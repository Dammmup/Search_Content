import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, Alert } from 'antd';
import { getAccounts, addUser, getCurrentUser, logout, accounts } from '../../BL/userdb';

const AuthModal = ({ visible, onLogin, onCancel }) => {
  const [form] = Form.useForm();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const modalShown = localStorage.getItem('modalShown');
    if (modalShown !== 'true') {
      onOpen(); 
      localStorage.setItem('modalShown', 'true');
    }
  }, []);

  const onOpen = () => {
    setIsLogin(true); 
    setError(null);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    if (isLogin) {
            const account = accounts.find(
        (account) => account.username === values.username && account.password === values.password
      );

      if (account) {
        localStorage.setItem('userToken', account.token || 'defaultToken'); // Используем токен из account или дефолтный
        localStorage.setItem('username', account.username);
        onLogin();
      } else {
        setError('Неправильные имя пользователя или пароль');
      }
    } else {
      // Логика регистрации
      if (accounts.some((account) => account.username === values.username)) {
        setError('Пользователь с таким именем уже существует');
      } else {
        // Добавление нового пользователя
        addUser({ username: values.username, password: values.password, token: 'newUserToken' }); // Замените 'newUserToken' на реальный токен
        localStorage.setItem('userToken', 'newUserToken'); // Замените 'newUserToken' на реальный токен
        localStorage.setItem('username', values.username);
        onLogin();
      }
    }
  };

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    form.resetFields();
  };

  return (
    <Modal
      title={isLogin ? 'Вход' : 'Регистрация'}
      visible={visible}
      footer={null}
      onCancel={onCancel}
      onOk={handleSubmit}
      afterClose={onOpen}
    >
      {error && <Alert message={error} type="error" showIcon />}
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: '20px' }}>
        <Form.Item
          label="Имя пользователя"
          name="username"
          rules={[{ required: true, message: 'Пожалуйста, введите имя пользователя' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Пароль"
          name="password"
          rules={[{ required: true, message: 'Пожалуйста, введите пароль' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </Button>
          <Button type="link" onClick={handleSwitchMode} style={{ marginLeft: '10px' }}>
            {isLogin ? 'Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AuthModal;
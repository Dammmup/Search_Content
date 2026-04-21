import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, Alert } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { authAPI } from '../../BL/api';

const AuthModal = ({ visible, onLogin, onCancel }) => {
  const [form] = Form.useForm();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setError(null);
      setIsLogin(true);
    }
  }, [visible, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);

    // Поддержка логина через "user" -> "user@admin.com"
    let email = values.email;
    if (!email.includes('@')) {
      // Если введено без @, считаем это именем пользователя
      email = `${email}@admin.com`;
    }

    try {
      if (isLogin) {
        // Вход через Supabase
        const result = await authAPI.login(email, values.password);

        if (result.user) {
          localStorage.setItem('userToken', result.session.access_token);
          localStorage.setItem('userEmail', result.user.email);
          localStorage.setItem('userId', result.user.id);
          onLogin();
        }
      } else {
        // Регистрация через Supabase
        const result = await authAPI.register(email, values.password);

        if (result.user) {
          localStorage.setItem('userToken', result.session?.access_token || '');
          localStorage.setItem('userEmail', result.user.email);
          localStorage.setItem('userId', result.user.id);
          
          // Эмулируем мгновенный вход без подтверждения почты
          onLogin();
        }
      }
    } catch (err) {
      console.error('Auth error:', err);

      // Обработка ошибок Supabase
      if (err.message?.includes('Invalid login')) {
        setError('Неправильный логин или пароль');
      } else if (err.message?.includes('User already registered')) {
        setError('Пользователь с таким логином уже существует');
      } else if (err.message?.includes('Password')) {
        setError('Пароль должен содержать минимум 6 символов');
      } else if (err.message?.includes('network')) {
        setError('Ошибка сети. Проверьте подключение к интернету');
      } else {
        setError(err.message || 'Произошла ошибка. Попробуйте позже');
      }
    }

    setLoading(false);
  };

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    form.resetFields();
  };

  return (
    <Modal
      title={isLogin ? '👋 Вход в аккаунт' : '📝 Регистрация'}
      open={visible}
      footer={null}
      maskClosable={false}
      onCancel={onCancel}
      centered
      width={400}
      className="auth-modal"
    >
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
        initialValues={{ email: '', password: '' }}
      >
        <Form.Item
          label="Логин"
          name="email"
          rules={[{ required: true, message: 'Пожалуйста, введите логин' }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#667eea' }} />}
            placeholder="Введите логин"
            autoComplete="username"
          />
        </Form.Item>

        <Form.Item
          label="Пароль"
          name="password"
          rules={[
            { required: true, message: 'Пожалуйста, введите пароль' },
            { min: 6, message: 'Пароль должен содержать минимум 6 символов' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#667eea' }} />}
            placeholder="Введите пароль"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              height: 48,
              fontSize: 16,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: 12
            }}
          >
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </Form.Item>

        <Form.Item style={{ textAlign: 'center', marginBottom: 0, marginTop: 16 }}>
          <Button
            type="link"
            onClick={handleSwitchMode}
            style={{ color: '#667eea', fontWeight: 500 }}
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AuthModal;

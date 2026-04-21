import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, Alert, Tabs } from 'antd';
import { LockOutlined, UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { authAPI } from '../../BL/api';

const AuthModal = ({ visible, onLogin, onCancel }) => {
  const [form] = Form.useForm();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setError(null);
      setIsLogin(true);
      setAuthMethod('email');
    }
  }, [visible, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);

    const { email, phone, password } = values;

    try {
      let result;
      if (isLogin) {
        if (authMethod === 'email') {
          if (!email) throw new Error('Пожалуйста, введите Email или Логин');
          // Поддержка "user" -> "user@admin.com"
          let emailIdentifier = email;
          if (!emailIdentifier.includes('@')) {
            emailIdentifier = `${emailIdentifier}@admin.com`;
          }
          result = await authAPI.login(emailIdentifier, password);
        } else {
          if (!phone) throw new Error('Пожалуйста, введите номер телефона');
          result = await authAPI.loginWithPhone(phone, password);
        }

        if (result.user) {
          localStorage.setItem('userToken', result.session.access_token);
          localStorage.setItem('userEmail', result.user.email || result.user.phone);
          localStorage.setItem('userId', result.user.id);
          onLogin();
        }
      } else {
        if (authMethod === 'email') {
          if (!email) throw new Error('Пожалуйста, введите Email или Логин');
          let emailIdentifier = email;
          if (!emailIdentifier.includes('@')) {
            emailIdentifier = `${emailIdentifier}@admin.com`;
          }
          result = await authAPI.register(emailIdentifier, password);
        } else {
          if (!phone) throw new Error('Пожалуйста, введите номер телефона');
          result = await authAPI.registerWithPhone(phone, password);
        }

        if (result.user) {
          localStorage.setItem('userToken', result.session?.access_token || '');
          localStorage.setItem('userEmail', result.user.email || result.user.phone);
          localStorage.setItem('userId', result.user.id);
          onLogin();
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (err.message?.includes('Invalid login')) {
        setError('Неправильный логин или пароль');
      } else if (err.message?.includes('User already registered')) {
        setError('Пользователь уже существует');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Почта не подтверждена. Пожалуйста, проверьте папку "Спам" или обратитесь в поддержку.');
      } else if (err.message?.includes('Password')) {
        setError('Пароль должен содержать минимум 6 символов');
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

  const items = [
    {
      key: 'email',
      label: (
        <span>
          <MailOutlined /> Почта
        </span>
      ),
      children: (
        <Form.Item
          label="Email / Логин"
          name="email"
          rules={[{ required: true, message: 'Пожалуйста, введите Email или Логин' }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#667eea' }} />}
            placeholder="example@mail.ru"
          />
        </Form.Item>
      ),
    },
    {
      key: 'phone',
      label: (
        <span>
          <PhoneOutlined /> Телефон
        </span>
      ),
      children: (
        <Form.Item
          label="Номер телефона"
          name="phone"
          rules={[{ required: true, message: 'Пожалуйста, введите номер телефона' }]}
        >
          <Input
            prefix={<PhoneOutlined style={{ color: '#667eea' }} />}
            placeholder="+7 (XXX) XXX-XX-XX"
          />
        </Form.Item>
      ),
    },
  ];

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

      <Tabs 
        centered 
        activeKey={authMethod} 
        onChange={setAuthMethod}
        items={items}
        style={{ marginBottom: 10 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
      >
        {/* Поля вставляются из Tabs выше, но пароль общий */}
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

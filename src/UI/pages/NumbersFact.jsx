import React, { useState } from 'react';
import { Button, Card, Input, Alert, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMathFact, fetchTriviaFact, fetchDateFact, toggleNumbersFactLike } from '../../BL/slices/numbersFactSlice';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import ModernNav from '../components/ModernNav';
import { MonthDayPicker } from '../components/MonthDayPicker';
import { BotomFooter } from '../components/BotomFooter';
import AuthModal from '../components/AuthModal';
import { authAPI } from '../../BL/api';

export const NumbersFact = () => {
  const dispatch = useDispatch();
  const { facts, status, error } = useSelector((state) => state.numbersFact);
  const [mathNumber, setMathNumber] = useState('');
  const [triviaNumber, setTriviaNumber] = useState('');
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Функция проверки авторизации
  const checkAuth = async () => {
    try {
      const userToken = localStorage.getItem('userToken');
      if (userToken) {
        const user = await authAPI.getUser();
        if (user) {
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // Обработчик изменения даты
  const handleDateChange = async (date) => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      // Сохраняем действие и показываем модальное окно
      setPendingAction(() => () => {
        if (date) {
          dispatch(fetchDateFact(date.format('M/D')));
        }
      });
      setIsAuthModalVisible(true);
      return;
    }
    // Если пользователь авторизован, выполняем действие
    if (date) {
      dispatch(fetchDateFact(date.format('M/D')));
    }
  };

  const handleMathInputChange = (e) => {
    setMathNumber(e.target.value);
    setTriviaNumber('');
  };

  const handleTriviaInputChange = (e) => {
    setTriviaNumber(e.target.value);
    setMathNumber('');
  };

  // Обработчик поиска
  const handleSearch = async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      // Сохраняем действие и показываем модальное окно
      setPendingAction(() => () => {
        if (mathNumber) {
          dispatch(fetchMathFact(mathNumber));
        } else if (triviaNumber) {
          dispatch(fetchTriviaFact(triviaNumber));
        }
      });
      setIsAuthModalVisible(true);
      return;
    }
    // Если пользователь авторизован, выполняем действие
    if (mathNumber) {
      dispatch(fetchMathFact(mathNumber));
    } else if (triviaNumber) {
      dispatch(fetchTriviaFact(triviaNumber));
    }
  };

  // Обработчик успешной авторизации
  const handleAuthSuccess = () => {
    setIsAuthModalVisible(false);
    if (pendingAction) {
      // Выполняем отложенное действие
      pendingAction();
      setPendingAction(null);
    }
  };

  // Обработчик отмены авторизации
  const handleAuthCancel = () => {
    setIsAuthModalVisible(false);
    setPendingAction(null);
  };

  const handleLike = (fact) => {
    dispatch(toggleNumbersFactLike({ fact }));
  };

  return (
    <div className="page-container">
      <ModernNav />
      <div className="search-section">
        <h1 className="hero-title">🔢 Интересные факты о числах</h1>
        <p className="hero-subtitle">
          Узнай интересные факты о любом числе
        </p>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Input
            type="number"
            placeholder="Математический факт"
            value={mathNumber}
            onChange={handleMathInputChange}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
            size="large"
          />
          <Input
            type="number"
            placeholder="Интересный факт"
            value={triviaNumber}
            onChange={handleTriviaInputChange}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
            size="large"
          />
          <MonthDayPicker onChange={handleDateChange} />
          <Button type="primary" size="large" onClick={handleSearch}>
            Поиск
          </Button>
        </div>
      </div>
      <div className="results-container" style={{ marginTop: '20px', padding: '0 20px' }}>
        <div className="profile-container">
          {status === 'loading' ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }} >
              <Spin size="large" />
            </div>
          ) : error ? (
            <Alert message={error} type="error" />
          ) : facts.length ? (
            facts.map((fact) => (
              <Card
                key={fact.id}
                className={`fact-card ${fact.is_favorite ? 'liked' : ''}`}
                style={{ marginTop: '20px' }}
              >
                <p style={{ fontSize: '16px', color: '#fff', lineHeight: '1.6' }}>{fact.text}</p>
                <Button
                  type="text"
                  icon={
                    fact.is_favorite ?
                      <HeartFilled style={{ color: 'red' }} /> :
                      <HeartOutlined />
                  }
                  onClick={() => handleLike(fact)}
                />
              </Card>
            ))
          ) : (
            <div></div>
          )}
        </div>
      </div>
      <BotomFooter />

      {/* Модальное окно авторизации */}
      <AuthModal
        visible={isAuthModalVisible}
        onLogin={handleAuthSuccess}
        onCancel={handleAuthCancel}
      />
    </div>
  );
};

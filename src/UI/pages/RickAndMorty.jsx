/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Input, Card, Row, Col, Button, Alert, Spin, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCharacters, toggleRickAndMortyLike } from '../../BL/slices/rickAndMortySlice';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import ModernNav from '../components/ModernNav';
import { BotomFooter } from '../components/BotomFooter';
import AuthModal from '../components/AuthModal';
import { authAPI } from '../../BL/api';

const { Search } = Input;
const { Meta } = Card;
const { Text } = Typography;

export const RickAndMorty = () => {
  const dispatch = useDispatch();
  const { characters, status, error } = useSelector((state) => state.rickAndMorty);
  const [hasSearched, setHasSearched] = useState(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [pendingSearchValue, setPendingSearchValue] = useState(null);

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

  // Обработчик поиска
  const onSearch = async (value) => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      // Сохраняем значение для поиска и показываем модальное окно
      setPendingSearchValue(value);
      setIsAuthModalVisible(true);
      return;
    }
    // Если пользователь авторизован, выполняем поиск
    setHasSearched(true);
    dispatch(fetchCharacters(value));
  };

  // Обработчик успешной авторизации
  const handleAuthSuccess = () => {
    setIsAuthModalVisible(false);
    if (pendingSearchValue) {
      // Выполняем отложенный поиск
      setHasSearched(true);
      dispatch(fetchCharacters(pendingSearchValue));
      setPendingSearchValue(null);
    }
  };

  // Обработчик отмены авторизации
  const handleAuthCancel = () => {
    setIsAuthModalVisible(false);
    setPendingSearchValue(null);
  };

  const handleLike = (character) => {
    dispatch(toggleRickAndMortyLike({ character }));
  };

  return (
    <div className="page-container">
      <ModernNav />
      <div className="search-section">
        <h1 className="hero-title">🌌 Рик и Морти</h1>
        <p className="hero-subtitle">
          Найди персонажей из любимого мультсериала
        </p>
        <Search
          placeholder="Введи имя персонажа..."
          allowClear
          enterButton="Поиск"
          size="large"
          style={{ maxWidth: 400 }}
          onSearch={onSearch}
        />
      </div>
      <div className="results-container" style={{ marginTop: '20px' }}>
        {status === 'loading' ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <Alert message={`Error: ${error}`} type="error" />
        ) : hasSearched && characters.length === 0 ? (
          <Text type="warning">Characters not found.</Text>
        ) : (
          <Row gutter={[24, 24]}>
            {characters.map((character) => (
              <Col key={character.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card
                  className={`character-card ${character.is_favorite ? 'liked' : ''}`}
                  hoverable
                  style={{ width: '100%' }}
                  cover={<img alt={character.name} src={character.image} style={{ height: '250px', objectFit: 'cover' }} />}
                >
                  <Meta title={character.name} />
                  <p>Статус: {character.status}</p>
                  <p>Вид: {character.species}</p>
                  <p>Пол: {character.gender}</p>
                  <p>Место происхождения: {character.origin.name}</p>
                  <p>Местоположение: {character.location.name}</p>
                  <Button
                    type="text"
                    icon={
                      character.is_favorite ? (
                        <HeartFilled style={{ color: 'red' }} />
                      ) : (
                        <HeartOutlined />
                      )
                    }
                    onClick={() => handleLike(character)}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
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

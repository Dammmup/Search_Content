import React, { useState } from 'react';
import { Input, Card, Row, Col, Button, Alert, Spin, Typography, Image } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchImages, toggleImageLike } from '../../BL/slices/imageSlice';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import ModernNav from '../components/ModernNav';
import { BotomFooter } from '../components/BotomFooter';
import AuthModal from '../components/AuthModal';
import { authAPI } from '../../BL/api';

const { Search } = Input;
const { Text } = Typography;

export const SearchImage = () => {
  const dispatch = useDispatch();
  const { images, status, error } = useSelector((state) => state.images);
  const [query, setQuery] = useState('');
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
    setQuery(value);
    setHasSearched(true);
    dispatch(fetchImages(value));
  };

  // Обработчик успешной авторизации
  const handleAuthSuccess = () => {
    setIsAuthModalVisible(false);
    if (pendingSearchValue) {
      // Выполняем отложенный поиск
      setQuery(pendingSearchValue);
      setHasSearched(true);
      dispatch(fetchImages(pendingSearchValue));
      setPendingSearchValue(null);
    }
  };

  // Обработчик отмены авторизации
  const handleAuthCancel = () => {
    setIsAuthModalVisible(false);
    setPendingSearchValue(null);
  };

  const handleLike = (image) => {
    dispatch(toggleImageLike({ image }));
  };

  return (
    <div className="page-container">
      <ModernNav />
      <div className="search-section">
        <h1 className="hero-title">🖼️ Поиск изображений</h1>
        <p className="hero-subtitle">
          Найди красивые изображения по запросу
        </p>
        <Search
          placeholder="Введи запрос..."
          enterButton="Поиск"
          size="large"
          style={{ maxWidth: 400 }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
        ) : hasSearched && images.length === 0 ? (
          <Text type="warning">Изображения не найдены. Попробуйте другой запрос.</Text>
        ) : (
          <Row gutter={[24, 24]}>
            {images.map((result) => (
              <Col key={result.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  className={`image-card ${result.is_favorite ? 'liked' : ''}`}
                  hoverable
                  style={{ marginBottom: 16 }}
                  cover={
                    <Image
                      alt={result.alt_description}
                      src={result.urls.small}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  }
                >
                  <Card.Meta title={result.alt_description} />
                  <Button
                    type="text"
                    icon={
                      result.is_favorite ? (
                        <HeartFilled style={{ color: 'red' }} />
                      ) : (
                        <HeartOutlined />
                      )
                    }
                    onClick={() => handleLike(result)}
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

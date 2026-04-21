import { Input, Card, Row, Col, Button, Alert, Spin, Image } from 'antd';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFilms, toggleFilmLike } from '../../BL/slices/filmSlice';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import ModernNav from '../components/ModernNav';
import { BotomFooter } from '../components/BotomFooter';
import AuthModal from '../components/AuthModal';
import { authAPI } from '../../BL/api';

const { Search } = Input;

export const SearchFilm = () => {
  const dispatch = useDispatch();
  const { films, status, error } = useSelector((state) => state.films);
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
    dispatch(fetchFilms(value));
  };

  // Обработчик успешной авторизации
  const handleAuthSuccess = () => {
    setIsAuthModalVisible(false);
    if (pendingSearchValue) {
      // Выполняем отложенный поиск
      dispatch(fetchFilms(pendingSearchValue));
      setPendingSearchValue(null);
    }
  };

  // Обработчик отмены авторизации
  const handleAuthCancel = () => {
    setIsAuthModalVisible(false);
    setPendingSearchValue(null);
  };

  const handleLike = (film) => {
    dispatch(toggleFilmLike({ film }));
  };

  const isValidFilm = (film) => {
    return film.name && film.poster && film.poster.url;
  };

  return (
    <div className="page-container">
      <ModernNav />
      <div className="search-section">
        <h1 className="hero-title">🎬 Поиск фильмов</h1>
        <p className="hero-subtitle">
          Найди свой любимый фильм или сериал
        </p>
        <Search
          placeholder="Введи название фильма..."
          allowClear
          enterButton="Поиск"
          size="large"
          style={{ maxWidth: 400 }}
          onSearch={onSearch}
        />
      </div>
      <div className="results-container" style={{ marginTop: '20px' }}>
        {status === 'loading' ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <Alert message={error} type="error" />
        ) : films.length > 0 ? (
          <Row gutter={[24, 24]}>
            {films.filter(isValidFilm).map((result) => (
              <Col key={result.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  className={`film-card ${result.is_favorite ? 'liked' : ''}`}
                  style={{ marginBottom: 16 }}
                  hoverable
                  cover={
                    <Image alt={result.name} src={result.poster.url} style={{ height: '300px', objectFit: 'cover' }} />
                  }
                >
                  <Card.Meta
                    title={result.name}
                    description={
                      <>
                        {result.year && <p><strong>Год:</strong> {result.year}</p>}
                        {result.description && <p><strong>Описание:</strong> {result.description}</p>}
                        {result.rating && result.rating.kp && <p><strong>Рейтинг КиноПоиск:</strong> {result.rating.kp}</p>}
                        {result.rating && result.rating.imdb && <p><strong>Рейтинг IMDb:</strong> {result.rating.imdb}</p>}
                      </>
                    }
                  />
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
        ) : (
          <p style={{ textAlign: 'center' }}></p>
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

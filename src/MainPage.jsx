/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import ModernNav from './UI/components/ModernNav';
import AuthModal from './UI/components/AuthModal';
import { BotomFooter } from './UI/components/BotomFooter';
import { ArrowRightOutlined, ThunderboltOutlined, HeartOutlined, RocketOutlined, StarOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { authAPI } from './BL/api';
import './styles/MainPage.css';

export const MainPage = () => {
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const features = [
    { icon: '🎬', title: 'Фильмы', desc: 'Поиск фильмов и сериалов', path: '/movies', color: '#667eea' },
    { icon: '🎵', title: 'Музыка', desc: 'Треки и исполнители', path: '/music', color: '#f5576c' },
    { icon: '🖼️', title: 'Картинки', desc: 'Красивые изображения', path: '/image', color: '#4facfe' },
    { icon: '🌌', title: 'Рик и Морти', desc: 'Персонажи мультфильма', path: '/ram', color: '#43e97b' },
    { icon: '🔢', title: 'Числа', desc: 'Интересные факты', path: '/numbers', color: '#fa709a' },
    { icon: '🎮', title: 'Игры', desc: 'База игр RAWG', path: '/games', color: '#a8edea' },
    { icon: '😂', title: 'Шутки', desc: 'Анекдоты и приколы', path: '/jokes', color: '#ffecd2' },
    { icon: '💰', title: 'Крипто', desc: 'Курсы валют', path: '/crypto', color: '#fcb69f' },
  ];

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsAuthModalVisible(false);
  };

  return (
    <div className="main-page">
      <ModernNav />

      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <ThunderboltOutlined style={{ color: '#ffd700', marginRight: '15px' }} />
            SearchX
          </h1>
          <p className="hero-subtitle">
            Твой универсальный поисковик контента 🎯<br />
            Фильмы, музыка, игры, шутки и криптовалюта — всё в одном месте!
          </p>

          <div className="hero-cta">
            <Link to="/movies">
              <Button type="primary" size="large" className="cta-button">
                Начать поиск <ArrowRightOutlined />
              </Button>
            </Link>
          </div>
        </div>

        <div className="hero-features">
          {features.map((feature, index) => (
            <Link to={feature.path} key={index} className="feature-card">
              <div className="feature-icon" style={{ background: feature.color }}>
                {feature.icon}
              </div>
              <div className="feature-info">
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-item">
          <StarOutlined style={{ fontSize: 32, color: '#ffd700' }} />
          <h3>8</h3>
          <p>Категорий</p>
        </div>
        <div className="stat-item">
          <RocketOutlined style={{ fontSize: 32, color: '#667eea' }} />
          <h3>100K+</h3>
          <p>Данных</p>
        </div>
        <div className="stat-item">
          <HeartOutlined style={{ fontSize: 32, color: '#f5576c' }} />
          <h3>Бесплатно</h3>
          <p>Для всех</p>
        </div>
      </div>

      <BotomFooter />

      <AuthModal
        visible={isAuthModalVisible}
        onLogin={handleLogin}
        onCancel={() => setIsAuthModalVisible(false)}
      />
    </div>
  );
};

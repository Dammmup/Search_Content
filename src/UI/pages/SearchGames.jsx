import React, { useEffect, useState } from 'react';
import { Input, Card, Row, Col, Button, Alert, Spin, Image, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGames, toggleGameLike } from '../../BL/slices/gameSlice';
import { HeartOutlined, HeartFilled, StarOutlined, CalendarOutlined, PlayCircleOutlined } from '@ant-design/icons';
import ModernNav from '../components/ModernNav';
import { BotomFooter } from '../components/BotomFooter';
import AuthModal from '../components/AuthModal';
import { authAPI } from '../../BL/api';

const { Search } = Input;

export const SearchGames = () => {
    const dispatch = useDispatch();
    const { games, status, error } = useSelector((state) => state.games);
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
        if (value.trim()) {
            dispatch(fetchGames(value));
        }
    };

    // Обработчик успешной авторизации
    const handleAuthSuccess = () => {
        setIsAuthModalVisible(false);
        if (pendingSearchValue) {
            // Выполняем отложенный поиск
            if (pendingSearchValue.trim()) {
                dispatch(fetchGames(pendingSearchValue));
            }
            setPendingSearchValue(null);
        }
    };

    // Обработчик отмены авторизации
    const handleAuthCancel = () => {
        setIsAuthModalVisible(false);
        setPendingSearchValue(null);
    };

    // Загружаем популярные игры при первом рендере
    useEffect(() => {
        dispatch(fetchGames(''));
    }, [dispatch]);

    const handleLike = (game) => {
        dispatch(toggleGameLike({ game }));
    };

    const getMetacriticColor = (score) => {
        if (score >= 75) return 'green';
        if (score >= 50) return 'orange';
        return 'red';
    };

    return (
        <div className="page-container">
            <ModernNav />

            <div className="search-section">
                <h1 className="hero-title">🎮 Поиск игр</h1>
                <p className="hero-subtitle">
                    Найди свою следуюшую игру в базе из тысяч проектов
                </p>

                <Search
                    placeholder="Введи название игры..."
                    allowClear
                    enterButton={<><PlayCircleOutlined /> Поиск</>}
                    size="large"
                    style={{ maxWidth: 500 }}
                    onSearch={onSearch}
                />
            </div>

            <div className="results-container" style={{ padding: '20px' }}>
                {status === 'loading' ? (
                    <div style={{ textAlign: 'center', marginTop: '50px' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>Загружаем игры...</p>
                    </div>
                ) : error ? (
                    <Alert message={`Ошибка: ${error}`} type="error" showIcon />
                ) : games.length > 0 ? (
                    <Row gutter={[24, 24]}>
                        {games.map((game) => (
                            <Col key={game.id} xs={24} sm={12} md={8} lg={6}>
                                <Card
                                    className={`game-card ${game.is_favorite ? 'liked' : ''}`}
                                    hoverable
                                    cover={
                                        game.background_image ? (
                                            <div className="card-image-wrapper">
                                                <Image
                                                    alt={game.name}
                                                    src={game.background_image}
                                                    style={{ height: '180px', objectFit: 'cover' }}
                                                    preview={false}
                                                />
                                                {game.metacritic && (
                                                    <Tag
                                                        color={getMetacriticColor(game.metacritic)}
                                                        className="metacritic-tag"
                                                    >
                                                        {game.metacritic}
                                                    </Tag>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="no-image-placeholder">
                                                <PlayCircleOutlined style={{ fontSize: 48 }} />
                                            </div>
                                        )
                                    }
                                >
                                    <Card.Meta
                                        title={<span className="game-title">{game.name}</span>}
                                        description={
                                            <div className="game-meta">
                                                {game.released && (
                                                    <p><CalendarOutlined /> {game.released}</p>
                                                )}
                                                <div className="game-rating">
                                                    <StarOutlined style={{ color: '#ffd700' }} />
                                                    {game.rating || 'N/A'}
                                                </div>
                                                <div className="game-platforms">
                                                    {game.platforms?.slice(0, 3).map((p, i) => (
                                                        <Tag key={i} color="blue">{p.platform.name}</Tag>
                                                    ))}
                                                </div>
                                            </div>
                                        }
                                    />
                                    <Button
                                        type="text"
                                        className="like-button"
                                        icon={
                                            game.is_favorite ? (
                                                <HeartFilled style={{ color: '#fff' }} />
                                            ) : (
                                                <HeartOutlined style={{ color: '#fff' }} />
                                            )
                                        }
                                        onClick={() => handleLike(game)}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <PlayCircleOutlined style={{ fontSize: 64, color: 'var(--text-muted)' }} />
                        <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>
                            Введи название игры для поиска
                        </p>
                    </div>
                )}
            </div>

            <BotomFooter />

            {/* Модальное окно авторизации */}
            <AuthModal
                visible={isAuthModalVisible}
                onLogin={handleAuthSuccess}
                onCancel={handleAuthCancel}
            />

            <style>{`
        .game-card {
          position: relative;
          overflow: hidden;
        }
        
        .game-card .card-image-wrapper {
          position: relative;
        }
        
        .game-card .metacritic-tag {
          position: absolute;
          top: 10px;
          right: 10px;
          font-weight: bold;
        }
        
        .game-card .no-image-placeholder {
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.05);
        }
        
        .game-card .game-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          color: #fff;
        }
        
        .game-card .game-meta p {
          color: var(--text-secondary);
          margin: 4px 0;
          font-size: 13px;
        }
        
        .game-card .game-rating {
          display: flex;
          align-items: center;
          gap: 5px;
          margin: 8px 0;
        }
        
        .game-card .game-platforms {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 8px;
        }
        
        .game-card .like-button {
          position: absolute;
          bottom: 10px;
          right: 10px;
        }
      `}</style>
        </div>
    );
};

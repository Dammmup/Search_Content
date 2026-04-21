import React, { useState } from 'react';
import { Card, Row, Col, Button, Alert, Spin, Tag, Select, Empty } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJokes, fetchRandomJokes, toggleJokeLike } from '../../BL/slices/jokeSlice';
import { HeartOutlined, HeartFilled, SmileOutlined } from '@ant-design/icons';
import ModernNav from '../components/ModernNav';
import { BotomFooter } from '../components/BotomFooter';
import AuthModal from '../components/AuthModal';
import { authAPI } from '../../BL/api';

const { Option } = Select;

export const SearchJokes = () => {
    const dispatch = useDispatch();
    const { jokes, status, error } = useSelector((state) => state.jokes);
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

    // Обработчик выбора категории
    const handleCategoryChange = async (value) => {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
            // Сохраняем действие и показываем модальное окно
            setPendingAction(() => () => {
                if (value === 'random') {
                    dispatch(fetchRandomJokes());
                } else {
                    dispatch(fetchJokes(value));
                }
            });
            setIsAuthModalVisible(true);
            return;
        }
        // Если пользователь авторизован, выполняем действие
        if (value === 'random') {
            dispatch(fetchRandomJokes());
        } else {
            dispatch(fetchJokes(value));
        }
    };

    // Обработчик кнопки "Ещё шутки"
    const handleMoreJokesClick = async () => {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
            // Сохраняем действие и показываем модальное окно
            setPendingAction(() => () => {
                dispatch(fetchRandomJokes());
            });
            setIsAuthModalVisible(true);
            return;
        }
        // Если пользователь авторизован, выполняем действие
        dispatch(fetchRandomJokes());
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

    const handleLike = (joke) => {
        dispatch(toggleJokeLike({ joke }));
    };

    const getCategoryColor = (category) => {
        const colors = {
            Programming: 'blue',
            Misc: 'green',
            Pun: 'orange',
            Spooky: 'purple',
            Christmas: 'red',
            Dark: 'black',
        };
        return colors[category] || 'default';
    };

    return (
        <div className="page-container">
            <ModernNav />

            <div className="search-section">
                <h1 className="hero-title">😂 Шутки и анекдоты</h1>
                <p className="hero-subtitle">
                    Подними себе настроение с помощью случайных шуток
                </p>

                <Select
                    defaultValue="random"
                    style={{ width: 250 }}
                    size="large"
                    onChange={handleCategoryChange}
                >
                    <Option value="random">🎲 Случайные шутки</Option>
                    <Option value="programming">💻 Программистские</Option>
                    <Option value="misc">🎭 Разные</Option>
                    <Option value="pun">🤪 Каламбуры</Option>
                    <Option value="spooky">👻 Страшные</Option>
                    <Option value="christmas">🎄 Новогодние</Option>
                </Select>

                <Button
                    type="primary"
                    size="large"
                    onClick={handleMoreJokesClick}
                    style={{ marginLeft: '10px' }}
                >
                    <SmileOutlined /> Ещё шутки!
                </Button>
            </div>

            <div className="results-container" style={{ padding: '20px' }}>
                {status === 'loading' ? (
                    <div style={{ textAlign: 'center', marginTop: '50px' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>Загружаем шутки...</p>
                    </div>
                ) : error ? (
                    <Alert message={`Ошибка: ${error}`} type="error" showIcon />
                ) : jokes.length > 0 ? (
                    <Row gutter={[24, 24]}>
                        {jokes.map((joke) => (
                            <Col key={joke.id} xs={24} sm={12} md={8} lg={6}>
                                <Card
                                    className={`joke-card ${joke.is_favorite ? 'liked' : ''}`}
                                    hoverable
                                >
                                    <div className="joke-header">
                                        <Tag color={getCategoryColor(joke.category)}>
                                            {joke.category}
                                        </Tag>
                                    </div>

                                    <div className="joke-content">
                                        {joke.setup ? (
                                            <>
                                                <p className="joke-setup">🤔 {joke.setup}</p>
                                                <p className="joke-delivery">📣 {joke.delivery}</p>
                                            </>
                                        ) : (
                                            <p className="joke-text">{joke.joke}</p>
                                        )}
                                    </div>

                                    <div className="joke-footer">
                                        <Button
                                            type="text"
                                            icon={
                                                joke.is_favorite ? (
                                                    <HeartFilled style={{ color: '#f5576c' }} />
                                                ) : (
                                                    <HeartOutlined style={{ color: '#f5576c' }} />
                                                )
                                            }
                                            onClick={() => handleLike(joke)}
                                        >
                                            {joke.is_favorite ? 'Лайкнуто' : 'Лайк'}
                                        </Button>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Empty
                        description="Шутки не найдены"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
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
        .joke-card {
          min-height: 200px;
          display: flex;
          flex-direction: column;
        }
        
        .joke-card .joke-header {
          margin-bottom: 12px;
        }
        
        .joke-card .joke-content {
          flex: 1;
        }
        
        .joke-card .joke-setup {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          margin-bottom: 12px;
          line-height: 1.5;
        }
        
        .joke-card .joke-delivery {
          font-size: 14px;
          color: #4facfe;
          font-weight: 600;
          padding: 10px;
          background: rgba(79, 172, 254, 0.1);
          border-radius: 8px;
          line-height: 1.5;
        }
        
        .joke-card .joke-text {
          font-size: 15px;
          color: #fff;
          line-height: 1.6;
        }
        
        .joke-card .joke-footer {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
      `}</style>
        </div>
    );
};

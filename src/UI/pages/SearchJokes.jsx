import React from 'react';
import { Card, Row, Col, Button, Alert, Spin, Tag, Select, Empty } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJokes, fetchRandomJokes, toggleJokeLike } from '../../BL/slices/jokeSlice';
import { HeartOutlined, HeartFilled, SmileOutlined } from '@ant-design/icons';
import ModernNav from '../components/ModernNav';
import { BotomFooter } from '../components/BotomFooter';

const { Option } = Select;

export const SearchJokes = () => {
    const dispatch = useDispatch();
    const { jokes, status, error } = useSelector((state) => state.jokes);

    const handleCategoryChange = (value) => {
        if (value === 'random') {
            dispatch(fetchRandomJokes());
        } else {
            dispatch(fetchJokes(value));
        }
    };

    const handleMoreJokesClick = () => {
        dispatch(fetchRandomJokes());
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
                    <Option value="general">🎭 Разные</Option>
                    <Option value="knockKnock">🚪 Knock-knock</Option>
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

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Spin, Empty, Avatar, Tag, Tooltip, Image, message, Space } from 'antd';
import { UserOutlined, ClockCircleOutlined, HeartFilled } from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { favoritesAPI } from '../../BL/api';
import ModernNav from '../components/ModernNav';
import { BotomFooter } from '../components/BotomFooter';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

const { Title, Text, Paragraph } = Typography;

export const Community = () => {
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCommunityFeed();
    }, []);

    const loadCommunityFeed = async () => {
        try {
            setLoading(true);
            const data = await favoritesAPI.getCommunityFeed(50);
            setFeed(data);
        } catch (error) {
            console.error('Ошибка загрузки ленты сообщества:', error);
            message.error('Не удалось загрузить ленту сообщества');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (type) => {
        const colors = {
            film: '#667eea',
            track: '#f5576c',
            image: '#4facfe',
            character: '#43e97b',
            fact: '#fa709a',
            game: '#a8edea',
            joke: '#ffecd2',
            crypto: '#fcb69f'
        };
        return colors[type] || '#1890ff';
    };

    const getCategoryName = (type) => {
        const names = {
            film: '🎥 Фильм',
            track: '🎵 Трек',
            image: '🖼️ Картинка',
            character: '👽 Рик и Морти',
            fact: '🔢 Факт',
            game: '🎮 Игра',
            joke: '😂 Шутка',
            crypto: '💰 Крипто'
        };
        return names[type] || 'Контент';
    };

    const renderCardCover = (type, item) => {
        switch (type) {
            case 'film':
                return item.poster?.url ? <Image src={item.poster.url} alt={item.name} style={{ height: 250, objectFit: 'cover' }} /> : null;
            case 'track':
                return item.image ? <Image src={item.image} alt={item.name} style={{ height: 250, objectFit: 'cover' }} /> : null;
            case 'image':
                return item.urls?.raw ? <Image src={item.urls.raw} alt={item.alt_description} style={{ height: 250, objectFit: 'cover' }} /> : null;
            case 'character':
                return item.image ? <Image src={item.image} alt={item.name} style={{ height: 250, objectFit: 'cover' }} /> : null;
            case 'game':
                return item.background_image ? <Image src={item.background_image} alt={item.name} style={{ height: 250, objectFit: 'cover' }} /> : null;
            case 'crypto':
                return item.image ? (
                    <div style={{ padding: '20px', textAlign: 'center', background: '#f0f2f5' }}>
                        <Image src={item.image} alt={item.name} style={{ width: 80, height: 80 }} preview={false} />
                    </div>
                ) : null;
            default:
                return null;
        }
    };

    const renderCardContent = (type, item) => {
        switch (type) {
            case 'track':
                return (
                    <>
                        <div style={{ marginBottom: 10 }}>
                            <Text strong>{item.artist_name}</Text><br />
                            <Text>{item.name}</Text>
                        </div>
                        {item.audio && (
                            <AudioPlayer
                                src={item.audio}
                                showJumpControls={false}
                                showDownloadProgress={false}
                                customAdditionalControls={[]}
                                customVolumeControls={[]}
                                style={{ borderRadius: 8, background: '#f5f5f5', padding: '10px 15px' }}
                            />
                        )}
                    </>
                );
            case 'fact':
                return <Paragraph ellipsis={{ rows: 3 }}>{item.text}</Paragraph>;
            case 'joke':
                return item.setup ? (
                    <>
                        <Paragraph strong>🤔 {item.setup}</Paragraph>
                        <Paragraph style={{ color: '#1890ff' }}>📣 {item.delivery}</Paragraph>
                    </>
                ) : (
                    <Paragraph>{item.joke}</Paragraph>
                );
            case 'character':
                return (
                    <Space direction="vertical" size="small">
                        <Text type="secondary">{item.species} • {item.status}</Text>
                        <Text>📍 {item.location?.name}</Text>
                    </Space>
                );
            case 'crypto':
                return (
                    <Space direction="vertical" size="small">
                        <Text strong style={{ fontSize: 18 }}>${item.current_price?.toLocaleString()}</Text>
                        <Tag color={item.price_change_percentage_24h >= 0 ? 'success' : 'error'}>
                            {item.price_change_percentage_24h >= 0 ? '+' : ''}{item.price_change_percentage_24h?.toFixed(2)}%
                        </Tag>
                    </Space>
                );
            default:
                return item.year ? <Text type="secondary">Год: {item.year}</Text> : null;
        }
    };

    const getTimeAgo = (dateString) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ru });
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="page-container">
            <ModernNav />

            <div className="search-section" style={{ padding: '60px 20px', textAlign: 'center' }}>
                <h1 className="hero-title">🌍 Сообщество</h1>
                <p className="hero-subtitle">Узнай, что сохраняют другие пользователи</p>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 40px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                    </div>
                ) : feed.length === 0 ? (
                    <Empty description="Лента пуста. Сохраняйте контент, и он появится здесь!" />
                ) : (
                    <Row gutter={[24, 24]}>
                        {feed.map((feedItem) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={feedItem.id}>
                                <Card
                                    hoverable
                                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                    bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                                    cover={renderCardCover(feedItem.type, feedItem.data)}
                                >
                                    <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Tag color={getCategoryColor(feedItem.type)} style={{ margin: 0 }}>
                                            {getCategoryName(feedItem.type)}
                                        </Tag>
                                        <Tooltip title={new Date(feedItem.created_at).toLocaleString()}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                <ClockCircleOutlined style={{ marginRight: 4 }} />
                                                {getTimeAgo(feedItem.created_at)}
                                            </Text>
                                        </Tooltip>
                                    </div>

                                    <Title level={5} ellipsis={{ rows: 2 }} style={{ marginTop: 0 }}>
                                        {feedItem.data.name || feedItem.data.title || feedItem.data.category || feedItem.data.alt_description || 'Без названия'}
                                    </Title>

                                    <div style={{ flex: 1, marginBottom: 16 }}>
                                        {renderCardContent(feedItem.type, feedItem.data)}
                                    </div>

                                    <div style={{
                                        marginTop: 'auto',
                                        paddingTop: 12,
                                        borderTop: '1px solid #f0f0f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8
                                    }}>
                                        <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                                        <Text type="secondary" ellipsis style={{ flex: 1 }}>
                                            {feedItem.users?.username || 'Анонимный пользователь'}
                                        </Text>
                                        <HeartFilled style={{ color: '#ff4d4f' }} />
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            <BotomFooter />
        </div>
    );
};

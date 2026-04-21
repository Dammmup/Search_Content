import { Button, ConfigProvider, Space, Tooltip } from 'antd';
import { HeartOutlined, UserOutlined, GlobalOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './styles/searchbar.css';
import { useSelector } from 'react-redux';

const ModernNav = () => {
    const navigate = useNavigate();
    const films = useSelector((state) => state.films.films || []);
    const images = useSelector((state) => state.images.images || []);
    const tracks = useSelector((state) => state.music.tracks || []);
    const characters = useSelector((state) => state.rickAndMorty.characters || []);
    const facts = useSelector((state) => state.numbersFact.facts || []);
    const likedItems = [...films, ...images, ...tracks, ...characters, ...facts];

    const handleFavoritesClick = () => {
        navigate(likedItems.length === 0 ? '/empty' : '/favorites');
    };

    const handleCommunityClick = () => {
        navigate('/community');
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    // Яркие градиенты для разных категорий
    const categories = [
        { path: '/movies', label: '🎬 Фильмы', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { path: '/music', label: '🎵 Музыка', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { path: '/image', label: '🖼️ Картинки', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
        { path: '/ram', label: '🌌 Рик и Морти', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
        { path: '/numbers', label: '🔢 Числа', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
        { path: '/games', label: '🎮 Игры', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
        { path: '/jokes', label: '😂 Шутки', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
        { path: '/crypto', label: '💰 Крипто', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    ];

    return (
        <div className='modern-nav'>
            <div className="nav-logo">
                <Link to="/">
                    <img src="/search_content_logo_019db154-6c6e-7062-b5b5-42f475cd440c.svg" alt="SearchX" className="logo-img" />
                </Link>
            </div>

            <div className='nav-categories'>
                <Space wrap size="middle">
                    {categories.map((cat) => (
                        <ConfigProvider
                            key={cat.path}
                            theme={{
                                components: {
                                    Button: {
                                        colorPrimary: cat.gradient,
                                        colorPrimaryHover: cat.gradient,
                                        colorPrimaryActive: cat.gradient,
                                        lineWidth: 0,
                                    },
                                },
                            }}
                        >
                            <Link to={cat.path}>
                                <Button type="primary" size="large" className="nav-btn">
                                    {cat.label}
                                </Button>
                            </Link>
                        </ConfigProvider>
                    ))}
                </Space>
            </div>

            <div className="nav-actions">
                <Tooltip title="Сообщество">
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<GlobalOutlined />}
                        onClick={handleCommunityClick}
                        className="action-btn"
                        style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', border: 'none' }}
                    />
                </Tooltip>
                <Tooltip title="Избранное">
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<HeartOutlined />}
                        onClick={handleFavoritesClick}
                        className="action-btn"
                    />
                </Tooltip>
                <Tooltip title="Профиль">
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<UserOutlined />}
                        onClick={handleProfileClick}
                        className="action-btn"
                    />
                </Tooltip>
            </div>
        </div>
    );
};

export default ModernNav;

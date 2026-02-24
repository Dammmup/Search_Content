/* eslint-disable react/jsx-key */
import React, { useState, useEffect } from 'react';
import { Space, ConfigProvider, Button, Row, Col, Card, Image, Popover, message, Tag } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { VideoCameraOutlined, CustomerServiceOutlined, FileImageOutlined, TrophyFilled, HeartFilled, HeartOutlined, SmileOutlined, DollarOutlined, PlayCircleOutlined, ExperimentOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './styles/Favorites.css';
import ModernNav from '../components/ModernNav';
import { toggleFilmLike } from '../../BL/slices/filmSlice';
import { toggleImageLike } from '../../BL/slices/imageSlice';
import { toggleRickAndMortyLike } from '../../BL/slices/rickAndMortySlice';
import { toggleNumbersFactLike } from '../../BL/slices/numbersFactSlice';
import { toggleTrackLike } from '../../BL/slices/musicSlice';
import { toggleJokeLike } from '../../BL/slices/jokeSlice';
import { toggleCryptoLike } from '../../BL/slices/cryptoSlice';
import { toggleGameLike } from '../../BL/slices/gameSlice';
import { colors1, colors2, colors3, getActiveColors, getHoverColors } from './fitch';
import { BotomFooter } from '../components/BotomFooter';
import AuthModal from '../components/AuthModal';
import { authAPI, favoritesAPI } from '../../BL/api';

export const Favorites = () => {
  const dispatch = useDispatch();
  const [activeType, setActiveType] = useState('films');
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

  const navigate = useNavigate();

  // Загрузка из базы данных
  const [dbFavorites, setDbFavorites] = useState({
    film: [],
    track: [],
    image: [],
    character: [],
    fact: [],
    joke: [],
    crypto: [],
    game: []
  });

  useEffect(() => {
    const load = (key) => {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    };
    setLocalFavFilms(load('favorite_films'));
    setLocalFavImages(load('favorite_images'));
    setLocalFavTracks(load('favorite_tracks'));
    setLocalFavCharacters(load('favorite_rickandmorty'));
    setLocalFavFacts(load('favorite_numbersfacts'));
    setLocalFavJokes(load('favorite_jokes'));
    setLocalFavCoins(load('favorite_crypto'));
    setLocalFavGames(load('favorite_games'));

    // Подгрузка из БД
    const loadDbFavorites = async () => {
      try {
        const user = await authAPI.getUser();
        if (user) {
          const allFavs = await favoritesAPI.getAll(user.id);
          const mappedFavs = allFavs.reduce((acc, curr) => {
            const type = curr.type;
            if (acc[type]) {
              acc[type].push(curr.data);
            } else {
              acc[type] = [curr.data];
            }
            return acc;
          }, {
            film: [], track: [], image: [], character: [], fact: [], joke: [], crypto: [], game: []
          });
          setDbFavorites(mappedFavs);
        }
      } catch (err) {
        console.error('Ошибка при загрузке избранного из БД', err);
      }
    };

    checkAuth().then(isAuth => {
      if (isAuth) loadDbFavorites();
    });
  }, []);

  // Приводим данные к нужному формату для рендера
  const prepareForRender = (dbItems = []) => {
    return dbItems.map(item => ({ ...item, is_favorite: true }));
  };

  const films = React.useMemo(() => prepareForRender(dbFavorites.film), [dbFavorites.film]);
  const images = React.useMemo(() => prepareForRender(dbFavorites.image), [dbFavorites.image]);
  const tracks = React.useMemo(() => prepareForRender(dbFavorites.track), [dbFavorites.track]);
  const characters = React.useMemo(() => prepareForRender(dbFavorites.character), [dbFavorites.character]);
  const facts = React.useMemo(() => prepareForRender(dbFavorites.fact), [dbFavorites.fact]);
  const jokes = React.useMemo(() => prepareForRender(dbFavorites.joke), [dbFavorites.joke]);
  const coins = React.useMemo(() => prepareForRender(dbFavorites.crypto), [dbFavorites.crypto]);
  const games = React.useMemo(() => prepareForRender(dbFavorites.game), [dbFavorites.game]);

  const handleRemoveLike = async (type, item) => {
    const isAuthenticated = await checkAuth();
    const doAction = () => {
      switch (type) {
        case 'film':
          dispatch(toggleFilmLike({ film: item }));
          break;
        case 'track':
          dispatch(toggleTrackLike({ track: item }));
          break;
        case 'image':
          dispatch(toggleImageLike({ image: item }));
          break;
        case 'fact':
          dispatch(toggleNumbersFactLike({ fact: item }));
          break;
        case 'character':
          dispatch(toggleRickAndMortyLike({ character: item }));
          break;
        case 'joke':
          dispatch(toggleJokeLike({ joke: item }));
          break;
        case 'crypto':
          dispatch(toggleCryptoLike({ coin: item }));
          break;
        case 'game':
          dispatch(toggleGameLike({ game: item }));
          break;
        default:
          break;
      }
    };

    if (!isAuthenticated) {
      message.info('Пожалуйста, авторизуйтесь для управления избранным');
      setPendingAction(() => doAction);
      setIsAuthModalVisible(true);
      return;
    }

    doAction();

    // Оптимистичное удаление из UI
    setDbFavorites(prev => ({
      ...prev,
      [type]: prev[type].filter(fav => (fav.id || fav.external_id) !== (item.id || item.external_id))
    }));
  };

  // Обработчик успешной авторизации
  const handleAuthSuccess = () => {
    setIsAuthModalVisible(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Обработчик отмены авторизации
  const handleAuthCancel = () => {
    setIsAuthModalVisible(false);
    setPendingAction(null);
  };

  const content = <div style={{ width: 7 }}></div>;

  const renderCards = (items, type) => {
    const favoriteItems = items.filter((item) => item.is_favorite);

    if (!favoriteItems || favoriteItems.length === 0) {
      return (
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <p>Нет избранных элементов в этой категории</p>
        </div>
      );
    }

    return (
      <div className={`results-${type}`} style={{ marginTop: '20px' }}>
        <Row gutter={[24, 24]}>
          {favoriteItems.map((item) => (
            <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                className={`${type}-card liked`}
                hoverable
                title={type === 'fact' ? item.name : type === 'joke' ? (item.category || 'Шутка') : item.text || item.alt_description}
                style={{ marginBottom: 16 }}
                cover={
                  type === 'track' && item.image ? (
                    <Image alt={item.name} src={item.image} style={{ height: '300px', objectFit: 'cover' }} />
                  ) : type === 'film' && item.poster && item.poster.url ? (
                    <Image alt={item.name} src={item.poster.url} style={{ height: '300px', objectFit: 'cover' }} />
                  ) : type === 'image' && item.urls && item.urls.raw ? (
                    <Image alt={item.alt_description} src={item.urls.raw} style={{ height: '300px', objectFit: 'cover' }} />
                  ) : type === 'character' && item.image ? (
                    <Image alt={item.name} src={item.image} style={{ height: '300px', objectFit: 'cover' }} />
                  ) : type === 'game' && item.background_image ? (
                    <Image alt={item.name} src={item.background_image} style={{ height: '300px', objectFit: 'cover' }} />
                  ) : type === 'crypto' && item.image ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Image alt={item.name} src={item.image} style={{ width: '80px', height: '80px' }} preview={false} />
                    </div>
                  ) : null
                }
                actions={[
                  <Button
                    type="text"
                    icon={item.is_favorite ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}
                    onClick={() => handleRemoveLike(type, item)}
                  />
                ]}
              >
                <Card.Meta
                  description={
                    <>
                      {type === 'track' && (
                        <div>
                          <p><strong>Исполнитель:</strong> {item.artist_name}</p>
                          <p><strong>Трек:</strong> {item.name}</p>
                          {item.album_name && (
                            <p><strong>Альбом:</strong> {item.album_name}</p>
                          )}

                          {/* Аудиоплеер — полный трек */}
                          {item.audio && (
                            <div className="track-player-wrapper">
                              <AudioPlayer
                                src={item.audio}
                                showJumpControls={false}
                                showDownloadProgress={false}
                                showFilledProgress={true}
                                layout="horizontal-reverse"
                                customAdditionalControls={[]}
                                customVolumeControls={[]}
                                style={{
                                  borderRadius: '12px',
                                  background: 'rgba(30, 215, 96, 0.08)',
                                  boxShadow: 'none',
                                  marginTop: '10px',
                                }}
                              />
                            </div>
                          )}
                          {item.track_url && (
                            <p style={{ marginTop: '8px' }}>
                              <a href={item.track_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1db954', fontSize: '12px' }}>
                                🎧 Открыть в Apple Music
                              </a>
                            </p>
                          )}
                        </div>
                      )}
                      {type === 'fact' && (
                        <p><strong>Факт:</strong> {item.text}</p>
                      )}
                      {type === 'image' && (
                        <p><strong>Ссылка:</strong> <a href={item.urls?.full} target="_blank" rel="noopener noreferrer">Открыть на весь экран</a></p>
                      )}
                      {type === 'character' && (
                        <div>
                          <p><strong>Имя:</strong> {item.name}</p>
                          <p><strong>Вид:</strong> {item.species}</p>
                          <p><strong>Статус:</strong> {item.status}</p>
                          <p><strong>Локация:</strong> {item.location?.name}</p>
                        </div>
                      )}
                      {type === 'joke' && (
                        <div>
                          {item.setup ? (
                            <>
                              <p>🤔 {item.setup}</p>
                              <p style={{ color: '#4facfe', fontWeight: 600 }}>📣 {item.delivery}</p>
                            </>
                          ) : (
                            <p>{item.joke}</p>
                          )}
                        </div>
                      )}
                      {type === 'crypto' && (
                        <div>
                          <p><strong>{item.name}</strong> ({item.symbol?.toUpperCase()})</p>
                          {item.current_price && <p><strong>Цена:</strong> ${item.current_price?.toLocaleString()}</p>}
                          {item.price_change_percentage_24h != null && (
                            <Tag color={item.price_change_percentage_24h >= 0 ? 'success' : 'error'}>
                              {item.price_change_percentage_24h >= 0 ? '+' : ''}{item.price_change_percentage_24h?.toFixed(2)}%
                            </Tag>
                          )}
                        </div>
                      )}
                      {type === 'game' && (
                        <div>
                          <p><strong>{item.name}</strong></p>
                          {item.released && <p><strong>Дата выхода:</strong> {item.released}</p>}
                          {item.rating && <p><strong>Рейтинг:</strong> ⭐ {item.rating}</p>}
                        </div>
                      )}
                      {item.year && <p><strong>Год:</strong> {item.year}</p>}
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  // Цвета для новых кнопок
  const colors4 = ['#f093fb', '#f5576c'];
  const colors5 = ['#4facfe', '#00f2fe'];
  const colors6 = ['#43e97b', '#38f9d7'];

  return (
    <div className="page-container">
      <ModernNav />

      <div className="search-section">
        <h1 className="hero-title">❤️ Избранное</h1>
        <p className="hero-subtitle">
          Твой список понравившихся материалов
        </p>
        <Link to="/">
          <Button type="primary" size="large">
            На главную
          </Button>
        </Link>
      </div>

      <div style={{ padding: '20px' }}>
        <Space className="chep" wrap>
          {/* Фильмы */}
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  colorPrimary: `linear-gradient(135deg, ${colors3.join(', ')})`,
                  colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(colors3).join(', ')})`,
                  colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(colors3).join(', ')})`,
                  lineWidth: 0,
                },
              },
            }}
          >
            <Popover title="Фильмы" content={content}>
              <Button type="primary" size="large" icon={<VideoCameraOutlined />} onClick={() => setActiveType('films')} />
            </Popover>
          </ConfigProvider>

          {/* Музыка */}
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  colorPrimary: `linear-gradient(90deg, ${colors1.join(', ')})`,
                  colorPrimaryHover: `linear-gradient(90deg, ${getHoverColors(colors1).join(', ')})`,
                  colorPrimaryActive: `linear-gradient(90deg, ${getActiveColors(colors1).join(', ')})`,
                  lineWidth: 0,
                },
              },
            }}
          >
            <Button type="primary" size="large" icon={<CustomerServiceOutlined />} onClick={() => setActiveType('tracks')} />
          </ConfigProvider>

          {/* Картинки */}
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  colorPrimary: `linear-gradient(135deg, ${colors2.join(', ')})`,
                  colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(colors2).join(', ')})`,
                  colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(colors2).join(', ')})`,
                  lineWidth: 0,
                },
              },
            }}
          >
            <Button type="primary" size="large" icon={<FileImageOutlined />} onClick={() => setActiveType('images')} />
          </ConfigProvider>

          {/* Рик и Морти */}
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  colorPrimary: `linear-gradient(90deg, ${colors3.join(', ')})`,
                  colorPrimaryHover: `linear-gradient(90deg, ${getHoverColors(colors3).join(', ')})`,
                  colorPrimaryActive: `linear-gradient(90deg, ${getActiveColors(colors3).join(', ')})`,
                  lineWidth: 0,
                },
              },
            }}
          >
            <Popover title="Рик и Морти" content={content}>
              <Button type="primary" size="large" icon={<TrophyFilled />} onClick={() => setActiveType('characters')} />
            </Popover>
          </ConfigProvider>

          {/* Факты */}
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  colorPrimary: `linear-gradient(135deg, ${colors1.join(', ')})`,
                  colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(colors1).join(', ')})`,
                  colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(colors1).join(', ')})`,
                  lineWidth: 0,
                },
              },
            }}
          >
            <Popover title="Факты о числах" content={content}>
              <Button type="primary" size="large" icon={<ExperimentOutlined />} onClick={() => setActiveType('facts')} />
            </Popover>
          </ConfigProvider>

          {/* Шутки */}
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  colorPrimary: `linear-gradient(135deg, ${colors4.join(', ')})`,
                  colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(colors4).join(', ')})`,
                  colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(colors4).join(', ')})`,
                  lineWidth: 0,
                },
              },
            }}
          >
            <Popover title="Шутки" content={content}>
              <Button type="primary" size="large" icon={<SmileOutlined />} onClick={() => setActiveType('jokes')} />
            </Popover>
          </ConfigProvider>

          {/* Крипто */}
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  colorPrimary: `linear-gradient(135deg, ${colors5.join(', ')})`,
                  colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(colors5).join(', ')})`,
                  colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(colors5).join(', ')})`,
                  lineWidth: 0,
                },
              },
            }}
          >
            <Popover title="Криптовалюты" content={content}>
              <Button type="primary" size="large" icon={<DollarOutlined />} onClick={() => setActiveType('crypto')} />
            </Popover>
          </ConfigProvider>

          {/* Игры */}
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  colorPrimary: `linear-gradient(135deg, ${colors6.join(', ')})`,
                  colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(colors6).join(', ')})`,
                  colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(colors6).join(', ')})`,
                  lineWidth: 0,
                },
              },
            }}
          >
            <Popover title="Игры" content={content}>
              <Button type="primary" size="large" icon={<PlayCircleOutlined />} onClick={() => setActiveType('games')} />
            </Popover>
          </ConfigProvider>
        </Space>
      </div>

      <div className="results-container">
        {activeType === 'films' && renderCards(films, 'film')}
        {activeType === 'tracks' && renderCards(tracks, 'track')}
        {activeType === 'images' && renderCards(images, 'image')}
        {activeType === 'characters' && renderCards(characters, 'character')}
        {activeType === 'facts' && renderCards(facts, 'fact')}
        {activeType === 'jokes' && renderCards(jokes, 'joke')}
        {activeType === 'crypto' && renderCards(coins, 'crypto')}
        {activeType === 'games' && renderCards(games, 'game')}
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

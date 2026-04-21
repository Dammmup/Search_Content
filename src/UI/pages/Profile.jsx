import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Typography, List, Button, Modal, Row, Col, Statistic, message, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../BL/api';
import ModernNav from '../components/ModernNav';
import './styles/Profile.css';
import { BotomFooter } from '../components/BotomFooter';
import dinosaur2 from '../../assets/dinosaur2.png';
import dinosaur3 from '../../assets/dinosaur3.png';
import AuthModal from '../components/AuthModal';

const { Title, Text } = Typography;
const { Countdown } = Statistic;

export const Profile = () => {
  const navigate = useNavigate();

  const films = useSelector((state) => state.films.films || []);
  const images = useSelector((state) => state.images.images || []);
  const tracks = useSelector((state) => state.music.tracks || []);
  const characters = useSelector((state) => state.rickAndMorty.characters || []);
  const facts = useSelector((state) => state.numbersFact.facts || []);

  // Получаем информацию о пользователе из Supabase
  const [user, setUser] = useState(null);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Функция проверки авторизации
  const checkAuth = async () => {
    try {
      const userToken = localStorage.getItem('userToken');
      if (userToken) {
        const userData = await authAPI.getUser();
        if (userData) {
          setUser(userData);
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const username = user ? (user.email ? user.email.split('@')[0] : user.id) : 'Гость';

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [countMedia, setCountMedia] = useState(0);
  const [deadline, setDeadline] = useState(Date.now() + 1000 * 60 * 60 * 1 * 0.125 + 1000 * 30);
  const [timeSpent, setTimeSpent] = useState(0);
  const [achievementUnlocked, setAchievementUnlocked] = useState(false);

  const accelerateTime = () => {
    setDeadline(Date.now() + 1000 * 10);
  };

  const countFavorites = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.filter((item) => item.is_favorite).length;
  };

  const totalFavorites = useMemo(() => {
    return (
      countFavorites(films) +
      countFavorites(images) +
      countFavorites(tracks) +
      countFavorites(characters) +
      countFavorites(facts)
    );
  }, [films, images, tracks, characters, facts]);

  useEffect(() => {
    setCountMedia(totalFavorites);
  }, [totalFavorites]);

  const handleLogout = async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    setIsLogoutModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.log('Logout error:', error);
    }

    setIsLogoutModalVisible(false);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userLogin');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setUser(null);
    navigate('/');
  };

  const handleCancelLogout = () => {
    setIsLogoutModalVisible(false);
  };

  const onFinish = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.log('Logout error:', error);
    }

    localStorage.removeItem('userToken');
    localStorage.removeItem('userLogin');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setUser(null);
    navigate('/');
  };

  const showAuthModal = () => {
    setIsAuthModalVisible(true);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prevTimeSpent) => prevTimeSpent + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeSpent >= 30 && !achievementUnlocked && user) {
      setAchievementUnlocked(true);
      message.success('Достижение разблокировано: 30 секунд в профиле!');
    }
  }, [timeSpent, achievementUnlocked, user]);

  const goals = useMemo(() => {
    const baseGoals = [];
    const newGoals = [...baseGoals];

    if (!newGoals.includes("Лайкнуть 10 карточек")) {
      newGoals.push("Лайкнуть 10 карточек");
    }
    if (!newGoals.includes("Пробыть 30 секунд в профиле")) {
      newGoals.push("Пробыть 30 секунд в профиле");
    }

    return newGoals;
  }, []);

  const isGoalAchieved = countMedia >= 10;
  const isTimeGoalAchieved = achievementUnlocked;

  const updatedGoals = useMemo(() => {
    let newGoals = [...goals];
    if (isGoalAchieved) {
      newGoals = newGoals.filter((goal) => goal !== "Лайкнуть 10 карточек");
    }
    if (isTimeGoalAchieved) {
      newGoals = newGoals.filter((goal) => goal !== "Пробыть 30 секунд в профиле");
    }
    return newGoals;
  }, [goals, isGoalAchieved, isTimeGoalAchieved]);

  const achievements = useMemo(() => {
    const baseAchievements = [];

    if (isGoalAchieved) {
      baseAchievements.push("Лайкнуть 10 карточек");
    }
    if (isTimeGoalAchieved) {
      baseAchievements.push("Пробыть 30 секунд в профиле");
    }

    return baseAchievements;
  }, [isGoalAchieved, isTimeGoalAchieved]);

  const handleAuthSuccess = () => {
    setIsAuthModalVisible(false);
    checkAuth();
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleAuthCancel = () => {
    setIsAuthModalVisible(false);
    setPendingAction(null);
  };

  return (
    <div className="page-container">
      <ModernNav />
      <div className="search-section">
        <h1 className="hero-title">👤 Профиль</h1>
        <p className="hero-subtitle">
          Добро пожаловать, {username}!
        </p>
      </div>

      <div className="profile-container" style={{ padding: '20px' }}>
        {!user ? (
          <Card style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Title level={3}>Вы не авторизованы</Title>
            <p>Пожалуйста, авторизуйтесь, чтобы получить доступ к персональной информации</p>
            <Button type="primary" onClick={showAuthModal}>
              Войти
            </Button>
          </Card>
        ) : (
          <>
            <Title level={2} className="profile-search-count">
              Количество лайков: {countMedia}
            </Title>

            <div className="profile-section">
              <Title level={4}>Аккаунт создан: {user ? new Date(user.created_at || user.aud).toLocaleDateString() : 'Неизвестно'}</Title>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <Countdown title="Время до окончания сессии" value={deadline} onFinish={onFinish} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px' }}>
              <Button onClick={accelerateTime} type="primary">
                Ускорить время
              </Button>
            </div>

            <div className="profile-section">
              <Text strong className="profile-subtitle">
                Цели:
              </Text>
              <List
                size="small"
                dataSource={updatedGoals}
                style={{ display: 'flex', justifyContent: 'center' }}
                renderItem={(goal) => (
                  <List.Item>
                    {goal === "Лайкнуть 10 карточек" ? (
                      <Row align="middle">
                        <Col>
                          <img
                            src={dinosaur2}
                            alt="dinosaur"
                            className={isGoalAchieved ? "achievement-dinosaur" : "goal-dinosaur"}
                          />
                        </Col>
                        <Col>
                          <Text>{goal}</Text>
                        </Col>
                      </Row>
                    ) : goal === "Пробыть 30 секунд в профиле" ? (
                      <Row align="middle">
                        <Col>
                          <img
                            src={dinosaur3}
                            alt="dinosaur"
                            className={isTimeGoalAchieved ? "achievement-dinosaur" : "goal-dinosaur"}
                          />
                        </Col>
                        <Col>
                          <Text>{goal}</Text>
                        </Col>
                      </Row>
                    ) : (
                      <Text>{goal}</Text>
                    )}
                  </List.Item>
                )}
              />
            </div>

            <div className="profile-section">
              <Text strong className="profile-subtitle">
                Достижения:
              </Text>
              <List
                size="small"
                style={{ display: 'flex', justifyContent: 'center' }}
                dataSource={achievements}
                renderItem={(achievement) => (
                  <List.Item>
                    {achievement === "Лайкнуть 10 карточек" ? (
                      <Row align="middle">
                        <Col>
                          <img src={dinosaur2} alt="dinosaur" className="achievement-dinosaur" />
                        </Col>
                        <Col>
                          <Text>{achievement}</Text>
                        </Col>
                      </Row>
                    ) : achievement === "Пробыть 30 секунд в профиле" ? (
                      <Row align="middle">
                        <Col>
                          <img src={dinosaur3} alt="dinosaur" className="achievement-dinosaur" />
                        </Col>
                        <Col>
                          <Text>{achievement}</Text>
                        </Col>
                      </Row>
                    ) : (
                      <Text>{achievement}</Text>
                    )}
                  </List.Item>
                )}
              />
            </div>
          </>
        )}

        {user && (
          <Button onClick={handleLogout} type="primary" danger style={{ marginTop: '20px' }}>
            Выйти
          </Button>
        )}

        <Modal
          title="Подтверждение выхода"
          open={isLogoutModalVisible}
          onOk={handleConfirmLogout}
          onCancel={handleCancelLogout}
        >
          <p>Вы уверены, что хотите выйти?</p>
        </Modal>
      </div>
      <BotomFooter />

      <AuthModal
        visible={isAuthModalVisible}
        onLogin={handleAuthSuccess}
        onCancel={handleAuthCancel}
      />
    </div>
  );
};

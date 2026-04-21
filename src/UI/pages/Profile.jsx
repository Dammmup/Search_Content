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
      // Если пользователь не авторизован, перенаправляем на главную
      navigate('/');
      return;
    }

    setIsLogoutModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Если ошибка при выходе из Supabase, очищаем локальные данные
      console.log('Logout error:', error);
    }

    setIsLogoutModalVisible(false);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
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
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setUser(null);
    navigate('/');
  };

  useEffect(() => {
    // Удаляем автоматический редирект на главную
    // if (!user) {
    //   navigate('/');
    // }
  }, [user, navigate]);

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
      message.success('Achievement Unlocked: Stayed 30 seconds on profile page!');
    }
  }, [timeSpent, achievementUnlocked, user]);

  // Для совместимости с существующей логикой целей
  const goals = useMemo(() => {
    // Временная заглушка для целей
    const baseGoals = [];
    const newGoals = [...baseGoals];

    if (!newGoals.includes("Like 10 cards")) {
      newGoals.push("Like 10 cards");
    }
    if (!newGoals.includes("Stay 30 seconds on profile page")) {
      newGoals.push("Stay 30 seconds on profile page");
    }

    return newGoals;
  }, []);

  const isGoalAchieved = countMedia >= 10;
  const isTimeGoalAchieved = achievementUnlocked;

  const updatedGoals = useMemo(() => {
    let newGoals = [...goals];
    if (isGoalAchieved) {
      newGoals = newGoals.filter((goal) => goal !== "Like 10 cards");
    }
    if (isTimeGoalAchieved) {
      newGoals = newGoals.filter((goal) => goal !== "Stay 30 seconds on profile page");
    }
    return newGoals;
  }, [goals, isGoalAchieved, isTimeGoalAchieved]);

  const achievements = useMemo(() => {
    // Временная заглушка для достижений
    const baseAchievements = [];

    if (isGoalAchieved && !baseAchievements.includes("Like 10 cards")) {
      baseAchievements.push("Like 10 cards");
    }
    if (isTimeGoalAchieved && !baseAchievements.includes("Stay 30 seconds on profile page")) {
      baseAchievements.push("Stay 30 seconds on profile page");
    }

    return baseAchievements;
  }, [isGoalAchieved, isTimeGoalAchieved]);

  // Обработчик успешной авторизации
  const handleAuthSuccess = () => {
    setIsAuthModalVisible(false);
    checkAuth(); // Обновляем информацию о пользователе
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
              <Title level={4}>Дата создания аккаунта: {user ? new Date(user.created_at || user.aud).toLocaleDateString() : 'Неизвестно'}</Title>
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
                    {goal === "Like 10 cards" ? (
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
                    ) : goal === "Stay 30 seconds on profile page" ? (
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
                    {achievement === "Like 10 cards" ? (
                      <Row align="middle">
                        <Col>
                          <img src={dinosaur2} alt="dinosaur" className="achievement-dinosaur" />
                        </Col>
                        <Col>
                          <Text>{achievement}</Text>
                        </Col>
                      </Row>
                    ) : achievement === "Stay 30 seconds on profile page" ? (
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

      {/* Модальное окно авторизации */}
      <AuthModal
        visible={isAuthModalVisible}
        onLogin={handleAuthSuccess}
        onCancel={handleAuthCancel}
      />
    </div>
  );
};

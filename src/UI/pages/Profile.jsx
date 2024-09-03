/* eslint-disable react/no-unescaped-entities */
import  { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Typography, List, Button, Modal, Row, Col, Statistic, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../../BL/userdb';
import Buttons from '../components/SearchBar';
import './styles/Profile.css';
import { BotomFooter } from '../components/BotomFooter';
import dinosaur2 from '../../assets/dinosaur2.png';
import dinosaur3 from '../../assets/dinosaur3.png';

const { Title, Text } = Typography;
const { Countdown } = Statistic;

export const Profile = () => {
  const navigate = useNavigate();

  const films = useSelector((state) => state.films.films || []);
  const images = useSelector((state) => state.images.images || []);
  const tracks = useSelector((state) => state.music.tracks || []);
  const characters = useSelector((state) => state.rickAndMorty.characters || []);
  const facts = useSelector((state) => state.numbersFact.facts || []);

  const currentUser = getCurrentUser();
  const username = localStorage.getItem('username') || (currentUser ? currentUser.username : 'Guest');

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

  const handleLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setIsLogoutModalVisible(false);
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleCancelLogout = () => {
    setIsLogoutModalVisible(false);
  };

  const onFinish = () => {
    logout();
    localStorage.removeItem('username');
    navigate('/');
  };

  useEffect(() => {
    if (!username) {
      navigate('/');
    }
  }, [username, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prevTimeSpent) => prevTimeSpent + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeSpent >= 30 && !achievementUnlocked) {
      setAchievementUnlocked(true);
      message.success('Achievement Unlocked: Stayed 30 seconds on profile page!');
    }
  }, [timeSpent, achievementUnlocked]);

  const goals = useMemo(() => {
    const baseGoals = currentUser ? currentUser.goals || [] : [];
    const newGoals = [...baseGoals];

    if (!newGoals.includes("Like 10 cards")) {
      newGoals.push("Like 10 cards");
    }
    if (!newGoals.includes("Stay 30 seconds on profile page")) {
      newGoals.push("Stay 30 seconds on profile page");
    }

    return newGoals;
  }, [currentUser]);

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
    const baseAchievements = currentUser ? currentUser.achievements || [] : [];
    const newAchievements = [...baseAchievements];

    if (isGoalAchieved && !newAchievements.includes("Like 10 cards")) {
      newAchievements.push("Like 10 cards");
    }
    if (isTimeGoalAchieved && !newAchievements.includes("Stay 30 seconds on profile page")) {
      newAchievements.push("Stay 30 seconds on profile page");
    }

    return newAchievements;
  }, [currentUser, isGoalAchieved, isTimeGoalAchieved]);

  return (
    <>
      <Buttons />
      <div className="profile-container">
        <Title className="profile-title">Welcome, {username || 'Guest'}</Title>
        <Title level={2} className="profile-search-count">
          Today's count of searching cards: {countMedia}
        </Title>

        <div className="profile-section" style={{ display: 'flex', justifyContent: 'center' }}>
        <Title level={2} className="profile-subtitle">
  Account Created: {currentUser && currentUser.createdAt ? currentUser.createdAt : 'Unknown'}
</Title>


        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Countdown title="Time before out of session" value={deadline} onFinish={onFinish} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
  <Button onClick={accelerateTime}>
    Accelerate Time
  </Button>
</div>

        <div className="profile-section">
          <Text strong className="profile-subtitle">
            Goals:
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
            Achievements:
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
        
        <Button onClick={handleLogout} type="primary" danger style={{ marginTop: '20px' }}>
          Logout
        </Button>
        <Modal
          title="Confirm Logout"
          visible={isLogoutModalVisible}
          onOk={handleConfirmLogout}
          onCancel={handleCancelLogout}
        >
          <p>Are you sure you want to logout?</p>
        </Modal>
      </div>
      <BotomFooter />
    </>
  );
};

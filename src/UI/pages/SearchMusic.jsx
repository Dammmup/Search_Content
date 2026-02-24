import React, { useState } from 'react';
import { Input, Card, Row, Col, Button, Alert, Spin, Image, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMusic, toggleTrackLike } from '../../BL/slices/musicSlice';
import { HeartOutlined, HeartFilled, ClockCircleOutlined } from '@ant-design/icons';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import ModernNav from '../components/ModernNav';
import { BotomFooter } from '../components/BotomFooter';
import AuthModal from '../components/AuthModal';
import { authAPI } from '../../BL/api';

const { Search } = Input;

// Форматирование длительности из секунд в MM:SS
const formatDuration = (seconds) => {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const SearchMusic = () => {
  const dispatch = useDispatch();
  const { tracks, status, error } = useSelector((state) => state.music);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [pendingSearchValue, setPendingSearchValue] = useState(null);

  const checkAuth = async () => {
    try {
      const userToken = localStorage.getItem('userToken');
      if (userToken) {
        const user = await authAPI.getUser();
        if (user) return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const onSearch = async (value) => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      setPendingSearchValue(value);
      setIsAuthModalVisible(true);
      return;
    }
    dispatch(fetchMusic(value));
  };

  const handleAuthSuccess = () => {
    setIsAuthModalVisible(false);
    if (pendingSearchValue) {
      dispatch(fetchMusic(pendingSearchValue));
      setPendingSearchValue(null);
    }
  };

  const handleAuthCancel = () => {
    setIsAuthModalVisible(false);
    setPendingSearchValue(null);
  };

  const handleLike = (track) => {
    dispatch(toggleTrackLike({ track }));
  };

  return (
    <div className="page-container">
      <ModernNav />
      <div className="search-section">
        <h1 className="hero-title">🎵 Поиск музыки</h1>
        <p className="hero-subtitle">
          Найди любимые треки и исполнителей
        </p>
        <Search
          placeholder="Введи название трека или исполнителя..."
          allowClear
          enterButton="Поиск"
          size="large"
          style={{ maxWidth: 400 }}
          onSearch={onSearch}
        />
      </div>
      <div className="results-container" style={{ marginTop: '20px' }}>
        {status === 'loading' ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <Alert message={error} type="error" />
        ) : tracks.length > 0 ? (
          <Row gutter={[24, 24]}>
            {tracks.map((result) => (
              <Col key={result.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  className={`track-card ${result.is_favorite ? 'liked' : ''}`}
                  hoverable
                  style={{ marginBottom: 16 }}
                  cover={
                    result.image ? (
                      <Image
                        alt={result.name}
                        src={result.image}
                        style={{ height: '200px', objectFit: 'cover' }}
                        fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFhMWEyZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwMCIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2N2VlYSI+8J+OtTwvdGV4dD48L3N2Zz4="
                      />
                    ) : null
                  }
                >
                  <Card.Meta
                    title={result.name}
                    description={
                      <div>
                        <span>{result.artist_name}</span>
                        {result.duration && (
                          <span style={{ marginLeft: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                            <ClockCircleOutlined style={{ marginRight: '4px' }} />
                            {formatDuration(result.duration)}
                          </span>
                        )}
                        {result.genre && (
                          <Tag color="purple" style={{ marginLeft: '8px', fontSize: '11px' }}>
                            {result.genre}
                          </Tag>
                        )}
                      </div>
                    }
                  />

                  {/* Аудиоплеер — 30сек превью */}
                  {result.audio && (
                    <div className="track-player-wrapper">
                      <AudioPlayer
                        src={result.audio}
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
                          marginTop: '12px',
                        }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <Button
                      type="text"
                      icon={
                        result.is_favorite ? (
                          <HeartFilled style={{ color: 'red' }} />
                        ) : (
                          <HeartOutlined />
                        )
                      }
                      onClick={() => handleLike(result)}
                    />
                    {result.track_url && (
                      <a
                        href={result.track_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}
                      >
                        Apple Music ↗
                      </a>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div></div>
        )}
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

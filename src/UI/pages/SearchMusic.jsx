import React from 'react';
import { Input, Card, Row, Col, Button, Alert, Spin, Image } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMusic, likeTrack } from '../../BL/slices/musicSlice';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import Buttons from '../components/SearchBar';
import { BotomFooter } from '../components/BotomFooter';

const { Search } = Input;

export const SearchMusic = () => {
  const dispatch = useDispatch();
  const { tracks, status, error } = useSelector((state) => state.music);

  const onSearch = (value) => {
    dispatch(fetchMusic(value));
  };

  const handleLike = (trackId) => {
    dispatch(likeTrack(trackId));
    console.log('liked in React', trackId);
  };

  return (
    <>
      <Buttons />
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <Search
          placeholder="Enter the query"
          allowClear
          enterButton="Search"
          style={{ width: 300 }}
          onSearch={onSearch}
        />
      </div>
      <div className="profile-container">
        <div className="results-container" style={{ marginTop: '20px' }}>
          {status === 'loading' ? (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <Spin size="large" />
            </div>
          ) : error ? (
            <Alert message={error} type="error" />
          ) : tracks.length > 0 ? (
            <Row gutter={[16, 16]}>
              {tracks.map((result) => (
                <Col key={result.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    className={`track-card ${result.is_favorite ? 'liked' : ''}`}
                    hoverable
                    style={{ marginBottom: 16 }}
                    cover={
                      result.album.images && result.album.images[0] ? (
                        <Image
                          alt={result.name}
                          src={result.album.images[0].url}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      ) : null
                    }
                  >
                    <Card.Meta 
                      title={result.name} 
                      description={result.artists.map((artist) => artist.name).join(', ')} 
                    />
                    <Button
                      type="text"
                      icon={
                        result.is_favorite ? (
                          <HeartFilled style={{ color: 'red' }} />
                        ) : (
                          <HeartOutlined />
                        )
                      }
                      onClick={() => handleLike(result.id)}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div></div>
          )}
        </div>
      </div>
     <BotomFooter/>
    </>
  );
};

import React, { useState } from 'react';
import { Input, Card, Row, Col, Button, Alert, Spin, Typography, Image } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchImages, likeImage } from '../../BL/slices/imageSlice';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import Buttons from '../components/SearchBar';
import { BotomFooter } from '../components/BotomFooter';

const { Search } = Input;
const { Text } = Typography;

export const SearchImage = () => {
  const dispatch = useDispatch();
  const { images, status, error } = useSelector((state) => state.images);
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false); // Состояние для отслеживания поиска

  const onSearch = (value) => {
    setQuery(value);
    setHasSearched(true);
    dispatch(fetchImages(value));
  };

  const handleLike = (image) => {
    dispatch(likeImage(image.id));
    console.log('liked in React', image.alt_description);
  };

  return (
    <div>
      <Buttons />
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <Search
          placeholder="Enter the query"
          enterButton="Search"
          style={{ width: 300 }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onSearch={onSearch}
        />
      </div>
      <div className="profile-container">
        <div className="results-container" style={{ marginTop: '20px' }}>
          {status === 'loading' ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Spin size="large" />
            </div>
          ) : error ? (
            <Alert message={`Error: ${error}`} type="error" />
          ) : hasSearched && images.length === 0 ? ( // Проверка на отсутствие результатов
            <Text type="warning">Изображения не найдены. Попробуйте другой запрос.</Text>
          ) : (
            <Row gutter={[16, 16]}>
              {images.map((result) => (
                <Col key={result.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    className={`image-card ${result.is_favorite ? 'liked' : ''}`}
                    hoverable
                    style={{ marginBottom: 16 }}
                    cover={
                      <Image
                      width={200}
                        alt={result.alt_description}
                        src={result.urls.small}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    }
                  >
                    <Card.Meta title={result.alt_description} />
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
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
   <BotomFooter/>
    </div>
  );
};
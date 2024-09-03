/* eslint-disable no-unused-vars */
import { Input, Card, Row, Col, Button, Alert, Spin, Image } from 'antd';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFilms, likeFilm } from '../../BL/slices/filmSlice';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import Buttons from '../components/SearchBar';
import { BotomFooter } from '../components/BotomFooter';

const { Search } = Input;

export const SearchFilm = () => {
  const dispatch = useDispatch();
  const { films, status, error } = useSelector((state) => state.films);

  const onSearch = (value) => {
    dispatch(fetchFilms(value));
  };

  const handleLike = (filmId) => {
    dispatch(likeFilm(filmId));
    console.log('liked in React', filmId);
  };

  const isValidFilm = (film) => {
    return film.name && film.poster && film.poster.url;
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
          ) : films.length > 0 ? (
            <Row gutter={[16, 16]}>
              {films.filter(isValidFilm).map((result) => (
                <Col key={result.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    className={`film-card ${result.is_favorite ? 'liked' : ''}`}
                    hoverable
                    style={{ marginBottom: 16 }}
                    cover={
                      <Image alt={result.name} src={result.poster.url} style={{ height: '300px', objectFit: 'cover' }} />
                    }
                  >
                    <Card.Meta 
                      title={result.name} 
                      description={
                        <>
                          {result.year && <p><strong>Год:</strong> {result.year}</p>}
                          {result.description && <p><strong>Описание:</strong> {result.description}</p>}
                          {result.rating && result.rating.kp && <p><strong>Рейтинг КиноПоиск:</strong> {result.rating.kp}</p>}
                          {result.rating && result.rating.imdb && <p><strong>Рейтинг IMDb:</strong> {result.rating.imdb}</p>}
                        </>
                      } 
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
            <p style={{ textAlign: 'center' }}></p>
          )}
        </div>
      </div>
<BotomFooter/>
    </>
  );
};

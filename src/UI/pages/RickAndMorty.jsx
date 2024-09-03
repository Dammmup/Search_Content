/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Input, Card, Row, Col, Button, Alert, Spin, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCharacters, likeCharacter } from '../../BL/slices/rickAndMortySlice';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import Buttons from '../components/SearchBar';
import { BotomFooter } from '../components/BotomFooter';

const { Search } = Input;
const { Meta } = Card;
const { Text } = Typography;

export const RickAndMorty = () => {
  const dispatch = useDispatch();
  const { characters, status, error } = useSelector((state) => state.rickAndMorty);
  const [hasSearched, setHasSearched] = useState(false); // Состояние для отслеживания поиска

  const onSearch = (value) => {
    setHasSearched(true);
    dispatch(fetchCharacters(value));
  };

  const handleLike = (character) => {
    dispatch(likeCharacter(character.id));
    console.log('liked in React', character);
  };

  return (
    <>
      <Buttons />
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <Search
          placeholder="Enter the query"
          allowClear
          enterButton="Search"
          onSearch={onSearch}
          style={{ width: 300 }}
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
          ) : hasSearched && characters.length === 0 ? ( // Проверка на отсутствие результатов
            <Text type="warning">Characters not found.</Text>
          ) : (
            <Row gutter={[16, 16]}>
              {characters.map((character) => (
                <Col key={character.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card
                    className={`character-card ${character.is_favorite ? 'liked' : ''}`}
                    hoverable
                    style={{ width: 200 }}
                    cover={<img alt={character.name} src={character.image} />}
                  >
                    <Meta title={character.name} />
                    <p>Статус: {character.status}</p>
                    <p>Вид: {character.species}</p>
                    <p>Пол: {character.gender}</p>
                    <p>Место происхождения: {character.origin.name}</p>
                    <p>Местоположение: {character.location.name}</p>
                    <Button
                      type="text"
                      icon={
                        character.is_favorite ? (
                          <HeartFilled style={{ color: 'red' }} />
                        ) : (
                          <HeartOutlined />
                        )
                      }
                      onClick={() => handleLike(character)}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
<BotomFooter/>
    </>
  );
};
import React from 'react';
import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';
import ModernNav from '../components/ModernNav';

export const NotFound = () => (
  <div className="page-container">
    <ModernNav />
    <Result
      status="404"
      title="404"
      subTitle="Страница не найдена"
      extra={<Link to="/"><Button type="primary">На главную</Button></Link>}
    />
  </div>
);

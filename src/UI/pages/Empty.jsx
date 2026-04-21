import { Link } from "react-router-dom";
import { Button } from 'antd';
import ModernNav from "../components/ModernNav";
import { BotomFooter } from "../components/BotomFooter";
import { FrownOutlined } from '@ant-design/icons';

export const Empty = () => {
  return (
    <div className="page-container">
      <ModernNav />
      <div className="search-section">
        <FrownOutlined style={{ fontSize: 80, color: 'var(--text-muted)', marginBottom: '20px' }} />
        <h1 className="hero-title">😢 Пока пусто</h1>
        <p className="hero-subtitle">
          У вас пока нет избранных материалов.<br />
          Начните добавлять понравившиеся фильмы, музыку, игры и другой контент!
        </p>
        <Link to="/">
          <Button type="primary" size="large">
            На главную
          </Button>
        </Link>
      </div>
      <BotomFooter />
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Input, Button, Alert, Spin, Image, Tag, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCrypto, searchCrypto, toggleCryptoLike } from '../../BL/slices/cryptoSlice';
import { HeartOutlined, HeartFilled, ArrowUpOutlined, ArrowDownOutlined, SearchOutlined } from '@ant-design/icons';
import ModernNav from '../components/ModernNav';
import { BotomFooter } from '../components/BotomFooter';
import AuthModal from '../components/AuthModal';
import { authAPI } from '../../BL/api';

const { Search } = Input;

export const SearchCrypto = () => {
    const dispatch = useDispatch();
    const { coins, status, error } = useSelector((state) => state.crypto);
    const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
    const [pendingSearchValue, setPendingSearchValue] = useState(null);

    // Функция проверки авторизации
    const checkAuth = async () => {
        try {
            const userToken = localStorage.getItem('userToken');
            if (userToken) {
                const user = await authAPI.getUser();
                if (user) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            return false;
        }
    };

    // Обработчик поиска
    const onSearch = async (value) => {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
            // Сохраняем значение для поиска и показываем модальное окно
            setPendingSearchValue(value);
            setIsAuthModalVisible(true);
            return;
        }
        // Если пользователь авторизован, выполняем поиск
        if (value.trim()) {
            dispatch(searchCrypto(value));
        } else {
            dispatch(fetchCrypto());
        }
    };

    // Обработчик успешной авторизации
    const handleAuthSuccess = () => {
        setIsAuthModalVisible(false);
        if (pendingSearchValue !== null) {
            // Выполняем отложенный поиск
            if (pendingSearchValue.trim()) {
                dispatch(searchCrypto(pendingSearchValue));
            } else {
                dispatch(fetchCrypto());
            }
            setPendingSearchValue(null);
        }
    };

    // Обработчик отмены авторизации
    const handleAuthCancel = () => {
        setIsAuthModalVisible(false);
        setPendingSearchValue(null);
    };

    useEffect(() => {
        dispatch(fetchCrypto());
    }, [dispatch]);

    const handleLike = (coin) => {
        dispatch(toggleCryptoLike({ coin }));
    };

    const formatPrice = (price) => {
        if (price >= 1) {
            return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return price.toFixed(6);
    };

    const formatMarketCap = (cap) => {
        if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
        if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
        if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
        return `$${cap}`;
    };

    const columns = [
        {
            title: '#',
            dataIndex: 'market_cap_rank',
            key: 'rank',
            width: 50,
        },
        {
            title: 'Монета',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Image
                        src={record.image}
                        width={24}
                        height={24}
                        preview={false}
                        style={{ borderRadius: '50%' }}
                    />
                    <div>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{text}</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: '8px', textTransform: 'uppercase' }}>
                            {record.symbol}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Цена',
            dataIndex: 'current_price',
            key: 'price',
            render: (price) => (
                <span style={{ fontWeight: 600, color: '#fff' }}>${formatPrice(price)}</span>
            ),
        },
        {
            title: '24ч %',
            dataIndex: 'price_change_percentage_24h',
            key: 'change',
            render: (change) => {
                const isPositive = change >= 0;
                return (
                    <Tag
                        color={isPositive ? 'success' : 'error'}
                        icon={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    >
                        {isPositive ? '+' : ''}{change?.toFixed(2)}%
                    </Tag>
                );
            },
        },
        {
            title: 'Капитализация',
            dataIndex: 'market_cap',
            key: 'marketCap',
            render: (cap) => (
                <span style={{ color: 'var(--text-secondary' }}>{formatMarketCap(cap)}</span>
            ),
        },
        {
            title: 'Объём 24ч',
            dataIndex: 'total_volume',
            key: 'volume',
            render: (vol) => (
                <span style={{ color: 'var(--text-secondary' }}>{formatMarketCap(vol)}</span>
            ),
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="text"
                    icon={
                        record.is_favorite ? (
                            <HeartFilled style={{ color: '#f5576c' }} />
                        ) : (
                            <HeartOutlined style={{ color: '#f5576c' }} />
                        )
                    }
                    onClick={() => handleLike(record)}
                />
            ),
        },
    ];

    return (
        <div className="page-container">
            <ModernNav />

            <div className="search-section">
                <h1 className="hero-title">💰 Криптовалюты</h1>
                <p className="hero-subtitle">
                    Отслеживай курсы криптовалют в реальном времени
                </p>

                <Search
                    placeholder="Поиск монеты (bitcoin, ethereum...)"
                    allowClear
                    enterButton={<><SearchOutlined /> Поиск</>}
                    size="large"
                    style={{ maxWidth: 400 }}
                    onSearch={onSearch}
                />
            </div>

            <div className="results-container" style={{ padding: '20px' }}>
                {status === 'loading' ? (
                    <div style={{ textAlign: 'center', marginTop: '50px' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>Загружаем данные...</p>
                    </div>
                ) : error ? (
                    <Alert message={`Ошибка: ${error}`} type="error" showIcon />
                ) : (
                    <div className="crypto-table-wrapper">
                        <Table
                            dataSource={coins}
                            columns={columns}
                            rowKey="id"
                            pagination={{ pageSize: 20 }}
                            scroll={{ x: 800 }}
                            style={{
                                background: 'var(--card-bg)',
                                borderRadius: '16px',
                                overflow: 'hidden'
                            }}
                        />
                    </div>
                )}
            </div>

            <BotomFooter />

            {/* Модальное окно авторизации */}
            <AuthModal
                visible={isAuthModalVisible}
                onLogin={handleAuthSuccess}
                onCancel={handleAuthCancel}
            />

            <style>{`
        .crypto-table-wrapper .ant-table {
          background: transparent !important;
        }
        
        .crypto-table-wrapper .ant-table-thead > tr > th {
          background: rgba(255,255,255,0.05) !important;
          color: var(--text-secondary) !important;
          border-bottom: 1px solid var(--glass-border) !important;
        }
        
        .crypto-table-wrapper .ant-table-tbody > tr > td {
          background: transparent !important;
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
        }
        
        .crypto-table-wrapper .ant-table-tbody > tr:hover > td {
          background: rgba(255,255,255,0.05) !important;
        }
        
        .crypto-table-wrapper .ant-pagination {
          margin-top: 20px !important;
        }
        
        .crypto-table-wrapper .ant-pagination-item {
          background: var(--card-bg) !important;
          border-color: var(--glass-border) !important;
        }
        
        .crypto-table-wrapper .ant-pagination-item a {
          color: var(--text-primary) !important;
        }
        
        .crypto-table-wrapper .ant-pagination-item-active {
          background: var(--primary-gradient) !important;
        }
      `}</style>
        </div>
    );
};

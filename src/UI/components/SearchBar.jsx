import { Space, Button, ConfigProvider, Popover } from 'antd';
import { HeartOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './styles/searchbar.css';
import logo from './logo.png';
import { useSelector } from 'react-redux';
import { colors1,colors2,colors3,getActiveColors,getHoverColors } from '../pages/fitch';


const Buttons = () => {
  const content = (
    <div style={{width:150}}>
      <p>Click this button to navigate 
        to page with liked items</p>
    </div>
  );
  const content1 = (
    <div style={{width:150}}>
      <p>Click this button to enter profile data</p>
    </div>
  );
  const navigate = useNavigate();
  const films = useSelector((state) => state.films.films || []);
  const images = useSelector((state) => state.images.images || []);
  const tracks = useSelector((state) => state.music.tracks || []);
  const characters = useSelector((state) => state.rickAndMorty.characters || []);
  const facts = useSelector((state) => state.numbersFact.facts || []);
  const likedItems = [...films, ...images, ...tracks, ...characters, ...facts];


  const handleFavoritesClick = () => {
    navigate(likedItems.length === 0 ? '/empty' : '/favorites');
  };

  const handleProfileClick = () => {
  
      navigate('/profile');
    
  };


  return (
    <div className='posiciya'>
      <div className="elme">
        <Link to="/">
          <Button type="primary" size="large" icon={<img src={logo} alt="" style={{ width: 150,marginTop:90 }} />}>
          </Button>
        </Link>
      </div>

      <Space>
        <Space>
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  colorPrimary: `linear-gradient(135deg, ${colors1.join(', ')})`,
                  colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(colors1).join(', ')})`,
                  colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(colors1).join(', ')})`,
                  lineWidth: 0,
                },
              },
            }}
          >
            <Link to="/movies">
              <Button type="primary" size="large">
               Movies
              </Button>
            </Link>
          </ConfigProvider>

          <ConfigProvider
            theme={{
              components: {
                Button: {
                  colorPrimary: `linear-gradient(90deg, ${colors2.join(', ')})`,
                  colorPrimaryHover: `linear-gradient(90deg, ${getHoverColors(colors2).join(', ')})`,
                  colorPrimaryActive: `linear-gradient(90deg, ${getActiveColors(colors2).join(', ')})`,
                  lineWidth: 0,
                },
              },
            }}
          >
            <Link to="/music">
              <Button type="primary" size="large">
               Music
              </Button>
            </Link>
          </ConfigProvider>

          <ConfigProvider
            theme={{
              components: {
                Button: {
                  colorPrimary: `linear-gradient(135deg, ${colors1.join(', ')})`,
                  colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(colors1).join(', ')})`,
                  colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(colors1).join(', ')})`,
                  lineWidth: 0,
                },
              },
            }}
          >
            <Link to="/image">
              <Button type="primary" size="large">
               Images
              </Button>
            </Link>
          </ConfigProvider>

          <ConfigProvider
            theme={{
              components: {
                Button: {
                  colorPrimary: `linear-gradient(116deg, ${colors3.join(', ')})`,
                  colorPrimaryHover: `linear-gradient(116deg, ${getHoverColors(colors3).join(', ')})`,
                  colorPrimaryActive: `linear-gradient(116deg, ${getActiveColors(colors3).join(', ')})`,
                  lineWidth: 0,
                },
              },
            }}
          >
            <Link to="/ram">
              <Button type="primary" size="large">
                Rick and Morty
              </Button>
            </Link>
          </ConfigProvider>

          <ConfigProvider
            theme={{
              components: {
                Button: {
                  colorPrimary: `linear-gradient(135deg, ${colors1.join(', ')})`,
                  colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(colors1).join(', ')})`,
                  colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(colors1).join(', ')})`,
                  lineWidth: 0,
                },
              },
            }}
          >
            <Link to="/numbers">
              <Button type="primary" size="large">
                Numbers Facts
              </Button>
            </Link>
          </ConfigProvider>
        </Space>
      </Space>
      <Popover content={content} title="Favorites cards">
      <Button type="primary" shape="round" icon={<HeartOutlined />} onClick={handleFavoritesClick} />
      </Popover>
      <Popover content={content1} title="Profile">
      <Button type="primary" shape="round" icon={<UserOutlined />} onClick={handleProfileClick} />
      </Popover>
</div>
  );
};

export default Buttons;

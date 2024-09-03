import { Link } from "react-router-dom";
import { Space, ConfigProvider, Button, Typography, Layout } from 'antd';
import Buttons from "../components/SearchBar";
import { colors1,getActiveColors,getHoverColors } from './fitch';
import { BotomFooter } from "../components/BotomFooter";

const { Title, Text } = Typography;
const { Header, Content } = Layout;

export const Empty = () => {
  return (
    <>
      <Buttons />
      <Layout className="cartPage" style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: 0, textAlign: 'center' }}>
          <Title level={2}>You haven't any liked cards :c</Title>
        </Header>
        <Content style={{ padding: '0 50px', textAlign: 'center' }} className="profile-container">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={4}>Most likely, you haven't liked anything yet.</Title>
            <Text>To like something, go to the main page.</Text>
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
              <Link to="/">
                <Button type="primary" size="large">
                  Go back
                </Button>
              </Link>
            </ConfigProvider>
          </Space>
        </Content>
<BotomFooter/>
      </Layout>
    </>
  );
};

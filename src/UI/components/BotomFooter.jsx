import { Layout, Row, Col } from 'antd';
import client1 from '../../assets/client1.png';
import client2 from '../../assets/client2.png';
import client3 from '../../assets/client3.png';
import client4 from '../../assets/client4.png';
import client5 from '../../assets/client5.png';
import client6 from '../../assets/client6.png';
import './styles/BotomFooter.css';

const { Footer } = Layout;

const images = [client1, client2, client3, client4, client5, client6];

export const BotomFooter = () => {
  return (
    <Footer className="profile-footer">
      <Row justify="center" align="middle" className="footer-images-row">
        {images.map((src, index) => (
          <Col key={index} xs={12} sm={8} md={4} className="footer-image-col">
            <img src={src} alt={`client-${index + 1}`} className="footer-image" />
          </Col>
        ))}
      </Row>
      <Row justify="center" align="middle">
        <Col className="footer-contact-col">
          <h5 className="footer-title" >Find us</h5>
          <a href=''>
          <p className="footer-contact">+7(747)8313398</p></a>
          <a href=''><p className="footer-contact">damir.-@mail.ru</p></a>
        </Col>
      </Row>
    </Footer>
  );
};
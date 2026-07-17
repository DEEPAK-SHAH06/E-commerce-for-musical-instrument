// src/pages/HelpSupportPage.jsx
import React, { useState, useContext } from 'react';
import { Row, Col, Typography, Form, Input, Button, Collapse, Card, message, Space } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, QuestionCircleOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { LanguageContext } from '../context/LanguageContext';
import api from '../api/api';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const HelpSupportPage = () => {
  const { t } = useContext(LanguageContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('/support/ticket', values);
      if (response.data.success) {
        message.success(t('ticketSuccess') || 'Support ticket submitted successfully!');
        form.resetFields();
      } else {
        message.error('Failed to submit ticket. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      message.error(error.response?.data?.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // FAQ Content based on Language
  const faqs = [
    {
      key: '1',
      question: {
        en: 'What are your delivery locations in Nepal?',
        ne: 'नेपालमा तपाईंहरूको डेलिभरी हुने स्थानहरू कुन-कुन हुन्?'
      },
      answer: {
        en: 'We deliver all across Nepal, including major cities like Kathmandu, Pokhara, Lalitpur, Bhaktapur, Biratnagar, Butwal, and Chitwan. Courier charges may apply outside Kathmandu valley.',
        ne: 'हामी काठमाडौं, पोखरा, ललितपुर, भक्तपुर, विराटनगर, बुटवल र चितवन लगायत नेपालभर डेलिभरी गर्छौं। काठमाडौं उपत्यका बाहिर कुरियर शुल्क लाग्न सक्छ।'
      }
    },
    {
      key: '2',
      question: {
        en: 'How can I pay for my musical instruments?',
        ne: 'मैले वाद्ययन्त्रहरूको भुक्तानी कसरी गर्न सक्छु?'
      },
      answer: {
        en: 'We accept Cash on Delivery (COD), eSewa, Khalti, and direct Bank Transfers. You can select your preferred method during checkout.',
        ne: 'हामी डेलिभरीमा नगद (COD), ईसेवा, खल्ती, र सिधा बैंक स्थानान्तरण स्वीकार गर्छौं। तपाईंले चेकआउट गर्दा आफ्नो उपयुक्त विधि रोज्न सक्नुहुन्छ।'
      }
    },
    {
      key: '3',
      question: {
        en: 'Do you offer warranty on guitars and keyboards?',
        ne: 'के गितार र किबोर्डमा वारेन्टी उपलब्ध छ?'
      },
      answer: {
        en: 'Yes, all our premium and branded instruments come with a 1-year store warranty covering manufacturing defects. Accessories and strings are not covered.',
        ne: 'हो, हाम्रा सबै प्रिमियम र ब्रान्डेड वाद्ययन्त्रहरूमा उत्पादन त्रुटिहरू समेट्ने १ वर्षको स्टोर वारेन्टी आउँछ। सामानहरू (accessories) र तारहरू (strings) यसमा समेटिँदैनन्।'
      }
    },
    {
      key: '4',
      question: {
        en: 'Can I visit your physical store to test instruments?',
        ne: 'के म वाद्ययन्त्रहरू परीक्षण गर्न तपाईंको भौतिक स्टोरमा आउन सक्छु?'
      },
      answer: {
        en: 'Absolutely! Our showroom is located in Putalisadak, Kathmandu, where you can play and test any instrument before making a purchase.',
        ne: 'पक्कै पनि! हाम्रो शोरुम पुतलीसडक, काठमाडौंमा अवस्थित छ, जहाँ तपाईंले खरिद गर्नु अघि कुनै पनि वाद्ययन्त्र बजाएर परीक्षण गर्न सक्नुहुन्छ।'
      }
    }
  ];

  return (
    <div style={{ padding: '32px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Title level={1}><CustomerServiceOutlined /> {t('helpSupport')}</Title>
        <Paragraph style={{ fontSize: 16, color: '#666' }}>
          {t('nepalStore')}
        </Paragraph>
      </div>

      <Row gutter={[32, 32]}>
        {/* Contact Info and FAQs */}
        <Col xs={24} lg={14}>
          <Title level={3}><QuestionCircleOutlined /> {t('frequentlyAskedQuestions')}</Title>
          <Collapse accordion defaultActiveKey={['1']} style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', marginBottom: 32 }}>
            {faqs.map((faq) => (
              <Panel 
                header={<Text strong style={{ fontSize: 15 }}>{faq.question[t('languageLabel') === 'EN | NPR' ? 'en' : 'ne']}</Text>} 
                key={faq.key}
              >
                <Paragraph style={{ margin: 0, fontSize: 14, lineHeight: '1.6', color: '#555' }}>
                  {faq.answer[t('languageLabel') === 'EN | NPR' ? 'en' : 'ne']}
                </Paragraph>
              </Panel>
            ))}
          </Collapse>

          <Card title={<Text strong style={{ fontSize: 18 }}>{t('contactUs')}</Text>} style={{ borderRadius: 8 }}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <EnvironmentOutlined style={{ fontSize: 20, color: '#1890ff', marginRight: 12 }} />
                <Text style={{ fontSize: 15 }}>Putalisadak, Kathmandu, Nepal</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PhoneOutlined style={{ fontSize: 20, color: '#1890ff', marginRight: 12 }} />
                <Text style={{ fontSize: 15 }}>+977 1 4412345 / +977 9801234567</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <MailOutlined style={{ fontSize: 20, color: '#1890ff', marginRight: 12 }} />
                <Text style={{ fontSize: 15 }}>support@soundoramusic.com</Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Contact Form */}
        <Col xs={24} lg={10}>
          <Card 
            title={<Text strong style={{ fontSize: 18 }}>Submit a Support Ticket</Text>} 
            style={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              <Form.Item
                label={t('fullName')}
                name="name"
                rules={[{ required: true, message: 'Please enter your full name' }]}
              >
                <Input placeholder="John Doe" size="large" />
              </Form.Item>

              <Form.Item
                label={t('email')}
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email address' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
              >
                <Input placeholder="john@example.com" size="large" />
              </Form.Item>

              <Form.Item
                label={t('subject')}
                name="subject"
                rules={[{ required: true, message: 'Please enter a subject' }]}
              >
                <Input placeholder="Guitar tuning issue" size="large" />
              </Form.Item>

              <Form.Item
                label={t('message')}
                name="message"
                rules={[{ required: true, message: 'Please enter your message' }]}
              >
                <Input.TextArea rows={4} placeholder="Describe your inquiry in detail..." />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                  {t('submit')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HelpSupportPage;

import React from 'react'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useTranslation } from '@/Hooks/useTranslation';

const Footer = () => {
    const { t } = useTranslation();
    
    const footerStyle = {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: '40px 0',
        fontSize: '14px',
        textAlign: 'center'
      };
    
      const footerContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        flexWrap: 'wrap' // For responsiveness
      };
    
      const sectionStyle = {
        flex: '1',
        margin: '0 15px'
      };
    
      const titleStyle = {
        fontSize: '18px',
        marginBottom: '15px'
      };
    
      const linkStyle = {
        color: '#fff',
        textDecoration: 'none',
        marginBottom: '10px',
        display: 'block'
      };
    
      const linkHoverStyle = {
        textDecoration: 'underline'
      };
    
      const socialIconsStyle = {
        display: 'flex',
        gap: '15px',
        fontSize: '20px'
      };
    
      const footerBottomStyle = {
        textAlign: 'center',
        paddingTop: '20px',
        borderTop: '1px solid #444',
        marginTop: '30px',
        fontSize: '13px'
      };
    
      return (
        <footer style={footerStyle}>
          <div style={footerContainerStyle}>
            <div style={sectionStyle}>
              <h3 style={titleStyle}>{t('aboutUs')}</h3>
              <p>{t('aboutUsDescription')}</p>
            </div>
    
            <div style={sectionStyle}>
              <h3 style={titleStyle}>{t('quickLinks')}</h3>
              <a href="/about" style={linkStyle} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>{t('about')}</a>
              <a href="/contact" style={linkStyle} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>{t('contact')}</a>
              <a href="/faq" style={linkStyle} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>{t('faq')}</a>
              <a href="/privacy" style={linkStyle} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>{t('privacyPolicy')}</a>
            </div>
    
            <div style={sectionStyle}>
              <h3 style={titleStyle}>{t('followUs')}</h3>
              <div style={socialIconsStyle}>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
    
          <div style={footerBottomStyle}>
            <p>&copy; {new Date().getFullYear()} {t('yourCompany')}. {t('allRightsReserved')}.</p>
            {/* Hidden Admin Access Hint - Very subtle */}
            <div style={{
              fontSize: '10px',
              color: '#333',
              marginTop: '5px',
              opacity: '0.3',
              cursor: 'default',
              userSelect: 'none'
            }} title={t('administratorAccessAvailable')}>
              A
            </div>
          </div>
        </footer>
      );
    }
    
 

export default Footer
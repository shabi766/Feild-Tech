import React from 'react'
import '@fortawesome/fontawesome-free/css/all.min.css';


const Footer = () => {
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
              <h3 style={titleStyle}>About Us</h3>
              <p>We are committed to providing the best service to our customers. Feel free to explore our platform and learn more about what we offer.</p>
            </div>
    
            <div style={sectionStyle}>
              <h3 style={titleStyle}>Quick Links</h3>
              <a href="/about" style={linkStyle} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>About</a>
              <a href="/contact" style={linkStyle} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>Contact</a>
              <a href="/faq" style={linkStyle} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>FAQ</a>
              <a href="/privacy" style={linkStyle} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>Privacy Policy</a>
            </div>
    
            <div style={sectionStyle}>
              <h3 style={titleStyle}>Follow Us</h3>
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
            <p>&copy; {new Date().getFullYear()} YourCompany. All rights reserved.</p>
          </div>
        </footer>
      );
    }
    
 

export default Footer
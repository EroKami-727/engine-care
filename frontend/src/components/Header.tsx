import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showBack = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  return (
    <header className={`header ${!isHomePage ? 'header-compact' : ''}`}>
      <div className="header-container">
        <div className="header-left">
          {showBack && (
            <button 
              className="btn-back"
              onClick={() => navigate('/')}
              aria-label="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>Back</span>
            </button>
          )}
          <div className="logo" onClick={() => navigate('/')}>
            <div className="logo-icon">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2"/>
                <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="20" cy="20" r="6" fill="currentColor"/>
                <path d="M20 2V8M20 32V38M2 20H8M32 20H38" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 6L11 11M29 29L34 34M34 6L29 11M6 34L11 29" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-name">EngineCore</span>
              <span className="logo-tagline">ML Diagnostics</span>
            </div>
          </div>
        </div>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <a href="#models" className="nav-link" onClick={() => setMenuOpen(false)}>Models</a>
          <a href="#about" className="nav-link" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#help" className="nav-link" onClick={() => setMenuOpen(false)}>Help</a>
        </nav>

        <div className="header-right">
          <ThemeToggle />
          <button 
            className={`menu-toggle ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="menu-line"></span>
            <span className="menu-line"></span>
            <span className="menu-line"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return !document.documentElement.hasAttribute('data-theme');
    }
    return true;
  });

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    setIsDark(!isDark);
  };

  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      {isDark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
};

export default Header;

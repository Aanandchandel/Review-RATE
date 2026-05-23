import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [authModal, setAuthModal] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/?search=${encodeURIComponent(query.trim())}`);
    else navigate('/');
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <header className="navbar">
        <div className="container navbar-inner">
          {/* Left side: Brand */}
          <Link to="/" className="navbar-brand">
            <img src="/BrandLogo.png" alt="Logo" className="navbar-brand-logo" />
            <span className="brand-text">
              Review<span className="ampersand">&amp;</span>RATE
            </span>
          </Link>

          {/* Right side: Search + Auth buttons */}
          <div className="navbar-right">
            <form className="navbar-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="navbar-search-btn" aria-label="Search">
                <img src="/akar-icons_search.png" alt="Search" className="search-icon-img" />
              </button>
            </form>

            <nav className="navbar-nav">
              {user ? (
                <div className="user-menu" ref={dropdownRef}>
                  <button
                    className="user-avatar-btn"
                    onClick={() => setDropdownOpen((o) => !o)}
                    aria-expanded={dropdownOpen}
                  >
                    <span className="user-avatar">{user.name[0].toUpperCase()}</span>
                    <span className="user-name">{user.name.split(' ')[0]}</span>
                    <span className="chevron">{dropdownOpen ? '▲' : '▼'}</span>
                  </button>

                  {dropdownOpen && (
                    <div className="user-dropdown">
                      <p className="dropdown-info">
                        <span className="dropdown-name">{user.name}</span>
                        <span className="dropdown-email">{user.email}</span>
                      </p>
                      <hr className="dropdown-divider" />
                      <button
                        className="dropdown-logout"
                        onClick={() => { logout(); setDropdownOpen(false); }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button className="btn-nav" onClick={() => setAuthModal('signup')}>SignUp</button>
                  <button className="btn-nav btn-nav-primary" onClick={() => setAuthModal('login')}>
                    Login
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {authModal && (
        <AuthModal
          initialMode={authModal}
          onClose={() => setAuthModal(null)}
        />
      )}
    </>
  );
}
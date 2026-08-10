import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Navbar Component
 * Displays the website header, logo, navigation links, login state, and mobile menu toggle.
 */
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userSession, setUserSession] = useState(null);

  // Check login session state
  const checkSession = () => {
    const session = localStorage.getItem('user_session');
    if (session) {
      try {
        setUserSession(JSON.parse(session));
      } catch (e) {
        console.error('Failed to parse user session from localStorage:', e);
        setUserSession(null);
      }
    } else {
      setUserSession(null);
    }
  };

  useEffect(() => {
    checkSession();
    // Listen for storage events when user logs in/out
    window.addEventListener('storage', checkSession);
    return () => window.removeEventListener('storage', checkSession);
  }, []);

  // Helper function for NavLink styling
  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
    }`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Brand */}
          <NavLink to="/" className="flex items-center space-x-2 text-xl font-bold text-slate-800">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 py-1 rounded-lg text-lg shadow-xs">
              🤖
            </span>
            <span className="tracking-tight text-blue-950">AI Routine Maker</span>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/create-routine" className={navLinkClass}>
              Create Routine
            </NavLink>
            <NavLink to="/my-routine" className={navLinkClass}>
              My Routine
            </NavLink>
            <NavLink to="/progress" className={navLinkClass}>
              Progress
            </NavLink>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`
              }
            >
              <span>👤</span>
              <span>{userSession ? userSession.username : 'Login'}</span>
            </NavLink>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900 p-2 rounded-md focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-2">
          <NavLink
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md text-base font-medium ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/create-routine"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md text-base font-medium ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            Create Routine
          </NavLink>
          <NavLink
            to="/my-routine"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md text-base font-medium ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            My Routine
          </NavLink>
          <NavLink
            to="/progress"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md text-base font-medium ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            Progress
          </NavLink>
          <NavLink
            to="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md text-base font-medium ${
                isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
              }`
            }
          >
            👤 {userSession ? `Account (${userSession.username})` : 'Login'}
          </NavLink>
        </div>
      )}
    </header>
  );
};

export default Navbar;

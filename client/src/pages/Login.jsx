import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser, loginUser, logoutUser, fetchCurrentUser } from '../services/api';
import { useToast } from '../context/ToastContext';

/**
 * Auth / Login & Sign Up Page Component
 * Handles MySQL user authentication, session cookies, space-free username validation,
 * and password show/hide eye toggle button.
 */
const Login = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Tab State: 'signup' or 'login'
  const [activeTab, setActiveTab] = useState('signup');

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userSession, setUserSession] = useState(null);

  // Load existing session from backend on mount
  useEffect(() => {
    fetchCurrentUser()
      .then((user) => {
        if (user && user.username) {
          setUserSession(user);
        }
      })
      .catch(() => {
        setUserSession(null);
      });
  }, []);

  /**
   * Validate Username (No spaces allowed)
   */
  const validateUsername = (name) => {
    if (!name || !name.trim()) return 'Username is required.';
    if (name.includes(' ')) return 'Username cannot contain any spaces.';
    if (name.length < 3) return 'Username must be at least 3 characters long.';
    return null;
  };

  /**
   * Handle Sign Up
   */
  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const usernameError = validateUsername(username);
    if (usernameError) {
      setErrorMessage(usernameError);
      showToast(usernameError, 'error');
      return;
    }

    if (!password) {
      setErrorMessage('Password is required.');
      showToast('Password is required.', 'error');
      return;
    }
    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      showToast('Password must be at least 4 characters long.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      showToast('Passwords do not match.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const user = await signupUser({
        username: username.trim(),
        password,
        confirmPassword,
      });

      setUserSession(user);
      window.dispatchEvent(new Event('auth-change'));
      showToast(`Account created successfully! Welcome ${user.username}`, 'success');

      setTimeout(() => {
        navigate('/create-routine');
      }, 1000);
    } catch (err) {
      console.error('Signup error:', err);
      const msg = err.message || 'Failed to create account.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Log In
   */
  const handleLogIn = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const usernameError = validateUsername(username);
    if (usernameError) {
      setErrorMessage(usernameError);
      showToast(usernameError, 'error');
      return;
    }

    if (!password) {
      setErrorMessage('Password is required.');
      showToast('Password is required.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const user = await loginUser({
        username: username.trim(),
        password,
      });

      setUserSession(user);
      window.dispatchEvent(new Event('auth-change'));
      showToast(`Welcome back, ${user.username}!`, 'success');

      setTimeout(() => {
        navigate('/create-routine');
      }, 800);
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || 'Invalid username or password.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Logout
   */
  const handleLogout = async () => {
    try {
      await logoutUser();
      setUserSession(null);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      window.dispatchEvent(new Event('auth-change'));
      showToast('Logged out successfully.', 'info');
    } catch (err) {
      showToast('Logout failed.', 'error');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-md max-w-md w-full space-y-6">
        
        {/* If user is logged in */}
        {userSession ? (
          <div className="text-center space-y-6">
            <div className="inline-block bg-blue-100 text-blue-700 text-4xl p-4 rounded-full">
              👤
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {userSession.username}!</h1>
            <p className="text-slate-500 text-sm">
              You are currently logged in to your account. You can now create and manage your routines.
            </p>
            <div className="pt-2 space-y-3">
              <button
                onClick={() => navigate('/create-routine')}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-sm transition-colors cursor-pointer"
              >
                Create Routine →
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
              >
                🚪 Log Out
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header & Tabs */}
            <div className="text-center space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {activeTab === 'signup' ? 'Create an Account' : 'Student Login'}
              </h1>
              
              {/* Tab Selector */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'signup'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Log In
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={activeTab === 'signup' ? handleSignUp : handleLogIn} className="space-y-4">
              
              {/* Username Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Username <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-slate-400 ml-1">(No spaces allowed)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. alex_student"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 disabled:bg-slate-100"
                />
              </div>

              {/* Password Input with Eye Toggle */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 disabled:bg-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 text-sm p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input with Eye Toggle (Sign Up Only) */}
              {activeTab === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 disabled:bg-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 text-sm p-1 cursor-pointer"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md transition-all cursor-pointer disabled:opacity-70 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <span>Processing...</span>
                  ) : (
                    <span>{activeTab === 'signup' ? 'Create Account & Continue' : 'Log In'}</span>
                  )}
                </button>
              </div>

            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default Login;

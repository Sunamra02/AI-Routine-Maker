import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Auth / Login & Sign Up Page Component
 * Allows students to Sign Up or Log In.
 * Enforces rule: Username cannot contain spaces.
 */
const Login = () => {
  const navigate = useNavigate();

  // Tab State: 'login' or 'signup'
  const [activeTab, setActiveTab] = useState('signup');

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status Messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Active Session State
  const [userSession, setUserSession] = useState(null);

  // Load existing session on mount
  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (session) {
      try {
        setUserSession(JSON.parse(session));
      } catch (e) {
        console.error('Error parsing session:', e);
      }
    }
  }, []);

  /**
   * Validate Username (No spaces allowed)
   */
  const validateUsername = (name) => {
    if (!name.trim()) return 'Username is required.';
    if (name.includes(' ')) return 'Username cannot contain any spaces.';
    if (name.length < 3) return 'Username must be at least 3 characters long.';
    return null;
  };

  /**
   * Handle Sign Up
   */
  const handleSignUp = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Username validation
    const usernameError = validateUsername(username);
    if (usernameError) {
      setErrorMessage(usernameError);
      return;
    }

    // Password validation
    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }
    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    // Read existing registered accounts
    const existingAccounts = JSON.parse(localStorage.getItem('user_accounts') || '[]');
    const userExists = existingAccounts.some(
      (acc) => acc.username.toLowerCase() === username.toLowerCase()
    );

    if (userExists) {
      setErrorMessage('Username already taken. Please choose another username or log in.');
      return;
    }

    // Save new account
    const newAccount = { username: username.trim(), password };
    existingAccounts.push(newAccount);
    localStorage.setItem('user_accounts', JSON.stringify(existingAccounts));

    // Automatically log in the new user
    const sessionData = { username: username.trim(), isLoggedIn: true };
    localStorage.setItem('user_session', JSON.stringify(sessionData));
    setUserSession(sessionData);

    // Notify window for Navbar updates
    window.dispatchEvent(new Event('storage'));

    setSuccessMessage('Account created successfully! Redirecting to Create Routine...');

    setTimeout(() => {
      navigate('/create-routine');
    }, 1200);
  };

  /**
   * Handle Log In
   */
  const handleLogIn = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Username validation
    const usernameError = validateUsername(username);
    if (usernameError) {
      setErrorMessage(usernameError);
      return;
    }

    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    // Check against registered accounts (or allow demo login if first time)
    const existingAccounts = JSON.parse(localStorage.getItem('user_accounts') || '[]');
    const foundUser = existingAccounts.find(
      (acc) => acc.username.toLowerCase() === username.toLowerCase()
    );

    if (existingAccounts.length > 0 && (!foundUser || foundUser.password !== password)) {
      setErrorMessage('Invalid username or password.');
      return;
    }

    // Save session
    const sessionData = { username: username.trim(), isLoggedIn: true };
    localStorage.setItem('user_session', JSON.stringify(sessionData));
    setUserSession(sessionData);

    window.dispatchEvent(new Event('storage'));

    setSuccessMessage(`Welcome back, ${username}! Redirecting...`);

    setTimeout(() => {
      navigate('/create-routine');
    }, 1000);
  };

  /**
   * Handle Logout
   */
  const handleLogout = () => {
    localStorage.removeItem('user_session');
    setUserSession(null);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-md max-w-md w-full space-y-6">
        
        {/* If user is already logged in */}
        {userSession ? (
          <div className="text-center space-y-6">
            <div className="inline-block bg-blue-100 text-blue-700 text-4xl p-4 rounded-full">
              👤
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {userSession.username}!</h1>
            <p className="text-slate-500 text-sm">
              You are currently logged in. You can now create and view your daily routines.
            </p>
            <div className="pt-2 space-y-3">
              <button
                onClick={() => navigate('/create-routine')}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-sm transition-colors cursor-pointer"
              >
                Create Routine →
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
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
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMessage('');
                    setSuccessMessage('');
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
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage('');
                    setSuccessMessage('');
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

            {/* Error / Success Banners */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                ⚠️ {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                ✨ {successMessage}
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              {/* Confirm Password Input (Sign Up Only) */}
              {activeTab === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md transition-all cursor-pointer"
                >
                  {activeTab === 'signup' ? 'Create Account & Continue' : 'Log In'}
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

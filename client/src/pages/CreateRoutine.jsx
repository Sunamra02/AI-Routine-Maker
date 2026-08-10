import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RoutineCard from '../components/RoutineCard';

/**
 * CreateRoutine Page Component
 * Allows logged-in users to input their goal, available hours, times, and difficulty level
 * to generate a customized routine stored in localStorage.
 */
const CreateRoutine = () => {
  const navigate = useNavigate();

  // Authentication check
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.isLoggedIn) {
          setIsLoggedIn(true);
          setCurrentUser(parsed.username);
        }
      } catch (e) {
        console.error('Failed to parse user session from localStorage:', e);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Form State
  const [mainGoal, setMainGoal] = useState('');
  const [availableHours, setAvailableHours] = useState('8');
  const [wakeupTime, setWakeupTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [difficulty, setDifficulty] = useState('Intermediate');

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedRoutine, setGeneratedRoutine] = useState(null);

  /**
   * Helper function to convert 24h time ("07:00") to 12h formatted time ("07:00 AM")
   */
  const formatTime12h = (time24) => {
    if (!time24) return '08:00 AM';
    const [hStr, mStr] = time24.split(':');
    let hours = parseInt(hStr, 10);
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    return `${formattedHours}:${mStr} ${period}`;
  };

  /**
   * Pure JavaScript Routine Generator
   * Tailors daily tasks based on goal, available hours, and difficulty.
   */
  const generateSampleRoutine = (goal, hours, wake, sleep, level) => {
    const goalLower = goal.toLowerCase();

    // Default specialized tasks based on keywords in user's goal
    let primarySubject = 'Core Learning & Practice';
    let secondarySubject = 'Revision & Hands-on Work';

    if (goalLower.includes('code') || goalLower.includes('program') || goalLower.includes('react') || goalLower.includes('web')) {
      primarySubject = 'Programming & Coding Practice';
      secondarySubject = 'Building Project Features & Debugging';
    } else if (goalLower.includes('exam') || goalLower.includes('test') || goalLower.includes('study')) {
      primarySubject = 'Intensive Subject Study';
      secondarySubject = 'Mock Questions & Formula Revision';
    } else if (goalLower.includes('fit') || goalLower.includes('gym') || goalLower.includes('health')) {
      primarySubject = 'Main Workout Session & Cardio';
      secondarySubject = 'Active Recovery & Meal Prep';
    }

    const startFormatted = formatTime12h(wake);

    // Baseline sample schedule tailored to user inputs
    const tasks = [
      { id: 1, time: startFormatted, activity: 'Wake Up & Morning Hydration', duration: '30 min', completed: false },
      { id: 2, time: '07:30 AM', activity: 'Light Exercise & Breakfast', duration: '45 min', completed: false },
      { id: 3, time: '09:00 AM', activity: `${primarySubject} (${goal})`, duration: `${Math.min(parseInt(hours) * 15, 120)} min`, completed: false },
      { id: 4, time: '11:30 AM', activity: 'Short Break & Hydration', duration: '30 min', completed: false },
      { id: 5, time: '12:00 PM', activity: `${secondarySubject}`, duration: `${level === 'Advanced' ? 90 : 60} min`, completed: false },
      { id: 6, time: '01:30 PM', activity: 'Lunch & Relax', duration: '60 min', completed: false },
      { id: 7, time: '03:30 PM', activity: 'Focused Practice & Goal Review', duration: '60 min', completed: false },
      { id: 8, time: '08:00 PM', activity: 'Daily Accomplishment Review', duration: '30 min', completed: false },
    ];

    return tasks;
  };

  /**
   * Handle Form Submission
   */
  const handleGenerate = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Check login requirement
    if (!isLoggedIn) {
      setErrorMessage('Please Sign Up or Log In first to generate a routine.');
      return;
    }

    // Validation
    if (!mainGoal.trim()) {
      setErrorMessage('Please enter your Main Goal.');
      return;
    }
    if (!availableHours || parseInt(availableHours, 10) <= 0) {
      setErrorMessage('Please enter valid available hours.');
      return;
    }

    // Start loading state
    setIsLoading(true);

    setTimeout(() => {
      // Generate tasks array
      const tasks = generateSampleRoutine(mainGoal, availableHours, wakeupTime, sleepTime, difficulty);
      
      const routineData = {
        user: currentUser,
        goal: mainGoal,
        availableHours,
        wakeupTime,
        sleepTime,
        difficulty,
        generatedAt: new Date().toLocaleDateString(),
        tasks,
      };

      // Save to localStorage
      localStorage.setItem('ai_routine', JSON.stringify(routineData));

      setGeneratedRoutine(routineData);
      setIsLoading(false);
    }, 1200); // 1.2 second simulated loading state
  };

  return (
    <div className="flex-1 py-10 px-4 max-w-4xl mx-auto w-full">
      
      {/* Page Title Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Create Your Daily Routine</h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">
          Fill in your details below to let our algorithm generate a smart, balanced schedule.
        </p>
      </div>

      {/* Login Required Notice if not logged in */}
      {!isLoggedIn && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🔒</span>
            <div>
              <h3 className="font-bold text-amber-900">Login or Sign Up Required</h3>
              <p className="text-amber-700 text-sm">
                You need to log in or create an account before you can generate your personalized routine.
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-colors shrink-0"
          >
            Sign Up / Log In →
          </Link>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-10">
        
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-6">
          
          {/* 1. Main Goal */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              1. Main Goal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Prepare for Exams, Learn React, Build a Fitness Routine"
              value={mainGoal}
              onChange={(e) => setMainGoal(e.target.value)}
              disabled={!isLoggedIn}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Grid for parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* 2. Available Hours */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                2. Available Study/Work Hours
              </label>
              <input
                type="number"
                min="1"
                max="18"
                value={availableHours}
                onChange={(e) => setAvailableHours(e.target.value)}
                disabled={!isLoggedIn}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* 5. Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                3. Difficulty / Pace
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={!isLoggedIn}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="Beginner">Beginner (Gentle pace)</option>
                <option value="Intermediate">Intermediate (Balanced pace)</option>
                <option value="Advanced">Advanced (Intensive pace)</option>
              </select>
            </div>

            {/* 3. Wake-up Time */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                4. Wake-up Time
              </label>
              <input
                type="time"
                value={wakeupTime}
                onChange={(e) => setWakeupTime(e.target.value)}
                disabled={!isLoggedIn}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* 4. Sleep Time */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                5. Sleep Time
              </label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                disabled={!isLoggedIn}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

          </div>

          {/* Submit Button */}
          <div className="pt-2">
            {isLoggedIn ? (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-75 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating your personalized routine...</span>
                  </>
                ) : (
                  <span>⚡ Generate Routine</span>
                )}
              </button>
            ) : (
              <Link
                to="/login"
                className="w-full py-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg shadow-md text-center block transition-all"
              >
                🔒 Sign Up / Log In to Generate Routine
              </Link>
            )}
          </div>

        </form>
      </div>

      {/* Generated Routine Display Section */}
      {generatedRoutine && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                Routine Generated
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">
                Your Customized Routine for "{generatedRoutine.goal}"
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                User: {generatedRoutine.user} | Pace: {generatedRoutine.difficulty} | Available Time: {generatedRoutine.availableHours} hours
              </p>
            </div>

            <Link
              to="/my-routine"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-colors shrink-0"
            >
              View My Routine →
            </Link>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {generatedRoutine.tasks.map((task) => (
              <RoutineCard key={task.id} task={task} showCheckbox={false} />
            ))}
          </div>

          <div className="pt-4 text-center">
            <button
              onClick={() => navigate('/my-routine')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md transition-all cursor-pointer"
            >
              View My Routine & Start Tracking
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default CreateRoutine;

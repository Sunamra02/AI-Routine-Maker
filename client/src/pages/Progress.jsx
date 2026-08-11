import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchLatestRoutine, fetchCurrentUser } from '../services/api';

/**
 * Progress Page Component
 * Displays today's task completion progress calculated from Spring Boot backend REST API
 * along with consistency breakdown.
 */
const Progress = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
    hasRoutine: false,
  });

  const [weeklyData, setWeeklyData] = useState([
    { day: 'Monday', percentage: 0 },
    { day: 'Tuesday', percentage: 0 },
    { day: 'Wednesday', percentage: 0 },
    { day: 'Thursday', percentage: 0 },
    { day: 'Friday', percentage: 0 },
    { day: 'Saturday', percentage: 0 },
    { day: 'Sunday', percentage: 0 },
  ]);

  useEffect(() => {
    let isMounted = true;

    fetchCurrentUser()
      .then((currUser) => {
        setLoading(false);
        if (!isMounted) return;
        setUser(currUser);
        if (!currUser) {
          return null
        };
        return fetchLatestRoutine();
      })
      .then((routine) => {
        if (!isMounted || !routine) return;
        if (routine && routine.tasks && routine.tasks.length > 0) {
          const total = routine.tasks.length;
          const completed = routine.tasks.filter((t) => t.completed).length;
          const percentage = Math.round((completed / total) * 100);

          setTodayStats({
            completed,
            total,
            percentage,
            hasRoutine: true,
          });

          const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const todayName = daysOfWeek[new Date().getDay()];

          setWeeklyData((prev) =>
            prev.map((item) =>
              item.day === todayName ? { ...item, percentage } : item
            )
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading routine stats:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    console.log(user);
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-500">
        Loading your current progress...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full space-y-6">
          <div className="text-5xl">🔒</div>
          <h2 className="text-2xl font-bold text-slate-800">Login Required</h2>
          <p className="text-slate-600 text-sm">
            Please log in or create an account to view and manage your personalized daily routines.
          </p>
          <div>
            <Link
              to="/login"
              className="inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-md transition-colors"
            >
              Sign Up / Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 px-4 max-w-4xl mx-auto w-full space-y-10">

      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Progress Dashboard</h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">
          Your daily achievements and consistency throughout the week.
        </p>
      </div>

      {/* Today's Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Today's Completion Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
              Today's Overview
            </span>
            <h3 className="text-2xl font-bold text-slate-800 mt-3">
              {todayStats.hasRoutine ? `${todayStats.percentage}%` : '0%'}
            </h3>
            <p className="text-slate-500 text-sm mt-1">Today's Goal Completion</p>
          </div>

          <div className="mt-4">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${todayStats.hasRoutine ? todayStats.percentage : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tasks Completed Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
              Task Breakdown
            </span>
            <h3 className="text-2xl font-bold text-slate-800 mt-3">
              {todayStats.hasRoutine
                ? `${todayStats.completed} / ${todayStats.total}`
                : '0 / 0'}
            </h3>
            <p className="text-slate-500 text-sm mt-1">Tasks Completed Today</p>
          </div>

          <div className="mt-4">
            {todayStats.hasRoutine ? (
              <Link
                to="/my-routine"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-block"
              >
                Go to My Routine →
              </Link>
            ) : (
              <Link
                to={user ? "/create-routine" : "/login"}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-block"
              >
                {user ? "Create a routine first →" : "Log in to track progress →"}
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* Weekly Progress Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Weekly Consistency</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Consistency history across the current week.
            </p>
          </div>
          {!todayStats.hasRoutine && (
            <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
              No routine active
            </span>
          )}
        </div>

        {/* CSS Progress Bars List */}
        <div className="space-y-4 pt-2">
          {weeklyData.map((item) => (
            <div key={item.day} className="space-y-1.5">
              <div className="flex justify-between text-xs sm:text-sm font-semibold">
                <span className="text-slate-700">{item.day}</span>
                <span className="text-slate-600">{item.percentage}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Progress;

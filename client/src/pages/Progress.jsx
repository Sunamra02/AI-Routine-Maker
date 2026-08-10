import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Progress Page Component
 * Displays today's task completion progress calculated from localStorage
 * along with a clean weekly breakdown using simple CSS/Tailwind progress bars.
 * Initial weekly progress is 0% until tasks are completed.
 */
const Progress = () => {
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
    const saved = localStorage.getItem('ai_routine');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.tasks && parsed.tasks.length > 0) {
          const total = parsed.tasks.length;
          const completed = parsed.tasks.filter((t) => t.completed).length;
          const percentage = Math.round((completed / total) * 100);

          setTodayStats({
            completed,
            total,
            percentage,
            hasRoutine: true,
          });

          // Determine current day of week (0 = Sun, 1 = Mon, ..., 6 = Sat)
          const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const todayName = daysOfWeek[new Date().getDay()];

          // Update current day's percentage dynamically in weekly chart
          setWeeklyData((prev) =>
            prev.map((item) =>
              item.day === todayName ? { ...item, percentage } : item
            )
          );
        }
      } catch (err) {
        console.error('Error loading routine stats:', err);
      }
    } else {
      // Reset if routine deleted
      setTodayStats({
        completed: 0,
        total: 0,
        percentage: 0,
        hasRoutine: false,
      });
      setWeeklyData([
        { day: 'Monday', percentage: 0 },
        { day: 'Tuesday', percentage: 0 },
        { day: 'Wednesday', percentage: 0 },
        { day: 'Thursday', percentage: 0 },
        { day: 'Friday', percentage: 0 },
        { day: 'Saturday', percentage: 0 },
        { day: 'Sunday', percentage: 0 },
      ]);
    }
  }, []);

  return (
    <div className="flex-1 py-10 px-4 max-w-4xl mx-auto w-full space-y-10">
      
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Your Progress Dashboard</h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">
          Track your daily achievements and consistency throughout the week.
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
            <p className="text-slate-500 text-sm mt-1">Today's Progress</p>
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
                to="/create-routine"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-block"
              >
                Create a routine first →
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* Weekly Progress Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Weekly Progress</h2>
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

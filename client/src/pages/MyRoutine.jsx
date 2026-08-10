import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RoutineCard from '../components/RoutineCard';

/**
 * MyRoutine Page Component
 * Reads user routine from localStorage, shows interactive checkbox cards,
 * updates task completion, and displays current progress bar.
 */
const MyRoutine = () => {
  const [routineData, setRoutineData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read routine from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('ai_routine');
    if (saved) {
      try {
        setRoutineData(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse saved routine:', err);
      }
    }
    setLoading(false);
  }, []);

  /**
   * Toggle task completion checkbox
   */
  const handleToggleComplete = (taskId) => {
    if (!routineData || !routineData.tasks) return;

    const updatedTasks = routineData.tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    const updatedRoutine = {
      ...routineData,
      tasks: updatedTasks,
    };

    // Update React State
    setRoutineData(updatedRoutine);

    // Save updated routine to localStorage
    localStorage.setItem('ai_routine', JSON.stringify(updatedRoutine));
  };

  /**
   * Delete Routine handler
   */
  const handleDeleteRoutine = () => {
    if (window.confirm('Are you sure you want to delete your current routine?')) {
      localStorage.removeItem('ai_routine');
      setRoutineData(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-500">
        Loading routine...
      </div>
    );
  }

  // If no routine is found in localStorage
  if (!routineData || !routineData.tasks || routineData.tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full space-y-6">
          <div className="text-5xl">📋</div>
          <h2 className="text-2xl font-bold text-slate-800">No routine found</h2>
          <p className="text-slate-600 text-sm">
            You haven't generated a routine yet. Create your routine first to start tracking your daily tasks!
          </p>
          <div>
            <Link
              to="/create-routine"
              className="inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-md transition-colors"
            >
              Create Routine
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Progress Stats
  const totalTasks = routineData.tasks.length;
  const completedTasks = routineData.tasks.filter((t) => t.completed).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex-1 py-10 px-4 max-w-4xl mx-auto w-full space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Routine</h1>
          <p className="text-slate-600 text-sm mt-1">
            Goal: <span className="font-semibold text-blue-700">{routineData.goal}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/create-routine"
            className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl border border-blue-200"
          >
            ✏️ Edit / Regenerate
          </Link>

          <button
            onClick={handleDeleteRoutine}
            className="inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-800 transition-colors bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-200 cursor-pointer"
          >
            🗑️ Delete Routine
          </button>
        </div>
      </div>

      {/* Today's Progress Bar Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-sm sm:text-base font-semibold">
          <span className="text-slate-800">Today's Progress</span>
          <span className="text-blue-600">
            {completedTasks} / {totalTasks} tasks completed ({progressPercentage}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Routine Cards List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Schedule & Tasks</h2>
        {routineData.tasks.map((task) => (
          <RoutineCard
            key={task.id}
            task={task}
            onToggleComplete={handleToggleComplete}
            showCheckbox={true}
          />
        ))}
      </div>

    </div>
  );
};

export default MyRoutine;

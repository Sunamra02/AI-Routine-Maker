import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { faPenToSquare, faClipboardList, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RoutineCard from '../components/RoutineCard';
import { fetchLatestRoutine, updateTaskStatus, deleteRoutine, fetchCurrentUser } from '../services/api';
import { useToast } from '../context/ToastContext';

/**
 * MyRoutine Page Component
 * Reads current authenticated user's active routine from Spring Boot REST API,
 * provides interactive task checkbox toggles, progress bar, edit routine link, and deletion.
 */
const MyRoutine = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [routineData, setRoutineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser()
      .then((currUser) => {
        setUser(currUser);
        if (!currUser) {
          setLoading(false);
          return;
        }
        return fetchLatestRoutine();
      })
      .then((data) => {
        setRoutineData(data || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch user routine:', err);
        setLoading(false);
      });
  }, []);

  /**
   * Toggle task completion checkbox via API
   */
  const handleToggleComplete = async (taskId) => {
    if (!routineData || !routineData.tasks) return;

    const currentTask = routineData.tasks.find((t) => t.id === taskId);
    if (!currentTask) return;

    const nextCompletedState = !currentTask.completed;

    // Optimistic UI update
    setRoutineData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: nextCompletedState } : task
        ),
      };
    });

    try {
      await updateTaskStatus(taskId, nextCompletedState);
      if (nextCompletedState) {
        showToast(`Task "${currentTask.activity}" marked as completed! ✨`, 'success');
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
      showToast('Failed to update task completion status.', 'error');
      // Revert UI
      setRoutineData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !nextCompletedState } : task
          ),
        };
      });
    }
  };

  /**
   * Delete Routine handler via API
   */
  const handleDeleteRoutine = async () => {
    if (!routineData || !routineData.id) return;

    if (window.confirm('Are you sure you want to delete your active routine?')) {
      try {
        await deleteRoutine(routineData.id);
        setRoutineData(null);
        showToast('Routine deleted successfully.', 'info');
      } catch (err) {
        console.error('Failed to delete routine:', err);
        showToast(err.message || 'Failed to delete routine.', 'error');
      }
    }
  };

  if (loading) {
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

  if (!routineData || !routineData.tasks || routineData.tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full space-y-6">
          <div className="text-5xl">
            <FontAwesomeIcon icon={faClipboardList} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">No active routine found</h2>
          <p className="text-slate-600 text-sm">
            You haven't created a routine yet. Let AI generate a personalized schedule or create one manually!
          </p>
          <div>
            <Link
              to="/create-routine"
              className="inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-md transition-colors"
            >
              Create Routine Now
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
          <h1 className="text-3xl font-bold text-slate-900">Your Daily Routine</h1>
          <p className="text-slate-600 text-sm mt-1">
            Goal: <span className="font-semibold text-blue-700">{routineData.goal}</span> | Pace: <span className="font-medium text-slate-700">{routineData.difficulty}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/edit-routine/${routineData.id}`}
            className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl border border-blue-200"
          >
            <FontAwesomeIcon icon={faPenToSquare} /> Edit Routine
          </Link>

          <button
            onClick={handleDeleteRoutine}
            className="inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-800 transition-colors bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-200 cursor-pointer"
          >
            <FontAwesomeIcon icon={faTrash} /> Delete Routine
          </button>
        </div>
      </div>

      {/* Today's Progress Bar Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-sm sm:text-base font-semibold">
          <span className="text-slate-800">Today's Goal Progress</span>
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
        <h2 className="text-xl font-bold text-slate-800">Scheduled Activities</h2>
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

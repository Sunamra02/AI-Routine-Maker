import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { faClock, faPenToSquare, faTrash, faFloppyDisk,faCancel } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchRoutineById, updateRoutine, fetchCurrentUser } from '../services/api';
import { useToast } from '../context/ToastContext';

/**
 * EditRoutine Page Component
 * Dedicated page component for editing existing routines and their scheduled tasks.
 */
const EditRoutine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form Metadata
  const [goal, setGoal] = useState('');
  const [availableHours, setAvailableHours] = useState('8');
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const [routineDate, setRoutineDate] = useState(today);
  const nextMinute = () => { const now = new Date(); now.setMinutes(now.getMinutes() + 1, 0, 0); return now.toTimeString().slice(0, 5); };

  // Tasks List
  const [tasks, setTasks] = useState([]);
  const [editingTaskIdx, setEditingTaskIdx] = useState(null);

  // New Manual Task Form State
  const [newTaskTime, setNewTaskTime] = useState('08:00');
  const [newTaskActivity, setNewTaskActivity] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState('45');

  useEffect(() => {
    fetchCurrentUser().then((user) => {
      if (!user) {
        showToast('Please log in to edit routines.', 'error');
        navigate('/login');
        return;
      }

      fetchRoutineById(id)
        .then((data) => {
          if (data) {
            setGoal(data.goal || '');
            setAvailableHours(data.availableHours ? String(data.availableHours) : '8');
            setWakeUpTime(data.wakeUpTime || '07:00');
            setSleepTime(data.sleepTime || '23:00');
            setDifficulty(data.difficulty || 'Intermediate');
            setRoutineDate(data.routineDate || today);

            if (data.tasks) {
              setTasks(
                data.tasks.map((t) => ({
                  time: t.time || '07:00',
                  activity: t.activity || '',
                  duration: t.duration || 30,
                }))
              );
            }
          } else {
            showToast('Routine not found.', 'error');
            navigate('/my-routine');
          }
        })
        .catch((err) => {
          showToast(err.message || 'Failed to load routine details.', 'error');
          navigate('/my-routine');
        })
        .finally(() => {
          setLoading(false);
        });
    });
  }, [id, navigate, showToast]);

  const handleAddManualTask = (e) => {
    e.preventDefault();
    if (!newTaskActivity.trim()) {
      showToast('Please enter an activity name.', 'warning');
      return;
    }
    const dur = parseInt(newTaskDuration, 10);
    if (isNaN(dur) || dur <= 0) {
      showToast('Please enter a valid duration in minutes.', 'warning');
      return;
    }

    setTasks((prev) => [
      ...prev,
      {
        time: newTaskTime,
        activity: newTaskActivity.trim(),
        duration: dur,
      },
    ]);
    setNewTaskActivity('');
    showToast('Task added to schedule.', 'success');
  };

  const handleRemoveTask = (idx) => {
    setTasks((prev) => prev.filter((_, i) => i !== idx));
    showToast('Task removed from schedule.', 'info');
  };

  const handleSaveTaskEdit = (idx, updated) => {
    setTasks((prev) => prev.map((t, i) => (i === idx ? updated : t)));
    setEditingTaskIdx(null);
    showToast('Task details updated.', 'info');
  };

  const handleSaveAllChanges = async (e) => {
    e.preventDefault();
    if (!goal.trim()) {
      showToast('Goal title cannot be empty.', 'warning');
      return;
    }
    if (tasks.length === 0) {
      showToast('Routine must contain at least one task.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        goal: goal.trim(),
        availableHours: parseInt(availableHours, 10),
        wakeUpTime: wakeUpTime,
        sleepTime: sleepTime,
        difficulty: difficulty,
        routineDate,
        tasks: tasks,
      };

      await updateRoutine(id, payload);
      showToast('Routine updated successfully!', 'success');
      navigate('/my-routine');
    } catch (err) {
      showToast(err.message || 'Failed to update routine.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-500">
        Loading routine details...
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 px-4 max-w-4xl mx-auto w-full space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Routine</h1>
          <p className="text-slate-600 text-sm mt-1">
            Modify goal details and manage scheduled tasks.
          </p>
        </div>
        <Link
          to="/my-routine"
          className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl"
        >
          <FontAwesomeIcon icon={faCancel} /> Cancel Edit
        </Link>
      </div>

      <form onSubmit={handleSaveAllChanges} className="space-y-6">

        {/* Main Settings Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
            Routine Parameters
          </h2>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Main Goal
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Routine Date</label>
              <input type="date" min={today} value={routineDate} onChange={(e) => setRoutineDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Available Study Hours
              </label>
              <input
                type="number"
                min="1"
                max="18"
                value={availableHours}
                onChange={(e) => setAvailableHours(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Pace / Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Routine Start Time
              </label>
              <input
                type="time"
                value={wakeUpTime}
                onChange={(e) => setWakeUpTime(e.target.value)}
                min={routineDate === today ? nextMinute() : undefined}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Sleep Time
              </label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Scheduled Tasks List Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
            Tasks Schedule ({tasks.length} tasks)
          </h2>

          <div className="space-y-3">
            {tasks.map((task, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                {editingTaskIdx === idx ? (
                  <div className="w-full flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="time"
                      defaultValue={task.time}
                      id={`edit_t_${idx}`}
                      className="px-3 py-1.5 border rounded-lg text-sm bg-white"
                    />
                    <input
                      type="text"
                      defaultValue={task.activity}
                      id={`edit_a_${idx}`}
                      className="flex-1 px-3 py-1.5 border rounded-lg text-sm bg-white"
                    />
                    <input
                      type="number"
                      defaultValue={task.duration}
                      id={`edit_d_${idx}`}
                      className="w-20 px-3 py-1.5 border rounded-lg text-sm bg-white"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const tVal = document.getElementById(`edit_t_${idx}`).value;
                          const aVal = document.getElementById(`edit_a_${idx}`).value;
                          const dVal = parseInt(document.getElementById(`edit_d_${idx}`).value, 10);
                          handleSaveTaskEdit(idx, { time: tVal, activity: aVal, duration: dVal });
                        }}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTaskIdx(null)}
                        className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                        {task.time}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{task.activity}</p>
                        <span className="text-xs text-slate-500">
                          <FontAwesomeIcon icon={faClock} /> {task.duration} min
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingTaskIdx(idx)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold p-1 cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(idx)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold p-1 cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faTrash} /> Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add New Task Inline */}
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-2 mt-4">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              + Add New Task
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="time"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
                min={routineDate === today ? nextMinute() : wakeUpTime}
                className="px-3 py-2 border rounded-lg text-sm bg-white"
              />
              <input
                type="text"
                placeholder="Activity description..."
                value={newTaskActivity}
                onChange={(e) => setNewTaskActivity(e.target.value)}
                className="sm:col-span-2 px-3 py-2 border rounded-lg text-sm bg-white"
              />
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={newTaskDuration}
                  onChange={(e) => setNewTaskDuration(e.target.value)}
                  className="w-20 px-3 py-2 border rounded-lg text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddManualTask}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="pt-2 text-center">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-md transition-all cursor-pointer disabled:opacity-75"
          >
            {isSaving ? 'Saving Changes...' : <FontAwesomeIcon icon={faFloppyDisk} />} Save Routine Updates
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditRoutine;

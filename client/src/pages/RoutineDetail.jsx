import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RoutineCard from '../components/RoutineCard';
import { deleteRoutine, fetchRoutineById, updateTaskStatus } from '../services/api';
import { useToast } from '../context/ToastContext';

const RoutineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutineById(id).then(setRoutine).catch((error) => {
      showToast(error.message || 'Routine not found.', 'error');
      navigate('/my-routine');
    }).finally(() => setLoading(false));
  }, [id, navigate, showToast]);

  const toggleTask = async (taskId) => {
    const task = routine?.tasks?.find((item) => item.id === taskId);
    if (!task) return;
    const completed = !task.completed;
    setRoutine((previous) => ({ ...previous, tasks: previous.tasks.map((item) => item.id === taskId ? { ...item, completed } : item) }));
    try { await updateTaskStatus(taskId, completed); }
    catch (error) {
      setRoutine((previous) => ({ ...previous, tasks: previous.tasks.map((item) => item.id === taskId ? { ...item, completed: !completed } : item) }));
      showToast('Could not update this task.', 'error');
    }
  };

  const removeRoutine = async () => {
    if (!window.confirm('Delete this routine and all of its tasks?')) return;
    try { await deleteRoutine(id); showToast('Routine deleted.', 'info'); navigate('/my-routine'); }
    catch (error) { showToast(error.message || 'Could not delete routine.', 'error'); }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center p-8 text-slate-500">Loading routine…</div>;
  if (!routine) return null;
  const total = routine.tasks?.length || 0;
  const completed = routine.tasks?.filter((task) => task.completed).length || 0;
  const percentage = total ? Math.round((completed / total) * 100) : 0;

  return <div className="flex-1 py-10 px-4 max-w-4xl mx-auto w-full space-y-6">
    <div className="flex flex-wrap justify-between gap-3"><div><Link to="/my-routine" className="text-sm text-blue-600 font-semibold">← All routines</Link><h1 className="text-3xl font-bold text-slate-900 mt-2">{routine.goal}</h1><p className="text-slate-600 text-sm">Scheduled for {routine.routineDate || 'an unscheduled legacy date'} · {routine.wakeUpTime}–{routine.sleepTime}</p></div><div className="flex gap-2"><Link to={`/edit-routine/${id}`} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold">Edit</Link><button onClick={removeRoutine} className="px-4 py-2 rounded-xl border border-red-200 text-red-700 font-semibold">Delete</button></div></div>
    <div className="bg-white p-5 rounded-2xl border border-slate-200"><div className="flex justify-between font-semibold"><span>Progress</span><span>{completed}/{total} ({percentage}%)</span></div><div className="mt-3 h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${percentage}%` }} /></div></div>
    <div className="space-y-3"><h2 className="text-xl font-bold text-slate-800">Tasks</h2>{routine.tasks?.map((task) => <RoutineCard key={task.id} task={task} showCheckbox onToggleComplete={toggleTask} />)}</div>
  </div>;
};
export default RoutineDetail;

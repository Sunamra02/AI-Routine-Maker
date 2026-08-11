import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCurrentUser, fetchRoutines } from '../services/api';

const MyRoutine = () => {
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchCurrentUser().then((currentUser) => {
            setUser(currentUser);
            return currentUser ? fetchRoutines() : [];
        }).then(setRoutines).catch(() => setRoutines([])).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-500">
                Loading your routines…
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
                <h2 className="text-2xl font-bold">
                    Login Required
                </h2>
                <Link to="/login" className="mt-4 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold cursor-pointer">
                    Log In
                </Link>
            </div>
        );
    }

    return (
        <div className="flex-1 py-10 px-4 max-w-4xl mx-auto w-full space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Routines</h1>
                    <p className="text-slate-600 mt-1">
                        Choose a routine to view its full schedule and progress.
                    </p>
                </div>
                <Link to="/create-routine" className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold">
                    Create Routine
                </Link>
            </div>

            {routines.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                    <p className="text-slate-600">You have not created any routines yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {routines.map((routine) => {
                        const total = routine.tasks?.length || 0;
                        const completed = routine.tasks?.filter((task) => task.completed).length || 0;
                        const percentage = total ? Math.round(completed * 100 / total) : 0;

                        return (
                            <Link
                                key={routine.id}
                                to={`/routines/${routine.id}`}
                                className="block bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-sm"
                            >
                                <div className="flex justify-between gap-4">
                                    <div>
                                        <h2 className="font-bold text-lg text-slate-900">{routine.goal}</h2>
                                        <p className="text-sm text-slate-600 mt-1">
                                            {routine.routineDate || 'Unscheduled legacy routine'} · {routine.wakeUpTime}–{routine.sleepTime} · {routine.difficulty}
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-700">{percentage}%</span>
                                </div>
                                <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600" style={{ width: `${percentage}%` }} />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">{completed} of {total} tasks complete</p>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyRoutine;

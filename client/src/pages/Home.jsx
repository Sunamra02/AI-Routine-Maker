import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Home Page Component
 * Landing page featuring a clean hero section and 3 feature cards.
 */
const Home = () => {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-blue-50/50 to-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-block bg-blue-100 text-blue-800 font-semibold px-4 py-1.5 rounded-full text-sm">
            ✨ Smart Scheduling Made Easy
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            AI Routine Maker
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-blue-600">
            Plan your day. Achieve your goals.
          </p>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Create a personalized daily routine based on your goals, available time and daily schedule.
          </p>
          <div className="pt-4">
            <Link
              to="/create-routine"
              className="inline-flex items-center px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Create My Routine →
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-12 px-4 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Why Choose AI Routine Maker?</h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">Designed for students to stay focused and productive every day.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 font-bold">
              🎯
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Personalized</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Create routines based on your goals and available time.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 font-bold">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">AI Powered</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Generate a smart daily routine in seconds.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-2xl mb-4 font-bold">
              📊
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Track Progress</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Track completed tasks and improve your productivity.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

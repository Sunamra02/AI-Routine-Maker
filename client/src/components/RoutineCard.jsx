import React from 'react';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
/**
 * RoutineCard Component
 * Displays individual task details: time, activity, duration, and a completion checkbox.
 */
const RoutineCard = ({ task, onToggleComplete, showCheckbox = true }) => {
  const isCompleted = task.completed || false;

  // Format 24h time ("07:00") to 12h time ("07:00 AM") if needed
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    if (typeof timeStr === 'string' && (timeStr.includes('AM') || timeStr.includes('PM'))) {
      return timeStr;
    }
    const parts = String(timeStr).split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const formattedHours = hours < 10 ? `0${hours}` : hours;
      return `${formattedHours}:${minutes} ${period}`;
    }
    return timeStr;
  };

  // Format duration (e.g. 30 -> "30 min")
  const formatDurationDisplay = (dur) => {
    if (dur === null || dur === undefined) return '';
    if (typeof dur === 'number' || (!isNaN(dur) && !String(dur).includes('min'))) {
      return `${dur} min`;
    }
    return dur;
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 shadow-xs ${isCompleted
          ? 'bg-emerald-50/60 border-emerald-200 opacity-80'
          : 'bg-white border-slate-200 hover:shadow-md hover:border-blue-200'
        }`}
    >
      <div className="flex items-center justify-between gap-4">

        {/* Left section: Time indicator & details */}
        <div className="flex items-start sm:items-center space-x-4">
          {/* Time Badge */}
          <div className="shrink-0 bg-blue-100 text-blue-800 font-semibold px-3 py-1.5 rounded-lg text-xs sm:text-sm">
            {formatTimeDisplay(task.time)}
          </div>

          {/* Activity & Duration */}
          <div>
            <h4
              className={`font-semibold text-base sm:text-lg text-slate-800 ${isCompleted ? 'line-through text-slate-500' : ''
                }`}
            >
              {task.activity}
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1 mt-0.5">
              <span><FontAwesomeIcon icon={faClock} /></span> {formatDurationDisplay(task.duration)}
            </p>
          </div>
        </div>

        {/* Right section: Checkbox (if enabled) */}
        {showCheckbox && (
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer p-1">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={() => onToggleComplete && onToggleComplete(task.id)}
                className="w-6 h-6 text-blue-600 border-slate-300 rounded-md focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
              <span className="sr-only">Mark task as completed</span>
            </label>
          </div>
        )}

      </div>
    </div>
  );
};

export default RoutineCard;

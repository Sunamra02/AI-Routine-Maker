import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { faArrowRight, faPenNib, faClock, faPenToSquare, faTrash, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchCurrentUser, getAiRoutineSuggestions, getAiTaskSuggestions, createRoutine } from '../services/api';
import { useToast } from '../context/ToastContext';

/**
 * CreateRoutine Page Component
 * Implements a 4-step workflow:
 * Step 1: Enter Preferences
 * Step 2: Choose AI Routine Option (3 options) OR Manual Routine Creation
 * Step 3: Select & Edit AI Task Suggestions OR Add Manual Tasks
 * Step 4: Confirm and Save to MySQL Database
 */
const CreateRoutine = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Authentication check
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then((user) => {
        setCurrentUser(user);
        setAuthChecking(false);
      })
      .catch(() => {
        setCurrentUser(null);
        setAuthChecking(false);
      });
  }, []);

  // Wizard Step: 1 = Preferences, 2 = Routine Selection, 3 = Task Selection/Creation, 4 = Review & Save
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Preferences State
  const [mainGoal, setMainGoal] = useState('');
  const [availableHours, setAvailableHours] = useState('8');
  const [wakeupTime, setWakeupTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [difficulty, setDifficulty] = useState('Intermediate');

  // Step 2: AI Routine Suggestions State
  const [aiRoutineOptions, setAiRoutineOptions] = useState([]);
  const [selectedRoutineOption, setSelectedRoutineOption] = useState(null);
  const [isManualRoutine, setIsManualRoutine] = useState(false);

  // Step 3: Tasks State
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  const [selectedTaskIndices, setSelectedTaskIndices] = useState([]);
  const [editingTaskIndex, setEditingTaskIndex] = useState(null);

  // New Manual Task Form State
  const [newTaskTime, setNewTaskTime] = useState('08:00');
  const [newTaskActivity, setNewTaskActivity] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState('45');

  // Loading States
  const [isAiRoutineLoading, setIsAiRoutineLoading] = useState(false);
  const [isAiTaskLoading, setIsAiTaskLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Step 1 -> Step 2: Request AI Routine Suggestions
   */
  const handleFetchAiRoutineSuggestions = async () => {
    if (!mainGoal.trim()) {
      showToast('Please enter your Main Goal.', 'warning');
      return;
    }
    if (!availableHours || parseInt(availableHours, 10) <= 0) {
      showToast('Please enter valid available study hours.', 'warning');
      return;
    }

    setIsAiRoutineLoading(true);
    try {
      const payload = {
        goal: mainGoal.trim(),
        availableHours: parseInt(availableHours, 10),
        wakeUpTime: wakeupTime,
        sleepTime: sleepTime,
        difficulty: difficulty,
      };

      const res = await getAiRoutineSuggestions(payload);
      if (res && res.options && res.options.length > 0) {
        setAiRoutineOptions(res.options);
        setSelectedRoutineOption(res.options[0]);
        setIsManualRoutine(false);
        setCurrentStep(2);
        showToast('AI suggested 3 routine options for your goal!', 'success');
      } else {
        throw new Error('No routine options received from AI.');
      }
    } catch (err) {
      console.error('AI Routine suggestion error:', err);
      showToast('Unable to get AI suggestions right now. You can create your routine manually.', 'warning');
      // Fallback to manual routine creation
      setIsManualRoutine(true);
      setSelectedRoutineOption({
        title: mainGoal.trim() + ' Routine',
        description: 'Custom self-structured daily schedule.',
      });
      setCurrentStep(2);
    } finally {
      setIsAiRoutineLoading(false);
    }
  };

  /**
   * Choose Manual Routine Creation directly from Step 1
   */
  const handleChooseManualRoutine = () => {
    if (!mainGoal.trim()) {
      showToast('Please enter your Main Goal first.', 'warning');
      return;
    }
    setIsManualRoutine(true);
    setSelectedRoutineOption({
      title: mainGoal.trim() + ' Routine',
      description: 'Custom self-structured daily schedule.',
    });
    setSuggestedTasks([]);
    setCurrentStep(3);
    showToast('Starting manual task creation mode.', 'info');
  };

  /**
   * Step 2 -> Step 3: Confirm Routine Option & Fetch AI Tasks
   */
  const handleConfirmRoutineOption = async () => {
    if (!selectedRoutineOption && !isManualRoutine) {
      showToast('Please select a routine option or choose manual creation.', 'warning');
      return;
    }

    if (isManualRoutine) {
      setCurrentStep(3);
      return;
    }

    setIsAiTaskLoading(true);
    try {
      const payload = {
        goal: mainGoal.trim(),
        availableHours: parseInt(availableHours, 10),
        wakeUpTime: wakeupTime,
        sleepTime: sleepTime,
        difficulty: difficulty,
        selectedRoutineTitle: selectedRoutineOption.title,
        selectedRoutineDescription: selectedRoutineOption.description,
      };

      const res = await getAiTaskSuggestions(payload);
      if (res && res.tasks && res.tasks.length > 0) {
        setSuggestedTasks(res.tasks);
        // Select all by default
        setSelectedTaskIndices(res.tasks.map((_, idx) => idx));
        setCurrentStep(3);
        showToast('AI generated task breakdown!', 'success');
      } else {
        throw new Error('No task breakdown returned.');
      }
    } catch (err) {
      console.error('AI Task suggestion error:', err);
      showToast('The AI response could not be processed. You can add tasks manually.', 'warning');
      setSuggestedTasks([]);
      setCurrentStep(3);
    } finally {
      setIsAiTaskLoading(false);
    }
  };

  /**
   * Toggle task selection checkbox in Step 3
   */
  const handleToggleTaskSelection = (idx) => {
    setSelectedTaskIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  /**
   * Add a custom manual task in Step 3
   */
  const handleAddManualTask = (e) => {
    e.preventDefault();
    if (!newTaskActivity.trim()) {
      showToast('Please enter an activity description.', 'warning');
      return;
    }
    const dur = parseInt(newTaskDuration, 10);
    if (isNaN(dur) || dur <= 0) {
      showToast('Please enter a valid duration in minutes.', 'warning');
      return;
    }

    const newTask = {
      time: newTaskTime,
      activity: newTaskActivity.trim(),
      duration: dur,
    };

    setSuggestedTasks((prev) => [...prev, newTask]);
    setSelectedTaskIndices((prev) => [...prev, suggestedTasks.length]);
    setNewTaskActivity('');
    showToast('Task added to your list!', 'success');
  };

  /**
   * Remove a task from the list
   */
  const handleRemoveTask = (idx) => {
    setSuggestedTasks((prev) => prev.filter((_, i) => i !== idx));
    setSelectedTaskIndices((prev) =>
      prev.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i))
    );
  };

  /**
   * Save Task edit
   */
  const handleSaveTaskEdit = (idx, updatedTask) => {
    setSuggestedTasks((prev) =>
      prev.map((t, i) => (i === idx ? updatedTask : t))
    );
    setEditingTaskIndex(null);
    showToast('Task updated.', 'info');
  };

  /**
   * Final Step: Save Routine and Tasks to Backend MySQL Database
   */
  const handleSaveFinalRoutine = async () => {
    const finalTasksToSave = suggestedTasks.filter((_, idx) =>
      selectedTaskIndices.includes(idx)
    );

    if (finalTasksToSave.length === 0) {
      showToast('Please select or add at least one task for your routine.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        goal: mainGoal.trim(),
        availableHours: parseInt(availableHours, 10),
        wakeUpTime: wakeupTime,
        sleepTime: sleepTime,
        difficulty: difficulty,
        tasks: finalTasksToSave,
      };

      await createRoutine(payload);
      showToast('Routine and tasks saved successfully to database!', 'success');
      navigate('/my-routine');
    } catch (err) {
      console.error('Error saving routine:', err);
      showToast(err.message || 'Failed to save routine. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (authChecking) {
    return <div className="p-8 text-center text-slate-500">Checking authentication...</div>;
  }

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl max-w-md w-full space-y-4">
          <span className="text-4xl">🔒</span>
          <h2 className="text-xl font-bold text-amber-900">Login Required</h2>
          <p className="text-amber-700 text-sm">
            Only registered users can generate and save daily routines to their account.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-colors"
          >
            Log In <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 px-4 max-w-4xl mx-auto w-full space-y-8">

      {/* Step Indicator Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Create Routine: Step {currentStep} of 3
          </h1>
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            {currentStep === 1 && 'Preferences'}
            {currentStep === 2 && 'AI Routine Selection'}
            {currentStep === 3 && 'Task Customization & Save'}
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Enter Preferences */}
      {currentStep === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">
            1. Enter Your Routine Preferences
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Main Goal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Prepare for Semester Exams, Master React & Java, Data Science Study"
                value={mainGoal}
                onChange={(e) => setMainGoal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Available Work Hours per day
                </label>
                <input
                  type="number"
                  min="1"
                  max="18"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Difficulty / Pace
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800"
                >
                  <option value="Beginner">Beginner (Gentle pace)</option>
                  <option value="Intermediate">Intermediate (Balanced pace)</option>
                  <option value="Advanced">Advanced (Intensive pace)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Wake-up Time
                </label>
                <input
                  type="time"
                  value={wakeupTime}
                  onChange={(e) => setWakeupTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons for Step 1 */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleFetchAiRoutineSuggestions}
              disabled={isAiRoutineLoading}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-75"
            >
              {isAiRoutineLoading ? (
                <span>Requesting AI Suggestions...</span>
              ) : (
                <span>Get AI Routine Suggestions (3 Options)</span>
              )}
            </button>

            <button
              onClick={handleChooseManualRoutine}
              className="py-4 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-base transition-colors cursor-pointer border border-slate-300"
            >
              <FontAwesomeIcon icon={faPenNib} /> Create Manually
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: AI Routine Options Selection */}
      {currentStep === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                2. Choose a Routine Option
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Groq AI generated 3 realistic schedules based on your goal "{mainGoal}"
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              ← Edit Preferences
            </button>
          </div>

          {/* Debug */}
          {/* {console.log('AI Routine Options:', aiRoutineOptions)} */}

          {/* 3 AI Cards */}
          <div className="space-y-4">
            {aiRoutineOptions.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setSelectedRoutineOption(opt)}
                className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${selectedRoutineOption?.id === opt.id
                  ? 'border-blue-600 bg-blue-50/50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">
                      {opt.focusStyle || 'Style Option'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{opt.title}</h3>
                    <p className="text-sm text-slate-600">{opt.description}</p>
                  </div>
                  <input
                    type="radio"
                    name="routine_option"
                    checked={selectedRoutineOption?.id === opt.id}
                    onChange={() => setSelectedRoutineOption(opt)}
                    className="w-5 h-5 text-blue-600 accent-blue-600 cursor-pointer mt-1"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleChooseManualRoutine}
              className="text-sm text-slate-600 hover:text-slate-900 font-semibold"
            >
              Or skip AI suggestions & create manually →
            </button>

            <button
              onClick={handleConfirmRoutineOption}
              disabled={isAiTaskLoading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-75"
            >
              {isAiTaskLoading ? (
                <span>Generating Task List...</span>
              ) : (
                <span>Continue to Task Selection →</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Task Customization & Manual Addition */}
      {currentStep === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                3. Customize Your Schedule & Tasks
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Selected Routine: <span className="font-semibold text-blue-700">{selectedRoutineOption?.title || mainGoal}</span>
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              ← Back to Routine Choice
            </button>
          </div>

          {/* AI Task Suggestions List */}
          {suggestedTasks.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">
                Select tasks to include in your routine:
              </h3>
              {suggestedTasks.map((task, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${selectedTaskIndices.includes(idx)
                    ? 'bg-blue-50/40 border-blue-200'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                >
                  {editingTaskIndex === idx ? (
                    /* Task Edit Form */
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="time"
                        defaultValue={task.time}
                        id={`edit_time_${idx}`}
                        className="px-3 py-1.5 border rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        defaultValue={task.activity}
                        id={`edit_act_${idx}`}
                        className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        defaultValue={task.duration}
                        id={`edit_dur_${idx}`}
                        className="w-20 px-3 py-1.5 border rounded-lg text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const timeVal = document.getElementById(`edit_time_${idx}`).value;
                            const actVal = document.getElementById(`edit_act_${idx}`).value;
                            const durVal = parseInt(document.getElementById(`edit_dur_${idx}`).value, 10);
                            handleSaveTaskEdit(idx, { time: timeVal, activity: actVal, duration: durVal });
                          }}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTaskIndex(null)}
                          className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal Display */
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedTaskIndices.includes(idx)}
                          onChange={() => handleToggleTaskSelection(idx)}
                          className="w-5 h-5 text-blue-600 accent-blue-600 cursor-pointer"
                        />
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
                          onClick={() => setEditingTaskIndex(idx)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold p-1 cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(idx)}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold p-1 cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-sm">
              No tasks added yet. Use the form below to manually add tasks for your routine.
            </div>
          )}

          {/* Add Manual Task Form */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              + Add Custom Manual Task
            </h4>
            <form onSubmit={handleAddManualTask} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="time"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              />
              <input
                type="text"
                placeholder="Activity description..."
                value={newTaskActivity}
                onChange={(e) => setNewTaskActivity(e.target.value)}
                className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              />
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={newTaskDuration}
                  onChange={(e) => setNewTaskDuration(e.target.value)}
                  className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                />
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs"
                >
                  + Add
                </button>
              </div>
            </form>
          </div>

          {/* Final Save Button */}
          <div className="pt-4 text-center">
            <button
              onClick={handleSaveFinalRoutine}
              disabled={isSaving}
              className="w-full sm:w-auto px-10 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-md transition-all cursor-pointer disabled:opacity-75"
            >
              {isSaving ? 'Saving Routine...' : <><FontAwesomeIcon icon={faFloppyDisk} /> Confirm & Save</>}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CreateRoutine;

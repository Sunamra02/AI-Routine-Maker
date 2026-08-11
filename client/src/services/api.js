/**
 * API Service Layer
 * Handles HTTP REST API requests to Spring Boot backend.
 * Includes credentials: 'include' for secure HTTP session cookie authentication.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Generic helper for handling HTTP responses and error messages
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && (errorData.message || errorData.error)) {
        errorMessage = errorData.message || errorData.error;
      }
    } catch {
      // Non-JSON response
    }
    throw new Error(errorMessage);
  }
  // If no content (204)
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

/**
 * Auth API: Sign Up
 */
export async function signupUser(data) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

/**
 * Auth API: Log In
 */
export async function loginUser(data) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

/**
 * Auth API: Log Out
 */
export async function logoutUser() {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleResponse(response);
}

/**
 * Auth API: Get Current Authenticated User Profile
 */
export async function fetchCurrentUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * AI API: Get Routine Suggestions (3 options)
 */
export async function getAiRoutineSuggestions(payload) {
  const response = await fetch(`${API_BASE_URL}/api/ai/suggest-routines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

/**
 * AI API: Get Task Suggestions for chosen routine
 */
export async function getAiTaskSuggestions(payload) {
  const response = await fetch(`${API_BASE_URL}/api/ai/suggest-tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

/**
 * Create and Save Routine via Spring Boot Backend
 */
export async function createRoutine(payload) {
  const response = await fetch(`${API_BASE_URL}/api/routines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

/**
 * Update Existing Routine
 */
export async function updateRoutine(id, payload) {
  const response = await fetch(`${API_BASE_URL}/api/routines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

/**
 * Fetch all routines for logged-in user
 */
export async function fetchRoutines() {
  const response = await fetch(`${API_BASE_URL}/api/routines`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function fetchRoutinesForDate(date) {
  const response = await fetch(`${API_BASE_URL}/api/routines/date/${date}`, {
    method: 'GET', credentials: 'include',
  });
  return handleResponse(response);
}

/**
 * Fetch latest routine for logged-in user
 */
export async function fetchLatestRoutine() {
  const response = await fetch(`${API_BASE_URL}/api/routines/latest`, {
    method: 'GET',
    credentials: 'include',
  });
  if (response.status === 204) return null;
  return handleResponse(response);
}

/**
 * Fetch routine by ID
 */
export async function fetchRoutineById(id) {
  const response = await fetch(`${API_BASE_URL}/api/routines/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleResponse(response);
}

/**
 * Update task completion status
 */
export async function updateTaskStatus(taskId, completed) {
  const response = await fetch(`${API_BASE_URL}/api/routines/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ completed }),
  });
  return handleResponse(response);
}

/**
 * Delete routine by ID
 */
export async function deleteRoutine(id) {
  const response = await fetch(`${API_BASE_URL}/api/routines/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
}

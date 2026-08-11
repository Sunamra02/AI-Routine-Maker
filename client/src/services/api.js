/**
 * API Service Layer
 * Handles HTTP requests to the Spring Boot backend REST API.
 * Uses Vite environment variable VITE_API_URL for the backend base URL.
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
      // Ignore JSON parse errors for non-JSON responses
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

/**
 * Fetch all routines from Spring Boot backend
 */
export async function fetchRoutines() {
  const response = await fetch(`${API_BASE_URL}/api/routines`);
  return handleResponse(response);
}

/**
 * Fetch the latest created routine
 */
export async function fetchLatestRoutine() {
  const routines = await fetchRoutines();
  if (Array.isArray(routines) && routines.length > 0) {
    // Return the routine created last (highest id or last element)
    return routines[routines.length - 1];
  }
  return null;
}

/**
 * Fetch routine by ID
 */
export async function fetchRoutineById(id) {
  const response = await fetch(`${API_BASE_URL}/api/routines/${id}`);
  return handleResponse(response);
}

/**
 * Create a new routine via Spring Boot backend API
 * @param {Object} payload - { goal, availableHours, wakeUpTime, sleepTime, difficulty }
 */
export async function createRoutine(payload) {
  const response = await fetch(`${API_BASE_URL}/api/routines`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

/**
 * Update task completion status
 * @param {number} taskId
 * @param {boolean} completed
 */
export async function updateTaskStatus(taskId, completed) {
  const response = await fetch(`${API_BASE_URL}/api/routines/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ completed }),
  });
  return handleResponse(response);
}

/**
 * Delete a routine by ID
 * @param {number} id
 */
export async function deleteRoutine(id) {
  const response = await fetch(`${API_BASE_URL}/api/routines/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

import { API_BASE_URL } from '../config';

const TOKEN_KEY = 'campusbridge_token';
const USER_KEY = 'campusbridge_user'; // cached copy of the profile for instant display; the database is the source of truth

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
  catch { return null; }
}

export function saveSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function storeUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Error with the HTTP status and optional per-field messages from the API.
export class ApiError extends Error {
  constructor(message, status = 0, fieldErrors = {}, extra = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.extra = extra;
  }
}

// Other parts of the app (AuthContext) subscribe to be told when the server says the session is no longer valid.
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new ApiError('Cannot reach the CampusBridge server. Check that the backend is running and try again.', 0);
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    // 401 on a request that carried a token = expired/invalid session. (A wrong password on /auth/login has no token.)
    if (response.status === 401 && token) onUnauthorized();
    throw new ApiError(body.message || `Request failed (${response.status})`, response.status, body.errors || {}, body);
  }
  return body;
}

const qs = (params) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== 'All'));
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : '';
};

// ---- Public catalogue ----
export const getCourses = (params = {}) => apiFetch(`/courses${qs(params)}`);
export const getCourseById = (id) => apiFetch(`/courses/${encodeURIComponent(id)}`);
export const getOpportunities = (params = {}) => apiFetch(`/opportunities${qs(params)}`);
export const getOpportunityById = (id) => apiFetch(`/opportunities/${encodeURIComponent(id)}`);
export const getFilterOptions = () => apiFetch('/meta/filters');
export const getStats = () => apiFetch('/stats');

// ---- Auth ----
export const registerUser = (payload) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
export const loginUser = (payload) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
export const getCurrentUser = () => apiFetch('/auth/me');
export const updateProfile = (payload) => apiFetch('/auth/me', { method: 'PATCH', body: JSON.stringify(payload) });

// ---- Applications (all need a logged-in user) ----
export const submitApplication = (payload) => apiFetch('/applications', { method: 'POST', body: JSON.stringify(payload) });
export const getApplications = () => apiFetch('/applications');
export const getApplicationById = (id) => apiFetch(`/applications/${encodeURIComponent(id)}`);

// ---- Learning (students) ----
export const getEnrollment = (courseId) => apiFetch(`/courses/${encodeURIComponent(courseId)}/enrollment`);
export const enrollInCourse = (courseId) => apiFetch(`/courses/${encodeURIComponent(courseId)}/enroll`, { method: 'POST' });
export const getCourseAssignments = (courseId) => apiFetch(`/courses/${encodeURIComponent(courseId)}/assignments`);
export const getAssignment = (id) => apiFetch(`/assignments/${encodeURIComponent(id)}`);
export const submitAssignment = (id, payload) => apiFetch(`/assignments/${encodeURIComponent(id)}/submissions`, { method: 'POST', body: JSON.stringify(payload) });
export const getProgress = () => apiFetch('/progress');
export const getLeaderboard = () => apiFetch('/leaderboard');
export const withdrawApplication = (id) => apiFetch(`/applications/${encodeURIComponent(id)}/withdraw`, { method: 'PATCH' });

// ---- Notifications (every role) ----
export const getNotifications = () => apiFetch('/notifications');
export const markNotificationRead = (id) => apiFetch(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
export const markAllNotificationsRead = () => apiFetch('/notifications/read-all', { method: 'POST' });

// ---- Instructors ----
export const getInstructorCourses = () => apiFetch('/instructor/courses');
export const createAssignment = (courseId, payload) => apiFetch(`/courses/${encodeURIComponent(courseId)}/assignments`, { method: 'POST', body: JSON.stringify(payload) });
export const getAssignmentSubmissions = (id) => apiFetch(`/assignments/${encodeURIComponent(id)}/submissions`);
export const gradeSubmission = (id, payload) => apiFetch(`/submissions/${encodeURIComponent(id)}/grade`, { method: 'PATCH', body: JSON.stringify(payload) });

// ---- Internship coordinators ----
export const createOpportunity = (payload) => apiFetch('/opportunities', { method: 'POST', body: JSON.stringify(payload) });
export const getCoordinatorOpportunities = () => apiFetch('/coordinator/opportunities');
export const getOpportunityApplications = (id) => apiFetch(`/opportunities/${encodeURIComponent(id)}/applications`);
export const setApplicationStatus = (id, status) => apiFetch(`/applications/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

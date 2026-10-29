import { API_BASE_URL } from '../config';
import { courses as mockCourses, opportunities as mockOpportunities } from '../data/mockData';

// Simulated network delay for realistic loading states
const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory store for applications (simulates backend persistence for the session)
let applicationsStore = [];

/**
 * Generic fetch wrapper. Falls back to mock data when backend is unavailable.
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    // Network error or backend not running — fall back to mock
    if (err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
      return { __mock: true, error: err };
    }
    throw err;
  }
}

// ============ Courses ============

export async function getCourses(params = {}) {
  await delay(500);
  
  // Try real API first
  const query = new URLSearchParams(params).toString();
  const result = await apiFetch(`/courses${query ? `?${query}` : ''}`);
  
  if (result && !result.__mock) {
    return result;
  }

  // Fallback to mock
  let data = [...mockCourses];
  
  if (params.search) {
    const q = params.search.toLowerCase();
    data = data.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q)) ||
      c.category.toLowerCase().includes(q)
    );
  }
  
  if (params.category && params.category !== 'All') {
    data = data.filter(c => c.category === params.category);
  }
  
  if (params.level && params.level !== 'All') {
    data = data.filter(c => c.level === params.level);
  }

  return { data, total: data.length, mock: true };
}

export async function getCourseById(id) {
  await delay(400);
  
  const result = await apiFetch(`/courses/${id}`);
  if (result && !result.__mock) return result;

  const course = mockCourses.find(c => c.id === id);
  if (!course) throw new Error('Course not found');
  return { data: course, mock: true };
}

// ============ Opportunities ============

export async function getOpportunities(params = {}) {
  await delay(550);
  
  const query = new URLSearchParams(params).toString();
  const result = await apiFetch(`/opportunities${query ? `?${query}` : ''}`);
  
  if (result && !result.__mock) return result;

  let data = [...mockOpportunities];
  
  if (params.search) {
    const q = params.search.toLowerCase();
    data = data.filter(o =>
      o.title.toLowerCase().includes(q) ||
      o.company.toLowerCase().includes(q) ||
      o.tags.some(t => t.toLowerCase().includes(q)) ||
      o.category.toLowerCase().includes(q)
    );
  }
  
  if (params.category && params.category !== 'All') {
    data = data.filter(o => o.category === params.category);
  }
  
  if (params.type && params.type !== 'All') {
    data = data.filter(o => o.type === params.type);
  }

  return { data, total: data.length, mock: true };
}

export async function getOpportunityById(id) {
  await delay(400);
  
  const result = await apiFetch(`/opportunities/${id}`);
  if (result && !result.__mock) return result;

  const opp = mockOpportunities.find(o => o.id === id);
  if (!opp) throw new Error('Opportunity not found');
  return { data: opp, mock: true };
}

// ============ Applications ============

export async function submitApplication(payload) {
  await delay(800);
  
  const result = await apiFetch('/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  if (result && !result.__mock) {
    return result;
  }

  // Mock success — only store locally for the session
  const newApp = {
    id: `app_${Date.now()}`,
    ...payload,
    status: 'Submitted',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  applicationsStore = [newApp, ...applicationsStore];
  
  return {
    success: true,
    data: newApp,
    message: 'Application submitted successfully (demo mode — not persisted to a real server)',
    mock: true,
  };
}

export async function getApplications() {
  await delay(500);
  
  const result = await apiFetch('/applications');
  if (result && !result.__mock) return result;

  return { data: applicationsStore, total: applicationsStore.length, mock: true };
}

export async function getApplicationById(id) {
  await delay(350);
  
  const result = await apiFetch(`/applications/${id}`);
  if (result && !result.__mock) return result;

  const app = applicationsStore.find(a => a.id === id);
  if (!app) throw new Error('Application not found');
  return { data: app, mock: true };
}

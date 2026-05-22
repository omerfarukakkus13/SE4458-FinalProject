// Central API service — ALL backend calls go through the API Gateway (Port 3000)
const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';
const API_BASE = `${GATEWAY_URL}/api/jobs/api/v1`;
const SEARCH_BASE = `${GATEWAY_URL}/api/search/api/v1`;
const NOTIF_BASE = `${GATEWAY_URL}/api/notifications/api/v1`;

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export async function fetchJobs(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/jobs?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json(); // { data, pagination }
}

export async function fetchJobById(id) {
  const res = await fetch(`${API_BASE}/jobs/${id}`);
  if (!res.ok) throw new Error('Failed to fetch job');
  return res.json();
}

export async function fetchRelatedJobs(id) {
  const res = await fetch(`${API_BASE}/jobs/${id}/related`);
  if (!res.ok) return [];
  return res.json();
}

export async function createJob(payload) {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create job');
  }
  return res.json();
}

export async function updateJob(id, payload) {
  const res = await fetch(`${API_BASE}/jobs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update job');
  return res.json();
}

export async function applyToJob(id, user_id, user_email) {
  const res = await fetch(`${API_BASE}/jobs/${id}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, user_email }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to apply');
  return body;
}

export async function fetchAutocomplete(q, type) {
  const res = await fetch(`${API_BASE}/jobs/autocomplete?q=${encodeURIComponent(q)}&type=${type}`);
  if (!res.ok) return [];
  return res.json();
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export async function createAlert(payload) {
  const res = await fetch(`${API_BASE}/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create alert');
  return res.json();
}

export async function fetchUserAlerts(userId) {
  const res = await fetch(`${API_BASE}/alerts?user_id=${userId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function deleteAlert(id) {
  await fetch(`${API_BASE}/alerts/${id}`, { method: 'DELETE' });
}

// ─── Search History ───────────────────────────────────────────────────────────

export async function searchJobs(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${SEARCH_BASE}/search?${qs}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function fetchRecentSearches(userId) {
  if (!userId) return [];
  const res = await fetch(`${SEARCH_BASE}/search/recent?userId=${userId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchMyApplications(userId) {
  if (!userId) return [];
  const res = await fetch(`${API_BASE}/jobs/my-applications?user_id=${userId}`);
  if (!res.ok) return [];
  return res.json();
}

// ─── Notifications ────────────────────────────────────────────────────────────

export const fetchNotifications = async (userId) => {
  const res = await fetch(`${NOTIF_BASE}/notifications/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
};

export const markNotificationAsRead = async (id) => {
  const res = await fetch(`${NOTIF_BASE}/notifications/${id}/read`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to mark notification read');
  return res.json();
};


const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('literaai_token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch (networkErr) {
    const err = new Error(
      'Cannot reach the LiteraAI server. Start the backend first: cd backend && npm run dev'
    );
    err.status = 0;
    err.cause = networkErr;
    throw err;
  }

  if (options.raw) return res;

  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }
  }

  if (!res.ok) {
    let message = data.error || data.message;
    if (!message) {
      if (res.status === 404 || res.status === 502 || res.status === 503) {
        message = 'Backend not reachable on port 5000. Open a terminal, run: cd backend && npm install && npm run dev';
      } else if (res.status === 409) {
        message = 'Email already registered. Please log in instead.';
      } else {
        message = `Request failed (${res.status})`;
      }
    }
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  health: () => request('/api/health'),
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/user/me'),
  updateMe: (body) => request('/api/user/me', { method: 'PUT', body: JSON.stringify(body) }),
  getAssessment: () => request('/api/assessment'),
  submitAssessment: (answers) => request('/api/assessment/submit', { method: 'POST', body: JSON.stringify({ answers }) }),
  recommended: () => request('/api/courses/recommended'),
  getCourse: (id) => request(`/api/courses/${id}`),
  lessonProgress: (lessonId, body) => request(`/api/lessons/${lessonId}/progress`, { method: 'POST', body: JSON.stringify(body) }),
  getCourseScores: (courseId) => request(`/api/courses/${courseId}/scores`),
  checkpoint: (courseId, payload) => {
    const answers = Array.isArray(payload) ? payload : (payload?.answers || []);
    return request(`/api/checkpoint/${courseId}`, { method: 'POST', body: JSON.stringify({ answers }) });
  },
  certificate: () => request('/api/certificate/generate'),
  certificatePdfUrl: () => `${API_BASE}/api/certificate/generate?format=pdf`,
  getLeagueStatus: () => request('/api/league/status'),
  getLeaderboard: () => request('/api/league/leaderboard'),
  getLeagueExam: () => request('/api/league/exam'),
  submitLeagueExam: (answers) => request('/api/league/exam/submit', { method: 'POST', body: JSON.stringify({ answers }) }),
  downloadLeagueCertificate: async (league) => {
    const query = league ? `?league=${league}` : '';
    const res = await request(`/api/certificate/league${query}`, { raw: true });
    if (!res.ok) throw new Error('League PDF download failed');
    return res.blob();
  },
  coach: () => request('/api/coach', { method: 'POST', body: JSON.stringify({}) }),
  downloadCertificate: async () => {
    const res = await request('/api/certificate/generate?format=pdf', { raw: true });
    if (!res.ok) throw new Error('PDF download failed');
    return res.blob();
  },
  getCommunityPosts: () => request('/api/community'),
  createCommunityPost: (body) => request('/api/community', { method: 'POST', body: JSON.stringify(body) }),
  likeCommunityPost: (id) => request(`/api/community/${id}/like`, { method: 'POST' }),
  deleteCommunityPost: (id) => request(`/api/community/${id}`, { method: 'DELETE' }),
};

export default api;

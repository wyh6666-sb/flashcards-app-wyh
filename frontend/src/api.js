const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = getToken();
    if (t) headers['Authorization'] = `Bearer ${t}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg = (data && data.error) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // auth
  register: (body) => request('/auth/register', { method: 'POST', body, auth: false }),
  login:    (body) => request('/auth/login',    { method: 'POST', body, auth: false }),
  // decks
  listDecks:   ()         => request('/decks'),
  createDeck:  (body)     => request('/decks', { method: 'POST', body }),
  updateDeck:  (id, body) => request(`/decks/${id}`, { method: 'PUT', body }),
  deleteDeck:  (id)       => request(`/decks/${id}`, { method: 'DELETE' }),
  // flashcards
  listCards:   (params = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.deck_id) qs.set('deck_id', params.deck_id);
    const s = qs.toString();
    return request(`/flashcards${s ? '?' + s : ''}`);
  },
  createCard:  (body)     => request('/flashcards', { method: 'POST', body }),
  updateCard:  (id, body) => request(`/flashcards/${id}`, { method: 'PUT', body }),
  deleteCard:  (id)       => request(`/flashcards/${id}`, { method: 'DELETE' }),
  // history
  recordHistory: (body)   => request('/history', { method: 'POST', body }),
  myHistory:     ()       => request('/history/me'),
  deleteHistory: (id)     => request(`/history/${id}`, { method: 'DELETE' }),
  // admin
  adminUsers:   ()        => request('/admin/users'),
  adminDeleteUser: (id)   => request(`/admin/users/${id}`, { method: 'DELETE' }),
  adminHistory: (userId)  => request(`/admin/history${userId ? '?user_id=' + userId : ''}`),
  adminStats:   ()        => request('/admin/stats'),
};

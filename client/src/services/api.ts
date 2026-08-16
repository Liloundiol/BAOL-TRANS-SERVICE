const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

export const getAuthToken = () => {
  return localStorage.getItem('bts_token');
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (response.status === 401 || response.status === 403) {
    window.dispatchEvent(new CustomEvent('auth-error'));
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Une erreur est survenue');
  }

  return data;
};

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
export const WS_BACKEND_URL = 'ws://localhost:5000';

let currentToken = null;

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }
  return headers;
};

export const apiService = {
  setToken: (token) => {
    currentToken = token;
  },

  login: async (credentials) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  sendOtp: async (userData) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to send OTP');
    }
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Registration failed');
    }
    return res.json();
  },

  getOrders: async () => {
    const res = await fetch(`${BACKEND_URL}/api/orders`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  getMyOrders: async () => {
    const res = await fetch(`${BACKEND_URL}/api/orders/myorders`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch my orders');
    return res.json();
  },
  
  createOrder: async (orderData) => {
    const res = await fetch(`${BACKEND_URL}/api/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },
  
  updateOrderStatus: async (id, status) => {
    const res = await fetch(`${BACKEND_URL}/api/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  sendAudio: async (sessionId, base64Audio, mimeType) => {
    const res = await fetch(`${BACKEND_URL}/api/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId, base64Audio, mimeType })
    });
    if (!res.ok) throw new Error('Failed to send audio');
    return res.json();
  },

  getMenu: async () => {
    const res = await fetch(`${BACKEND_URL}/api/menu`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch menu');
    return res.json();
  },

  createMenuItem: async (itemData) => {
    const res = await fetch(`${BACKEND_URL}/api/menu`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(itemData)
    });
    if (!res.ok) throw new Error('Failed to create menu item');
    return res.json();
  },

  updateMenuItem: async (id, itemData) => {
    const res = await fetch(`${BACKEND_URL}/api/menu/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(itemData)
    });
    if (!res.ok) throw new Error('Failed to update menu item');
    return res.json();
  },

  deleteMenuItem: async (id) => {
    const res = await fetch(`${BACKEND_URL}/api/menu/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete menu item');
    return res.json();
  },

  getAnalytics: async () => {
    const res = await fetch(`${BACKEND_URL}/api/orders/analytics`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  recoverMissedCall: async (id) => {
    const res = await fetch(`${BACKEND_URL}/api/orders/missed-calls/${id}/recover`, {
      method: 'PUT',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to recover missed call');
    return res.json();
  },

  sendTextChat: async (sessionId, text) => {
    const res = await fetch(`${BACKEND_URL}/api/ai/text-chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId, text })
    });
    if (!res.ok) throw new Error('Failed to send text chat');
    return res.json();
  }
};

import api from './api';

// Auth Service
export const authService = {
  async register(data: { name: string; email: string; password: string }) {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async login(data: { email: string; password: string }) {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async logout() {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// User Service
export const userService = {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(data: any) {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  async getLeaderboard(limit = 10) {
    const response = await api.get(`/users/leaderboard/top?limit=${limit}`);
    return response.data;
  },

  async getAllUsers(page = 1, limit = 10) {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },
};

// Event Service
export const eventService = {
  async getEvents(page = 1, limit = 10) {
    const response = await api.get(`/events?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getEventById(id: string) {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  async registerForEvent(eventId: string) {
    const response = await api.post(`/events/${eventId}/register`);
    return response.data;
  },

  async getUpcomingEvents() {
    const response = await api.get('/events/upcoming');
    return response.data;
  },
};

// Project Service
export const projectService = {
  async getProjects(page = 1, limit = 10) {
    const response = await api.get(`/projects?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getProjectById(id: string) {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  async getFeaturedProjects() {
    const response = await api.get('/projects/featured');
    return response.data;
  },
};

// Team Service
export const teamService = {
  async getTeamMembers() {
    const response = await api.get('/team');
    return response.data;
  },

  async getTeamMemberById(id: string) {
    const response = await api.get(`/team/${id}`);
    return response.data;
  },
};

// Resource Service
export const resourceService = {
  async getResources(category?: string) {
    const url = category ? `/resources?category=${category}` : '/resources';
    const response = await api.get(url);
    return response.data;
  },

  async getResourceById(id: string) {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },
};

// Contact Service
export const contactService = {
  async sendMessage(data: { name: string; email: string; message: string }) {
    const response = await api.post('/contact', data);
    return response.data;
  },
};
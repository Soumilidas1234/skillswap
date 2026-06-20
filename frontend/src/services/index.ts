import api, { ApiResponse, type PaginatedData } from './api'

export interface User {
  id: number
  uuid: string
  name: string
  email: string
  role: 'user' | 'admin'
  avatar?: string
  bio?: string
  location?: string
  website?: string
  twitter?: string
  linkedin?: string
  github?: string
  points: number
  rank?: number
  user_level?: UserLevel
  level_ranges?: UserLevel[]
  category_points?: CategoryPoints[]
  is_verified: boolean
  created_at: string
}

export interface Skill {
  id: number
  user_id: number
  category_id: number
  title: string
  slug: string
  description: string
  level: string
  tags: string[]
  thumbnail?: string
  availability: string
  experience_years: number
  status: string
  views: number
  request_count: number
  rating: number
  teacher_name?: string
  teacher_avatar?: string
  teacher_uuid?: string
  category_name?: string
  category_slug?: string
  category_icon?: string
  category_color?: string
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  icon: string
  color: string
  skill_count: number
}

export interface LearningRequest {
  id: number
  uuid: string
  skill_id: number
  learner_id: number
  teacher_id: number
  message: string
  preferred_timing?: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed'
  skill_title?: string
  skill_thumbnail?: string
  learner_name?: string
  learner_avatar?: string
  learner_uuid?: string
  teacher_name?: string
  teacher_avatar?: string
  teacher_uuid?: string
  created_at: string
}

export interface Notification {
  id: number
  type: string
  title: string
  message: string
  data?: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface Achievement {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  color: string
  tier: string
  unlocked_at?: string
}

export interface UserLevel {
  level: number
  name: string
  min_points: number
  max_points: number | null
  cert_at: number | null
  progress: number
  next_level_at: number | null
}

export interface CategoryPoints {
  category_id: number
  points: number
  category_name: string
  category_slug: string
  category_color: string
}

export interface CertificateMilestone {
  id: number
  category_id: number
  category_name: string
  category_slug: string
  category_color?: string
  level: number
  name: string
  slug: string
  min_points: number
  level_min: number
  level_max: number
  tier: string
  description: string
}

export interface Certificate {
  id: number
  certificate_id: string
  cert_type: 'session' | 'milestone'
  skill_name: string
  learner_name: string
  teacher_name: string
  completion_date: string
  category_name?: string
  category_slug?: string
  category_color?: string
  milestone_tier?: string
  milestone_level?: number
  milestone_points?: number
  level_min?: number
  level_max?: number
  user_level?: number
  qr_data?: Record<string, string>
  created_at: string
}

export const authService = {
  register: (data: { name: string; email: string; password: string }) => {
    const body = new URLSearchParams({ name: data.name, email: data.email, password: data.password })
    return api.post<ApiResponse<{ user: User; token: string; csrf_token: string }>>('/auth/register', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  login: (data: { email: string; password: string; remember?: boolean }) => {
    const body = new URLSearchParams({ email: data.email, password: data.password })
    if (data.remember) body.append('remember', '1')
    return api.post<ApiResponse<{ user: User; token: string; csrf_token: string }>>('/auth/login', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  logout: () => api.post('/auth/logout'),
  me: () => api.get<ApiResponse<User>>('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
}

export const userService = {
  getProfile: () => api.get<ApiResponse<User>>('/users/profile'),
  updateProfile: (data: Partial<User>) => api.put<ApiResponse<User>>('/users/profile', data),
  getDashboard: () => api.get<ApiResponse<Record<string, unknown>>>('/users/dashboard'),
  getPublicProfile: (uuid: string) => api.get<ApiResponse<User>>(`/users/${uuid}`),
}

export const skillService = {
  browse: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<{ items: Skill[]; pagination: PaginatedData<Skill>['pagination'] }>>('/skills', { params }),
  getPopular: () => api.get<ApiResponse<Skill[]>>('/skills/popular'),
  getById: (id: number) => api.get<ApiResponse<Skill>>(`/skills/${id}`),
  getMySkills: () => api.get<ApiResponse<Skill[]>>('/skills/my'),
  create: (data: Partial<Skill>) => api.post<ApiResponse<Skill>>('/skills', data),
  update: (id: number, data: Partial<Skill>) => api.put<ApiResponse<Skill>>(`/skills/${id}`, data),
  delete: (id: number) => api.delete(`/skills/${id}`),
}

export const requestService = {
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ incoming: LearningRequest[]; outgoing: LearningRequest[] }>>('/requests', { params }),
  create: (data: { skill_id: number; message: string; preferred_timing?: string }) =>
    api.post<ApiResponse<LearningRequest>>('/requests', data),
  accept: (id: number) => api.post(`/requests/${id}/accept`),
  reject: (id: number, response?: string) => api.post(`/requests/${id}/reject`, { response }),
  complete: (id: number) => api.post(`/requests/${id}/complete`),
  cancel: (id: number) => api.post(`/requests/${id}/cancel`),
}

export const notificationService = {
  getAll: (page = 1) => api.get(`/notifications?page=${page}`),
  getUnreadCount: () => api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}

export const categoryService = {
  getAll: () => api.get<ApiResponse<Category[]>>('/categories'),
  getTop: () => api.get<ApiResponse<Category[]>>('/categories/top'),
}

export const leaderboardService = {
  getAll: () => api.get<ApiResponse<User[]>>('/leaderboard'),
  getPreview: () => api.get<ApiResponse<User[]>>('/leaderboard/preview'),
}

export const achievementService = {
  getAll: () => api.get<ApiResponse<Achievement[]>>('/achievements'),
  getMy: () => api.get<ApiResponse<Achievement[]>>('/achievements/my'),
}

export const certificateService = {
  getAll: () => api.get<ApiResponse<Certificate[]>>('/certificates'),
  getMilestones: () => api.get<ApiResponse<CertificateMilestone[]>>('/certificates/milestones'),
  getById: (certId: string) => api.get<ApiResponse<Certificate>>(`/certificates/${certId}`),
  verify: (certId: string) => api.get(`/certificates/verify/${certId}`),
}

export const statsService = {
  getPublic: () => api.get<ApiResponse<{ total_users: number; total_skills: number; total_requests: number }>>('/stats'),
}

export const adminService = {
  getDashboard: () => api.get<ApiResponse<Record<string, unknown>>>('/admin/dashboard'),
  getUsers: (params?: Record<string, string | number>) => api.get('/admin/users', { params }),
  suspendUser: (id: number) => api.post(`/admin/users/${id}/suspend`),
  unsuspendUser: (id: number) => api.post(`/admin/users/${id}/unsuspend`),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  getSkills: (page = 1) => api.get(`/admin/skills?page=${page}`),
  deleteSkill: (id: number) => api.delete(`/admin/skills/${id}`),
  getRequests: (page = 1) => api.get(`/admin/requests?page=${page}`),
}

export const uploadService = {
  avatar: (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return api.post('/upload/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  thumbnail: (file: File) => {
    const form = new FormData()
    form.append('thumbnail', file)
    return api.post('/upload/thumbnail', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

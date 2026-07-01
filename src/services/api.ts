import { 
  User, MemberProfile, TrainerProfile, MembershipPlan, 
  AttendanceRecord, Payment, WorkoutPlan, DietPlan, 
  ProgressLog, Notification, GymSettings,
  RewardShopItem, RewardTransaction, FitnessChallenge, CalendarEvent
} from '../types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {})
  };
  
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

export const api = {
  // Auth
  login: (credentials: any) => 
    request<{ user: User; profile: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    
  register: (data: any) => 
    request<{ user: User; profile: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    
  forgotPassword: (email: string) => 
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
    
  resetPassword: (data: any) => 
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Members
  getMembers: () => request<any[]>('/members'),
  createMember: (data: any) => 
    request<any>('/members', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateMember: (id: string, data: any) => 
    request<any>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteMember: (id: string) => 
    request<{ success: boolean; message: string }>(`/members/${id}`, {
      method: 'DELETE'
    }),

  // Trainers
  getTrainers: () => request<any[]>('/trainers'),
  createTrainer: (data: any) => 
    request<any>('/trainers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateTrainer: (id: string, data: any) => 
    request<any>(`/trainers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteTrainer: (id: string) => 
    request<{ success: boolean; message: string }>(`/trainers/${id}`, {
      method: 'DELETE'
    }),

  // Plans
  getPlans: () => request<MembershipPlan[]>('/plans'),
  createPlan: (data: any) => 
    request<MembershipPlan>('/plans', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updatePlan: (id: string, data: any) => 
    request<MembershipPlan>(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Attendance
  getAttendance: () => request<AttendanceRecord[]>('/attendance'),
  checkIn: (data: { memberId: string; status?: string; method?: string; date?: string; checkInTime?: string }) => 
    request<AttendanceRecord>('/attendance', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  checkOut: (data: { memberId: string; date?: string; checkOutTime?: string }) => 
    request<AttendanceRecord>('/attendance/checkout', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Payments
  getPayments: () => request<Payment[]>('/payments'),
  createPayment: (data: { memberId: string; planId: string; amount?: number; paymentMethod?: string; status?: string }) => 
    request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  refundPayment: (paymentId: string) => 
    request<Payment>('/payments/refund', {
      method: 'POST',
      body: JSON.stringify({ paymentId })
    }),

  // Workouts
  getWorkouts: () => request<WorkoutPlan[]>('/workouts'),
  assignWorkout: (data: { memberId: string; exercises: any[]; assignedBy: string; status?: string }) => 
    request<WorkoutPlan>('/workouts', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Diets
  getDiets: () => request<DietPlan[]>('/diets'),
  assignDiet: (data: { 
    memberId: string; 
    meals: any[]; 
    targetCalories: number; 
    targetProtein: number; 
    targetCarbs: number; 
    targetFat: number; 
    waterIntakeLiters: number; 
    supplements?: string[]; 
    assignedBy: string; 
    status?: string;
  }) => 
    request<DietPlan>('/diets', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Progress Logs
  getProgress: (memberId: string) => request<ProgressLog[]>(`/progress/${memberId}`),
  addProgress: (data: { 
    memberId: string; 
    weight: number; 
    height?: number; 
    bodyFatPercentage?: number; 
    muscleMassPercentage?: number; 
    chestSize?: number; 
    waistSize?: number; 
    bicepSize?: number; 
    thighSize?: number; 
    date?: string;
  }) => 
    request<ProgressLog>('/progress', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Notifications
  getNotifications: () => request<Notification[]>('/notifications'),
  markAsRead: (id: string) => 
    request<Notification>(`/notifications/${id}/read`, {
      method: 'PUT'
    }),
  markAllAsRead: () => 
    request<{ success: boolean }>('/notifications/all-read', {
      method: 'POST'
    }),

  // Settings
  getSettings: () => request<GymSettings>('/settings'),
  updateSettings: (data: any) => 
    request<GymSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // AI Assistant recommendations
  recommendWorkout: (data: { age: number; gender: string; weight: number; height: number; goal: string; category?: string }) => 
    request<{ assignedBy: string; exercises: any[] }>('/ai/recommend-workout', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    
  recommendDiet: (data: { age: number; gender: string; weight: number; height: number; goal: string; dietType?: string }) => 
    request<any>('/ai/recommend-diet', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Rewards System
  getRewards: (memberId: string) => 
    request<{ memberId: string; balance: number; transactions: RewardTransaction[]; shopItems: RewardShopItem[] }>(`/rewards/${memberId}`),

  redeemReward: (memberId: string, itemId: string) => 
    request<{ success: boolean; transaction: RewardTransaction; balance: number; item: RewardShopItem }>('/rewards/redeem', {
      method: 'POST',
      body: JSON.stringify({ memberId, itemId })
    }),

  adjustPoints: (memberId: string, points: number, reason: string) => 
    request<RewardTransaction>('/rewards/adjust', {
      method: 'POST',
      body: JSON.stringify({ memberId, points, reason })
    }),

  logWorkoutPoints: (memberId: string, workoutName: string) => 
    request<RewardTransaction>('/rewards/log-workout', {
      method: 'POST',
      body: JSON.stringify({ memberId, workoutName })
    }),

  // Fitness Challenges
  getChallenges: () => request<FitnessChallenge[]>('/challenges'),

  createChallenge: (data: any) => 
    request<FitnessChallenge>('/challenges', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  joinChallenge: (id: string, memberId: string) => 
    request<{ success: boolean; challenge: FitnessChallenge }>(`/challenges/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({ memberId })
    }),

  logChallengeProgress: (id: string, memberId: string, value: number) => 
    request<{ success: boolean; challenge: FitnessChallenge; completed: boolean; currentProgress: number }>(`/challenges/${id}/log`, {
      method: 'POST',
      body: JSON.stringify({ memberId, value })
    }),

  // Events & Scheduling
  getEvents: () => request<CalendarEvent[]>('/events'),

  createEvent: (data: any) => 
    request<CalendarEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  bookEvent: (id: string, memberId: string) => 
    request<{ success: boolean; event: CalendarEvent }>(`/events/${id}/book`, {
      method: 'POST',
      body: JSON.stringify({ memberId })
    }),

  cancelEvent: (id: string, memberId: string) => 
    request<{ success: boolean; event: CalendarEvent }>(`/events/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ memberId })
    })
};

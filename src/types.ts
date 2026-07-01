export type Role = 'admin' | 'trainer' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: 'active' | 'inactive';
  joinedDate: string;
}

export interface MemberProfile {
  id: string;
  userId: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  height: number; // in cm
  weight: number; // in kg
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  joinDate: string;
  membershipPlanId: string;
  assignedTrainerId: string | null;
  status: 'active' | 'inactive' | 'expired';
  profilePhoto: string;
  medicalInfo?: string;
}

export interface TrainerProfile {
  id: string;
  userId: string;
  phone: string;
  experience: number; // years
  specialization: string;
  salary: number;
  availability: 'Morning' | 'Evening' | 'Full-time' | 'Part-time';
  certifications: string[];
  bio: string;
  photo: string;
  name?: string;
  email?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  benefits: string[];
  personalTraining: boolean;
  groupClasses: boolean;
  dietConsultation: boolean;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:MM:SS
  checkOutTime?: string; // HH:MM:SS
  status: 'present' | 'late' | 'absent';
  method: 'QR' | 'Manual';
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  planId: string;
  planName: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'refunded';
  paymentMethod: 'Credit Card' | 'Cash' | 'Bank Transfer' | 'Online';
  invoiceNumber: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Cardio' | 'Full Body';
  sets: number;
  reps: string; // e.g. "12-10-8" or "15"
  weight?: string; // e.g. "40kg" or "Bodyweight"
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  memberId: string;
  memberName: string;
  assignedBy: string; // Trainer ID or "AI"
  assignedDate: string;
  exercises: Exercise[];
  status: 'active' | 'completed';
}

export interface Meal {
  name: string; // Breakfast, Lunch, Dinner, Snack
  description: string; // e.g. "Oatmeal with whey and berries"
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export interface DietPlan {
  id: string;
  memberId: string;
  memberName: string;
  assignedBy: string; // Trainer ID or "AI"
  assignedDate: string;
  meals: Meal[];
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  waterIntakeLiters: number;
  supplements?: string[];
  status: 'active' | 'completed';
}

export interface ProgressLog {
  id: string;
  memberId: string;
  date: string;
  weight: number;
  height: number;
  bmi: number;
  bodyFatPercentage: number;
  muscleMassPercentage: number;
  chestSize?: number;
  waistSize?: number;
  bicepSize?: number;
  thighSize?: number;
}

export interface Notification {
  id: string;
  userId: string; // target user, or "all"
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  date: string;
  read: boolean;
}

export interface GymSettings {
  gymName: string;
  openingHours: string;
  taxRate: number; // percentage
  currency: string; // e.g. "$", "€", "£", "₹"
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  backupStatus: string;
}

export interface RewardShopItem {
  id: string;
  name: string;
  pointsCost: number;
  description: string;
  category: 'Supplements' | 'Apparel' | 'Gear' | 'Voucher' | 'Other';
  stock: number;
  image: string;
}

export interface RewardTransaction {
  id: string;
  memberId: string;
  points: number;
  reason: string;
  date: string;
}

export interface FitnessChallenge {
  id: string;
  title: string;
  description: string;
  type: 'attendance' | 'workout' | 'weight_loss' | 'custom';
  targetValue: number;
  startDate: string;
  endDate: string;
  pointsReward: number;
  isPrivate: boolean;
  participants: string[];
  progress: Record<string, number>;
  createdBy: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: 'group_class' | 'personal_training' | 'gym_event';
  date: string;
  startTime: string;
  endTime: string;
  trainerId?: string;
  trainerName?: string;
  maxParticipants: number;
  participants: string[];
  location: string;
}

import fs from 'fs';
import path from 'path';
import { 
  User, MemberProfile, TrainerProfile, MembershipPlan, 
  AttendanceRecord, Payment, WorkoutPlan, DietPlan, 
  ProgressLog, Notification, GymSettings,
  RewardShopItem, RewardTransaction, FitnessChallenge, CalendarEvent
} from '../src/types';

const DB_PATH = path.join(process.cwd(), 'server', 'db.json');

export interface DBStructure {
  users: User[];
  passwords: Record<string, string>; // userId -> password
  members: MemberProfile[];
  trainers: TrainerProfile[];
  membershipPlans: MembershipPlan[];
  attendance: AttendanceRecord[];
  payments: Payment[];
  workoutPlans: WorkoutPlan[];
  dietPlans: DietPlan[];
  progress: ProgressLog[];
  notifications: Notification[];
  settings: GymSettings;
  rewardShopItems: RewardShopItem[];
  rewardTransactions: RewardTransaction[];
  fitnessChallenges: FitnessChallenge[];
  calendarEvents: CalendarEvent[];
}

const DEFAULT_PLANS: MembershipPlan[] = [
  {
    id: 'plan-basic',
    name: 'Basic Starter',
    price: 1500,
    durationMonths: 1,
    benefits: ['Gym floor access', 'Standard locker access', '1 Fitness assessment'],
    personalTraining: false,
    groupClasses: false,
    dietConsultation: false
  },
  {
    id: 'plan-standard',
    name: 'Standard Pro',
    price: 2500,
    durationMonths: 1,
    benefits: ['Gym floor access', 'Unlimited locker access', '3 Group classes / month', 'Basic progress tracking'],
    personalTraining: false,
    groupClasses: true,
    dietConsultation: false
  },
  {
    id: 'plan-premium',
    name: 'Premium Elite',
    price: 4500,
    durationMonths: 3,
    benefits: ['All gym access', 'Unlimited group classes', 'Dedicated Trainer', 'Custom Workout Plans', '1 Diet consultation / month'],
    personalTraining: true,
    groupClasses: true,
    dietConsultation: true
  },
  {
    id: 'plan-vip',
    name: 'VIP Platinum',
    price: 8000,
    durationMonths: 6,
    benefits: ['24/7 Access', 'Unlimited Group Classes', '1-on-1 Personal Trainer', 'Custom Diet & Workout plans', 'Spa & sauna access', 'Complimentary recovery drinks'],
    personalTraining: true,
    groupClasses: true,
    dietConsultation: true
  }
];

const DEFAULT_SETTINGS: GymSettings = {
  gymName: 'FitSync Elite Club India',
  openingHours: 'Mon-Sat: 06:00 - 22:00, Sun: 07:00 - 13:00',
  taxRate: 18, // GST
  currency: '₹',
  smtpHost: 'smtp.fitsync-mail.in',
  smtpPort: 587,
  smtpUser: 'notifications@fitsync.in',
  backupStatus: 'Healthy (Auto-backed up daily)'
};

const DEFAULT_REWARD_SHOP_ITEMS: RewardShopItem[] = [
  {
    id: 'item-1',
    name: 'FitSync Shaker Bottle',
    pointsCost: 150,
    description: 'High durability leak-proof 700ml shaker with dynamic wire whisk.',
    category: 'Gear',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=300&h=300&fit=crop'
  },
  {
    id: 'item-2',
    name: 'Premium Whey Isolate (1kg)',
    pointsCost: 500,
    description: 'Ultra-pure fast absorbing cold-processed chocolate whey isolate.',
    category: 'Supplements',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=300&h=300&fit=crop'
  },
  {
    id: 'item-3',
    name: 'Elite Gym Stringer (Black)',
    pointsCost: 200,
    description: '100% breathable premium athletic dry-fit gym vest with bold logo.',
    category: 'Apparel',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&h=300&fit=crop'
  },
  {
    id: 'item-4',
    name: '₹500 Membership Renewal Voucher',
    pointsCost: 350,
    description: 'Flat ₹500 discount on your next monthly membership renewal package.',
    category: 'Voucher',
    stock: 999,
    image: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=300&h=300&fit=crop'
  },
  {
    id: 'item-5',
    name: 'BCAA Recovery Formula (250g)',
    pointsCost: 400,
    description: 'Watermelon flavored branch-chain amino acids for enhanced muscle recovery.',
    category: 'Supplements',
    stock: 10,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&h=300&fit=crop'
  }
];

function getSeedData(): DBStructure {
  return {
    users: [
      { id: 'usr-admin', email: 'admin@fitsync.com', name: 'Devendra Rajput', role: 'admin', status: 'active', joinedDate: '2026-01-10' },
      { id: 'usr-trainer1', email: 'trainer1@fitsync.com', name: 'Vikram Rathore', role: 'trainer', status: 'active', joinedDate: '2026-02-15' },
      { id: 'usr-trainer2', email: 'trainer2@fitsync.com', name: 'Ananya Sharma', role: 'trainer', status: 'active', joinedDate: '2026-03-01' },
      { id: 'usr-member1', email: 'member1@fitsync.com', name: 'Rohan Malhotra', role: 'member', status: 'active', joinedDate: '2026-04-01' },
      { id: 'usr-member2', email: 'member2@fitsync.com', name: 'Priya Patel', role: 'member', status: 'active', joinedDate: '2026-04-10' },
      { id: 'usr-member3', email: 'member3@fitsync.com', name: 'Aarav Mehta', role: 'member', status: 'active', joinedDate: '2026-04-15' },
      { id: 'usr-member4', email: 'member4@fitsync.com', name: 'Pooja Sen', role: 'member', status: 'active', joinedDate: '2026-05-01' },
      { id: 'usr-member5', email: 'member5@fitsync.com', name: 'Kabir Kapoor', role: 'member', status: 'inactive', joinedDate: '2026-02-01' }
    ],
    passwords: {
      'usr-admin': 'admin123',
      'usr-trainer1': 'trainer123',
      'usr-trainer2': 'trainer123',
      'usr-member1': 'member123',
      'usr-member2': 'member123',
      'usr-member3': 'member123',
      'usr-member4': 'member123',
      'usr-member5': 'member123'
    },
    trainers: [
      {
        id: 'trn-1',
        userId: 'usr-trainer1',
        phone: '+91 98765 43210',
        experience: 8,
        specialization: 'Strength & Powerlifting',
        salary: 45000,
        availability: 'Full-time',
        certifications: ['NASM-PES', 'Gold Standard Certified Trainer', 'IPF Coach'],
        bio: 'Former national level powerlifter. Highly dedicated to building functional raw strength, optimal biomechanics, and consistent habit systems.',
        photo: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=150&h=150&fit=crop&crop=faces'
      },
      {
        id: 'trn-2',
        userId: 'usr-trainer2',
        phone: '+91 87654 32109',
        experience: 6,
        specialization: 'Yoga & Functional Mobility',
        salary: 40000,
        availability: 'Full-time',
        certifications: ['RYT-500 Yoga Teacher', 'Functional Movement Screen L1'],
        bio: 'Focused on yoga, vinyasa flows, and active rehab. Bridging the gap between explosive conditioning and physical flexibility.',
        photo: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=150&h=150&fit=crop&crop=faces'
      }
    ],
    members: [
      {
        id: 'mem-1',
        userId: 'usr-member1',
        phone: '+91 76543 21098',
        gender: 'Male',
        age: 28,
        height: 182,
        weight: 84.5,
        address: 'Sector 15, Vashi, Navi Mumbai',
        emergencyContact: { name: 'Sanjay Malhotra', phone: '+91 91234 56789', relationship: 'Father' },
        joinDate: '2026-04-01',
        membershipPlanId: 'plan-premium',
        assignedTrainerId: 'trn-1',
        status: 'active',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
        medicalInfo: 'Slight lower back tension if deadlifting with poor posture.'
      },
      {
        id: 'mem-2',
        userId: 'usr-member2',
        phone: '+91 65432 10987',
        gender: 'Female',
        age: 25,
        height: 165,
        weight: 58.2,
        address: 'Bandra West, Mumbai',
        emergencyContact: { name: 'Kiran Patel', phone: '+91 92345 67890', relationship: 'Mother' },
        joinDate: '2026-04-10',
        membershipPlanId: 'plan-premium',
        assignedTrainerId: 'trn-2',
        status: 'active',
        profilePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=faces'
      },
      {
        id: 'mem-3',
        userId: 'usr-member3',
        phone: '+91 54321 09876',
        gender: 'Male',
        age: 34,
        height: 175,
        weight: 91.0,
        address: 'Koregaon Park, Pune',
        emergencyContact: { name: 'Meera Mehta', phone: '+91 93456 78901', relationship: 'Spouse' },
        joinDate: '2026-04-15',
        membershipPlanId: 'plan-standard',
        assignedTrainerId: null,
        status: 'active',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces'
      },
      {
        id: 'mem-4',
        userId: 'usr-member4',
        phone: '+91 43210 98765',
        gender: 'Female',
        age: 31,
        height: 170,
        weight: 64.0,
        address: 'Indiranagar, Bengaluru',
        emergencyContact: { name: 'Amit Sen', phone: '+91 94567 89012', relationship: 'Brother' },
        joinDate: '2026-05-01',
        membershipPlanId: 'plan-vip',
        assignedTrainerId: 'trn-1',
        status: 'active',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces'
      },
      {
        id: 'mem-5',
        userId: 'usr-member5',
        phone: '+91 32109 87654',
        gender: 'Male',
        age: 42,
        height: 178,
        weight: 88.0,
        address: 'Salt Lake, Kolkata',
        emergencyContact: { name: 'Sunita Kapoor', phone: '+91 95678 90123', relationship: 'Sister' },
        joinDate: '2026-02-01',
        membershipPlanId: 'plan-basic',
        assignedTrainerId: null,
        status: 'inactive',
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces'
      }
    ],
    membershipPlans: DEFAULT_PLANS,
    attendance: [
      { id: 'att-1', memberId: 'mem-1', memberName: 'Rohan Malhotra', date: '2026-06-25', checkInTime: '07:15:30', checkOutTime: '08:45:00', status: 'present', method: 'QR' },
      { id: 'att-2', memberId: 'mem-2', memberName: 'Priya Patel', date: '2026-06-25', checkInTime: '08:30:15', checkOutTime: '10:00:10', status: 'present', method: 'QR' },
      { id: 'att-3', memberId: 'mem-3', memberName: 'Aarav Mehta', date: '2026-06-25', checkInTime: '18:15:00', checkOutTime: '19:30:00', status: 'present', method: 'Manual' },
      { id: 'att-4', memberId: 'mem-1', memberName: 'Rohan Malhotra', date: '2026-06-26', checkInTime: '07:22:11', checkOutTime: '08:50:00', status: 'present', method: 'QR' },
      { id: 'att-5', memberId: 'mem-2', memberName: 'Priya Patel', date: '2026-06-26', checkInTime: '08:45:00', checkOutTime: '10:15:00', status: 'present', method: 'QR' },
      { id: 'att-6', memberId: 'mem-4', memberName: 'Pooja Sen', date: '2026-06-26', checkInTime: '09:15:00', checkOutTime: '11:00:00', status: 'present', method: 'QR' },
      { id: 'att-7', memberId: 'mem-1', memberName: 'Rohan Malhotra', date: '2026-06-27', checkInTime: '07:05:40', checkOutTime: '08:30:00', status: 'present', method: 'QR' },
      { id: 'att-8', memberId: 'mem-3', memberName: 'Aarav Mehta', date: '2026-06-27', checkInTime: '18:45:10', checkOutTime: '20:00:00', status: 'present', method: 'Manual' },
      { id: 'att-9', memberId: 'mem-1', memberName: 'Rohan Malhotra', date: '2026-06-28', checkInTime: '07:35:00', checkOutTime: '09:00:00', status: 'present', method: 'QR' },
      { id: 'att-10', memberId: 'mem-2', memberName: 'Priya Patel', date: '2026-06-28', checkInTime: '08:50:00', checkOutTime: '10:20:00', status: 'present', method: 'QR' },
      { id: 'att-11', memberId: 'mem-4', memberName: 'Pooja Sen', date: '2026-06-28', checkInTime: '09:10:00', checkOutTime: '10:45:00', status: 'present', method: 'QR' },
      { id: 'att-12', memberId: 'mem-1', memberName: 'Rohan Malhotra', date: '2026-06-29', checkInTime: '07:08:12', checkOutTime: '08:40:00', status: 'present', method: 'QR' },
      { id: 'att-13', memberId: 'mem-2', memberName: 'Priya Patel', date: '2026-06-29', checkInTime: '08:12:44', checkOutTime: '09:45:00', status: 'present', method: 'QR' },
      { id: 'att-14', memberId: 'mem-3', memberName: 'Aarav Mehta', date: '2026-06-29', checkInTime: '18:32:00', checkOutTime: '19:45:00', status: 'present', method: 'Manual' },
      { id: 'att-15', memberId: 'mem-4', memberName: 'Pooja Sen', date: '2026-06-29', checkInTime: '09:02:15', checkOutTime: '10:30:00', status: 'present', method: 'QR' },
      { id: 'att-16', memberId: 'mem-1', memberName: 'Rohan Malhotra', date: '2026-06-30', checkInTime: '07:11:00', checkOutTime: '08:35:00', status: 'present', method: 'QR' },
      { id: 'att-17', memberId: 'mem-2', memberName: 'Priya Patel', date: '2026-06-30', checkInTime: '08:24:00', checkOutTime: '09:50:00', status: 'present', method: 'QR' },
      { id: 'att-18', memberId: 'mem-3', memberName: 'Aarav Mehta', date: '2026-06-30', checkInTime: '18:10:00', checkOutTime: '19:25:00', status: 'present', method: 'Manual' },
      { id: 'att-19', memberId: 'mem-4', memberName: 'Pooja Sen', date: '2026-06-30', checkInTime: '09:40:00', checkOutTime: '11:15:00', status: 'late', method: 'QR' }
    ],
    payments: [
      { id: 'pay-1', memberId: 'mem-1', memberName: 'Rohan Malhotra', planId: 'plan-premium', planName: 'Premium Elite', amount: 4500, date: '2026-04-01', status: 'completed', paymentMethod: 'Credit Card', invoiceNumber: 'INV-2026-001' },
      { id: 'pay-2', memberId: 'mem-2', memberName: 'Priya Patel', planId: 'plan-premium', planName: 'Premium Elite', amount: 4500, date: '2026-04-10', status: 'completed', paymentMethod: 'Online', invoiceNumber: 'INV-2026-002' },
      { id: 'pay-3', memberId: 'mem-3', memberName: 'Aarav Mehta', planId: 'plan-standard', planName: 'Standard Pro', amount: 2500, date: '2026-04-15', status: 'completed', paymentMethod: 'Cash', invoiceNumber: 'INV-2026-003' },
      { id: 'pay-4', memberId: 'mem-5', memberName: 'Kabir Kapoor', planId: 'plan-basic', planName: 'Basic Starter', amount: 1500, date: '2026-05-01', status: 'completed', paymentMethod: 'Bank Transfer', invoiceNumber: 'INV-2026-004' },
      { id: 'pay-5', memberId: 'mem-1', memberName: 'Rohan Malhotra', planId: 'plan-premium', planName: 'Premium Elite', amount: 4500, date: '2026-05-01', status: 'completed', paymentMethod: 'Credit Card', invoiceNumber: 'INV-2026-005' },
      { id: 'pay-6', memberId: 'mem-2', memberName: 'Priya Patel', planId: 'plan-premium', planName: 'Premium Elite', amount: 4500, date: '2026-05-10', status: 'completed', paymentMethod: 'Online', invoiceNumber: 'INV-2026-006' },
      { id: 'pay-7', memberId: 'mem-3', memberName: 'Aarav Mehta', planId: 'plan-standard', planName: 'Standard Pro', amount: 2500, date: '2026-05-15', status: 'completed', paymentMethod: 'Cash', invoiceNumber: 'INV-2026-007' },
      { id: 'pay-8', memberId: 'mem-4', memberName: 'Pooja Sen', planId: 'plan-vip', planName: 'VIP Platinum', amount: 8000, date: '2026-05-01', status: 'completed', paymentMethod: 'Credit Card', invoiceNumber: 'INV-2026-008' },
      { id: 'pay-9', memberId: 'mem-1', memberName: 'Rohan Malhotra', planId: 'plan-premium', planName: 'Premium Elite', amount: 4500, date: '2026-06-01', status: 'completed', paymentMethod: 'Credit Card', invoiceNumber: 'INV-2026-009' },
      { id: 'pay-10', memberId: 'mem-2', memberName: 'Priya Patel', planId: 'plan-premium', planName: 'Premium Elite', amount: 4500, date: '2026-06-10', status: 'completed', paymentMethod: 'Online', invoiceNumber: 'INV-2026-010' },
      { id: 'pay-11', memberId: 'mem-3', memberName: 'Aarav Mehta', planId: 'plan-standard', planName: 'Standard Pro', amount: 2500, date: '2026-06-15', status: 'completed', paymentMethod: 'Cash', invoiceNumber: 'INV-2026-011' },
      { id: 'pay-12', memberId: 'mem-4', memberName: 'Pooja Sen', planId: 'plan-vip', planName: 'VIP Platinum', amount: 8000, date: '2026-06-01', status: 'completed', paymentMethod: 'Credit Card', invoiceNumber: 'INV-2026-012' }
    ],
    workoutPlans: [
      {
        id: 'wrk-1',
        memberId: 'mem-1',
        memberName: 'Rohan Malhotra',
        assignedBy: 'trn-1',
        assignedDate: '2026-04-05',
        exercises: [
          { id: 'ex-1', name: 'Barbell Squat', category: 'Legs', sets: 4, reps: '8-10', weight: '80kg', notes: 'Focus on full depth, keep core tight' },
          { id: 'ex-2', name: 'Incline Dumbbell Press', category: 'Chest', sets: 4, reps: '10', weight: '30kg', notes: 'Controlled descent' },
          { id: 'ex-3', name: 'Barbell Row', category: 'Back', sets: 3, reps: '12', weight: '60kg', notes: 'Pull to lower abdomen' },
          { id: 'ex-4', name: 'Dumbbell Lateral Raise', category: 'Shoulders', sets: 3, reps: '15', weight: '12.5kg', notes: 'Minimize body momentum' },
          { id: 'ex-5', name: 'Cable Tricep Pushdown', category: 'Arms', sets: 3, reps: '12', weight: '25kg', notes: 'Keep elbows locked at sides' }
        ],
        status: 'active'
      },
      {
        id: 'wrk-2',
        memberId: 'mem-2',
        memberName: 'Priya Patel',
        assignedBy: 'trn-2',
        assignedDate: '2026-04-12',
        exercises: [
          { id: 'ex-6', name: 'Romanian Deadlift', category: 'Legs', sets: 4, reps: '10', weight: '45kg', notes: 'Feel the stretch in hamstrings' },
          { id: 'ex-7', name: 'Lat Pulldown', category: 'Back', sets: 4, reps: '12', weight: '35kg', notes: 'Engage lats, squeeze shoulder blades' },
          { id: 'ex-8', name: 'Dumbbell Shoulder Press', category: 'Shoulders', sets: 3, reps: '10', weight: '12kg', notes: 'Do not arch back too much' },
          { id: 'ex-9', name: 'Dumbbell Bicep Curl', category: 'Arms', sets: 3, reps: '12', weight: '8kg', notes: 'Strict form, no swinging' },
          { id: 'ex-10', name: 'Plank Hold', category: 'Full Body', sets: 3, reps: '60s', notes: 'Squeeze glutes and abs' }
        ],
        status: 'active'
      }
    ],
    dietPlans: [
      {
        id: 'diet-1',
        memberId: 'mem-1',
        memberName: 'Rohan Malhotra',
        assignedBy: 'trn-1',
        assignedDate: '2026-04-05',
        meals: [
          { name: 'Breakfast', description: '4 Scrambled Eggs, 2 slices of Whole Wheat Toast, 1 Avocado', calories: 650, protein: 36, carbs: 42, fat: 38 },
          { name: 'Lunch', description: '200g Grilled Chicken Breast, 150g Jasmine Rice, Steamed Broccoli', calories: 580, protein: 55, carbs: 58, fat: 12 },
          { name: 'Snack', description: 'Whey Protein Shake (1 scoop) with 1 Banana and 30g Peanut Butter', calories: 420, protein: 32, carbs: 40, fat: 15 },
          { name: 'Dinner', description: '180g Baked Salmon, 200g Roasted Sweet Potatoes, Asparagus', calories: 550, protein: 38, carbs: 48, fat: 22 }
        ],
        targetCalories: 2200,
        targetProtein: 161,
        targetCarbs: 188,
        targetFat: 87,
        waterIntakeLiters: 3.5,
        supplements: ['Creatine Monohydrate 5g', 'Omega-3 Fish Oil', 'Multivitamin'],
        status: 'active'
      },
      {
        id: 'diet-2',
        memberId: 'mem-2',
        memberName: 'Priya Patel',
        assignedBy: 'trn-2',
        assignedDate: '2026-04-12',
        meals: [
          { name: 'Breakfast', description: 'Greek Yogurt (200g) with Granola, Honey, and Blueberries', calories: 380, protein: 22, carbs: 45, fat: 12 },
          { name: 'Lunch', description: 'Quinoa and Tuna Salad with mixed greens, olive oil dressing', calories: 450, protein: 32, carbs: 38, fat: 16 },
          { name: 'Snack', description: 'Apple slices with 1 tbsp Almond Butter', calories: 190, protein: 4, carbs: 22, fat: 10 },
          { name: 'Dinner', description: 'Grilled Turkey Breast (150g) with stir-fry Vegetables and Brown Rice', calories: 480, protein: 38, carbs: 46, fat: 10 }
        ],
        targetCalories: 1500,
        targetProtein: 96,
        targetCarbs: 151,
        targetFat: 48,
        waterIntakeLiters: 2.5,
        supplements: ['Vitamin D3', 'Magnesium Bisglycinate'],
        status: 'active'
      }
    ],
    progress: [
      { id: 'prog-1', memberId: 'mem-1', date: '2026-04-01', weight: 86.2, height: 182, bmi: 26.0, bodyFatPercentage: 22.4, muscleMassPercentage: 42.5 },
      { id: 'prog-2', memberId: 'mem-1', date: '2026-05-01', weight: 85.1, height: 182, bmi: 25.7, bodyFatPercentage: 20.8, muscleMassPercentage: 43.1 },
      { id: 'prog-3', memberId: 'mem-1', date: '2026-06-01', weight: 84.5, height: 182, bmi: 25.5, bodyFatPercentage: 19.5, muscleMassPercentage: 44.0 },
      { id: 'prog-4', memberId: 'mem-2', date: '2026-04-10', weight: 59.8, height: 165, bmi: 22.0, bodyFatPercentage: 25.1, muscleMassPercentage: 33.0 },
      { id: 'prog-5', memberId: 'mem-2', date: '2026-05-10', weight: 58.9, height: 165, bmi: 21.6, bodyFatPercentage: 24.2, muscleMassPercentage: 33.6 },
      { id: 'prog-6', memberId: 'mem-2', date: '2026-06-10', weight: 58.2, height: 165, bmi: 21.4, bodyFatPercentage: 23.0, muscleMassPercentage: 34.2 }
    ],
    notifications: [
      { id: 'not-1', userId: 'usr-member1', title: 'Workout Plan Assigned', message: 'Your trainer Vikram Rathore has assigned a new Strength & Conditioning workout plan!', type: 'success', date: '2026-04-05', read: false },
      { id: 'not-2', userId: 'usr-member2', title: 'Diet Plan Assigned', message: 'Ananya Sharma created your customized nutrition guide.', type: 'info', date: '2026-04-12', read: true },
      { id: 'not-3', userId: 'all', title: 'Holiday Closing Hours', message: 'FitSync Elite will operate from 08:00 to 18:00 on upcoming national holiday.', type: 'warning', date: '2026-06-25', read: false }
    ],
    settings: DEFAULT_SETTINGS,
    rewardShopItems: DEFAULT_REWARD_SHOP_ITEMS,
    rewardTransactions: [
      { id: 'tx-1', memberId: 'mem-1', points: 100, reason: 'Initial Welcome Bonus Points', date: '2026-04-01' },
      { id: 'tx-2', memberId: 'mem-1', points: 50, reason: 'Completed First Workout Assessment', date: '2026-04-05' },
      { id: 'tx-3', memberId: 'mem-1', points: 100, reason: 'Consecutive 5-Day Attendance Streak', date: '2026-06-29' },
      { id: 'tx-4', memberId: 'mem-2', points: 100, reason: 'Initial Welcome Bonus Points', date: '2026-04-10' },
      { id: 'tx-5', memberId: 'mem-2', points: 80, reason: 'Completed 8 Fitness Workouts', date: '2026-05-12' },
      { id: 'tx-6', memberId: 'mem-3', points: 100, reason: 'Initial Welcome Bonus Points', date: '2026-04-15' },
      { id: 'tx-7', memberId: 'mem-3', points: 240, reason: 'Achieved Step Target Challenge Milestone', date: '2026-06-20' },
      { id: 'tx-8', memberId: 'mem-4', points: 100, reason: 'Initial Welcome Bonus Points', date: '2026-05-01' }
    ],
    fitnessChallenges: [
      {
        id: 'chal-1',
        title: 'Monsoon Shred 15-Day Challenge',
        description: 'Complete 10 workouts within 15 days to build active momentum and burn body fat.',
        type: 'workout',
        targetValue: 10,
        startDate: '2026-07-01',
        endDate: '2026-07-15',
        pointsReward: 200,
        isPrivate: false,
        participants: ['mem-1', 'mem-2', 'mem-3'],
        progress: { 'mem-1': 3, 'mem-2': 5, 'mem-3': 1 },
        createdBy: 'admin'
      },
      {
        id: 'chal-2',
        title: 'Consistency King (Attendance)',
        description: 'Check into the gym 12 times this month. Stay active, stay dedicated.',
        type: 'attendance',
        targetValue: 12,
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        pointsReward: 300,
        isPrivate: false,
        participants: ['mem-1', 'mem-2', 'mem-4'],
        progress: { 'mem-1': 4, 'mem-2': 3, 'mem-4': 2 },
        createdBy: 'admin'
      },
      {
        id: 'chal-3',
        title: 'Weight Loss Warrior',
        description: 'Lose 3kg or more by the end of July. Progress updated from weekly progress logs.',
        type: 'weight_loss',
        targetValue: 3,
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        pointsReward: 400,
        isPrivate: false,
        participants: ['mem-1', 'mem-3'],
        progress: { 'mem-1': 1.2, 'mem-3': 0.5 },
        createdBy: 'trn-1'
      }
    ],
    calendarEvents: [
      {
        id: 'evt-1',
        title: 'HIIT Cardio Burn',
        description: 'High Intensity Interval Training class led by Ananya Sharma.',
        type: 'group_class',
        date: '2026-07-02',
        startTime: '08:00',
        endTime: '09:00',
        trainerId: 'trn-2',
        trainerName: 'Ananya Sharma',
        maxParticipants: 15,
        participants: ['mem-1', 'mem-2'],
        location: 'Studio A'
      },
      {
        id: 'evt-2',
        title: 'Powerlifting Masterclass',
        description: 'Learn safe lifting mechanics, squat, bench, and deadlift techniques from Vikram Rathore.',
        type: 'group_class',
        date: '2026-07-03',
        startTime: '18:00',
        endTime: '19:30',
        trainerId: 'trn-1',
        trainerName: 'Vikram Rathore',
        maxParticipants: 10,
        participants: ['mem-1', 'mem-3'],
        location: 'Heavy Lifting Zone'
      },
      {
        id: 'evt-3',
        title: '1-on-1 Strength Training (Rohan)',
        description: 'Personal training block booked with coach Vikram.',
        type: 'personal_training',
        date: '2026-07-02',
        startTime: '10:00',
        endTime: '11:00',
        trainerId: 'trn-1',
        trainerName: 'Vikram Rathore',
        maxParticipants: 1,
        participants: ['mem-1'],
        location: 'PT Corner'
      },
      {
        id: 'evt-4',
        title: 'Vinyasa Flow Yoga',
        description: 'Connect movement with breath. All skill levels welcome.',
        type: 'group_class',
        date: '2026-07-04',
        startTime: '07:00',
        endTime: '08:00',
        trainerId: 'trn-2',
        trainerName: 'Ananya Sharma',
        maxParticipants: 20,
        participants: ['mem-2', 'mem-4'],
        location: 'Studio B'
      },
      {
        id: 'evt-5',
        title: 'Club Nutrition Workshop',
        description: 'Special interactive seminar on micro-nutrients, hydration, and supplement guides.',
        type: 'gym_event',
        date: '2026-07-05',
        startTime: '11:00',
        endTime: '12:30',
        maxParticipants: 50,
        participants: ['mem-1', 'mem-2', 'mem-3', 'mem-4'],
        location: 'Main Lounge'
      }
    ]
  };
}

export function loadDB(): DBStructure {
  try {
    const parentDir = path.dirname(DB_PATH);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    
    if (!fs.existsSync(DB_PATH)) {
      const seed = getSeedData();
      saveDB(seed);
      return seed;
    }

    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    
    // Ensure all keys are present
    const seed = getSeedData();
    const updated = { ...seed, ...parsed };
    
    // Perform migrations if old structure doesn't have the new properties
    if (!updated.rewardShopItems) updated.rewardShopItems = seed.rewardShopItems;
    if (!updated.rewardTransactions) updated.rewardTransactions = seed.rewardTransactions;
    if (!updated.fitnessChallenges) updated.fitnessChallenges = seed.fitnessChallenges;
    if (!updated.calendarEvents) updated.calendarEvents = seed.calendarEvents;
    
    return updated;
  } catch (error) {
    console.error('Error loading DB, returning seed data:', error);
    return getSeedData();
  }
}

export function saveDB(data: DBStructure): void {
  try {
    const parentDir = path.dirname(DB_PATH);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving DB:', error);
  }
}

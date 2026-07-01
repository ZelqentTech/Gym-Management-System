import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { loadDB, saveDB } from './server/db.js';
import { 
  User, MemberProfile, TrainerProfile, MembershipPlan, 
  AttendanceRecord, Payment, WorkoutPlan, DietPlan, 
  ProgressLog, Notification, GymSettings,
  RewardShopItem, RewardTransaction, FitnessChallenge, CalendarEvent
} from './src/types';

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini AI initialized successfully for FitSync.');
  } catch (err) {
    console.error('Failed to initialize Gemini Client:', err);
  }
} else {
  console.log('Gemini API key is not set. FitSync will run in Offline Proactive Mode for recommendations.');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());

  // Database helper
  const db = loadDB();

  // Helper to trigger automated notifications
  const createNotification = (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert') => {
    const newNot: Notification = {
      id: `not-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      title,
      message,
      type,
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    db.notifications.unshift(newNot);
    saveDB(db);
  };

  // --- API ROUTES ---

  // AUTHENTICATION
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password against plain seeded passwords
    const storedPassword = db.passwords[user.id];
    if (storedPassword !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Link details if member or trainer
    let profile: any = null;
    if (user.role === 'member') {
      profile = db.members.find(m => m.userId === user.id);
    } else if (user.role === 'trainer') {
      profile = db.trainers.find(t => t.userId === user.id);
    }

    const token = `mock-jwt-token-for-${user.id}-${user.role}`;
    res.json({
      user,
      profile,
      token
    });
  });

  app.post('/api/auth/register', (req, res) => {
    const { email, password, name, role, phone, gender, age, height, weight, address, membershipPlanId } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Missing required registration fields' });
    }

    const exists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const userId = `usr-${Date.now()}`;
    const newUser: User = {
      id: userId,
      email: email.toLowerCase(),
      name,
      role: role as any,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    db.users.push(newUser);
    db.passwords[userId] = password;

    let profile: any = null;
    if (role === 'member') {
      const memberId = `mem-${Date.now()}`;
      const memberProf: MemberProfile = {
        id: memberId,
        userId,
        phone: phone || '',
        gender: gender || 'Male',
        age: Number(age) || 25,
        height: Number(height) || 175,
        weight: Number(weight) || 70,
        address: address || '',
        emergencyContact: { name: 'Emergency Contact', phone: phone || '', relationship: 'Family' },
        joinDate: newUser.joinedDate,
        membershipPlanId: membershipPlanId || 'plan-basic',
        assignedTrainerId: null,
        status: 'active',
        profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces'
      };
      db.members.push(memberProf);
      profile = memberProf;

      // Log an initial payment
      const plan = db.membershipPlans.find(p => p.id === memberProf.membershipPlanId);
      if (plan) {
        const paymentId = `pay-${Date.now()}`;
        const newPayment: Payment = {
          id: paymentId,
          memberId: memberId,
          memberName: name,
          planId: plan.id,
          planName: plan.name,
          amount: plan.price,
          date: newUser.joinedDate,
          status: 'completed',
          paymentMethod: 'Online',
          invoiceNumber: `INV-2026-${Math.floor(Math.random() * 10000)}`
        };
        db.payments.unshift(newPayment);
      }

      createNotification(userId, 'Welcome to FitSync!', `Hi ${name}, welcome to the FitSync Elite Club. Start your fitness journey today!`, 'success');
    } else if (role === 'trainer') {
      const trainerId = `trn-${Date.now()}`;
      const trainerProf: TrainerProfile = {
        id: trainerId,
        userId,
        phone: phone || '',
        experience: 2,
        specialization: 'General Fitness Coaching',
        salary: 3000,
        availability: 'Morning',
        certifications: ['Certified Personal Trainer'],
        bio: 'Enthusiastic fitness trainer focusing on custom conditioning and cardio workouts.',
        photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=faces'
      };
      db.trainers.push(trainerProf);
      profile = trainerProf;
    }

    saveDB(db);

    res.status(201).json({
      user: newUser,
      profile,
      token: `mock-jwt-token-for-${userId}-${role}`
    });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'No user registered with this email address' });
    }
    res.json({ message: 'Password reset link simulated. Please check your simulated inbox.' });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    const { email, newPassword } = req.body;
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    db.passwords[user.id] = newPassword;
    saveDB(db);
    res.json({ message: 'Password has been reset successfully.' });
  });

  // MEMBERS MANAGEMENT
  app.get('/api/members', (req, res) => {
    const membersWithNames = db.members.map(m => {
      const user = db.users.find(u => u.id === m.userId);
      const plan = db.membershipPlans.find(p => p.id === m.membershipPlanId);
      const trainer = db.trainers.find(t => t.id === m.assignedTrainerId);
      const trainerUser = trainer ? db.users.find(u => u.id === trainer.userId) : null;
      return {
        ...m,
        name: user ? user.name : 'Unknown User',
        email: user ? user.email : '',
        planName: plan ? plan.name : 'No Plan',
        trainerName: trainerUser ? trainerUser.name : 'Unassigned'
      };
    });
    res.json(membersWithNames);
  });

  app.post('/api/members', (req, res) => {
    const { name, email, phone, gender, age, height, weight, address, emergencyContact, membershipPlanId, assignedTrainerId, medicalInfo, profilePhoto } = req.body;
    
    // Check if email already registered
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const userId = `usr-${Date.now()}`;
    const memberId = `mem-${Date.now()}`;

    const newUser: User = {
      id: userId,
      email: email.toLowerCase(),
      name,
      role: 'member',
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    const newProfile: MemberProfile = {
      id: memberId,
      userId,
      phone,
      gender,
      age: Number(age) || 25,
      height: Number(height) || 170,
      weight: Number(weight) || 70,
      address,
      emergencyContact: emergencyContact || { name: 'Emergency', phone: '', relationship: 'Family' },
      joinDate: newUser.joinedDate,
      membershipPlanId,
      assignedTrainerId: assignedTrainerId || null,
      status: 'active',
      profilePhoto: profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces',
      medicalInfo
    };

    db.users.push(newUser);
    db.passwords[userId] = 'member123'; // default password
    db.members.push(newProfile);

    // Initial payment
    const plan = db.membershipPlans.find(p => p.id === membershipPlanId);
    if (plan) {
      const paymentId = `pay-${Date.now()}`;
      const newPayment: Payment = {
        id: paymentId,
        memberId,
        memberName: name,
        planId: plan.id,
        planName: plan.name,
        amount: plan.price,
        date: newUser.joinedDate,
        status: 'completed',
        paymentMethod: 'Cash',
        invoiceNumber: `INV-2026-${Math.floor(Math.random() * 10000)}`
      };
      db.payments.unshift(newPayment);
    }

    saveDB(db);
    res.status(201).json({ ...newProfile, name, email });
  });

  app.put('/api/members/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone, gender, age, height, weight, address, emergencyContact, membershipPlanId, assignedTrainerId, medicalInfo, status, profilePhoto } = req.body;

    const memberIdx = db.members.findIndex(m => m.id === id);
    if (memberIdx === -1) {
      return res.status(404).json({ error: 'Member profile not found' });
    }

    const member = db.members[memberIdx];
    const user = db.users.find(u => u.id === member.userId);

    // Update user profile
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email.toLowerCase();
      if (status) user.status = status === 'active' ? 'active' : 'inactive';
    }

    // Update member profile
    db.members[memberIdx] = {
      ...member,
      phone: phone !== undefined ? phone : member.phone,
      gender: gender !== undefined ? gender : member.gender,
      age: age !== undefined ? Number(age) : member.age,
      height: height !== undefined ? Number(height) : member.height,
      weight: weight !== undefined ? Number(weight) : member.weight,
      address: address !== undefined ? address : member.address,
      emergencyContact: emergencyContact !== undefined ? emergencyContact : member.emergencyContact,
      membershipPlanId: membershipPlanId !== undefined ? membershipPlanId : member.membershipPlanId,
      assignedTrainerId: assignedTrainerId !== undefined ? assignedTrainerId : member.assignedTrainerId,
      medicalInfo: medicalInfo !== undefined ? medicalInfo : member.medicalInfo,
      status: status !== undefined ? status : member.status,
      profilePhoto: profilePhoto !== undefined ? profilePhoto : member.profilePhoto
    };

    saveDB(db);
    res.json({ ...db.members[memberIdx], name: user?.name, email: user?.email });
  });

  app.delete('/api/members/:id', (req, res) => {
    const { id } = req.params;
    const memberIdx = db.members.findIndex(m => m.id === id);
    if (memberIdx === -1) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const member = db.members[memberIdx];
    
    // Remove member and corresponding user/passwords
    db.members.splice(memberIdx, 1);
    const userIdx = db.users.findIndex(u => u.id === member.userId);
    if (userIdx !== -1) {
      db.users.splice(userIdx, 1);
    }
    delete db.passwords[member.userId];

    saveDB(db);
    res.json({ success: true, message: 'Member successfully removed' });
  });

  // TRAINERS MANAGEMENT
  app.get('/api/trainers', (req, res) => {
    const trainersWithNames = db.trainers.map(t => {
      const user = db.users.find(u => u.id === t.userId);
      const assignedMembers = db.members.filter(m => m.assignedTrainerId === t.id).map(m => {
        const mu = db.users.find(u => u.id === m.userId);
        return { id: m.id, name: mu ? mu.name : 'Unknown member' };
      });
      return {
        ...t,
        name: user ? user.name : 'Unknown User',
        email: user ? user.email : '',
        assignedCount: assignedMembers.length,
        assignedMembersList: assignedMembers
      };
    });
    res.json(trainersWithNames);
  });

  app.post('/api/trainers', (req, res) => {
    const { name, email, phone, experience, specialization, salary, availability, certifications, bio, photo } = req.body;

    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const userId = `usr-${Date.now()}`;
    const trainerId = `trn-${Date.now()}`;

    const newUser: User = {
      id: userId,
      email: email.toLowerCase(),
      name,
      role: 'trainer',
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    const newProfile: TrainerProfile = {
      id: trainerId,
      userId,
      phone,
      experience: Number(experience) || 1,
      specialization: specialization || 'General Fitness',
      salary: Number(salary) || 3000,
      availability: availability || 'Full-time',
      certifications: certifications || [],
      bio: bio || '',
      photo: photo || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=150&h=150&fit=crop&crop=faces'
    };

    db.users.push(newUser);
    db.passwords[userId] = 'trainer123'; // default password
    db.trainers.push(newProfile);

    saveDB(db);
    res.status(201).json({ ...newProfile, name, email });
  });

  app.put('/api/trainers/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone, experience, specialization, salary, availability, certifications, bio, photo } = req.body;

    const trainerIdx = db.trainers.findIndex(t => t.id === id);
    if (trainerIdx === -1) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    const trainer = db.trainers[trainerIdx];
    const user = db.users.find(u => u.id === trainer.userId);

    if (user) {
      if (name) user.name = name;
      if (email) user.email = email.toLowerCase();
    }

    db.trainers[trainerIdx] = {
      ...trainer,
      phone: phone !== undefined ? phone : trainer.phone,
      experience: experience !== undefined ? Number(experience) : trainer.experience,
      specialization: specialization !== undefined ? specialization : trainer.specialization,
      salary: salary !== undefined ? Number(salary) : trainer.salary,
      availability: availability !== undefined ? availability : trainer.availability,
      certifications: certifications !== undefined ? certifications : trainer.certifications,
      bio: bio !== undefined ? bio : trainer.bio,
      photo: photo !== undefined ? photo : trainer.photo
    };

    saveDB(db);
    res.json({ ...db.trainers[trainerIdx], name: user?.name, email: user?.email });
  });

  app.delete('/api/trainers/:id', (req, res) => {
    const { id } = req.params;
    const trainerIdx = db.trainers.findIndex(t => t.id === id);
    if (trainerIdx === -1) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    const trainer = db.trainers[trainerIdx];

    // Reset assigned trainer for members
    db.members.forEach(m => {
      if (m.assignedTrainerId === id) {
        m.assignedTrainerId = null;
      }
    });

    db.trainers.splice(trainerIdx, 1);
    const userIdx = db.users.findIndex(u => u.id === trainer.userId);
    if (userIdx !== -1) {
      db.users.splice(userIdx, 1);
    }
    delete db.passwords[trainer.userId];

    saveDB(db);
    res.json({ success: true, message: 'Trainer successfully removed' });
  });

  // MEMBERSHIP PLANS
  app.get('/api/plans', (req, res) => {
    res.json(db.membershipPlans);
  });

  app.post('/api/plans', (req, res) => {
    const { name, price, durationMonths, benefits, personalTraining, groupClasses, dietConsultation } = req.body;
    const id = `plan-${Date.now()}`;
    const newPlan: MembershipPlan = {
      id,
      name,
      price: Number(price),
      durationMonths: Number(durationMonths),
      benefits: benefits || [],
      personalTraining: !!personalTraining,
      groupClasses: !!groupClasses,
      dietConsultation: !!dietConsultation
    };
    db.membershipPlans.push(newPlan);
    saveDB(db);
    res.status(201).json(newPlan);
  });

  app.put('/api/plans/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, durationMonths, benefits, personalTraining, groupClasses, dietConsultation } = req.body;

    const planIdx = db.membershipPlans.findIndex(p => p.id === id);
    if (planIdx === -1) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    db.membershipPlans[planIdx] = {
      ...db.membershipPlans[planIdx],
      name: name !== undefined ? name : db.membershipPlans[planIdx].name,
      price: price !== undefined ? Number(price) : db.membershipPlans[planIdx].price,
      durationMonths: durationMonths !== undefined ? Number(durationMonths) : db.membershipPlans[planIdx].durationMonths,
      benefits: benefits !== undefined ? benefits : db.membershipPlans[planIdx].benefits,
      personalTraining: personalTraining !== undefined ? !!personalTraining : db.membershipPlans[planIdx].personalTraining,
      groupClasses: groupClasses !== undefined ? !!groupClasses : db.membershipPlans[planIdx].groupClasses,
      dietConsultation: dietConsultation !== undefined ? !!dietConsultation : db.membershipPlans[planIdx].dietConsultation
    };

    saveDB(db);
    res.json(db.membershipPlans[planIdx]);
  });

  // ATTENDANCE SYSTEM
  app.get('/api/attendance', (req, res) => {
    res.json(db.attendance);
  });

  app.post('/api/attendance', (req, res) => {
    const { memberId, status, method, date, checkInTime } = req.body;

    const member = db.members.find(m => m.id === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const memberUser = db.users.find(u => u.id === member.userId);
    const memberName = memberUser ? memberUser.name : 'Unknown Member';

    const reqDate = date || new Date().toISOString().split('T')[0];
    const reqTime = checkInTime || new Date().toTimeString().split(' ')[0];

    // Avoid double check-in on same day
    const alreadyCheckedIn = db.attendance.find(a => a.memberId === memberId && a.date === reqDate);
    if (alreadyCheckedIn) {
      return res.status(400).json({ error: 'Member is already checked in for today.' });
    }

    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      memberId,
      memberName,
      date: reqDate,
      checkInTime: reqTime,
      status: status || 'present',
      method: method || 'QR'
    };

    db.attendance.unshift(record);

    // AWARD REWARD POINTS FOR ATTENDANCE Check-in (+10 points)
    const txId = `tx-${Date.now()}`;
    const tx: RewardTransaction = {
      id: txId,
      memberId: member.id,
      points: 10,
      reason: `Gym Attendance Check-In (${record.status === 'late' ? 'Late' : 'Present'})`,
      date: reqDate
    };
    if (!db.rewardTransactions) db.rewardTransactions = [];
    db.rewardTransactions.unshift(tx);
    createNotification(member.userId, 'Reward Points Earned! ⚡', 'You earned 10 reward points for checking in today!', 'success');

    saveDB(db);
    res.status(201).json(record);
  });

  app.put('/api/attendance/checkout', (req, res) => {
    const { memberId, checkOutTime, date } = req.body;
    const reqDate = date || new Date().toISOString().split('T')[0];
    const reqTime = checkOutTime || new Date().toTimeString().split(' ')[0];

    const record = db.attendance.find(a => a.memberId === memberId && a.date === reqDate);
    if (!record) {
      return res.status(404).json({ error: 'Active check-in record not found for today.' });
    }

    record.checkOutTime = reqTime;
    saveDB(db);
    res.json(record);
  });

  // PAYMENTS MODULE
  app.get('/api/payments', (req, res) => {
    res.json(db.payments);
  });

  app.post('/api/payments', (req, res) => {
    const { memberId, planId, amount, paymentMethod, status } = req.body;

    const member = db.members.find(m => m.id === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const plan = db.membershipPlans.find(p => p.id === planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const memberUser = db.users.find(u => u.id === member.userId);
    const memberName = memberUser ? memberUser.name : 'Unknown';

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      memberId,
      memberName,
      planId,
      planName: plan.name,
      amount: Number(amount) || plan.price,
      date: new Date().toISOString().split('T')[0],
      status: status || 'completed',
      paymentMethod: paymentMethod || 'Online',
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
    };

    db.payments.unshift(newPayment);
    saveDB(db);
    res.status(201).json(newPayment);
  });

  app.post('/api/payments/refund', (req, res) => {
    const { paymentId } = req.body;
    const payment = db.payments.find(p => p.id === paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    payment.status = 'refunded';
    saveDB(db);
    res.json(payment);
  });

  // WORKOUT PLANS
  app.get('/api/workouts', (req, res) => {
    res.json(db.workoutPlans);
  });

  app.post('/api/workouts', (req, res) => {
    const { memberId, exercises, assignedBy, status } = req.body;

    const member = db.members.find(m => m.id === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const memberUser = db.users.find(u => u.id === member.userId);
    const memberName = memberUser ? memberUser.name : 'Unknown';

    // Disable previous active plan for the member
    db.workoutPlans.forEach(wp => {
      if (wp.memberId === memberId && wp.status === 'active') {
        wp.status = 'completed';
      }
    });

    const newPlan: WorkoutPlan = {
      id: `wrk-${Date.now()}`,
      memberId,
      memberName,
      assignedBy: assignedBy || 'Trainer',
      assignedDate: new Date().toISOString().split('T')[0],
      exercises: exercises || [],
      status: status || 'active'
    };

    db.workoutPlans.unshift(newPlan);
    createNotification(member.userId, 'New Workout Plan!', 'A new workout plan has been designed for you. Check your workout dashboard!', 'success');
    saveDB(db);
    res.status(201).json(newPlan);
  });

  // DIET PLANS
  app.get('/api/diets', (req, res) => {
    res.json(db.dietPlans);
  });

  app.post('/api/diets', (req, res) => {
    const { memberId, meals, targetCalories, targetProtein, targetCarbs, targetFat, waterIntakeLiters, supplements, assignedBy, status } = req.body;

    const member = db.members.find(m => m.id === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const memberUser = db.users.find(u => u.id === member.userId);
    const memberName = memberUser ? memberUser.name : 'Unknown';

    // Complete old diet plans
    db.dietPlans.forEach(dp => {
      if (dp.memberId === memberId && dp.status === 'active') {
        dp.status = 'completed';
      }
    });

    const newPlan: DietPlan = {
      id: `diet-${Date.now()}`,
      memberId,
      memberName,
      assignedBy: assignedBy || 'Trainer',
      assignedDate: new Date().toISOString().split('T')[0],
      meals: meals || [],
      targetCalories: Number(targetCalories) || 2000,
      targetProtein: Number(targetProtein) || 150,
      targetCarbs: Number(targetCarbs) || 180,
      targetFat: Number(targetFat) || 70,
      waterIntakeLiters: Number(waterIntakeLiters) || 3,
      supplements: supplements || [],
      status: status || 'active'
    };

    db.dietPlans.unshift(newPlan);
    createNotification(member.userId, 'New Diet Plan!', 'Your customized meal plan has been compiled. Check your diet dashboard!', 'info');
    saveDB(db);
    res.status(201).json(newPlan);
  });

  // PROGRESS LOGS
  app.get('/api/progress/:memberId', (req, res) => {
    const { memberId } = req.params;
    const logs = db.progress.filter(p => p.memberId === memberId).sort((a, b) => a.date.localeCompare(b.date));
    res.json(logs);
  });

  app.post('/api/progress', (req, res) => {
    const { memberId, weight, height, bodyFatPercentage, muscleMassPercentage, chestSize, waistSize, bicepSize, thighSize, date } = req.body;

    const member = db.members.find(m => m.id === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const w = Number(weight);
    const h = Number(height) || member.height;
    
    // Calculate BMI = kg / m^2
    const bmi = Number((w / ((h / 100) * (h / 100))).toFixed(1));

    // Update weight on member profile
    member.weight = w;
    member.height = h;

    const newLog: ProgressLog = {
      id: `prog-${Date.now()}`,
      memberId,
      date: date || new Date().toISOString().split('T')[0],
      weight: w,
      height: h,
      bmi,
      bodyFatPercentage: Number(bodyFatPercentage) || 20,
      muscleMassPercentage: Number(muscleMassPercentage) || 40,
      chestSize: chestSize ? Number(chestSize) : undefined,
      waistSize: waistSize ? Number(waistSize) : undefined,
      bicepSize: bicepSize ? Number(bicepSize) : undefined,
      thighSize: thighSize ? Number(thighSize) : undefined
    };

    db.progress.unshift(newLog);
    saveDB(db);
    res.status(201).json(newLog);
  });

  // NOTIFICATIONS
  app.get('/api/notifications', (req, res) => {
    res.json(db.notifications);
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    const { id } = req.params;
    const record = db.notifications.find(n => n.id === id);
    if (record) {
      record.read = true;
      saveDB(db);
    }
    res.json(record || { error: 'Not found' });
  });

  app.post('/api/notifications/all-read', (req, res) => {
    db.notifications.forEach(n => n.read = true);
    saveDB(db);
    res.json({ success: true });
  });

  // SETTINGS
  app.get('/api/settings', (req, res) => {
    res.json(db.settings);
  });

  app.put('/api/settings', (req, res) => {
    const { gymName, openingHours, taxRate, currency, smtpHost, smtpPort, smtpUser } = req.body;
    db.settings = {
      ...db.settings,
      gymName: gymName || db.settings.gymName,
      openingHours: openingHours || db.settings.openingHours,
      taxRate: taxRate !== undefined ? Number(taxRate) : db.settings.taxRate,
      currency: currency || db.settings.currency,
      smtpHost: smtpHost || db.settings.smtpHost,
      smtpPort: smtpPort !== undefined ? Number(smtpPort) : db.settings.smtpPort,
      smtpUser: smtpUser || db.settings.smtpUser
    };
    saveDB(db);
    res.json(db.settings);
  });

  // AI RECOMMENDATIONS
  app.post('/api/ai/recommend-workout', async (req, res) => {
    const { age, gender, weight, height, goal, category } = req.body;
    
    const userPrompt = `Generate a customized gym workout plan for a ${age}-year-old ${gender} weight ${weight}kg, height ${height}cm, with the fitness goal of "${goal}". They want to focus on a "${category || 'Full Body'}" workout session.`;
    
    // Fallback recommendation if no AI client
    const fallbackResponse = {
      assignedBy: "AI Coach (Offline Mode)",
      exercises: [
        { name: `${category || 'Full Body'} Power Warmup`, category: category || 'Full Body', sets: 3, reps: '10-12', notes: 'Maintain control, elevate heart rate, focus on mobility' },
        { name: `Target Compound Movement`, category: category || 'Full Body', sets: 4, reps: '8-10', notes: 'Aim for a heavier weight but keep strict form' },
        { name: `Target Accessory Exercise`, category: category || 'Full Body', sets: 3, reps: '12', notes: 'Slow negatives, squeeze at the top of the lift' },
        { name: `Isometric Recovery Hold`, category: category || 'Full Body', sets: 3, reps: '45 seconds', notes: 'Maintain steady breathing, keep core fully engaged' }
      ]
    };

    if (!ai) {
      return res.json(fallbackResponse);
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: "You are an elite, certified strength coach and personal trainer. Create a highly functional, safe, and professional workout plan with 4 exercises, return ONLY a valid JSON array matching the structure: [{\"name\": \"Exercise Name\", \"category\": \"Chest|Back|Legs|Shoulders|Arms|Cardio|Full Body\", \"sets\": 3, \"reps\": \"10-12\", \"notes\": \"form instruction\"}]. Do not output markdown backticks or any conversation, just the raw JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                sets: { type: Type.INTEGER },
                reps: { type: Type.STRING },
                notes: { type: Type.STRING }
              },
              required: ["name", "category", "sets", "reps", "notes"]
            }
          }
        }
      });

      const responseText = response.text || '';
      console.log('Gemini Workout Response:', responseText);
      const parsed = JSON.parse(responseText.trim());
      res.json({
        assignedBy: "FitSync AI Coach",
        exercises: parsed
      });
    } catch (err) {
      console.error('Gemini API workout generation error:', err);
      res.json(fallbackResponse);
    }
  });

  app.post('/api/ai/recommend-diet', async (req, res) => {
    const { age, gender, weight, height, goal, dietType } = req.body;

    const userPrompt = `Generate a customized macro-balanced meal plan for a ${age}-year-old ${gender} weighing ${weight}kg, height ${height}cm, with the fitness goal of "${goal}". Prefer a "${dietType || 'Standard Balanced'}" diet style.`;

    const fallbackResponse = {
      assignedBy: "AI Nutritionist (Offline Mode)",
      meals: [
        { name: "Breakfast", description: "Oatmeal with whey protein, mixed berries, and a handful of almonds", calories: 450, protein: 30, carbs: 50, fat: 14 },
        { name: "Lunch", description: "Grilled chicken breast, quinoa salad, and roasted green beans", calories: 500, protein: 45, carbs: 45, fat: 12 },
        { name: "Snack", description: "Greek yogurt with a drizzle of honey and apple slices", calories: 200, protein: 18, carbs: 22, fat: 4 },
        { name: "Dinner", description: "Baked salmon filet, sweet potato mash, and steamed asparagus with olive oil", calories: 450, protein: 35, carbs: 40, fat: 16 }
      ],
      targetCalories: 1600,
      targetProtein: 128,
      targetCarbs: 157,
      targetFat: 46,
      waterIntakeLiters: 3.0,
      supplements: ["Daily Multivitamin", "Omega-3 Fish Oil"]
    };

    if (!ai) {
      return res.json(fallbackResponse);
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: "You are a clinical sports nutritionist. Design a 4-meal plan with balanced calories, protein, carbs, and fat, water intake target, and recommended supplements. Return ONLY a valid JSON object matching the schema: {\"meals\": [{\"name\": \"Breakfast|Lunch|Snack|Dinner\", \"description\": \"detailed description\", \"calories\": 450, \"protein\": 30, \"carbs\": 45, \"fat\": 12}], \"targetCalories\": 1600, \"targetProtein\": 130, \"targetCarbs\": 160, \"targetFat\": 50, \"waterIntakeLiters\": 3.0, \"supplements\": [\"supplement name\"]}. Do not include markdown backticks or extra text.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              meals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    calories: { type: Type.INTEGER },
                    protein: { type: Type.INTEGER },
                    carbs: { type: Type.INTEGER },
                    fat: { type: Type.INTEGER }
                  },
                  required: ["name", "description", "calories", "protein", "carbs", "fat"]
                }
              },
              targetCalories: { type: Type.INTEGER },
              targetProtein: { type: Type.INTEGER },
              targetCarbs: { type: Type.INTEGER },
              targetFat: { type: Type.INTEGER },
              waterIntakeLiters: { type: Type.NUMBER },
              supplements: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["meals", "targetCalories", "targetProtein", "targetCarbs", "targetFat", "waterIntakeLiters"]
          }
        }
      });

      const responseText = response.text || '';
      console.log('Gemini Diet Response:', responseText);
      const parsed = JSON.parse(responseText.trim());
      res.json({
        assignedBy: "FitSync AI Nutritionist",
        ...parsed
      });
    } catch (err) {
      console.error('Gemini API diet generation error:', err);
      res.json(fallbackResponse);
    }
  });

  // --- REWARD POINTS SYSTEM ---

  // Get current member points balance & transaction history
  app.get('/api/rewards/:memberId', (req, res) => {
    const { memberId } = req.params;
    if (!db.rewardTransactions) db.rewardTransactions = [];
    if (!db.rewardShopItems) db.rewardShopItems = [];
    
    const txs = db.rewardTransactions.filter(t => t.memberId === memberId);
    const totalPoints = txs.reduce((sum, tx) => sum + tx.points, 0);
    res.json({
      memberId,
      balance: totalPoints,
      transactions: txs,
      shopItems: db.rewardShopItems
    });
  });

  // Redeem a reward shop item
  app.post('/api/rewards/redeem', (req, res) => {
    const { memberId, itemId } = req.body;
    if (!db.rewardTransactions) db.rewardTransactions = [];
    if (!db.rewardShopItems) db.rewardShopItems = [];

    const member = db.members.find(m => m.id === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const item = db.rewardShopItems.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ error: 'Shop item not found' });
    }

    if (item.stock <= 0) {
      return res.status(400).json({ error: 'Item is out of stock' });
    }

    // Check balance
    const txs = db.rewardTransactions.filter(t => t.memberId === memberId);
    const balance = txs.reduce((sum, tx) => sum + tx.points, 0);

    if (balance < item.pointsCost) {
      return res.status(400).json({ error: `Insufficient points. You need ${item.pointsCost} points, but only have ${balance}.` });
    }

    // Deduct stock
    item.stock -= 1;

    // Create redemption transaction
    const newTx: RewardTransaction = {
      id: `tx-${Date.now()}`,
      memberId,
      points: -item.pointsCost,
      reason: `Redeemed: ${item.name}`,
      date: new Date().toISOString().split('T')[0]
    };

    db.rewardTransactions.unshift(newTx);
    createNotification(member.userId, 'Reward Redeemed! 🛍️', `You successfully redeemed "${item.name}" for ${item.pointsCost} points. enjoy!`, 'success');
    saveDB(db);

    res.json({
      success: true,
      transaction: newTx,
      balance: balance - item.pointsCost,
      item
    });
  });

  // Admin adjustments or manual awarding of points
  app.post('/api/rewards/adjust', (req, res) => {
    const { memberId, points, reason } = req.body;
    if (!db.rewardTransactions) db.rewardTransactions = [];

    const member = db.members.find(m => m.id === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const newTx: RewardTransaction = {
      id: `tx-${Date.now()}`,
      memberId,
      points: Number(points),
      reason: reason || 'Adjustment',
      date: new Date().toISOString().split('T')[0]
    };

    db.rewardTransactions.unshift(newTx);
    createNotification(member.userId, 'Points Wallet Updated', `Administrator updated your rewards: ${points > 0 ? '+' : ''}${points} points for: ${newTx.reason}`, 'info');
    saveDB(db);

    res.json(newTx);
  });

  // Log completed workout points award (+15 points)
  app.post('/api/rewards/log-workout', (req, res) => {
    const { memberId, workoutName } = req.body;
    if (!db.rewardTransactions) db.rewardTransactions = [];

    const member = db.members.find(m => m.id === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const newTx: RewardTransaction = {
      id: `tx-${Date.now()}`,
      memberId,
      points: 15,
      reason: `Finished Workout: ${workoutName || 'Daily Routine'}`,
      date: new Date().toISOString().split('T')[0]
    };

    db.rewardTransactions.unshift(newTx);
    createNotification(member.userId, 'Workout Completed! 💪', 'Awesome job completing your workout! +15 Reward Points added to your wallet.', 'success');
    saveDB(db);

    res.json(newTx);
  });

  // --- FITNESS CHALLENGES MODULE ---

  // Get challenges list
  app.get('/api/challenges', (req, res) => {
    if (!db.fitnessChallenges) db.fitnessChallenges = [];
    res.json(db.fitnessChallenges);
  });

  // Create challenge (Admin or Trainer)
  app.post('/api/challenges', (req, res) => {
    const { title, description, type, targetValue, startDate, endDate, pointsReward, isPrivate, createdBy } = req.body;
    if (!db.fitnessChallenges) db.fitnessChallenges = [];

    const newChallenge: FitnessChallenge = {
      id: `chal-${Date.now()}`,
      title,
      description,
      type,
      targetValue: Number(targetValue),
      startDate,
      endDate,
      pointsReward: Number(pointsReward),
      isPrivate: !!isPrivate,
      participants: [],
      progress: {},
      createdBy: createdBy || 'admin'
    };

    db.fitnessChallenges.push(newChallenge);
    saveDB(db);
    res.status(201).json(newChallenge);
  });

  // Join a challenge
  app.post('/api/challenges/:id/join', (req, res) => {
    const { id } = req.params;
    const { memberId } = req.body;
    if (!db.fitnessChallenges) db.fitnessChallenges = [];
    if (!db.rewardTransactions) db.rewardTransactions = [];

    const challenge = db.fitnessChallenges.find(c => c.id === id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const member = db.members.find(m => m.id === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (challenge.participants.includes(memberId)) {
      return res.status(400).json({ error: 'You have already joined this challenge.' });
    }

    challenge.participants.push(memberId);
    challenge.progress[memberId] = 0;

    // Bonus points for taking up a challenge! (+20 points)
    const bonusTx: RewardTransaction = {
      id: `tx-${Date.now()}`,
      memberId,
      points: 20,
      reason: `Joined Challenge: ${challenge.title}`,
      date: new Date().toISOString().split('T')[0]
    };
    db.rewardTransactions.unshift(bonusTx);

    createNotification(member.userId, 'Challenge Accepted! 🔥', `You entered the "${challenge.title}" challenge. Go crush it! (+20 bonus points)`, 'success');
    saveDB(db);

    res.json({ success: true, challenge });
  });

  // Log progress towards a challenge
  app.post('/api/challenges/:id/log', (req, res) => {
    const { id } = req.params;
    const { memberId, value } = req.body;
    if (!db.fitnessChallenges) db.fitnessChallenges = [];
    if (!db.rewardTransactions) db.rewardTransactions = [];

    const challenge = db.fitnessChallenges.find(c => c.id === id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const member = db.members.find(m => m.id === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (!challenge.participants.includes(memberId)) {
      return res.status(400).json({ error: 'You are not a participant in this challenge.' });
    }

    const addVal = Number(value);
    const oldVal = challenge.progress[memberId] || 0;
    const newVal = oldVal + addVal;
    challenge.progress[memberId] = Number(newVal.toFixed(1));

    let completed = false;
    if (oldVal < challenge.targetValue && newVal >= challenge.targetValue) {
      completed = true;
      // Award major challenge completion reward points!
      const completionTx: RewardTransaction = {
        id: `tx-${Date.now()}`,
        memberId,
        points: challenge.pointsReward,
        reason: `Completed Challenge: ${challenge.title}`,
        date: new Date().toISOString().split('T')[0]
      };
      db.rewardTransactions.unshift(completionTx);
      createNotification(member.userId, 'Challenge Accomplished! 🎉', `Congratulations! You conquered the "${challenge.title}" challenge and earned ${challenge.pointsReward} Reward Points!`, 'success');
    } else {
      createNotification(member.userId, 'Challenge Progress Logged', `Logged +${addVal} progress in "${challenge.title}". Total: ${challenge.progress[memberId]}/${challenge.targetValue}`, 'info');
    }

    saveDB(db);
    res.json({ success: true, challenge, completed, currentProgress: challenge.progress[memberId] });
  });

  // --- INTERACTIVE SCHEDULER & BOOKING CALENDAR ---

  // Get calendar events
  app.get('/api/events', (req, res) => {
    if (!db.calendarEvents) db.calendarEvents = [];
    res.json(db.calendarEvents);
  });

  // Create group class, training slot, or gym event
  app.post('/api/events', (req, res) => {
    const { title, description, type, date, startTime, endTime, trainerId, trainerName, maxParticipants, location } = req.body;
    if (!db.calendarEvents) db.calendarEvents = [];

    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title,
      description,
      type,
      date,
      startTime,
      endTime,
      trainerId,
      trainerName,
      maxParticipants: Number(maxParticipants) || 15,
      participants: [],
      location: location || 'Gym Floor'
    };

    db.calendarEvents.push(newEvent);
    saveDB(db);
    res.status(201).json(newEvent);
  });

  // Book a class or personal training slot
  app.post('/api/events/:id/book', (req, res) => {
    const { id } = req.params;
    const { memberId } = req.body;
    if (!db.calendarEvents) db.calendarEvents = [];

    const event = db.calendarEvents.find(e => e.id === id);
    if (!event) {
      return res.status(404).json({ error: 'Event/Class not found' });
    }

    const member = db.members.find(m => m.id === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (event.participants.includes(memberId)) {
      return res.status(400).json({ error: 'You are already booked for this session.' });
    }

    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ error: 'This session is fully booked.' });
    }

    event.participants.push(memberId);
    createNotification(member.userId, 'Booking Confirmed! 📅', `You successfully booked a slot for "${event.title}" on ${event.date} at ${event.startTime}.`, 'success');
    saveDB(db);

    res.json({ success: true, event });
  });

  // Cancel booking
  app.post('/api/events/:id/cancel', (req, res) => {
    const { id } = req.params;
    const { memberId } = req.body;
    if (!db.calendarEvents) db.calendarEvents = [];

    const event = db.calendarEvents.find(e => e.id === id);
    if (!event) {
      return res.status(404).json({ error: 'Event/Class not found' });
    }

    const member = db.members.find(m => m.id === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const idx = event.participants.indexOf(memberId);
    if (idx === -1) {
      return res.status(400).json({ error: 'You do not have a booking for this session.' });
    }

    event.participants.splice(idx, 1);
    createNotification(member.userId, 'Booking Cancelled', `Your booking for "${event.title}" on ${event.date} has been cancelled.`, 'info');
    saveDB(db);

    res.json({ success: true, event });
  });

  // --- VITE MIDDLEWARE CONFIGURATION ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FitSync Full-Stack Dev Server listening at http://localhost:${PORT}`);
  });
}

startServer();

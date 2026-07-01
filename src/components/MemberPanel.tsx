import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Dumbbell, Calendar, Heart, Award, CreditCard, User, Bell, Settings, LogOut, Plus, 
  CheckCircle, Flame, Droplet, Check, TrendingUp, Scale, Apple, HelpCircle, FileText, 
  ChevronRight, Compass, ShieldAlert, Sparkles, RefreshCw, Menu, X as XIcon
} from 'lucide-react';
import { MemberProfile, MembershipPlan, AttendanceRecord, Payment, WorkoutPlan, DietPlan, ProgressLog, Notification, TrainerProfile, RewardShopItem, RewardTransaction, FitnessChallenge, CalendarEvent } from '../types';

interface MemberPanelProps {
  memberProfile: MemberProfile;
  user: any;
  plans: MembershipPlan[];
  trainers: any[];
  api: any;
  onLogout: () => void;
}

export default function MemberPanel({ memberProfile, user, plans, trainers, api, onLogout }: MemberPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workout' | 'diet' | 'progress' | 'billing' | 'profile' | 'rewards' | 'challenges' | 'scheduler'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data States
  const [profile, setProfile] = useState<MemberProfile>(memberProfile);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rewardsWallet, setRewardsWallet] = useState<{ balance: number; transactions: RewardTransaction[]; shopItems: RewardShopItem[] }>({ balance: 0, transactions: [], shopItems: [] });
  const [challenges, setChallenges] = useState<FitnessChallenge[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // Interactive Local States
  const [waterLiters, setWaterLiters] = useState(1.5);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [completedSupplements, setCompletedSupplements] = useState<Record<string, boolean>>({});
  
  // Modals & Form States
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCheckedInToday, setQrCheckedInToday] = useState(false);
  const [qrCheckedOutToday, setQrCheckedOutToday] = useState(false);
  const [showInvoice, setShowInvoice] = useState<Payment | null>(null);
  const [rollingToken, setRollingToken] = useState('FITS-4X9B');
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Progress Input
  const [logWeight, setLogWeight] = useState('');
  const [logFat, setLogFat] = useState('');
  const [logMuscle, setLogMuscle] = useState('');
  const [logMessage, setLogMessage] = useState('');
  
  // Profile Input
  const [profPhone, setProfPhone] = useState(profile.phone);
  const [profAddress, setProfAddress] = useState(profile.address);
  const [profMedical, setProfMedical] = useState(profile.medicalInfo || '');
  const [profEmergencyName, setProfEmergencyName] = useState(profile.emergencyContact.name);
  const [profEmergencyPhone, setProfEmergencyPhone] = useState(profile.emergencyContact.phone);
  const [profEmergencyRel, setProfEmergencyRel] = useState(profile.emergencyContact.relationship);
  const [profAge, setProfAge] = useState(String(profile.age));
  const [profHeight, setProfHeight] = useState(String(profile.height));
  const [profSuccess, setProfSuccess] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMemberData();
    
    // Timer for rolling secure QR token
    const generateToken = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'FITS-';
      for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setRollingToken(generateToken());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchMemberData = async () => {
    setLoading(true);
    try {
      // 1. Fetch member attendance
      const allAtt = await api.getAttendance();
      const memberAtt = allAtt.filter((a: any) => a.memberId === profile.id);
      setAttendance(memberAtt);

      // Check if checked in today
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRecord = memberAtt.find((a: any) => a.date === todayStr);
      const hasCheckedIn = !!todayRecord;
      const hasCheckedOut = todayRecord ? !!todayRecord.checkOutTime : false;
      setQrCheckedInToday(hasCheckedIn);
      setQrCheckedOutToday(hasCheckedOut);

      // 2. Fetch payments
      const allPay = await api.getPayments();
      const memberPay = allPay.filter((p: any) => p.memberId === profile.id);
      setPayments(memberPay);

      // 3. Fetch workout plans
      const allWork = await api.getWorkouts();
      const activeWork = allWork.find((w: any) => w.memberId === profile.id && w.status === 'active');
      setWorkoutPlan(activeWork || null);

      // 4. Fetch diet plans
      const allDiets = await api.getDiets();
      const activeDiet = allDiets.find((d: any) => d.memberId === profile.id && d.status === 'active');
      setDietPlan(activeDiet || null);

      // 5. Fetch progress logs
      const logs = await api.getProgress(profile.id);
      setProgressLogs(logs);

      // 6. Fetch notifications
      const nots = await api.getNotifications();
      const myNots = nots.filter((n: any) => n.userId === user.id || n.userId === 'all');
      setNotifications(myNots);

      // 7. Fetch rewards wallet
      const rewards = await api.getRewards(profile.id);
      setRewardsWallet(rewards);

      // 8. Fetch challenges
      const challs = await api.getChallenges();
      setChallenges(challs);

      // 9. Fetch events
      const evts = await api.getEvents();
      setEvents(evts);

    } catch (err) {
      console.error('Error fetching member stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Play high-fidelity check-in chime
  const playCheckInSound = (isCheckOut = false) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      if (!isCheckOut) {
        // High double-tone chirp for checkin
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain.gain.setValueAtTime(0.12, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.frequency.setValueAtTime(1320, now + 0.12);
        gain2.gain.setValueAtTime(0, now + 0.12);
        gain2.gain.linearRampToValueAtTime(0.12, now + 0.17);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc2.start(now + 0.12);
        
        osc.stop(now + 0.3);
        osc2.stop(now + 0.4);
      } else {
        // Lower double-tone chirp for checkout
        osc.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain.gain.setValueAtTime(0.12, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.frequency.setValueAtTime(660, now + 0.12);
        gain2.gain.setValueAtTime(0, now + 0.12);
        gain2.gain.linearRampToValueAtTime(0.12, now + 0.17);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc2.start(now + 0.12);
        
        osc.stop(now + 0.3);
        osc2.stop(now + 0.4);
      }
    } catch (e) {
      console.warn('Audio context blocked or unsupported:', e);
    }
  };

  // QR Attendance checkin/checkout simulator
  const handleQRCheckIn = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const nowTimeStr = new Date().toTimeString().split(' ')[0];
      
      if (!qrCheckedInToday) {
        // Perform Check-In
        const record = await api.checkIn({
          memberId: profile.id,
          status: 'present',
          method: 'QR',
          date: todayStr,
          checkInTime: nowTimeStr
        });
        
        setAttendance([record, ...attendance]);
        setQrCheckedInToday(true);
        playCheckInSound(false);
      } else if (!qrCheckedOutToday) {
        // Perform Check-Out
        await api.checkOut({
          memberId: profile.id,
          date: todayStr,
          checkOutTime: nowTimeStr
        });
        
        setQrCheckedOutToday(true);
        playCheckInSound(true);
      }
      
      setShowQRModal(false);
      await fetchMemberData();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  // Log progress
  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logWeight) return;
    
    try {
      const newLog = await api.addProgress({
        memberId: profile.id,
        weight: Number(logWeight),
        bodyFatPercentage: logFat ? Number(logFat) : undefined,
        muscleMassPercentage: logMuscle ? Number(logMuscle) : undefined
      });
      
      setProgressLogs([...progressLogs, newLog].sort((a, b) => a.date.localeCompare(b.date)));
      setLogWeight('');
      setLogFat('');
      setLogMuscle('');
      setLogMessage('Your measurement has been added successfully!');
      
      // update state profile
      setProfile(prev => ({ ...prev, weight: Number(logWeight) }));
      
      setTimeout(() => setLogMessage(''), 3000);
      fetchMemberData();
    } catch (err) {
      console.error('Error logging measurements:', err);
    }
  };

  // Save Settings / Profile details
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        phone: profPhone,
        address: profAddress,
        medicalInfo: profMedical,
        age: Number(profAge),
        height: Number(profHeight),
        emergencyContact: {
          name: profEmergencyName,
          phone: profEmergencyPhone,
          relationship: profEmergencyRel
        }
      };
      
      const updatedProfile = await api.updateMember(profile.id, payload);
      setProfile(updatedProfile);
      setProfSuccess('Your profile details have been saved successfully.');
      setTimeout(() => setProfSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  // Extract membership plan details
  const currentPlan = plans.find(p => p.id === profile.membershipPlanId);
  const trainerDetails = trainers.find(t => t.id === profile.assignedTrainerId);

  // Stats
  const attendanceCount = attendance.length;
  const attendanceRate = attendanceCount > 0 ? Math.min(Math.round((attendanceCount / 12) * 100), 100) : 0;
  const latestWeight = profile.weight;
  const latestBmi = (profile.weight / ((profile.height / 100) * (profile.height / 100))).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
      
      {/* Sticky Top Bar for Mobile */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white p-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Dumbbell className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white">FitSync Elite</h1>
            <span className="text-xxs font-bold text-blue-400 tracking-wider uppercase block -mt-0.5">Member Panel</span>
          </div>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white transition-all cursor-pointer"
        >
          {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col justify-between shrink-0 shadow-2xl border-r border-slate-800 transition-transform duration-300 ease-in-out transform
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:w-64 md:flex md:flex-col md:shadow-xl md:border-r md:border-slate-850
      `}>
        <div>
          {/* Gym Brand header */}
          <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white">FitSync Elite</h1>
                <span className="text-xxs font-bold text-blue-400 tracking-wider uppercase">Member Dashboard</span>
              </div>
            </div>
            {/* Close button inside sidebar on mobile */}
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Member mini-profile */}
          <div className="p-5 border-b border-slate-800/40 flex items-center gap-3 bg-slate-950/20">
            <img 
              src={profile.profilePhoto} 
              alt={user.name} 
              className="w-10 h-10 rounded-full object-cover border border-slate-700" 
            />
            <div className="overflow-hidden">
              <h3 className="font-bold text-xs text-white truncate">{user.name}</h3>
              <p className="text-slate-400 text-xxs truncate font-mono">{user.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <Compass className="w-4 h-4" /> },
              { id: 'workout', label: 'My Workout Plan', icon: <Dumbbell className="w-4 h-4" /> },
              { id: 'diet', label: 'My Nutrition Guide', icon: <Apple className="w-4 h-4" /> },
              { id: 'progress', label: 'Metrics & Charts', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'rewards', label: 'Rewards Hub', icon: <Award className="w-4 h-4" /> },
              { id: 'challenges', label: 'Challenges', icon: <Flame className="w-4 h-4" /> },
              { id: 'scheduler', label: 'Class Scheduler', icon: <Calendar className="w-4 h-4" /> },
              { id: 'billing', label: 'Payments & Receipts', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'profile', label: 'Profile Settings', icon: <Settings className="w-4 h-4" /> }
            ].map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setMobileMenuOpen(false); }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Quick QR Checkin button in footer */}
        <div className="p-4 border-t border-slate-800/50 space-y-2">
          {!qrCheckedInToday ? (
            <motion.button
              onClick={() => { setShowQRModal(true); setMobileMenuOpen(false); }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 cursor-pointer"
              id="member-btn-qr"
            >
              <Calendar className="w-4 h-4" /> Scan QR Check-In
            </motion.button>
          ) : (
            <div className="py-2 px-3 bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-xxs font-bold rounded-xl text-center flex items-center justify-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Checked In Today
            </div>
          )}

          <motion.button
            onClick={() => { onLogout(); setMobileMenuOpen(false); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 px-4 bg-slate-800 hover:bg-red-900/30 hover:text-red-300 text-slate-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </motion.button>
        </div>
      </aside>

      {/* Main Panel stage */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        
        {/* Header bar */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/50">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight capitalize">
              Welcome back, {user.name.split(' ')[0]}!
            </h2>
            <p className="text-sm text-slate-500">Your biometrics log, daily habits, and training tracker are completely synced.</p>
          </div>

          {/* Quick Stats Header */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Score</div>
              <div className="text-lg font-extrabold text-blue-600 flex items-center gap-1.5 justify-end">
                <Flame className="w-4 h-4 animate-bounce text-orange-500" /> {attendanceRate}%
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Weight</div>
              <div className="text-lg font-extrabold text-slate-800">{latestWeight} kg</div>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Tab Stage */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* DIGITAL MEMBERSHIP PASS & QR SCAN CONSOLE */}
            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" /> Digital Gym Pass & Lobby QR
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Scan your secure dynamic pass at the front desk lobby scanner to record check-in/out.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xxs font-extrabold tracking-wide uppercase ${
                    qrCheckedOutToday 
                      ? 'bg-slate-100 text-slate-500' 
                      : qrCheckedInToday 
                        ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      qrCheckedOutToday ? 'bg-slate-400' : qrCheckedInToday ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    {qrCheckedOutToday ? 'Checked Out' : qrCheckedInToday ? 'In Gym (Active)' : 'Checked Out (Ready)'}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-stretch">
                {/* Left Card: Apple Wallet/Google Wallet Style Member Card */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border border-slate-850 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[220px]">
                  {/* Subtle Holographic Glow Effect */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl" />
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start z-10">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs tracking-tight text-white block">FITSYNC ELITE</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block -mt-1">PREMIUM CLUB</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                      {currentPlan?.name || 'Active Member'}
                    </span>
                  </div>

                  {/* Card Body: Member Info */}
                  <div className="flex items-center gap-4 my-6 z-10">
                    <div className="relative shrink-0">
                      <img 
                        src={profile.profilePhoto} 
                        alt={user.name} 
                        className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/40 p-0.5 shadow-md shadow-slate-950/50"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider block">MEMBER PASS</span>
                      <h4 className="text-base font-black text-white truncate leading-tight">{user.name}</h4>
                      <p className="text-xxs text-slate-400 truncate mt-0.5 font-mono">{user.email}</p>
                    </div>
                  </div>

                  {/* Card Footer: Metadata and Fake Barcode */}
                  <div className="flex justify-between items-end border-t border-slate-800/60 pt-4 z-10">
                    <div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">MEMBER ID</span>
                      <span className="text-xxs font-mono font-bold text-slate-300 tracking-wider">
                        FS-EM-{profile.id.substring(0, 8).toUpperCase()}
                      </span>
                    </div>
                    {/* Simulated digital barcodes */}
                    <div className="flex flex-col items-end gap-1 opacity-70">
                      <div className="flex gap-[1px] h-6 items-stretch">
                        {[1, 3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 1, 4, 2, 1, 2].map((w, idx) => (
                          <div key={idx} className="bg-slate-300" style={{ width: `${w}px` }} />
                        ))}
                      </div>
                      <span className="text-[7px] font-mono text-slate-400 tracking-widest">
                        {profile.id.substring(0, 6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Interactive Lobby QR Scan Code & Simulator */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-between shadow-inner relative">
                  
                  {/* Live Security Timer */}
                  <div className="w-full flex justify-between items-center mb-4 text-xxs font-bold text-slate-500 border-b border-slate-100 pb-3">
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" style={{ animationDuration: '3s' }} />
                      DYNAMIC REFRESHING PASS
                    </span>
                    <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      RELOAD IN <span className="text-blue-600 font-extrabold">{timeLeft}s</span>
                    </span>
                  </div>

                  {/* SVG Custom High-Tech QR with Animated Laser Line */}
                  <div className="relative w-44 h-44 bg-white p-4 rounded-xl shadow-md border border-slate-150 flex items-center justify-center overflow-hidden">
                    
                    {/* Embedded Style Block for laser animation inside JSX */}
                    <style>{`
                      @keyframes scanline {
                        0%, 100% { top: 6%; }
                        50% { top: 94%; }
                      }
                      .animate-scanline {
                        animation: scanline 2.2s ease-in-out infinite;
                      }
                    `}</style>

                    {/* Laser Scanner horizontal line */}
                    {!qrCheckedOutToday && (
                      <div className="absolute left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_8px_rgba(6,182,212,0.8)] z-10 animate-scanline" />
                    )}

                    {/* Custom Vector SVG QR Code with Corner Anchor Points */}
                    <svg className={`w-full h-full text-slate-900 ${qrCheckedOutToday ? 'opacity-20' : ''}`} viewBox="0 0 100 100">
                      {/* Anchor square Top-Left */}
                      <rect x="0" y="0" width="24" height="24" fill="currentColor" rx="2" />
                      <rect x="4" y="4" width="16" height="16" fill="white" rx="1" />
                      <rect x="8" y="8" width="8" height="8" fill="currentColor" rx="0.5" />

                      {/* Anchor square Top-Right */}
                      <rect x="76" y="0" width="24" height="24" fill="currentColor" rx="2" />
                      <rect x="80" y="4" width="16" height="16" fill="white" rx="1" />
                      <rect x="84" y="8" width="8" height="8" fill="currentColor" rx="0.5" />

                      {/* Anchor square Bottom-Left */}
                      <rect x="0" y="76" width="24" height="24" fill="currentColor" rx="2" />
                      <rect x="4" y="80" width="16" height="16" fill="white" rx="1" />
                      <rect x="8" y="84" width="8" height="8" fill="currentColor" rx="0.5" />

                      {/* Small Alignment block Bottom-Right */}
                      <rect x="76" y="76" width="12" height="12" fill="currentColor" rx="1" />
                      <rect x="80" y="80" width="4" height="4" fill="white" />

                      {/* Fake stylized barcode blocks / data modules */}
                      <rect x="30" y="2" width="6" height="6" fill="currentColor" />
                      <rect x="40" y="0" width="8" height="4" fill="currentColor" />
                      <rect x="52" y="4" width="4" height="10" fill="currentColor" />
                      <rect x="60" y="2" width="8" height="6" fill="currentColor" />
                      
                      <rect x="30" y="12" width="14" height="4" fill="currentColor" />
                      <rect x="48" y="16" width="8" height="6" fill="currentColor" />
                      <rect x="62" y="10" width="10" height="4" fill="currentColor" />
                      
                      <rect x="34" y="24" width="4" height="12" fill="currentColor" />
                      <rect x="42" y="28" width="12" height="4" fill="currentColor" />
                      <rect x="58" y="20" width="6" height="8" fill="currentColor" />
                      
                      <rect x="2" y="30" width="10" height="4" fill="currentColor" />
                      <rect x="16" y="34" width="6" height="6" fill="currentColor" />
                      <rect x="26" y="40" width="8" height="4" fill="currentColor" />
                      
                      {/* Mid-right modules */}
                      <rect x="70" y="30" width="14" height="4" fill="currentColor" />
                      <rect x="88" y="34" width="8" height="8" fill="currentColor" />
                      <rect x="74" y="44" width="12" height="6" fill="currentColor" />

                      {/* Center-left modules */}
                      <rect x="2" y="48" width="12" height="8" fill="currentColor" />
                      <rect x="18" y="52" width="6" height="12" fill="currentColor" />
                      <rect x="32" y="48" width="16" height="4" fill="currentColor" />

                      {/* Center-right modules */}
                      <rect x="52" y="54" width="10" height="4" fill="currentColor" />
                      <rect x="66" y="52" width="4" height="12" fill="currentColor" />
                      <rect x="74" y="58" width="14" height="4" fill="currentColor" />

                      {/* Bottom modules */}
                      <rect x="30" y="70" width="8" height="8" fill="currentColor" />
                      <rect x="42" y="76" width="12" height="4" fill="currentColor" />
                      <rect x="58" y="72" width="10" height="6" fill="currentColor" />
                      <rect x="34" y="84" width="14" height="4" fill="currentColor" />
                      <rect x="52" y="82" width="8" height="8" fill="currentColor" />
                      <rect x="64" y="86" width="8" height="4" fill="currentColor" />
                      
                      {/* Center Emblem circle with Fitsync Dumbbell */}
                      <circle cx="50" cy="50" r="14" fill="white" />
                      <circle cx="50" cy="50" r="11" fill="#2563EB" />
                    </svg>
                    
                    {/* Dumbbell Icon in middle of QR */}
                    <div className="absolute pointer-events-none">
                      <Dumbbell className={`w-4 h-4 text-white ${qrCheckedOutToday ? 'opacity-20' : 'animate-pulse'}`} />
                    </div>

                    {/* Fully checked out overlay */}
                    {qrCheckedOutToday && (
                      <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-4 z-20">
                        <div className="bg-emerald-500 text-white p-3 rounded-full shadow-lg shadow-emerald-200">
                          <Check className="w-8 h-8 stroke-[3]" />
                        </div>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider mt-3">Completed Today</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase text-center">See you tomorrow!</span>
                      </div>
                    )}
                  </div>

                  {/* Subtext with the rolling passcode details */}
                  <div className="text-center mt-3 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">SECURE OTP PASS</span>
                    <span className="text-lg font-black font-mono text-slate-800 tracking-wider">
                      {qrCheckedOutToday ? '------' : rollingToken}
                    </span>
                  </div>

                  {/* High Polish Check-In Trigger Action Button */}
                  {qrCheckedOutToday ? (
                    <div className="w-full py-3 bg-slate-100 text-slate-400 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 shadow-inner">
                      <CheckCircle className="w-4 h-4" /> COMPLETED GYM SESSION
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleQRCheckIn}
                      className={`w-full py-3 text-xs font-extrabold rounded-xl text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                        qrCheckedInToday 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/10' 
                          : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-blue-500/15'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      {qrCheckedInToday ? 'SIMULATE CHECK-OUT SCAN' : 'SIMULATE CHECK-IN SCAN'}
                    </motion.button>
                  )}
                </div>
              </div>
              
              {/* Scan Log History list */}
              {attendance.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-3">TODAY'S SCAN ACTIVITY LOG</span>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Check-In Activity Block</div>
                        <div className="text-xxs text-slate-500 font-mono">Date: {attendance[0].date} | Method: Secure QR Scan</div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Checked In</span>
                        <span className="text-xs font-extrabold text-slate-700 font-mono">{attendance[0].checkInTime}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Checked Out</span>
                        <span className="text-xs font-extrabold text-slate-700 font-mono">
                          {attendance[0].checkOutTime || '--:--:--'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Overview Bento Cards */}
            <div className="grid sm:grid-cols-4 gap-6">
              
              {/* Card 1: Active Membership info */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Active Program</h4>
                  <p className="text-base font-extrabold text-slate-800">{currentPlan?.name || 'Loading...'}</p>
                  <p className="text-xxs text-slate-500">Auto-renew active</p>
                </div>
              </div>

              {/* Card 2: Personal Coach */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-xl text-emerald-500">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Coach Assigned</h4>
                  <p className="text-base font-extrabold text-slate-800">{trainerDetails?.name || 'Unassigned'}</p>
                  <p className="text-xxs text-slate-500">{trainerDetails ? trainerDetails.specialization : 'Self-guided workout'}</p>
                </div>
              </div>

              {/* Card 3: Biometric Weight */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center gap-4">
                <div className="bg-orange-50 p-3 rounded-xl text-orange-500">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Body weight</h4>
                  <p className="text-base font-extrabold text-slate-800">{latestWeight} kg</p>
                  <p className="text-xxs text-slate-500">BMI: {latestBmi}</p>
                </div>
              </div>

              {/* Card 4: Monthly Visits */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center gap-4">
                <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Gym Check-Ins</h4>
                  <p className="text-base font-extrabold text-slate-800">{attendanceCount} Days</p>
                  <p className="text-xxs text-slate-500">This subscription cycle</p>
                </div>
              </div>
            </div>

            {/* Dashboard content grid: Active updates & Notification Hub */}
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Left Column: Quick Action and Habit Progress */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Active workout quick-card */}
                <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-blue-600" /> Today's Training Schedule
                    </h3>
                    <button 
                      onClick={() => setActiveTab('workout')} 
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      View All Exercises <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {workoutPlan ? (
                    <div className="space-y-3">
                      <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                        <div>
                          <div className="font-bold text-xs text-slate-800">{workoutPlan.exercises.length} Exercises Assigned</div>
                          <div className="text-xxs text-slate-500">Program compiled by {workoutPlan.assignedBy === 'Trainer' ? 'Trainer Marcus' : workoutPlan.assignedBy} on {workoutPlan.assignedDate}</div>
                        </div>
                        <span className="px-2.5 py-1 text-xxs font-extrabold bg-blue-50 text-blue-600 rounded-full uppercase tracking-wider">ACTIVE</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {workoutPlan.exercises.slice(0, 4).map((ex, i) => (
                          <div key={ex.id} className="p-3 bg-white border border-slate-100 rounded-xl text-left">
                            <div className="text-xs font-bold text-slate-800 truncate">{ex.name}</div>
                            <div className="text-xxs text-slate-500 font-medium">{ex.sets} Sets × {ex.reps} Reps</div>
                            <div className="text-xxxs text-blue-500 font-semibold mt-1">{ex.category}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                      <p className="text-sm text-slate-500 font-medium">No workout plan assigned for this period.</p>
                      <p className="text-xs text-slate-400 mt-1">Ask your assigned trainer or try generating one with AI!</p>
                    </div>
                  )}
                </div>

                {/* Nutrition quick-card */}
                <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                      <Apple className="w-5 h-5 text-emerald-500" /> Active Nutrition Guide
                    </h3>
                    <button 
                      onClick={() => setActiveTab('diet')} 
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      Log Meal Macros <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {dietPlan ? (
                    <div className="space-y-4">
                      {/* Macro totals bar */}
                      <div className="grid grid-cols-4 gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center">
                        <div>
                          <div className="text-lg font-extrabold text-emerald-700">{dietPlan.targetCalories}</div>
                          <div className="text-xxs text-emerald-600 font-bold uppercase">Calories</div>
                        </div>
                        <div>
                          <div className="text-lg font-extrabold text-emerald-700">{dietPlan.targetProtein}g</div>
                          <div className="text-xxs text-emerald-600 font-bold uppercase">Protein</div>
                        </div>
                        <div>
                          <div className="text-lg font-extrabold text-emerald-700">{dietPlan.targetCarbs}g</div>
                          <div className="text-xxs text-emerald-600 font-bold uppercase">Carbs</div>
                        </div>
                        <div>
                          <div className="text-lg font-extrabold text-emerald-700">{dietPlan.targetFat}g</div>
                          <div className="text-xxs text-emerald-600 font-bold uppercase">Fat</div>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {dietPlan.meals.slice(0, 3).map((meal, idx) => (
                          <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                            <div>
                              <div className="font-bold text-slate-800">{meal.name}</div>
                              <div className="text-xxs text-slate-500">{meal.description}</div>
                            </div>
                            <span className="font-semibold text-slate-700">{meal.calories} kcal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                      <p className="text-sm text-slate-500 font-medium">No diet plan assigned currently.</p>
                      <p className="text-xs text-slate-400 mt-1">Trainer updates will display here instantly.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Notification panel & Gym Hours */}
              <div className="space-y-6">
                
                {/* Notification Hub */}
                <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs flex flex-col h-[340px]">
                  <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-1.5 shrink-0">
                    <Bell className="w-4 h-4 text-orange-500 animate-swing" /> Updates & Notices
                  </h3>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {notifications.length > 0 ? (
                      notifications.map(not => (
                        <div 
                          key={not.id} 
                          onClick={() => handleMarkRead(not.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            not.read 
                              ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                              : 'bg-blue-50/30 border-blue-150/40 hover:bg-blue-50/50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-slate-800">{not.title}</span>
                            {!not.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                            )}
                          </div>
                          <p className="text-xxs text-slate-600 leading-relaxed">{not.message}</p>
                          <span className="text-xxxs text-slate-400 font-mono block mt-2">{not.date}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-xs text-slate-400 font-medium">
                        No notifications or alerts.
                      </div>
                    )}
                  </div>
                </div>

                {/* Gym Info Card */}
                <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl border border-slate-800 shadow-lg">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">CLUB CONTACT & HOURS</h4>
                  <p className="text-sm font-extrabold text-white">FitSync Elite Club</p>
                  <p className="text-xxs text-slate-400 font-mono mt-1">742 Strength Boulevard, NY</p>
                  <div className="mt-4 border-t border-slate-800/80 pt-3 space-y-1">
                    <div className="flex justify-between text-xxs text-slate-300">
                      <span>Mon-Fri Opening</span>
                      <span className="font-bold text-white">06:00 - 22:00</span>
                    </div>
                    <div className="flex justify-between text-xxs text-slate-300">
                      <span>Sat-Sun Opening</span>
                      <span className="font-bold text-white">07:00 - 20:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Workout Plan View */}
        {activeTab === 'workout' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Custom Workout Schedule</h3>
                <p className="text-xs text-slate-500">Log and verify completed training sets to audit physical progress.</p>
              </div>
              <span className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl border border-blue-100">
                Category: {workoutPlan?.exercises[0]?.category || 'Full-body'}
              </span>
            </div>

            {workoutPlan ? (
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Exercise List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
                    <div className="p-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-600 uppercase">Exercises in Program</span>
                      <span className="text-xxs font-semibold text-slate-500">Tap checkbox when finished</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {workoutPlan.exercises.map((ex, idx) => {
                        const isCompleted = completedExercises[ex.id] || false;
                        return (
                          <div 
                            key={ex.id} 
                            onClick={() => setCompletedExercises({ ...completedExercises, [ex.id]: !isCompleted })}
                            className={`p-4 flex items-center justify-between hover:bg-slate-50/50 cursor-pointer transition-all ${
                              isCompleted ? 'bg-emerald-50/20' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                                isCompleted 
                                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                                  : 'border-slate-300 bg-white'
                              }`}>
                                {isCompleted && <Check className="w-4 h-4" />}
                              </div>
                              
                              <div>
                                <h4 className={`text-sm font-bold ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                  {ex.name}
                                </h4>
                                <div className="text-xxs text-slate-500 mt-0.5">
                                  <span className="font-semibold text-blue-600 mr-2">{ex.category}</span>
                                  <span>{ex.sets} Sets × {ex.reps} Reps</span>
                                  {ex.weight && <span className="ml-2 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-xxs font-mono">{ex.weight}</span>}
                                </div>
                                {ex.notes && (
                                  <p className="text-xxs text-slate-400 mt-1 italic">Notes: {ex.notes}</p>
                                )}
                              </div>
                            </div>
                            <span className="text-xxs font-mono text-slate-400">#ex-{idx+1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sidebar details */}
                <div className="space-y-6">
                  
                  {/* Workout instructions */}
                  <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">TRAINING GUIDES</h4>
                    
                    <div className="space-y-3 divide-y divide-slate-50">
                      <div className="pt-2">
                        <div className="font-bold text-xs text-slate-800">1. Master Form First</div>
                        <p className="text-xxs text-slate-500 leading-relaxed mt-0.5">Prioritize bio-mechanical control over total weight load. Control the concentric and eccentric phases.</p>
                      </div>
                      <div className="pt-3">
                        <div className="font-bold text-xs text-slate-800">2. Inter-Set Rest Period</div>
                        <p className="text-xxs text-slate-500 leading-relaxed mt-0.5">Rest for 60 to 90 seconds between strength training sets. Ensure heart rate is restored.</p>
                      </div>
                      <div className="pt-3">
                        <div className="font-bold text-xs text-slate-800">3. Hydrate Constantly</div>
                        <p className="text-xxs text-slate-500 leading-relaxed mt-0.5">Drink at least 500ml of fresh water during your session to avoid muscular dehydration.</p>
                      </div>
                    </div>
                  </div>

                  {/* Program stats */}
                  <div className="p-5 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl shadow-md space-y-2">
                    <h4 className="text-xs font-bold text-blue-200 uppercase">Assigned Coach Contact</h4>
                    <p className="text-base font-extrabold">{trainerDetails ? trainerDetails.name : 'No Assigned Trainer'}</p>
                    <p className="text-xxs text-blue-100">{trainerDetails ? trainerDetails.specialization : 'Contact admin desk to align with a certified coach.'}</p>
                    {trainerDetails && (
                      <p className="text-xxs text-blue-200 font-mono pt-2 border-t border-blue-500/50 mt-2">
                        Mobile: {trainerDetails.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center bg-white border border-slate-150 rounded-2xl shadow-sm">
                <Dumbbell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-slate-800">No Program Active</h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                  You are currently operating on a self-guided routine. Contact your assigned personal trainer or administrators to upload a custom diet and weight routine.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Diet Plan View */}
        {activeTab === 'diet' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Custom Nutrition & Diet Planner</h3>
                <p className="text-xs text-slate-500">Track calorie limits, protein requirements, water metrics, and supplements.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl border border-emerald-100">
                  Target Cal: {dietPlan?.targetCalories || 2000} kcal
                </span>
              </div>
            </div>

            {dietPlan ? (
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Meals and Supplements */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Meal Schedules */}
                  <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
                    <div className="p-4 bg-slate-50 border-b border-slate-150">
                      <span className="text-xs font-bold text-slate-600 uppercase">Daily Meal Schedule</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {dietPlan.meals.map((meal, idx) => (
                        <div key={idx} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <div>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xxs font-extrabold rounded uppercase tracking-wider">
                              {meal.name}
                            </span>
                            <p className="text-xs text-slate-800 font-semibold mt-1.5">{meal.description}</p>
                          </div>
                          
                          {/* Macros breakdown */}
                          <div className="flex gap-3 text-xxs font-semibold font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <span>🔥 {meal.calories} Cal</span>
                            <span>🍗 {meal.protein}g Pro</span>
                            <span>🍞 {meal.carbs}g Carb</span>
                            <span>🥑 {meal.fat}g Fat</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Supplement Checklist */}
                  {dietPlan.supplements && dietPlan.supplements.length > 0 && (
                    <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs">
                      <h4 className="text-xs font-bold text-slate-600 uppercase mb-4 tracking-wider">Daily Supplement Tracker</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {dietPlan.supplements.map((supp, i) => {
                          const isDone = completedSupplements[supp] || false;
                          return (
                            <div 
                              key={i}
                              onClick={() => setCompletedSupplements({ ...completedSupplements, [supp]: !isDone })}
                              className={`p-3 border rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                                isDone ? 'bg-emerald-50/20 border-emerald-300' : 'bg-slate-50/30 border-slate-150 hover:bg-slate-50'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isDone && <Check className="w-3 h-3" />}
                              </div>
                              <span className={`text-xs font-bold ${isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                {supp}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Hydration Counter & Diet Goals */}
                <div className="space-y-6">
                  
                  {/* Fluid Hydration Card */}
                  <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs text-center space-y-4">
                    <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto text-blue-600 shadow-sm">
                      <Droplet className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Water Intake Liters</h4>
                      <div className="text-3xl font-extrabold text-blue-600 mt-1">{waterLiters.toFixed(1)} L</div>
                      <p className="text-xxs text-slate-500 mt-0.5">Recommended Goal: {dietPlan.waterIntakeLiters} Liters</p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => setWaterLiters(Math.max(0, waterLiters - 0.25))}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                      >
                        - 250 ml
                      </button>
                      <button 
                        onClick={() => setWaterLiters(waterLiters + 0.25)}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                      >
                        + 250 ml
                      </button>
                    </div>
                  </div>

                  {/* Nutrient split charts summary */}
                  <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Macro Percentages</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xxs font-bold text-slate-600 mb-1">
                          <span>Protein</span>
                          <span>{dietPlan.targetProtein}g / 100%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xxs font-bold text-slate-600 mb-1">
                          <span>Carbohydrates</span>
                          <span>{dietPlan.targetCarbs}g / 100%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xxs font-bold text-slate-600 mb-1">
                          <span>Fats</span>
                          <span>{dietPlan.targetFat}g / 100%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center bg-white border border-slate-150 rounded-2xl shadow-sm">
                <Apple className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-slate-800">No Diet Plan Active</h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                  Ask your assigned personal coach to compile a nutritional meal plan with exact macros and water standards for your body.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Metrics and Charts Tab */}
        {activeTab === 'progress' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Physical Metrics & Progression</h3>
              <p className="text-xs text-slate-500">Document your biometrics periodically to generate performance curves.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Add Progress Measurement Form */}
              <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs h-fit">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">Log Today's Measurements</h4>
                
                {logMessage && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold">
                    {logMessage}
                  </div>
                )}

                <form onSubmit={handleAddProgress} className="space-y-4">
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Weight (kg) *</label>
                    <input 
                      type="number" 
                      step="0.1"
                      required
                      value={logWeight}
                      onChange={(e) => setLogWeight(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                      placeholder="e.g. 74.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Body Fat Percentage (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={logFat}
                      onChange={(e) => setLogFat(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                      placeholder="e.g. 18.2"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Muscle Mass Percentage (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={logMuscle}
                      onChange={(e) => setLogMuscle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                      placeholder="e.g. 42.1"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-100"
                  >
                    Save Measurement Log
                  </button>
                </form>
              </div>

              {/* Progress Curves (Native SVG) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Weight Trend */}
                <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4 flex justify-between">
                    <span>Weight Trend curve (kg)</span>
                    <span className="font-mono text-blue-600 text-xxs">{progressLogs.length} logs recorded</span>
                  </h4>

                  {progressLogs.length > 1 ? (
                    <div className="space-y-4">
                      {/* Interactive SVG graph representation */}
                      <div className="h-44 w-full bg-slate-50/50 rounded-xl p-2 relative border border-slate-100">
                        <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                          {/* Grid Lines */}
                          <line x1="0" y1="20" x2="400" y2="20" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4" />
                          <line x1="0" y1="50" x2="400" y2="50" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4" />
                          <line x1="0" y1="80" x2="400" y2="80" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4" />
                          
                          {/* Draw spline curve */}
                          <polyline
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="2.5"
                            points={progressLogs.map((log, index) => {
                              const x = (index / (progressLogs.length - 1)) * 380 + 10;
                              // map weight (50-100 range) to SVG height 10-90
                              const minW = Math.min(...progressLogs.map(l => l.weight)) - 1;
                              const maxW = Math.max(...progressLogs.map(l => l.weight)) + 1;
                              const range = maxW - minW || 1;
                              const y = 90 - ((log.weight - minW) / range) * 80;
                              return `${x},${y}`;
                            }).join(' ')}
                          />

                          {/* Data point markers */}
                          {progressLogs.map((log, index) => {
                            const x = (index / (progressLogs.length - 1)) * 380 + 10;
                            const minW = Math.min(...progressLogs.map(l => l.weight)) - 1;
                            const maxW = Math.max(...progressLogs.map(l => l.weight)) + 1;
                            const range = maxW - minW || 1;
                            const y = 90 - ((log.weight - minW) / range) * 80;
                            return (
                              <g key={log.id}>
                                <circle cx={x} cy={y} r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
                                <text x={x} y={y - 8} fontSize="6" fontWeight="bold" textAnchor="middle" fill="#1e293b">
                                  {log.weight}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>

                      {/* Log Dates Labels */}
                      <div className="flex justify-between text-xxs font-mono text-slate-400 px-2">
                        <span>{progressLogs[0].date}</span>
                        <span>{progressLogs[Math.floor(progressLogs.length / 2)].date}</span>
                        <span>{progressLogs[progressLogs.length - 1].date}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-slate-50 border border-slate-150 rounded-2xl">
                      <p className="text-xs text-slate-400 font-medium">Add at least two separate progress records to view your analytical trend curves.</p>
                    </div>
                  )}
                </div>

                {/* Biometric Stats Lists */}
                <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
                  <div className="p-4 bg-slate-50 border-b border-slate-150">
                    <span className="text-xs font-bold text-slate-600 uppercase">Measurement History Logs</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {progressLogs.slice().reverse().map((log) => (
                      <div key={log.id} className="p-4 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{log.weight} kg</div>
                          <div className="text-xxs text-slate-400 font-mono">{log.date}</div>
                        </div>
                        <div className="flex gap-4 font-mono text-slate-500">
                          <div>
                            <span className="text-xxs text-slate-400 block">BMI</span>
                            <span className="font-bold text-slate-800">{log.bmi}</span>
                          </div>
                          <div>
                            <span className="text-xxs text-slate-400 block">Body Fat</span>
                            <span className="font-bold text-orange-500">{log.bodyFatPercentage}%</span>
                          </div>
                          <div>
                            <span className="text-xxs text-slate-400 block">Muscle</span>
                            <span className="font-bold text-emerald-500">{log.muscleMassPercentage}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* Payments and Invoices */}
        {activeTab === 'billing' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Payments & Receipts</h3>
              <p className="text-xs text-slate-500">Review your past transaction history, and generate printable invoice receipts.</p>
            </div>

            <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600 uppercase">Billing Statement</span>
                <span className="text-xxs text-slate-500">Secure transactions</span>
              </div>

              <div className="divide-y divide-slate-100">
                {payments.length > 0 ? (
                  payments.map((pay) => (
                    <div key={pay.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{pay.planName} Fee</h4>
                          <div className="text-xxs text-slate-500 font-mono mt-0.5">
                            <span>ID: {pay.invoiceNumber}</span>
                            <span className="mx-2">•</span>
                            <span>{pay.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-slate-800">₹{pay.amount}</div>
                          <span className={`px-2 py-0.5 text-xxs font-bold rounded-full ${
                            pay.status === 'completed' 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : pay.status === 'refunded' 
                              ? 'bg-orange-50 text-orange-600' 
                              : 'bg-amber-50 text-amber-600'
                          }`}>
                            {pay.status.toUpperCase()}
                          </span>
                        </div>

                        <button 
                          onClick={() => setShowInvoice(pay)}
                          className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-sm text-slate-400">
                    No billing logs found.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Profile Settings</h3>
              <p className="text-xs text-slate-500">Keep your core contact details, emergency lines, and medical declarations up to date.</p>
            </div>

            <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs">
              
              {profSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold">
                  {profSuccess}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                {/* Physical stats */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Age</label>
                    <input 
                      type="number" 
                      value={profAge}
                      onChange={(e) => setProfAge(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Height (cm)</label>
                    <input 
                      type="number" 
                      value={profHeight}
                      onChange={(e) => setProfHeight(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Gender</label>
                    <select
                      value={profile.gender}
                      disabled
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Core Contacts */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Phone Number</label>
                    <input 
                      type="text" 
                      required
                      value={profPhone}
                      onChange={(e) => setProfPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Home Address</label>
                    <input 
                      type="text" 
                      value={profAddress}
                      onChange={(e) => setProfAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                    />
                  </div>
                </div>

                {/* Emergency Details */}
                <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Emergency Contact</h4>
                  
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1.5">Contact Name</label>
                      <input 
                        type="text" 
                        required
                        value={profEmergencyName}
                        onChange={(e) => setProfEmergencyName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1.5">Relationship</label>
                      <input 
                        type="text" 
                        required
                        value={profEmergencyRel}
                        onChange={(e) => setProfEmergencyRel(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1.5">Contact Phone</label>
                      <input 
                        type="text" 
                        required
                        value={profEmergencyPhone}
                        onChange={(e) => setProfEmergencyPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical constraints declaration */}
                <div>
                  <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Medical Records / Physical Constraints</label>
                  <textarea 
                    rows={3}
                    value={profMedical}
                    onChange={(e) => setProfMedical(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none text-slate-850"
                    placeholder="Declare any chronic muscle/joint problems or restrictions..."
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  Save Profile Settings
                </button>
              </form>

            </div>
          </motion.div>
        )}

        {/* REWARDS HUB TAB */}
        {activeTab === 'rewards' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <span className="text-xxs font-extrabold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full">WALLET BALANCE</span>
                <h3 className="text-4xl font-extrabold tracking-tight mt-2 flex items-center gap-2">
                  <Award className="w-10 h-10 text-yellow-300 fill-yellow-300 animate-pulse" /> {rewardsWallet.balance} <span className="text-lg font-normal text-amber-100">Points</span>
                </h3>
                <p className="text-xs text-amber-100 mt-2">Earn 10 pts per gym attendance, 15 pts per workout log, and hundreds per fitness challenge completion!</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] text-amber-200 uppercase font-mono">Check-In</p>
                  <p className="text-sm font-extrabold">+10 Pts</p>
                </div>
                <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] text-amber-200 uppercase font-mono">Workout</p>
                  <p className="text-sm font-extrabold">+15 Pts</p>
                </div>
                <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] text-amber-200 uppercase font-mono">Challenges</p>
                  <p className="text-sm font-extrabold">Up to +400</p>
                </div>
              </div>
            </div>

            {/* Reward Shop Directory */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Gym Rewards & Merchandise Shop</h3>
                <span className="text-xs text-slate-500 font-mono">Redeem voucher codes or items instantly</span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewardsWallet.shopItems.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <img src={item.image} alt={item.name} className="w-full h-36 object-cover rounded-xl mb-3" referrerPolicy="no-referrer" />
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 uppercase font-mono">
                          {item.category}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Stock: {item.stock} left</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 mb-1">{item.name}</h4>
                      <p className="text-xxs text-slate-500 line-clamp-2 leading-normal mb-4">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <div>
                        <span className="text-xxs text-slate-400 block font-mono">REDEEM FOR</span>
                        <span className="text-sm font-extrabold text-orange-600 font-mono">{item.pointsCost} Pts</span>
                      </div>
                      <button
                        disabled={item.stock <= 0 || rewardsWallet.balance < item.pointsCost}
                        onClick={async () => {
                          try {
                            const res = await api.redeemReward(profile.id, item.id);
                            alert(`Redeemed Successfully! 🎉\nYour unique voucher code is: FITS-REDEEM-${Math.random().toString(36).substr(2, 6).toUpperCase()}\nShow this code to the front desk counter.`);
                            fetchMemberData();
                          } catch (err: any) {
                            alert(err.message || 'Redemption failed');
                          }
                        }}
                        className={`px-4 py-2 rounded-xl text-xxs font-bold transition-all ${
                          item.stock <= 0 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : rewardsWallet.balance < item.pointsCost
                              ? 'bg-orange-50 text-orange-400 hover:bg-orange-100 cursor-not-allowed'
                              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-sm cursor-pointer'
                        }`}
                      >
                        {item.stock <= 0 ? 'Out of Stock' : 'Redeem Item'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-800 mb-4 uppercase tracking-wider">Rewards Wallet History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Description of Activity</th>
                      <th className="py-2 px-3 text-right">Points Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rewardsWallet.transactions.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-slate-400 italic">No rewards transaction history found. Check-in or complete workouts to earn points!</td>
                      </tr>
                    ) : (
                      rewardsWallet.transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50/20">
                          <td className="py-3 px-3 font-mono text-slate-500">{tx.date}</td>
                          <td className="py-3 px-3 font-bold text-slate-700">{tx.reason}</td>
                          <td className={`py-3 px-3 text-right font-extrabold font-mono ${
                            tx.points > 0 ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                            {tx.points > 0 ? `+${tx.points}` : tx.points} Pts
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* FITNESS CHALLENGES TAB */}
        {activeTab === 'challenges' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Leaderboard Section */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">Elite Gym Leaderboard</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {/* 1st, 2nd, 3rd Place Visual Podiums */}
                <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 flex flex-col items-center text-center">
                  <div className="bg-amber-100 text-amber-800 text-xxs font-extrabold px-3 py-1 rounded-full uppercase mb-2">1st Place</div>
                  <h4 className="font-extrabold text-sm text-slate-800">Rohan Malhotra</h4>
                  <p className="text-xs text-amber-700 font-mono font-bold mt-1">4 Challenges Finished</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex flex-col items-center text-center">
                  <div className="bg-slate-200/60 text-slate-800 text-xxs font-extrabold px-3 py-1 rounded-full uppercase mb-2">2nd Place</div>
                  <h4 className="font-extrabold text-sm text-slate-800">Aarav Mehta</h4>
                  <p className="text-xs text-slate-600 font-mono font-bold mt-1">3 Challenges Finished</p>
                </div>
                <div className="bg-amber-50/30 border border-amber-100/50 rounded-2xl p-4 flex flex-col items-center text-center">
                  <div className="bg-amber-100/40 text-amber-850 text-xxs font-extrabold px-3 py-1 rounded-full uppercase mb-2">3rd Place</div>
                  <h4 className="font-extrabold text-sm text-slate-800">Priya Patel</h4>
                  <p className="text-xs text-amber-600 font-mono font-bold mt-1">2 Challenges Finished</p>
                </div>
              </div>
            </div>

            {/* Active challenges directory */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Current Fitness Challenges</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {challenges.map(chal => {
                  const isJoined = chal.participants.includes(profile.id);
                  const progressVal = chal.progress[profile.id] || 0;
                  const pct = chal.targetValue > 0 ? Math.min(Math.round((progressVal / chal.targetValue) * 100), 100) : 0;
                  
                  return (
                    <div key={chal.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase font-mono ${
                            chal.type === 'attendance' ? 'bg-emerald-50 text-emerald-600' :
                            chal.type === 'workout' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {chal.type} Goal
                          </span>
                          <span className="text-xs font-bold text-orange-600 font-mono">+{chal.pointsReward} Pts Reward</span>
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-800 mb-2">{chal.title}</h4>
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">{chal.description}</p>
                        
                        <div className="text-xxs text-slate-400 font-mono space-y-1 mb-4">
                          <p>Start Date: {chal.startDate}</p>
                          <p>End Date: {chal.endDate}</p>
                          <p className="font-bold text-slate-600">Goal: Complete {chal.targetValue} {chal.type === 'attendance' ? 'check-ins' : chal.type === 'workout' ? 'workouts' : 'kg lost'}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-50">
                        {isJoined ? (
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-xxs font-bold mb-1.5">
                                <span className="text-blue-600 font-mono">My Progress: {progressVal} / {chal.targetValue}</span>
                                <span className="text-slate-500">{pct}% Completed</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>

                            {/* Log Progress for joined challenge */}
                            {progressVal < chal.targetValue && (
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  placeholder="Add progress..."
                                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                  id={`log-input-${chal.id}`}
                                />
                                <button
                                  onClick={async () => {
                                    const input = document.getElementById(`log-input-${chal.id}`) as HTMLInputElement;
                                    const val = Number(input?.value);
                                    if (!val || val <= 0) return;
                                    try {
                                      const res = await api.logChallengeProgress(chal.id, profile.id, val);
                                      if (res.completed) {
                                        alert(`CRUSHED IT! 🎉\nYou finished the challenge "${chal.title}" and won ${chal.pointsReward} points!`);
                                      } else {
                                        alert(`Logged progress! Current progress is now ${res.currentProgress}/${chal.targetValue}`);
                                      }
                                      input.value = '';
                                      fetchMemberData();
                                    } catch (err: any) {
                                      alert(err.message || 'Failed to log progress');
                                    }
                                  }}
                                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer"
                                >
                                  Add Log
                                </button>
                              </div>
                            )}
                            
                            {progressVal >= chal.targetValue && (
                              <div className="py-1.5 px-3 bg-emerald-50 text-emerald-600 text-xxs font-bold rounded-xl text-center flex items-center justify-center gap-1">
                                <CheckCircle className="w-4 h-4" /> Challenge Completed!
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                await api.joinChallenge(chal.id, profile.id);
                                alert(`Joined challenge! You received a +20 bonus entry points. Go get it!`);
                                fetchMemberData();
                              } catch (err: any) {
                                alert(err.message || 'Failed to join challenge');
                              }
                            }}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" /> Join Challenge & Play
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* INTERACTIVE CALENDAR TAB */}
        {activeTab === 'scheduler' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-8"
          >
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Weekly Interactive Club Scheduler</h3>
                  <p className="text-xs text-slate-500">Book personal training slots or secure your spot in popular group classes.</p>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xxs font-bold">
                    <span className="w-2 h-2 rounded-full bg-blue-600 block"></span> Group Classes
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xxs font-bold">
                    <span className="w-2 h-2 rounded-full bg-purple-600 block"></span> Personal Training
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xxs font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-600 block"></span> Events
                  </span>
                </div>
              </div>

              {/* Simplified Day grid list for scheduling */}
              <div className="grid sm:grid-cols-7 gap-3 mb-6">
                {[
                  { label: 'Mon', num: '29', dateStr: '2026-06-29' },
                  { label: 'Tue', num: '30', dateStr: '2026-06-30' },
                  { label: 'Wed', num: '01', dateStr: '2026-07-01' },
                  { label: 'Thu', num: '02', dateStr: '2026-07-02' },
                  { label: 'Fri', num: '03', dateStr: '2026-07-03' },
                  { label: 'Sat', num: '04', dateStr: '2026-07-04' },
                  { label: 'Sun', num: '05', dateStr: '2026-07-05' }
                ].map(day => (
                  <div key={day.dateStr} className={`p-3 rounded-2xl border text-center transition-all bg-slate-50 border-slate-100`}>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{day.label}</p>
                    <p className="text-base font-extrabold text-slate-800 mt-1 font-mono">{day.num}</p>
                    <p className="text-[9px] text-slate-500 font-semibold font-mono mt-1">July</p>
                  </div>
                ))}
              </div>

              {/* Scheduled events list */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Today & Upcoming Sessions</h4>
                
                {events.length === 0 ? (
                  <p className="text-slate-400 italic text-xs text-center py-6">No scheduled sessions or club events found.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {events.map(evt => {
                      const isBooked = evt.participants.includes(profile.id);
                      const spotsLeft = evt.maxParticipants - evt.participants.length;
                      
                      return (
                        <div key={evt.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 rounded-xl px-2 transition-all">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase font-mono ${
                                evt.type === 'group_class' ? 'bg-blue-50 text-blue-600' :
                                evt.type === 'personal_training' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {evt.type.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono font-bold">{evt.date} @ {evt.startTime} - {evt.endTime}</span>
                            </div>
                            <h5 className="font-extrabold text-slate-850 text-sm">{evt.title}</h5>
                            <p className="text-xxs text-slate-500">{evt.description}</p>
                            <p className="text-xxs text-slate-400">
                              Coach: <span className="font-bold text-slate-600">{evt.trainerName || 'Club Host'}</span> &bull; Location: <span className="font-bold text-slate-600">{evt.location}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-right">
                              <p className="text-xxs text-slate-400 block font-mono">AVAILABILITY</p>
                              <p className="text-xs font-bold text-slate-700 font-mono">{spotsLeft} of {evt.maxParticipants} slots left</p>
                            </div>

                            {isBooked ? (
                              <button
                                onClick={async () => {
                                  try {
                                    await api.cancelEvent(evt.id, profile.id);
                                    alert('Cancelled your slot booking successfully.');
                                    fetchMemberData();
                                  } catch (err: any) {
                                    alert(err.message || 'Cancellation failed');
                                  }
                                }}
                                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xxs font-bold rounded-xl transition-all border border-red-150 cursor-pointer"
                              >
                                Cancel Slot
                              </button>
                            ) : (
                              <button
                                disabled={spotsLeft <= 0}
                                onClick={async () => {
                                  try {
                                    await api.bookEvent(evt.id, profile.id);
                                    alert('Successfully booked slot! See you there!');
                                    fetchMemberData();
                                  } catch (err: any) {
                                    alert(err.message || 'Booking failed');
                                  }
                                }}
                                className={`px-4 py-2 text-xxs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                                  spotsLeft <= 0 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
                                }`}
                              >
                                {spotsLeft <= 0 ? 'Fully Booked' : 'Book Slot'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* QR Code Scan Simulator Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative border border-slate-100"
          >
            <button 
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-base font-extrabold text-slate-900 mb-2">Simulate QR Check-In</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              In the real gym lobby, point this dynamic QR code towards the front-desk camera to auto-record check-in!
            </p>

            {/* Generated Simulated QR box */}
            <div className="bg-slate-100 p-6 rounded-2xl w-48 h-48 mx-auto mb-6 flex flex-col justify-center items-center border border-slate-200 relative group overflow-hidden shadow-inner">
              {/* Dynamic QR SVG lines simulation */}
              <div className="grid grid-cols-4 gap-2 w-full h-full opacity-80">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className={`rounded-xs ${i % 3 === 0 || i % 5 === 1 ? 'bg-slate-900' : 'bg-transparent'}`}></div>
                ))}
              </div>
              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/5 transition-all"></div>
              <div className="absolute bg-white px-2 py-1 border border-slate-200 text-[10px] font-bold text-slate-700 tracking-wider font-mono rounded shadow-xs">
                {profile.id}
              </div>
            </div>

            <button 
              onClick={handleQRCheckIn}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-1.5"
              id="qr-btn-simulate-confirm"
            >
              <Check className="w-4 h-4" /> Simulate Code Scan Match
            </button>
          </motion.div>
        </div>
      )}

      {/* Invoice Modal Simulator (Printable) */}
      {showInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 font-sans text-slate-850"
          >
            <button 
              onClick={() => setShowInvoice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Invoice Print Layout */}
            <div className="space-y-6 pt-2" id="printable-invoice">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-blue-600 flex items-center gap-1">
                    <Dumbbell className="w-5 h-5" /> FitSync Elite Club
                  </h3>
                  <p className="text-xxs text-slate-400 font-mono mt-0.5">742 Strength Boulevard, NY 10001</p>
                </div>
                <div className="text-right">
                  <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">OFFICIAL RECEIPT</h2>
                  <p className="text-xxs text-slate-500 font-mono mt-1">Invoice #{showInvoice.invoiceNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase text-xxs tracking-wider mb-1">BILLED TO</h4>
                  <p className="font-extrabold text-slate-800">{user.name}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{user.email}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{profile.phone}</p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-slate-400 uppercase text-xxs tracking-wider mb-1">TRANSACTION DETAILS</h4>
                  <p className="text-slate-500 text-[11px]">Payment Date: <span className="font-bold text-slate-700">{showInvoice.date}</span></p>
                  <p className="text-slate-500 text-[11px]">Method: <span className="font-bold text-slate-700">{showInvoice.paymentMethod}</span></p>
                  <p className="text-slate-500 text-[11px]">Status: <span className="font-bold text-emerald-600 uppercase font-mono">{showInvoice.status}</span></p>
                </div>
              </div>

              {/* Items Grid */}
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Duration</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{showInvoice.planName} Membership Subscription</div>
                      <p className="text-xxs text-slate-400">Standard access to elite machines, lockers, yoga and cardio labs.</p>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {currentPlan?.durationMonths || 1} Month(s)
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-800">
                      ₹{showInvoice.amount}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Totals split */}
              <div className="border-t border-slate-200 pt-4 flex justify-end">
                <div className="w-48 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>₹{showInvoice.amount}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Taxes (8%)</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1.5 text-sm font-extrabold text-slate-800">
                    <span>Total Paid</span>
                    <span className="text-blue-600">₹{showInvoice.amount}</span>
                  </div>
                </div>
              </div>

              {/* Print notice */}
              <div className="pt-6 border-t border-slate-150/50 text-center text-xxs text-slate-400 leading-relaxed font-mono">
                Thank you for your business with FitSync Elite Club! <br />
                This is a computer-generated simulated receipt and requires no physical signature.
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
              >
                Print Invoice Receipt
              </button>
              <button 
                onClick={() => setShowInvoice(null)}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

// Simple Helper X close icon for modals
const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

import { useState, useEffect } from 'react';
import { api } from './services/api';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import MemberPanel from './components/MemberPanel';
import TrainerPanel from './components/TrainerPanel';
import AdminPanel from './components/AdminPanel';
import { MembershipPlan, TrainerProfile, MemberProfile, Payment, AttendanceRecord, GymSettings } from './types';
import { RefreshCw, Dumbbell } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'landing' | 'auth' | 'app'>('landing');
  
  // Auth Session state
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // App raw data lists
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [settings, setSettings] = useState<GymSettings | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore persistent session if present
    const savedUser = localStorage.getItem('fitsync_user');
    const savedProfile = localStorage.getItem('fitsync_profile');
    const savedToken = localStorage.getItem('fitsync_token');

    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setToken(savedToken);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
      setView('app');
    }

    // Load initial data
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const fetchedPlans = await api.getPlans();
      setPlans(fetchedPlans);

      const fetchedTrainers = await api.getTrainers();
      setTrainers(fetchedTrainers);

      const fetchedSettings = await api.getSettings();
      setSettings(fetchedSettings);

      // If user is admin or logged in, fetch administrative grids
      const savedUser = localStorage.getItem('fitsync_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'admin') {
          const fetchedMembers = await api.getMembers();
          setMembers(fetchedMembers);

          const fetchedPayments = await api.getPayments();
          setPayments(fetchedPayments);

          const fetchedAttendance = await api.getAttendance();
          setAttendance(fetchedAttendance);
        }
      }

    } catch (err) {
      console.error('Error loading Initial FitSync logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAllData = async () => {
    setLoading(true);
    await loadInitialData();
    setLoading(false);
  };

  const handleAuthSuccess = (authUser: any, authProfile: any, authToken: string) => {
    setUser(authUser);
    setProfile(authProfile);
    setToken(authToken);

    localStorage.setItem('fitsync_user', JSON.stringify(authUser));
    localStorage.setItem('fitsync_token', authToken);
    if (authProfile) {
      localStorage.setItem('fitsync_profile', JSON.stringify(authProfile));
    } else {
      localStorage.removeItem('fitsync_profile');
    }

    setView('app');
    loadInitialData(); // reload datasets with authorized headers
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    localStorage.removeItem('fitsync_user');
    localStorage.removeItem('fitsync_profile');
    localStorage.removeItem('fitsync_token');
    setView('landing');
  };

  if (loading && plans.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="bg-blue-600 p-4 rounded-3xl animate-bounce mb-4 shadow-lg shadow-blue-500/30">
          <Dumbbell className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-sm font-bold tracking-wider uppercase text-blue-400">Loading FitSync Elite</h3>
        <p className="text-xs text-slate-500 mt-1 font-mono">Synchronizing state engines...</p>
      </div>
    );
  }

  // Choose sub-view
  if (view === 'landing') {
    return (
      <LandingPage 
        plans={plans} 
        onGetStarted={() => setView('auth')}
        onLoginClick={() => setView('auth')}
      />
    );
  }

  if (view === 'auth') {
    return (
      <AuthPage 
        plans={plans}
        onAuthSuccess={handleAuthSuccess}
        onBackToLanding={() => setView('landing')}
        api={api}
      />
    );
  }

  // Logged-In panel distribution
  if (view === 'app' && user) {
    if (user.role === 'admin') {
      return (
        <AdminPanel 
          user={user}
          plans={plans}
          trainers={trainers}
          members={members}
          payments={payments}
          attendance={attendance}
          settings={settings || {
            gymName: "FitSync Elite Club",
            contactPhone: "+1 (555) FIT-SYNC",
            contactEmail: "desk@fitsync-elite.com",
            address: "742 Strength Boulevard, NY",
            taxPercentage: 8,
            currency: "₹",
            openingHours: "Mon-Fri: 06:00-22:00, Sat-Sun: 07:00-20:00"
          }}
          api={api}
          onLogout={handleLogout}
          onRefreshAllData={handleRefreshAllData}
        />
      );
    }

    if (user.role === 'trainer' && profile) {
      return (
        <TrainerPanel 
          trainerProfile={profile}
          user={user}
          api={api}
          onLogout={handleLogout}
        />
      );
    }

    if (user.role === 'member' && profile) {
      return (
        <MemberPanel 
          memberProfile={profile}
          user={user}
          plans={plans}
          trainers={trainers}
          api={api}
          onLogout={handleLogout}
        />
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <div className="p-4 bg-red-600/20 border border-red-500 text-red-200 rounded-2xl max-w-sm text-center">
        <h4 className="font-extrabold text-sm uppercase">Session Error</h4>
        <p className="text-xs mt-1">An authentication anomaly was detected. Re-logging to ensure security integrity.</p>
        <button 
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs"
        >
          Reset Session
        </button>
      </div>
    </div>
  );
}

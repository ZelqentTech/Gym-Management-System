import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Dumbbell, Users, CreditCard, Shield, Settings, LogOut, Plus, Trash2, Edit3, 
  Search, Filter, ChevronLeft, ChevronRight, Check, AlertCircle, FileText, 
  Calendar, Award, Trash, ShieldCheck, RefreshCw, Mail, Phone, MapPin, Database, HelpCircle, Menu, X
} from 'lucide-react';
import { MemberProfile, TrainerProfile, MembershipPlan, AttendanceRecord, Payment, GymSettings } from '../types';

interface AdminPanelProps {
  user: any;
  plans: MembershipPlan[];
  trainers: TrainerProfile[];
  members: MemberProfile[];
  payments: Payment[];
  attendance: AttendanceRecord[];
  settings: GymSettings;
  api: any;
  onLogout: () => void;
  onRefreshAllData: () => void;
}

export default function AdminPanel({ user, plans, trainers, members, payments, attendance, settings, api, onLogout, onRefreshAllData }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'members' | 'trainers' | 'plans' | 'attendance' | 'payments' | 'settings'>('analytics');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Local list states for CRUD and Filters
  const [memberList, setMemberList] = useState<MemberProfile[]>(members);
  const [trainerList, setTrainerList] = useState<TrainerProfile[]>(trainers);
  const [planList, setPlanList] = useState<MembershipPlan[]>(plans);
  const [paymentList, setPaymentList] = useState<Payment[]>(payments);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(attendance);
  const [gymSettings, setGymSettings] = useState<GymSettings>(settings);

  // Search & Filter state for Members
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterTrainer, setFilterTrainer] = useState('all');
  const [memberPage, setMemberPage] = useState(1);
  const membersPerPage = 6;

  // Modals & Editors
  const [editingMember, setEditingMember] = useState<MemberProfile | null>(null);
  const [editingTrainer, setEditingTrainer] = useState<TrainerProfile | null>(null);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);

  // New Record Forms State
  const [newMemberForm, setNewMemberForm] = useState({
    name: '', email: '', phone: '', gender: 'Male', age: '25', height: '175', weight: '70',
    address: '', emergencyContact: { name: '', phone: '', relationship: '' },
    membershipPlanId: 'plan-basic', assignedTrainerId: 'trainer-1'
  });

  const [newTrainerForm, setNewTrainerForm] = useState({
    name: '', email: '', phone: '', experience: '5', specialization: 'Strength',
    salary: '3500', availability: 'Full-time', certifications: 'NASM', bio: ''
  });

  const [newPlanForm, setNewPlanForm] = useState({
    id: '', name: '', price: '49', durationMonths: '1', benefits: 'Access to gym floor, locker rooms',
    personalTraining: false, groupClasses: true, dietConsultation: false
  });

  // Settings inputs
  const [setGymName, setSetGymName] = useState(gymSettings.gymName);
  const [setContactPhone, setSetContactPhone] = useState(gymSettings.contactPhone);
  const [setContactEmail, setSetContactEmail] = useState(gymSettings.contactEmail);
  const [setAddress, setSetAddress] = useState(gymSettings.address);
  const [setTax, setSetTax] = useState(String(gymSettings.taxPercentage));
  const [setCurrency, setSetCurrency] = useState(gymSettings.currency);
  const [setHours, setSetHours] = useState(gymSettings.openingHours);

  useEffect(() => {
    setMemberList(members);
    setTrainerList(trainers);
    setPlanList(plans);
    setPaymentList(payments);
    setAttendanceList(attendance);
    setGymSettings(settings);
  }, [members, trainers, plans, payments, attendance, settings]);

  // --- CRUD MEMBERS ---
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        email: newMemberForm.email,
        password: 'member123', // Default demo password
        name: newMemberForm.name,
        role: 'member' as const,
        phone: newMemberForm.phone,
        gender: newMemberForm.gender as any,
        age: Number(newMemberForm.age),
        height: Number(newMemberForm.height),
        weight: Number(newMemberForm.weight),
        address: newMemberForm.address,
        membershipPlanId: newMemberForm.membershipPlanId,
        assignedTrainerId: newMemberForm.assignedTrainerId,
        emergencyContact: newMemberForm.emergencyContact
      };
      
      const res = await api.register(payload);
      alert(`Member profile created successfully! Logins allocated with default password 'member123'.`);
      setShowAddMember(false);
      onRefreshAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to create member');
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      const updated = await api.updateMember(editingMember.id, {
        name: editingMember.name,
        phone: editingMember.phone,
        age: Number(editingMember.age),
        height: Number(editingMember.height),
        weight: Number(editingMember.weight),
        address: editingMember.address,
        membershipPlanId: editingMember.membershipPlanId,
        assignedTrainerId: editingMember.assignedTrainerId,
        emergencyContact: editingMember.emergencyContact,
        status: editingMember.status
      });
      alert('Member information revised.');
      setEditingMember(null);
      onRefreshAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to edit member');
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this member from the database?')) return;
    try {
      await api.deleteMember(id);
      alert('Trainee deleted.');
      onRefreshAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete member');
    }
  };

  // --- CRUD TRAINERS ---
  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        email: newTrainerForm.email,
        password: 'trainer123', // Default
        name: newTrainerForm.name,
        role: 'trainer' as const,
        phone: newTrainerForm.phone,
        experience: Number(newTrainerForm.experience),
        specialization: newTrainerForm.specialization,
        salary: Number(newTrainerForm.salary),
        availability: newTrainerForm.availability as any,
        certifications: newTrainerForm.certifications.split(',').map(c => c.trim()).filter(c => c !== ''),
        bio: newTrainerForm.bio
      };

      await api.register(payload);
      alert(`Trainer account created with password 'trainer123'.`);
      setShowAddTrainer(false);
      onRefreshAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to create trainer');
    }
  };

  const handleUpdateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrainer) return;
    try {
      await api.updateTrainer(editingTrainer.id, {
        name: editingTrainer.name,
        phone: editingTrainer.phone,
        experience: Number(editingTrainer.experience),
        specialization: editingTrainer.specialization,
        salary: Number(editingTrainer.salary),
        availability: editingTrainer.availability,
        certifications: Array.isArray(editingTrainer.certifications) 
          ? editingTrainer.certifications 
          : (editingTrainer.certifications as string).split(',').map(c => c.trim()).filter(c => c !== ''),
        bio: editingTrainer.bio
      });
      alert('Trainer details saved.');
      setEditingTrainer(null);
      onRefreshAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update trainer');
    }
  };

  const handleDeleteTrainer = async (id: string) => {
    if (!confirm('Are you sure you want to remove this certified trainer? All assigned members will remain unassigned.')) return;
    try {
      await api.deleteTrainer(id);
      alert('Trainer removed.');
      onRefreshAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete trainer');
    }
  };

  // --- CRUD PLANS ---
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        id: newPlanForm.id || `plan-${Date.now()}`,
        name: newPlanForm.name,
        price: Number(newPlanForm.price),
        durationMonths: Number(newPlanForm.durationMonths),
        benefits: newPlanForm.benefits.split(',').map(b => b.trim()),
        personalTraining: newPlanForm.personalTraining,
        groupClasses: newPlanForm.groupClasses,
        dietConsultation: newPlanForm.dietConsultation
      };

      await api.createPlan(payload);
      alert('New Membership plan designed.');
      setShowAddPlan(false);
      onRefreshAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to create plan');
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      await api.updatePlan(editingPlan.id, {
        name: editingPlan.name,
        price: Number(editingPlan.price),
        durationMonths: Number(editingPlan.durationMonths),
        benefits: Array.isArray(editingPlan.benefits) 
          ? editingPlan.benefits 
          : (editingPlan.benefits as string).split(',').map(b => b.trim()),
        personalTraining: editingPlan.personalTraining,
        groupClasses: editingPlan.groupClasses,
        dietConsultation: editingPlan.dietConsultation
      });
      alert('Membership plan details saved.');
      setEditingPlan(null);
      onRefreshAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update plan');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to retire this membership tier?')) return;
    try {
      await api.deletePlan(id);
      alert('Plan deleted.');
      onRefreshAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete plan');
    }
  };

  // --- BILLING / REFUND CONTROLS ---
  const handleRefundPayment = async (id: string) => {
    if (!confirm('Issue a direct refund for this payment record? This action is irreversible.')) return;
    try {
      await api.refundPayment(id);
      alert('Refund issued. Member invoice set to Refunded.');
      onRefreshAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to refund payment');
    }
  };

  // --- SYSTEM CONFIG ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        gymName: setGymName,
        contactPhone: setContactPhone,
        contactEmail: setContactEmail,
        address: setAddress,
        taxPercentage: Number(setTax) || 0,
        currency: setCurrency,
        openingHours: setHours
      };

      await api.updateSettings(payload);
      alert('Gym corporate setup guidelines successfully published.');
      onRefreshAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    }
  };

  // --- SEED SYSTEM DB RECOVERY ---
  const handleResetRestoreSeed = async () => {
    if (!confirm('Warning: This will reload all default demographic demo users, payments, and schedules. Continue?')) return;
    try {
      await api.seedDatabase();
      alert('Demo datasets successfully restored to pristine seeding state.');
      onRefreshAllData();
    } catch (err: any) {
      alert('Seeding operation failed: ' + err.message);
    }
  };

  // Manual Check-In Simulator for lobby reception desk
  const [manualCheckInId, setManualCheckInId] = useState('');
  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCheckInId) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toTimeString().split(' ')[0];
      await api.checkIn({
        memberId: manualCheckInId,
        status: 'present',
        method: 'manual',
        date: todayStr,
        checkInTime: timeStr
      });
      alert('Manual Lobby Check-in successfully recorded for today!');
      setManualCheckInId('');
      onRefreshAllData();
    } catch (err: any) {
      alert(err.message || 'Failed manual check-in');
    }
  };

  // Filters for member search
  const filteredMembers = memberList.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) || m.email.toLowerCase().includes(searchMemberQuery.toLowerCase());
    const matchesPlan = filterPlan === 'all' || m.membershipPlanId === filterPlan;
    const matchesTrainer = filterTrainer === 'all' || m.assignedTrainerId === filterTrainer;
    return matchesSearch && matchesPlan && matchesTrainer;
  });

  // Pagination bounds
  const totalMemberPages = Math.ceil(filteredMembers.length / membersPerPage) || 1;
  const paginatedMembers = filteredMembers.slice((memberPage - 1) * membersPerPage, memberPage * membersPerPage);

  // Analytics Metrics
  const activeCount = memberList.filter(m => m.status === 'active').length;
  const totalRevenue = paymentList.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenue = paymentList.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  // Helper exporter for CSV
  const handleExportMembersCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Age', 'Gender', 'Status', 'Plan', 'JoinDate'];
    const rows = filteredMembers.map(m => [
      m.id, m.name, m.email, m.phone, m.age, m.gender, m.status, m.membershipPlanId, m.joinDate
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "FitSync_Members_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">
      
      {/* Sticky Top Bar for Mobile */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white p-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white">FitSync Admin</h1>
            <span className="text-xxs font-bold text-blue-400 tracking-wider uppercase block -mt-0.5">Central Console</span>
          </div>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white transition-all cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
        md:translate-x-0 md:static md:w-64 md:flex md:flex-col md:shadow-xl md:border-r md:border-slate-800
      `}>
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white">FitSync Admin</h1>
                <span className="text-xxs font-bold text-blue-400 tracking-wider uppercase">HQ Central Console</span>
              </div>
            </div>
            {/* Close button inside sidebar on mobile */}
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-4 space-y-1">
            {[
              { id: 'analytics', label: 'Dashboard & Reports', icon: <Calendar className="w-4 h-4" /> },
              { id: 'members', label: 'Member Manager', icon: <Users className="w-4 h-4" /> },
              { id: 'trainers', label: 'Trainer Allocations', icon: <Award className="w-4 h-4" /> },
              { id: 'plans', label: 'Membership Tiers', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'attendance', label: 'Lobby Check-Ins', icon: <Check className="w-4 h-4" /> },
              { id: 'payments', label: 'Financial Statements', icon: <FileText className="w-4 h-4" /> },
              { id: 'settings', label: 'HQ System Config', icon: <Settings className="w-4 h-4" /> }
            ].map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setMemberPage(1); setMobileMenuOpen(false); }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:bg-slate-850 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {/* Diagnostic seed database recovery */}
          <motion.button
            onClick={() => { handleResetRestoreSeed(); setMobileMenuOpen(false); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-blue-400 hover:text-blue-300 text-xxs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-700/50 cursor-pointer"
            id="admin-btn-seed"
          >
            <Database className="w-3.5 h-3.5" /> Restore Seeding Data
          </motion.button>

          <motion.button
            onClick={() => { onLogout(); setMobileMenuOpen(false); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 bg-slate-950 hover:bg-red-950/40 hover:text-red-300 text-slate-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </motion.button>
        </div>
      </aside>

      {/* Main Board Stage */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        
        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 pb-4 border-b border-slate-200/50">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight capitalize">
              Operational Command Hub
            </h2>
            <p className="text-sm text-slate-500">Corporate control panel for member registrations, billing statements, and club analytics.</p>
          </div>

          <div className="flex gap-2.5">
            <button 
              onClick={onRefreshAllData}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Server Logs
            </button>
          </div>
        </header>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            
            {/* Bento statistics grids */}
            <div className="grid sm:grid-cols-4 gap-6">
              
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
                <div className="text-xs font-bold text-slate-400 uppercase">Gross Registered Members</div>
                <div className="text-2xl font-extrabold text-slate-800 mt-2">{memberList.length} Members</div>
                <div className="text-xxs text-emerald-600 font-bold mt-1">● {activeCount} Active subscribers</div>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
                <div className="text-xs font-bold text-slate-400 uppercase">Total Revenue Generated</div>
                <div className="text-2xl font-extrabold text-blue-600 mt-2">₹{totalRevenue}</div>
                <div className="text-xxs text-slate-500 mt-1">Completed invoices cleared</div>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
                <div className="text-xs font-bold text-slate-400 uppercase">Receivable Backlogs</div>
                <div className="text-2xl font-extrabold text-amber-600 mt-2">₹{pendingRevenue}</div>
                <div className="text-xxs text-slate-500 mt-1">Pending payments in queue</div>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
                <div className="text-xs font-bold text-slate-400 uppercase">Lobby Attendance Visits</div>
                <div className="text-2xl font-extrabold text-emerald-600 mt-2">{attendanceList.length} logs</div>
                <div className="text-xxs text-slate-500 mt-1">Dynamic check-ins recorded</div>
              </div>
            </div>

            {/* Analytics visuals: Native SVG Graphs */}
            <div className="grid lg:grid-cols-2 gap-6">
              
              {/* Monthly Revenue Chart */}
              <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">Gross Revenue Growth Statement</h4>
                
                <div className="h-44 w-full bg-slate-50/50 rounded-xl p-2 relative border border-slate-100">
                  <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                    {/* Grid guidelines */}
                    <line x1="0" y1="20" x2="400" y2="20" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3" />
                    <line x1="0" y1="50" x2="400" y2="50" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3" />
                    <line x1="0" y1="80" x2="400" y2="80" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3" />
                    
                    {/* Draw spline line */}
                    <polyline
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                      points="10,85 100,75 200,55 300,45 390,15"
                    />
                    
                    {/* Accent labels */}
                    <circle cx="10" cy="85" r="3" fill="#2563eb" />
                    <circle cx="100" cy="75" r="3" fill="#2563eb" />
                    <circle cx="200" cy="55" r="3" fill="#2563eb" />
                    <circle cx="300" cy="45" r="3" fill="#2563eb" />
                    <circle cx="390" cy="15" r="3" fill="#2563eb" />

                    <text x="15" y="80" fontSize="5" fontWeight="bold" fill="#64748b">₹850</text>
                    <text x="105" y="70" fontSize="5" fontWeight="bold" fill="#64748b">₹1,200</text>
                    <text x="205" y="50" fontSize="5" fontWeight="bold" fill="#64748b">₹1,950</text>
                    <text x="305" y="40" fontSize="5" fontWeight="bold" fill="#64748b">₹2,200</text>
                    <text x="380" y="10" fontSize="5" fontWeight="bold" fill="#2563eb">₹{totalRevenue}</text>
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2 px-1">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May (Current)</span>
                </div>
              </div>

              {/* Peak Attendance Bar Chart */}
              <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">Peak Lobby Attendance Days</h4>
                
                <div className="h-44 w-full bg-slate-50/50 rounded-xl p-4 flex items-end justify-between border border-slate-100">
                  {[
                    { day: 'Mon', count: 12, height: '70%' },
                    { day: 'Tue', count: 18, height: '90%' },
                    { day: 'Wed', count: 15, height: '80%' },
                    { day: 'Thu', count: 10, height: '55%' },
                    { day: 'Fri', count: 14, height: '75%' },
                    { day: 'Sat', count: 8, height: '40%' },
                    { day: 'Sun', count: 5, height: '25%' }
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-[10px] font-bold text-slate-500 font-mono">{bar.count}</span>
                      <div className="w-6 bg-emerald-500 rounded-t-lg transition-all" style={{ height: bar.height }}></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Members CRUD Tab */}
        {activeTab === 'members' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xxs">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchMemberQuery}
                  onChange={(e) => { setSearchMemberQuery(e.target.value); setMemberPage(1); }}
                  placeholder="Search members by name or email..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handleExportMembersCSV}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" /> Export CSV Report
                </button>
                <button 
                  onClick={() => setShowAddMember(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-100"
                  id="admin-btn-add-member"
                >
                  <Plus className="w-4 h-4" /> Add Gym Member
                </button>
              </div>
            </div>

            {/* Members table */}
            <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                  <tr>
                    <th className="py-3 px-4">Trainee Name</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Membership Level</th>
                    <th className="py-3 px-4">Assigned Coach</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedMembers.length > 0 ? (
                    paginatedMembers.map(m => {
                      const p = plans.find(plan => plan.id === m.membershipPlanId);
                      const t = trainers.find(coach => coach.id === m.assignedTrainerId);
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/50">
                          <td className="py-4 px-4 font-bold flex items-center gap-3">
                            <img src={m.profilePhoto} className="w-9 h-9 rounded-full object-cover border border-slate-100" />
                            <div>
                              <div className="text-slate-800">{m.name}</div>
                              <div className="text-xxs text-slate-400 font-mono">{m.email}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono text-slate-600">{m.phone}</td>
                          <td className="py-4 px-4 font-bold text-slate-700">{p?.name || 'Basic'}</td>
                          <td className="py-4 px-4 font-medium text-slate-600">{t?.name || 'Unassigned'}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-0.5 text-xxs font-bold rounded-full ${
                              m.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {m.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-center items-center gap-1.5">
                              <button 
                                onClick={() => setEditingMember(m)}
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-md"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteMember(m.id)}
                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-md"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No members match search filter standards.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination controls */}
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-between items-center text-xs">
                <span className="text-slate-500">Showing page {memberPage} of {totalMemberPages}</span>
                <div className="flex gap-1.5">
                  <button 
                    disabled={memberPage === 1}
                    onClick={() => setMemberPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    disabled={memberPage === totalMemberPages}
                    onClick={() => setMemberPage(prev => Math.min(totalMemberPages, prev + 1))}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Trainers CRUD Tab */}
        {activeTab === 'trainers' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-xxs">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Certified Coaching Staff</h3>
                <span className="text-xxs text-slate-400 font-medium">Coordinate payroll schedules and availability constraints.</span>
              </div>
              <button 
                onClick={() => setShowAddTrainer(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-100"
              >
                <Plus className="w-4 h-4" /> Add Certified Trainer
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainerList.map(t => (
                <div key={t.id} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex gap-3 items-center border-b border-slate-50 pb-3">
                      <img src={t.photo} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{t.name}</h4>
                        <span className="text-xxs text-slate-400 font-mono">{t.email}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <p className="text-slate-600">Specialty: <span className="font-bold text-slate-800">{t.specialization}</span></p>
                      <p className="text-slate-600">Salary Package: <span className="font-bold text-blue-600">₹{t.salary}/mo</span></p>
                      <p className="text-slate-600">Certificates: <span className="text-xxs font-bold text-emerald-600 font-mono">{t.certifications.join(', ')}</span></p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-50 mt-4">
                    <button 
                      onClick={() => setEditingTrainer(t)}
                      className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xxs font-bold rounded-lg border border-slate-200"
                    >
                      Modify Settings
                    </button>
                    <button 
                      onClick={() => handleDeleteTrainer(t.id)}
                      className="px-2 py-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Plans CRUD Tab */}
        {activeTab === 'plans' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-xxs">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Gym Membership Plans</h3>
                <span className="text-xxs text-slate-400 font-medium">Design active subscription programs and pricing models.</span>
              </div>
              <button 
                onClick={() => setShowAddPlan(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-100"
              >
                <Plus className="w-4 h-4" /> Add Membership Tier
              </button>
            </div>

            <div className="grid sm:grid-cols-4 gap-6">
              {planList.map(plan => (
                <div key={plan.id} className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-800">{plan.name}</h4>
                    <p className="text-xxs text-slate-400 font-mono">{plan.id}</p>
                    
                    <div className="my-4">
                      <span className="text-3xl font-extrabold text-blue-600">₹{plan.price}</span>
                      <span className="text-slate-400 text-xs">/mo</span>
                    </div>

                    <p className="text-xxs text-slate-500 font-medium leading-relaxed border-t pt-3 mb-4">
                      {Array.isArray(plan.benefits) ? plan.benefits.join(', ') : plan.benefits}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingPlan(plan)}
                      className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xxs font-bold border border-slate-200 rounded-lg"
                    >
                      Edit Pricing
                    </button>
                    <button 
                      onClick={() => handleDeletePlan(plan.id)}
                      className="px-2.5 py-1.5 text-slate-400 hover:text-red-500 border border-slate-200 rounded-lg hover:bg-red-50/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Lobby Check-Ins Tab */}
        {activeTab === 'attendance' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            
            {/* Manual checkin bar */}
            <div className="grid md:grid-cols-3 gap-6">
              
              <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs">
                <h4 className="text-xs font-bold text-slate-600 uppercase mb-4 tracking-wider">Lobby Manual Desk Check-In</h4>
                <form onSubmit={handleManualCheckIn} className="space-y-3">
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 mb-1">Select Member</label>
                    <select 
                      value={manualCheckInId}
                      onChange={(e) => setManualCheckInId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="">-- Choose Member --</option>
                      {memberList.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    disabled={!manualCheckInId}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-100 transition-all"
                  >
                    Confirm Member Visit
                  </button>
                </form>
              </div>

              {/* Attendance Log history */}
              <div className="md:col-span-2 bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b border-slate-150">
                  <span className="text-xs font-bold text-slate-600 uppercase">Today's Lobby Check-In Logs</span>
                </div>

                <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                  {attendanceList.length > 0 ? (
                    attendanceList.slice().reverse().map(att => {
                      const m = memberList.find(member => member.id === att.memberId);
                      return (
                        <div key={att.id} className="p-3.5 flex justify-between items-center text-xs">
                          <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <div>
                              <div className="font-bold text-slate-800">{m?.name || 'Unknown Member'}</div>
                              <span className="text-xxs text-slate-400 font-mono">{att.memberId}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 font-mono text-slate-500 text-xxs">
                            <span>Method: <strong className="text-slate-700">{att.method.toUpperCase()}</strong></span>
                            <span>Date: <strong className="text-slate-700">{att.date}</strong></span>
                            <span>Time: <strong className="text-blue-600">{att.checkInTime}</strong></span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-12 text-center text-slate-400 text-xs">No attendance recorded in this cycle.</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payments / Financial Tab */}
        {activeTab === 'payments' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <h3 className="text-xl font-extrabold text-slate-900">Gym Financial Transactions</h3>
            <p className="text-xs text-slate-500">Track paid subscriptions, clear backlogs, and trigger customer refund settlements.</p>

            <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-150">
                <span className="text-xs font-bold text-slate-600 uppercase">Payments Statement Register</span>
              </div>

              <div className="divide-y divide-slate-100">
                {paymentList.length > 0 ? (
                  paymentList.map(pay => {
                    const m = memberList.find(member => member.id === pay.memberId);
                    return (
                      <div key={pay.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-50 p-2.5 rounded-xl text-slate-500 border border-slate-100">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-850">
                              {m?.name || 'Unknown Member'} • <span className="font-semibold text-slate-500">{pay.planName} Subscription</span>
                            </div>
                            <div className="text-xxs text-slate-400 font-mono mt-0.5">
                              Invoice: {pay.invoiceNumber} • {pay.date} • Method: {pay.paymentMethod}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono">
                          <span className="font-extrabold text-sm text-slate-800">₹{pay.amount}</span>
                          <span className={`px-2 py-0.5 text-xxs font-bold rounded-full ${
                            pay.status === 'completed' 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : pay.status === 'refunded' 
                              ? 'bg-orange-50 text-orange-600' 
                              : 'bg-amber-50 text-amber-600'
                          }`}>
                            {pay.status.toUpperCase()}
                          </span>

                          {pay.status === 'completed' && (
                            <button 
                              onClick={() => handleRefundPayment(pay.id)}
                              className="px-2 py-1 text-xxs font-bold text-orange-600 bg-orange-50/50 hover:bg-orange-100 border border-orange-200 rounded-lg"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-12 text-center text-slate-400 text-xs">No transactions documented.</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Gym System configuration Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <h3 className="text-xl font-extrabold text-slate-900">Gym Operational Guidelines Settings</h3>
            <p className="text-xs text-slate-500">Configure global metadata variables such as tax brackets, currency formats, and corporate address paths.</p>

            <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Gym Club Name</label>
                    <input type="text" value={setGymName} onChange={(e) => setSetGymName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Lobby Phone Contact</label>
                    <input type="text" value={setContactPhone} onChange={(e) => setSetContactPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Customer Support Email</label>
                    <input type="email" value={setContactEmail} onChange={(e) => setSetContactEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Hours of opening</label>
                    <input type="text" value={setHours} onChange={(e) => setSetHours(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Corporate Address</label>
                    <input type="text" value={setAddress} onChange={(e) => setSetAddress(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Currency Format</label>
                    <input type="text" value={setCurrency} onChange={(e) => setSetCurrency(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Vat / Taxes (Percentage)</label>
                    <input type="number" value={setTax} onChange={(e) => setSetTax(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Save Corporate setup Guidelines
                </button>
              </form>
            </div>
          </motion.div>
        )}

      </main>

      {/* MODAL: ADD MEMBER */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Add Member Profile</h3>
            <form onSubmit={handleCreateMember} className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Full Name</label>
                  <input type="text" required value={newMemberForm.name} onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block mb-1">Email</label>
                  <input type="email" required value={newMemberForm.email} onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block mb-1">Age</label>
                  <input type="number" required value={newMemberForm.age} onChange={(e) => setNewMemberForm({ ...newMemberForm, age: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block mb-1">Height (cm)</label>
                  <input type="number" required value={newMemberForm.height} onChange={(e) => setNewMemberForm({ ...newMemberForm, height: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block mb-1">Weight (kg)</label>
                  <input type="number" required value={newMemberForm.weight} onChange={(e) => setNewMemberForm({ ...newMemberForm, weight: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Select Membership Plan</label>
                  <select value={newMemberForm.membershipPlanId} onChange={(e) => setNewMemberForm({ ...newMemberForm, membershipPlanId: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Select Coach Assigned</label>
                  <select value={newMemberForm.assignedTrainerId} onChange={(e) => setNewMemberForm({ ...newMemberForm, assignedTrainerId: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Phone Number</label>
                  <input type="text" required value={newMemberForm.phone} onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block mb-1">Address</label>
                  <input type="text" required value={newMemberForm.address} onChange={(e) => setNewMemberForm({ ...newMemberForm, address: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Publish Member</button>
                <button type="button" onClick={() => setShowAddMember(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* EDIT MEMBER MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-850">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Edit Member Profile</h3>
            <form onSubmit={handleUpdateMember} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1">Full Name</label>
                <input type="text" required value={editingMember.name} onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Phone</label>
                  <input type="text" required value={editingMember.phone} onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block mb-1">Status</label>
                  <select value={editingMember.status} onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as any })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg">Save Changes</button>
                <button type="button" onClick={() => setEditingMember(null)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: ADD TRAINER */}
      {showAddTrainer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Add Trainer Account</h3>
            <form onSubmit={handleCreateTrainer} className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Full Name</label>
                  <input type="text" required value={newTrainerForm.name} onChange={(e) => setNewTrainerForm({ ...newTrainerForm, name: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block mb-1">Email</label>
                  <input type="email" required value={newTrainerForm.email} onChange={(e) => setNewTrainerForm({ ...newTrainerForm, email: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Specialization</label>
                  <input type="text" required value={newTrainerForm.specialization} onChange={(e) => setNewTrainerForm({ ...newTrainerForm, specialization: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block mb-1">Salary Package (₹)</label>
                  <input type="number" required value={newTrainerForm.salary} onChange={(e) => setNewTrainerForm({ ...newTrainerForm, salary: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg">Register Coach</button>
                <button type="button" onClick={() => setShowAddTrainer(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* EDIT TRAINER MODAL */}
      {editingTrainer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-850">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Edit Trainer Credentials</h3>
            <form onSubmit={handleUpdateTrainer} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1">Full Name</label>
                <input type="text" required value={editingTrainer.name} onChange={(e) => setEditingTrainer({ ...editingTrainer, name: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Specialization</label>
                  <input type="text" required value={editingTrainer.specialization} onChange={(e) => setEditingTrainer({ ...editingTrainer, specialization: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block mb-1">Salary Package (₹)</label>
                  <input type="number" required value={editingTrainer.salary} onChange={(e) => setEditingTrainer({ ...editingTrainer, salary: Number(e.target.value) })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg">Save Settings</button>
                <button type="button" onClick={() => setEditingTrainer(null)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: ADD PLAN */}
      {showAddPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-slate-850">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Add Membership tier</h3>
            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs text-slate-700">
              <div>
                <label className="block mb-1">Unique Plan ID (e.g. plan-family)</label>
                <input type="text" required value={newPlanForm.id} onChange={(e) => setNewPlanForm({ ...newPlanForm, id: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block mb-1">Plan Name</label>
                <input type="text" required value={newPlanForm.name} onChange={(e) => setNewPlanForm({ ...newPlanForm, name: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Price (₹/mo)</label>
                  <input type="number" required value={newPlanForm.price} onChange={(e) => setNewPlanForm({ ...newPlanForm, price: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block mb-1">Duration (Months)</label>
                  <input type="number" required value={newPlanForm.durationMonths} onChange={(e) => setNewPlanForm({ ...newPlanForm, durationMonths: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block mb-1">Inclusions / Benefits (Comma separated)</label>
                <input type="text" required value={newPlanForm.benefits} onChange={(e) => setNewPlanForm({ ...newPlanForm, benefits: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg">Publish Tier</button>
                <button type="button" onClick={() => setShowAddPlan(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-slate-850">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Edit Membership tier</h3>
            <form onSubmit={handleUpdatePlan} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1">Plan Name</label>
                <input type="text" required value={editingPlan.name} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Price (₹/mo)</label>
                  <input type="number" required value={editingPlan.price} onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block mb-1">Duration (Months)</label>
                  <input type="number" required value={editingPlan.durationMonths} onChange={(e) => setEditingPlan({ ...editingPlan, durationMonths: Number(e.target.value) })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg">Save Settings</button>
                <button type="button" onClick={() => setEditingPlan(null)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MemberProfile, TrainerProfile, MembershipPlan, WorkoutPlan, DietPlan, ProgressLog, FitnessChallenge, CalendarEvent } from '../types';
import { 
  Dumbbell, Users, Clipboard, Apple, TrendingUp, Settings, LogOut, Plus, Trash2, 
  CheckCircle, Flame, Star, Sparkles, Scale, RefreshCw, Send, ArrowRight, User, Phone, MapPin,
  Calendar, Award, Clock, Menu, X
} from 'lucide-react';

interface TrainerPanelProps {
  trainerProfile: TrainerProfile;
  user: any;
  api: any;
  onLogout: () => void;
}

export default function TrainerPanel({ trainerProfile, user, api, onLogout }: TrainerPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'workouts' | 'diets' | 'profile' | 'challenges' | 'scheduler'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data States
  const [profile, setProfile] = useState<TrainerProfile>(trainerProfile);
  const [members, setMembers] = useState<any[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [challenges, setChallenges] = useState<FitnessChallenge[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Challenge Builder Form State
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [chalTitle, setChalTitle] = useState('');
  const [chalDesc, setChalDesc] = useState('');
  const [chalType, setChalType] = useState<'attendance' | 'workout' | 'milestone'>('workout');
  const [chalTarget, setChalTarget] = useState('10');
  const [chalReward, setChalReward] = useState('150');
  const [chalStart, setChalStart] = useState('2026-07-01');
  const [chalEnd, setChalEnd] = useState('2026-07-31');

  // Scheduler Form State
  const [showEventForm, setShowEventForm] = useState(false);
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtType, setEvtType] = useState<'group_class' | 'personal_training' | 'gym_event'>('group_class');
  const [evtDate, setEvtDate] = useState('2026-07-02');
  const [evtStart, setEvtStart] = useState('09:00');
  const [evtEnd, setEvtEnd] = useState('10:00');
  const [evtMax, setEvtMax] = useState('15');
  const [evtLoc, setEvtLoc] = useState('Yoga Lab A');
  
  // UI & Selection States
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [memberLogs, setMemberLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiWorking, setAiWorking] = useState(false);

  // Profile Inputs
  const [trainerPhone, setTrainerPhone] = useState(profile.phone);
  const [trainerExp, setTrainerExp] = useState(String(profile.experience));
  const [trainerSpecialty, setTrainerSpecialty] = useState(profile.specialization);
  const [trainerBio, setTrainerBio] = useState(profile.bio);
  const [trainerCerts, setTrainerCerts] = useState(profile.certifications.join(', '));
  const [profSuccess, setProfSuccess] = useState('');

  // Workout Builder Fields
  const [workoutGoal, setWorkoutGoal] = useState('Build lean muscle and core stability');
  const [workoutCategory, setWorkoutCategory] = useState<'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Cardio' | 'Full Body'>('Full Body');
  const [exerciseList, setExerciseList] = useState<any[]>([
    { name: 'Barbell Bench Press', category: 'Chest', sets: 4, reps: '10-12', notes: 'Squeeze pecs at peak extension' },
    { name: 'Lat Pulldown', category: 'Back', sets: 3, reps: '12', notes: 'Keep posture straight, activate lats' }
  ]);
  const [tempExName, setTempExName] = useState('');
  const [tempExCat, setTempExCat] = useState<'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Cardio' | 'Full Body'>('Full Body');
  const [tempExSets, setTempExSets] = useState('3');
  const [tempExReps, setTempExReps] = useState('10');
  const [tempExWeight, setTempExWeight] = useState('');
  const [tempExNotes, setTempExNotes] = useState('');

  // Diet Builder Fields
  const [dietGoal, setDietGoal] = useState('Fat loss and lean preservation');
  const [dietType, setDietType] = useState('Standard Balanced');
  const [mealsList, setMealsList] = useState<any[]>([
    { name: 'Breakfast', description: 'Egg whites with oatmeal and berries', calories: 400, protein: 30, carbs: 45, fat: 8 },
    { name: 'Lunch', description: 'Baked Turkey breast with quinoa and broccoli', calories: 450, protein: 42, carbs: 40, fat: 10 }
  ]);
  const [targetCalories, setTargetCalories] = useState('1800');
  const [targetProtein, setTargetProtein] = useState('140');
  const [targetCarbs, setTargetCarbs] = useState('160');
  const [targetFat, setTargetFat] = useState('50');
  const [waterTarget, setWaterTarget] = useState('3.0');
  const [supplementsText, setSupplementsText] = useState('Whey Isolate, Creatine, Multivitamin');

  // Meal inputs
  const [tempMealName, setTempMealName] = useState('Breakfast');
  const [tempMealDesc, setTempMealDesc] = useState('');
  const [tempMealCal, setTempMealCal] = useState('300');
  const [tempMealPro, setTempMealPro] = useState('25');
  const [tempMealCarb, setTempMealCarb] = useState('30');
  const [tempMealFat, setTempMealFat] = useState('8');

  useEffect(() => {
    fetchTrainerData();
  }, []);

  const fetchTrainerData = async () => {
    setLoading(true);
    try {
      // 1. Fetch assigned members
      const allMembers = await api.getMembers();
      const myMembers = allMembers.filter((m: any) => m.assignedTrainerId === profile.id);
      setMembers(myMembers);

      // Select first member by default
      if (myMembers.length > 0 && !selectedMember) {
        setSelectedMember(myMembers[0]);
        const logs = await api.getProgress(myMembers[0].id);
        setMemberLogs(logs);
      }

      // 2. Fetch workout plans
      const allWorkouts = await api.getWorkouts();
      setWorkoutPlans(allWorkouts);

      // 3. Fetch diet plans
      const allDiets = await api.getDiets();
      setDietPlans(allDiets);

    } catch (err) {
      console.error('Error fetching trainer stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = async (member: any) => {
    setSelectedMember(member);
    setLoading(true);
    try {
      const logs = await api.getProgress(member.id);
      setMemberLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- WORKOUT BUILDER UTILS ---
  const handleAddExercise = () => {
    if (!tempExName) return;
    const newEx = {
      id: `ex-${Date.now()}`,
      name: tempExName,
      category: tempExCat,
      sets: Number(tempExSets) || 3,
      reps: tempExReps || '10',
      weight: tempExWeight || undefined,
      notes: tempExNotes || undefined
    };
    setExerciseList([...exerciseList, newEx]);
    setTempExName('');
    setTempExWeight('');
    setTempExNotes('');
  };

  const handleRemoveExercise = (idx: number) => {
    setExerciseList(exerciseList.filter((_, i) => i !== idx));
  };

  // AI Workout Recommender
  const handleAIWorkoutRecommend = async () => {
    if (!selectedMember) return;
    setAiWorking(true);
    try {
      const data = {
        age: selectedMember.age,
        gender: selectedMember.gender,
        weight: selectedMember.weight,
        height: selectedMember.height,
        goal: workoutGoal,
        category: workoutCategory
      };
      
      const res = await api.recommendWorkout(data);
      if (res && res.exercises) {
        setExerciseList(res.exercises);
      }
    } catch (err) {
      console.error('Error fetching AI workouts:', err);
      alert('AI Workout Builder is busy. Falling back to default coaching splits.');
    } finally {
      setAiWorking(false);
    }
  };

  const handlePublishWorkout = async () => {
    if (!selectedMember || exerciseList.length === 0) return;
    try {
      await api.assignWorkout({
        memberId: selectedMember.id,
        exercises: exerciseList,
        assignedBy: `Coach ${user.name}`
      });
      alert('Workout Plan successfully compiled and assigned to ' + selectedMember.name);
      fetchTrainerData();
    } catch (err: any) {
      alert(err.message || 'Failed to publish workout');
    }
  };

  // --- DIET BUILDER UTILS ---
  const handleAddMeal = () => {
    if (!tempMealDesc) return;
    const newMeal = {
      name: tempMealName,
      description: tempMealDesc,
      calories: Number(tempMealCal) || 300,
      protein: Number(tempMealPro) || 20,
      carbs: Number(tempMealCarb) || 30,
      fat: Number(tempMealFat) || 8
    };
    setMealsList([...mealsList, newMeal]);
    setTempMealDesc('');
  };

  const handleRemoveMeal = (idx: number) => {
    setMealsList(mealsList.filter((_, i) => i !== idx));
  };

  // AI Diet Recommender
  const handleAIDietRecommend = async () => {
    if (!selectedMember) return;
    setAiWorking(true);
    try {
      const data = {
        age: selectedMember.age,
        gender: selectedMember.gender,
        weight: selectedMember.weight,
        height: selectedMember.height,
        goal: dietGoal,
        dietType: dietType
      };

      const res = await api.recommendDiet(data);
      if (res) {
        setMealsList(res.meals || []);
        setTargetCalories(String(res.targetCalories));
        setTargetProtein(String(res.targetProtein));
        setTargetCarbs(String(res.targetCarbs));
        setTargetFat(String(res.targetFat));
        setWaterTarget(String(res.waterIntakeLiters));
        if (res.supplements) {
          setSupplementsText(res.supplements.join(', '));
        }
      }
    } catch (err) {
      console.error('Error fetching AI diet recommendations:', err);
      alert('AI nutrition system is busy. Re-routing to offline proactive balance guide.');
    } finally {
      setAiWorking(false);
    }
  };

  const handlePublishDiet = async () => {
    if (!selectedMember || mealsList.length === 0) return;
    try {
      const supps = supplementsText.split(',').map(s => s.trim()).filter(s => s !== '');
      await api.assignDiet({
        memberId: selectedMember.id,
        meals: mealsList,
        targetCalories: Number(targetCalories),
        targetProtein: Number(targetProtein),
        targetCarbs: Number(targetCarbs),
        targetFat: Number(targetFat),
        waterIntakeLiters: Number(waterTarget),
        supplements: supps,
        assignedBy: `Coach ${user.name}`
      });
      alert('Macro nutritional menu successfully published and assigned to ' + selectedMember.name);
      fetchTrainerData();
    } catch (err: any) {
      alert(err.message || 'Failed to publish diet');
    }
  };

  const handleUpdateTrainerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        phone: trainerPhone,
        experience: Number(trainerExp),
        specialization: trainerSpecialty,
        bio: trainerBio,
        certifications: trainerCerts.split(',').map(c => c.trim()).filter(c => c !== '')
      };

      const updated = await api.updateTrainer(profile.id, payload);
      setProfile(updated);
      setProfSuccess('Your professional profile settings have been updated.');
      setTimeout(() => setProfSuccess(''), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
      
      {/* Sticky Top Bar for Mobile */}
      <div className="md:hidden flex items-center justify-between bg-slate-950 text-white p-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
            <Clipboard className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white">FitSync Trainer</h1>
            <span className="text-xxs font-bold text-emerald-400 tracking-wider uppercase block -mt-0.5">Coach Panel</span>
          </div>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="p-1.5 rounded-lg bg-slate-900 text-slate-200 hover:text-white transition-all cursor-pointer"
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
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white flex flex-col justify-between shrink-0 shadow-2xl border-r border-slate-900 transition-transform duration-300 ease-in-out transform
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:w-64 md:flex md:flex-col md:shadow-xl md:border-r md:border-slate-900
      `}>
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-500 p-2 rounded-xl text-white">
                <Clipboard className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white">FitSync Trainer</h1>
                <span className="text-xxs font-bold text-emerald-400 tracking-wider uppercase">Coach Workspace</span>
              </div>
            </div>
            {/* Close button inside sidebar on mobile */}
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Trainer Mini profile badge */}
          <div className="p-5 border-b border-slate-900 flex items-center gap-3 bg-slate-900/40">
            <img 
              src={profile.photo} 
              alt={user.name} 
              className="w-10 h-10 rounded-full object-cover border border-slate-800" 
            />
            <div className="overflow-hidden">
              <h3 className="font-bold text-xs text-white truncate">{user.name}</h3>
              <p className="text-slate-400 text-xxs truncate font-mono">{user.email}</p>
            </div>
          </div>

          {/* Nav list */}
          <nav className="p-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Overview Dashboard', icon: <Users className="w-4 h-4" /> },
              { id: 'members', label: 'Assigned Trainees', icon: <User className="w-4 h-4" /> },
              { id: 'workouts', label: 'Workout Plan Builder', icon: <Dumbbell className="w-4 h-4" /> },
              { id: 'diets', label: 'Meal Plan Creator', icon: <Apple className="w-4 h-4" /> },
              { id: 'challenges', label: 'Fitness Challenges', icon: <Flame className="w-4 h-4" /> },
              { id: 'scheduler', label: 'Class Scheduler', icon: <Calendar className="w-4 h-4" /> },
              { id: 'profile', label: 'My Credentials', icon: <Settings className="w-4 h-4" /> }
            ].map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setMobileMenuOpen(false); }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40' 
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Footer Log out */}
        <div className="p-4 border-t border-slate-900 space-y-2">
          <motion.button
            onClick={() => { onLogout(); setMobileMenuOpen(false); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 bg-slate-900 hover:bg-red-950/40 hover:text-red-300 text-slate-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </motion.button>
        </div>
      </aside>

      {/* Workspace Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        
        {/* Top Header info */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/50">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Hello Coach {user.name.split(' ')[0]}!
            </h2>
            <p className="text-sm text-slate-500">Formulate precise workout loads and macro diet plans. Keep your clients calibrated.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100">
              Assigned Athletes: {members.length}
            </span>
          </div>
        </header>

        {/* Dashboard tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Bento Quickstats */}
            <div className="grid sm:grid-cols-3 gap-6">
              
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase">Trainees active</span>
                  <Users className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-2xl font-extrabold text-slate-800">{members.length} Members</div>
                <p className="text-xxs text-slate-500 mt-1">Requiring active routines</p>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase">Workout Routines</span>
                  <Dumbbell className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-2xl font-extrabold text-slate-800">
                  {workoutPlans.filter(wp => wp.assignedBy.includes(user.name)).length} Active
                </div>
                <p className="text-xxs text-slate-500 mt-1">Assigned strength plans</p>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase">Nutrition Guides</span>
                  <Apple className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-2xl font-extrabold text-slate-800">
                  {dietPlans.filter(dp => dp.assignedBy.includes(user.name)).length} Active
                </div>
                <p className="text-xxs text-slate-500 mt-1">Assigned dietary split grids</p>
              </div>
            </div>

            {/* Trainee rapid selector */}
            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-1.5">
                <Users className="w-5 h-5 text-emerald-600" /> Trainee Diagnostics & Logs
              </h3>

              {members.length > 0 ? (
                <div className="grid lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Trainee selection card list */}
                  <div className="space-y-2 border-r border-slate-100 pr-4">
                    {members.map(m => (
                      <div 
                        key={m.id}
                        onClick={() => handleSelectMember(m)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          selectedMember?.id === m.id 
                            ? 'bg-emerald-50 border-emerald-250' 
                            : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <img 
                          src={m.profilePhoto} 
                          alt={m.name} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                        />
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-xs text-slate-800 truncate">{m.name}</h4>
                          <span className="text-xxs text-slate-400 font-mono block">BMI: {(m.weight / ((m.height / 100) * (m.height / 100))).toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Active diagnostics details */}
                  {selectedMember && (
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex gap-4 items-center border-b border-slate-100 pb-3">
                        <img 
                          src={selectedMember.profilePhoto} 
                          alt={selectedMember.name} 
                          className="w-12 h-12 rounded-full object-cover border border-slate-200" 
                        />
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">{selectedMember.name}</h4>
                          <span className="text-xxs text-slate-500 font-medium">Joined on {selectedMember.joinDate} • Age {selectedMember.age}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-xxs text-slate-400 uppercase tracking-wide font-bold">Biometrics Specs</span>
                          <p className="text-slate-700 font-bold">Height: <span className="font-semibold text-slate-800">{selectedMember.height} cm</span></p>
                          <p className="text-slate-700 font-bold">Weight: <span className="font-semibold text-slate-800">{selectedMember.weight} kg</span></p>
                          <p className="text-slate-700 font-bold">Gender: <span className="font-semibold text-slate-800">{selectedMember.gender}</span></p>
                        </div>
                        <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-xxs text-slate-400 uppercase tracking-wide font-bold">Contact Coordinates</span>
                          <p className="text-slate-700 font-medium">Mobile: <span className="font-mono text-slate-800 font-bold text-[11px]">{selectedMember.phone}</span></p>
                          <p className="text-slate-700 font-medium truncate">Address: <span className="font-sans text-slate-800 font-semibold text-[11px]">{selectedMember.address}</span></p>
                          <p className="text-slate-700 font-medium">Status: <span className="text-emerald-600 font-bold">ACTIVE</span></p>
                        </div>
                      </div>

                      {/* Display progress list brief */}
                      <div className="space-y-2">
                        <h5 className="text-xxs font-extrabold text-slate-400 uppercase tracking-wide">Historical Weight curve Logs</h5>
                        {memberLogs.length > 0 ? (
                          <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-xl border border-slate-100">
                            {memberLogs.slice(-3).map(log => (
                              <div key={log.id} className="p-3.5 flex justify-between items-center text-xs font-mono">
                                <span className="text-slate-500">{log.date}</span>
                                <span className="font-bold text-slate-700">{log.weight} kg</span>
                                <span className="text-xxs text-blue-600 font-bold">BMI: {log.bmi}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xxs text-slate-400">Trainee hasn't logged physical progress recently.</p>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-sm text-slate-500 font-medium">No members assigned to your workspace profile.</p>
                  <p className="text-xs text-slate-400 mt-1">Please ask gym administrators to allocate active members.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Assigned Trainees tabular overview */}
        {activeTab === 'members' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <h3 className="text-xl font-extrabold text-slate-900">Assigned Trainees List</h3>
            <p className="text-xs text-slate-500">Inspect trainee contact coordinate detail tables, medical issues, and emergencies.</p>

            <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                  <tr>
                    <th className="py-3 px-4">Trainee Name</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Biometrics</th>
                    <th className="py-3 px-4">Medical Declarations</th>
                    <th className="py-3 px-4">Emergency Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/40">
                      <td className="py-4 px-4 font-bold flex items-center gap-3">
                        <img src={m.profilePhoto} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="text-slate-800">{m.name}</div>
                          <div className="text-xxs text-slate-400 font-mono">{m.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-600">{m.phone}</td>
                      <td className="py-4 px-4 font-semibold text-slate-600">
                        Age {m.age} • {m.height}cm • {m.weight}kg
                      </td>
                      <td className="py-4 px-4 text-slate-500 italic max-w-xs truncate">
                        {m.medicalInfo || 'None Declared'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-700">{m.emergencyContact.name} ({m.emergencyContact.relationship})</div>
                        <div className="text-xxs font-mono text-slate-500">{m.emergencyContact.phone}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Workout Plan Builder */}
        {activeTab === 'workouts' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Workout Plan Compiler</h3>
                <p className="text-xs text-slate-500">Draft strength & metabolic routines, or invoke Gemini AI to generate custom splits.</p>
              </div>

              {/* Client Selection */}
              <select 
                value={selectedMember?.id || ''}
                onChange={(e) => {
                  const m = members.find(item => item.id === e.target.value);
                  if (m) handleSelectMember(m);
                }}
                className="px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs font-bold focus:outline-none"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>Assign To: {m.name}</option>
                ))}
              </select>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Form Config & AI Trigger */}
              <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs space-y-4 h-fit">
                <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
                  <h4 className="text-xs font-extrabold text-blue-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 animate-spin text-orange-500" /> Gemini AI Coach Assist
                  </h4>
                  <p className="text-xxs text-slate-600 leading-relaxed">
                    Instantly load professional workouts balanced specifically for age, gender, and muscle weights from the Gemini AI model.
                  </p>
                  
                  <div className="space-y-2 pt-2">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Workout Goal</label>
                      <input 
                        type="text"
                        value={workoutGoal}
                        onChange={(e) => setWorkoutGoal(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Target Split Category</label>
                      <select 
                        value={workoutCategory}
                        onChange={(e) => setWorkoutCategory(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                      >
                        <option value="Chest">Chest Focus</option>
                        <option value="Back">Back Focus</option>
                        <option value="Legs">Legs Focus</option>
                        <option value="Shoulders">Shoulder Focus</option>
                        <option value="Arms">Arm Focus</option>
                        <option value="Cardio">Cardio / Endurance</option>
                        <option value="Full Body">Full Body Split</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      disabled={aiWorking}
                      onClick={handleAIWorkoutRecommend}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-650 text-white font-bold rounded-lg text-xxs transition-all shadow-md flex justify-center items-center gap-1.5"
                    >
                      {aiWorking ? 'Consulting Gemini AI...' : '⚡ Generate Custom AI Splints'}
                    </button>
                  </div>
                </div>

                {/* Manual Add Exercise form */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Manual Add Exercise</h4>
                  
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 mb-1">Exercise Name</label>
                    <input 
                      type="text" 
                      value={tempExName} 
                      onChange={(e) => setTempExName(e.target.value)}
                      placeholder="e.g. Incline Bench press" 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 mb-1">Category</label>
                      <select 
                        value={tempExCat}
                        onChange={(e) => setTempExCat(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold"
                      >
                        <option value="Chest">Chest</option>
                        <option value="Back">Back</option>
                        <option value="Legs">Legs</option>
                        <option value="Shoulders">Shoulders</option>
                        <option value="Arms">Arms</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Full Body">Full Body</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 mb-1">Weight load</label>
                      <input 
                        type="text" 
                        value={tempExWeight} 
                        onChange={(e) => setTempExWeight(e.target.value)}
                        placeholder="e.g. 50kg" 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 mb-1">Sets count</label>
                      <input 
                        type="number" 
                        value={tempExSets} 
                        onChange={(e) => setTempExSets(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 mb-1">Reps config</label>
                      <input 
                        type="text" 
                        value={tempExReps} 
                        onChange={(e) => setTempExReps(e.target.value)}
                        placeholder="e.g. 12-10-8" 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-slate-500 mb-1">Form Instructions / Notes</label>
                    <input 
                      type="text" 
                      value={tempExNotes} 
                      onChange={(e) => setTempExNotes(e.target.value)}
                      placeholder="e.g. Strict form, pull slow" 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <button 
                    type="button"
                    onClick={handleAddExercise}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                  >
                    + Add to Program Queue
                  </button>
                </div>
              </div>

              {/* Exercises Queue & Publisher */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
                  <div className="p-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600 uppercase">Routines Queue for {selectedMember?.name}</span>
                    <span className="text-xxs font-bold text-blue-600">{exerciseList.length} Items</span>
                  </div>

                  <div className="divide-y divide-slate-100 min-h-[250px]">
                    {exerciseList.length > 0 ? (
                      exerciseList.map((ex, idx) => (
                        <div key={idx} className="p-4 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-slate-800">{ex.name}</div>
                            <div className="text-xxs text-slate-500 mt-0.5">
                              <span className="font-semibold text-blue-600 mr-2">{ex.category}</span>
                              <span>{ex.sets} sets × {ex.reps} reps</span>
                              {ex.weight && <span className="ml-2 bg-slate-100 px-1 rounded">{ex.weight}</span>}
                            </div>
                            {ex.notes && <p className="text-xxs text-slate-400 italic mt-1">Form: {ex.notes}</p>}
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveExercise(idx)}
                            className="p-1.5 text-slate-300 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center text-slate-400 text-sm">
                        No exercises compiled in this queue. Use manual forms or click the AI split generator above.
                      </div>
                    )}
                  </div>
                </div>

                {exerciseList.length > 0 && (
                  <button 
                    type="button"
                    onClick={handlePublishWorkout}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex justify-center items-center gap-1.5"
                    id="trainer-publish-workout"
                  >
                    <Send className="w-4 h-4" /> Publish Program to {selectedMember?.name}
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* Diet Plan Creator */}
        {activeTab === 'diets' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Custom Meal Plan Creator</h3>
                <p className="text-xs text-slate-500">Formulate macro target meal allocations and supplements checklist for athletes.</p>
              </div>

              <select 
                value={selectedMember?.id || ''}
                onChange={(e) => {
                  const m = members.find(item => item.id === e.target.value);
                  if (m) handleSelectMember(m);
                }}
                className="px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs font-bold focus:outline-none"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>Assign To: {m.name}</option>
                ))}
              </select>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Form Config & AI Diet Trigger */}
              <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs space-y-4 h-fit">
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
                  <h4 className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 animate-spin text-orange-500" /> Gemini AI Nutritionist
                  </h4>
                  <p className="text-xxs text-slate-600 leading-relaxed">
                    Instantly load macro diet limits, recipes, water quotas, and supplement guidance using sports science standards.
                  </p>
                  
                  <div className="space-y-2 pt-2">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Target Dietary Objective</label>
                      <input 
                        type="text"
                        value={dietGoal}
                        onChange={(e) => setDietGoal(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Dietary Focus Style</label>
                      <select 
                        value={dietType}
                        onChange={(e) => setDietType(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-semibold"
                      >
                        <option value="Keto / High Protein">Keto / High Protein</option>
                        <option value="High Carb / Mass Gain">High Carb / Mass Gain</option>
                        <option value="Mediterranean Diet">Mediterranean Diet</option>
                        <option value="Vegan Balanced">Vegan Balanced</option>
                        <option value="Standard Balanced">Standard Balanced</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      disabled={aiWorking}
                      onClick={handleAIDietRecommend}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-650 text-white font-bold rounded-lg text-xxs transition-all shadow-md flex justify-center items-center gap-1.5"
                    >
                      {aiWorking ? 'Nutritionist is building...' : '🥑 Generate Custom AI Macro Menu'}
                    </button>
                  </div>
                </div>

                {/* Macro splits target inputs */}
                <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Configure Nutrient Goals</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 mb-1">Calories (kcal)</label>
                      <input type="number" value={targetCalories} onChange={(e) => setTargetCalories(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 mb-1">Water quota (L)</label>
                      <input type="number" step="0.1" value={waterTarget} onChange={(e) => setWaterTarget(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 mb-1">Protein (g)</label>
                      <input type="number" value={targetProtein} onChange={(e) => setTargetProtein(e.target.value)} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center" />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 mb-1">Carb (g)</label>
                      <input type="number" value={targetCarbs} onChange={(e) => setTargetCarbs(e.target.value)} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center" />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 mb-1">Fat (g)</label>
                      <input type="number" value={targetFat} onChange={(e) => setTargetFat(e.target.value)} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-slate-500 mb-1">Supplements checklist (Comma separated)</label>
                    <input type="text" value={supplementsText} onChange={(e) => setSupplementsText(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Meals Queue & Diet Publisher */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Add Meal form inline */}
                <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Add Meal to Menu</h4>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <select value={tempMealName} onChange={(e) => setTempMealName(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Snack">Snack</option>
                      <option value="Dinner">Dinner</option>
                    </select>
                    
                    <input 
                      type="text" 
                      value={tempMealDesc} 
                      onChange={(e) => setTempMealDesc(e.target.value)}
                      placeholder="e.g. Oats with protein" 
                      className="sm:col-span-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={handleAddMeal} className="py-2 px-6 bg-slate-150 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">
                      + Add Meal
                    </button>
                  </div>
                </div>

                {/* Meals list */}
                <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
                  <div className="p-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600 uppercase">Meals compiled for {selectedMember?.name}</span>
                    <span className="text-xxs font-bold text-emerald-600">{mealsList.length} Meals</span>
                  </div>

                  <div className="divide-y divide-slate-100 min-h-[180px]">
                    {mealsList.length > 0 ? (
                      mealsList.map((meal, idx) => (
                        <div key={idx} className="p-4 flex justify-between items-center text-xs">
                          <div>
                            <span className="px-1.5 py-0.5 bg-slate-100 font-extrabold text-xxs rounded text-slate-700 uppercase tracking-wide">{meal.name}</span>
                            <p className="font-bold text-slate-800 mt-1">{meal.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-slate-500 font-bold bg-slate-50 px-2 py-1 rounded">{meal.calories} kcal</span>
                            <button type="button" onClick={() => handleRemoveMeal(idx)} className="p-1 text-slate-300 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center text-slate-400 text-sm">
                        No meals compiled yet. Consult the AI Nutritionist above or build one manually.
                      </div>
                    )}
                  </div>
                </div>

                {mealsList.length > 0 && (
                  <button 
                    type="button"
                    onClick={handlePublishDiet}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex justify-center items-center gap-1.5"
                    id="trainer-publish-diet"
                  >
                    <Send className="w-4 h-4" /> Publish Macro Menu to {selectedMember?.name}
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* Credentials Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Coach Credentials</h3>
              <p className="text-xs text-slate-500">Showcase your certified athletic certifications, coaching history, and specializations.</p>
            </div>

            <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs">
              
              {profSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold">
                  {profSuccess}
                </div>
              )}

              <form onSubmit={handleUpdateTrainerProfile} className="space-y-6">
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Coach Contact Mobile</label>
                    <input 
                      type="text" 
                      required
                      value={trainerPhone}
                      onChange={(e) => setTrainerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Years of experience</label>
                    <input 
                      type="number" 
                      required
                      value={trainerExp}
                      onChange={(e) => setTrainerExp(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Primary Specialization</label>
                    <input 
                      type="text" 
                      required
                      value={trainerSpecialty}
                      onChange={(e) => setTrainerSpecialty(e.target.value)}
                      placeholder="e.g. Strength & Conditioning"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Certifications (Comma separated)</label>
                    <input 
                      type="text" 
                      required
                      value={trainerCerts}
                      onChange={(e) => setTrainerCerts(e.target.value)}
                      placeholder="e.g. NASM-PES, ACE CPT, FMS-1"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xxs font-bold text-slate-400 uppercase mb-1.5">Professional Bio</label>
                  <textarea 
                    rows={4}
                    value={trainerBio}
                    onChange={(e) => setTrainerBio(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    placeholder="Describe your coaching philosophy, athletic history..."
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  Save Professional Credentials
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* FITNESS CHALLENGES TAB */}
        {activeTab === 'challenges' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Fitness Challenges Manager</h3>
                <p className="text-xs text-slate-500">Launch club-wide or private competitive fitness goals with points incentives.</p>
              </div>
              <button
                onClick={() => setShowChallengeForm(!showChallengeForm)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {showChallengeForm ? 'View Challenges' : 'Create New Challenge'}
              </button>
            </div>

            {showChallengeForm ? (
              <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-800">New Goal Incentive Details</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1">Challenge Title</label>
                    <input
                      type="text"
                      placeholder="e.g. July Squat Sensation"
                      value={chalTitle}
                      onChange={(e) => setChalTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1">Incentive Goal Type</label>
                    <select
                      value={chalType}
                      onChange={(e: any) => setChalType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    >
                      <option value="workout">Workout Session Completions</option>
                      <option value="attendance">Gym Check-In Frequency</option>
                      <option value="milestone">Custom Athletic Milestones</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xxs font-bold text-slate-400 uppercase mb-1">Description & Guidelines</label>
                  <textarea
                    rows={2}
                    placeholder="Briefly detail what participants have to log to claim this reward..."
                    value={chalDesc}
                    onChange={(e) => setChalDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  ></textarea>
                </div>

                <div className="grid sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1">Target Value</label>
                    <input
                      type="number"
                      value={chalTarget}
                      onChange={(e) => setChalTarget(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1">Reward (Points)</label>
                    <input
                      type="number"
                      value={chalReward}
                      onChange={(e) => setChalReward(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1">Start Date</label>
                    <input
                      type="date"
                      value={chalStart}
                      onChange={(e) => setChalStart(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1">End Date</label>
                    <input
                      type="date"
                      value={chalEnd}
                      onChange={(e) => setChalEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (!chalTitle || !chalDesc) return;
                    try {
                      await api.createChallenge({
                        title: chalTitle,
                        description: chalDesc,
                        type: chalType,
                        targetValue: chalTarget,
                        startDate: chalStart,
                        endDate: chalEnd,
                        pointsReward: chalReward,
                        createdBy: profile.id
                      });
                      alert('Fitness Challenge created and announced successfully! 📢');
                      setChalTitle('');
                      setChalDesc('');
                      setShowChallengeForm(false);
                      fetchTrainerData();
                    } catch (err: any) {
                      alert(err.message || 'Creation failed');
                    }
                  }}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  Announce Challenge
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {challenges.map(chal => (
                  <div key={chal.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold uppercase text-[9px] font-mono">
                        {chal.type}
                      </span>
                      <span className="text-xs font-bold text-orange-600 font-mono">+{chal.pointsReward} Pts Goal</span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-800">{chal.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{chal.description}</p>

                    <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-2 text-xxs font-mono text-slate-500">
                      <p>Active Players: <span className="font-bold text-slate-800">{chal.participants.length}</span></p>
                      <p>Target: <span className="font-bold text-slate-800">{chal.targetValue} units</span></p>
                      <p>Start: <span className="font-bold text-slate-800">{chal.startDate}</span></p>
                      <p>End: <span className="font-bold text-slate-800">{chal.endDate}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* CLASS SCHEDULER TAB */}
        {activeTab === 'scheduler' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Weekly Trainer Class Scheduler</h3>
                <p className="text-xs text-slate-500">Schedule daily high-intensity interval group sessions, yoga clinics, or custom personal slots.</p>
              </div>
              <button
                onClick={() => setShowEventForm(!showEventForm)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {showEventForm ? 'View Schedule' : 'Schedule New Session'}
              </button>
            </div>

            {showEventForm ? (
              <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-800">New Calendar Event Details</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1">Event / Class Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Iron Core Pilates Session"
                      value={evtTitle}
                      onChange={(e) => setEvtTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1">Class Type Category</label>
                    <select
                      value={evtType}
                      onChange={(e: any) => setEvtType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    >
                      <option value="group_class">Group Fitness Class</option>
                      <option value="personal_training">1-on-1 Personal Coaching Slot</option>
                      <option value="gym_event">Special Club/Gym Event</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xxs font-bold text-slate-400 uppercase mb-1">Short Description</label>
                  <input
                    type="text"
                    placeholder="Enter quick notes for members booking this spot..."
                    value={evtDesc}
                    onChange={(e) => setEvtDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div className="grid sm:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1">Date</label>
                    <input
                      type="date"
                      value={evtDate}
                      onChange={(e) => setEvtDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1">Start Time</label>
                    <input
                      type="time"
                      value={evtStart}
                      onChange={(e) => setEvtStart(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1">End Time</label>
                    <input
                      type="time"
                      value={evtEnd}
                      onChange={(e) => setEvtEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1">Max Bookings</label>
                    <input
                      type="number"
                      value={evtMax}
                      onChange={(e) => setEvtMax(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase mb-1">Location</label>
                    <input
                      type="text"
                      value={evtLoc}
                      onChange={(e) => setEvtLoc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (!evtTitle) return;
                    try {
                      await api.createEvent({
                        title: evtTitle,
                        description: evtDesc,
                        type: evtType,
                        date: evtDate,
                        startTime: evtStart,
                        endTime: evtEnd,
                        maxParticipants: evtMax,
                        location: evtLoc,
                        trainerId: profile.id,
                        trainerName: user.name
                      });
                      alert('Session scheduled successfully on the member calendar! 📅');
                      setEvtTitle('');
                      setEvtDesc('');
                      setShowEventForm(false);
                      fetchTrainerData();
                    } catch (err: any) {
                      alert(err.message || 'Scheduling failed');
                    }
                  }}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  Announce & Open Bookings
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">My Booked Slots & Scheduled Events</h4>
                
                <div className="divide-y divide-slate-100">
                  {events.filter(e => e.trainerId === profile.id).length === 0 ? (
                    <p className="text-center py-6 text-slate-400 italic text-xs">No scheduled events registered on your name yet.</p>
                  ) : (
                    events.filter(e => e.trainerId === profile.id).map(evt => (
                      <div key={evt.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold uppercase text-[9px] font-mono">
                              {evt.type.replace('_', ' ')}
                            </span>
                            <span className="text-xxs font-mono text-slate-400">{evt.date} @ {evt.startTime} - {evt.endTime}</span>
                          </div>
                          <h5 className="font-extrabold text-slate-800 text-sm">{evt.title}</h5>
                          <p className="text-xxs text-slate-400">Location: {evt.location} &bull; Max capacity: {evt.maxParticipants} players</p>
                        </div>

                        <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 text-right">
                          <span className="text-xxs text-slate-400 uppercase font-mono block">Registered Bookings</span>
                          <span className="text-sm font-extrabold text-slate-800 font-mono">
                            {evt.participants.length} / {evt.maxParticipants} slots booked
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

      </main>

    </div>
  );
}

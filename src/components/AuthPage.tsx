import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Mail, Lock, User, Phone, MapPin, Sparkles, Shield, UserCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { MembershipPlan } from '../types';

interface AuthPageProps {
  plans: MembershipPlan[];
  onAuthSuccess: (user: any, profile: any, token: string) => void;
  onBackToLanding: () => void;
  api: any;
}

export default function AuthPage({ plans, onAuthSuccess, onBackToLanding, api }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Login Fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registration Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'member' | 'trainer'>('member');
  const [regPhone, setRegPhone] = useState('');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regAge, setRegAge] = useState('25');
  const [regHeight, setRegHeight] = useState('175');
  const [regWeight, setRegWeight] = useState('70');
  const [regAddress, setRegAddress] = useState('');
  const [regPlan, setRegPlan] = useState('plan-basic');

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick login demo credentials
  const demoAccounts = [
    { name: "Alexander (Admin)", email: "admin@fitsync.com", pass: "admin123", icon: <Shield className="w-3.5 h-3.5 text-blue-500" />, role: "admin" },
    { name: "Marcus (Trainer)", email: "trainer1@fitsync.com", pass: "trainer123", icon: <UserCheck className="w-3.5 h-3.5 text-emerald-500" />, role: "trainer" },
    { name: "John (Premium Member)", email: "member1@fitsync.com", pass: "member123", icon: <User className="w-3.5 h-3.5 text-orange-500" />, role: "member" },
    { name: "Jane (Premium Member)", email: "member2@fitsync.com", pass: "member123", icon: <User className="w-3.5 h-3.5 text-purple-500" />, role: "member" }
  ];

  const handleDemoLogin = async (email: string, pass: string) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.login({ email, password: pass });
      onAuthSuccess(res.user, res.profile, res.token);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        // Forgot password workflow
        const res = await api.forgotPassword(loginEmail);
        setMessage(res.message);
        setTimeout(() => {
          setIsForgotPassword(false);
          setMessage('');
        }, 3000);
      } else if (isLogin) {
        // Login workflow
        const res = await api.login({ email: loginEmail, password: loginPassword });
        onAuthSuccess(res.user, res.profile, res.token);
      } else {
        // Register workflow
        const payload = {
          email: regEmail,
          password: regPassword,
          name: regName,
          role: regRole,
          phone: regPhone,
          gender: regGender,
          age: Number(regAge),
          height: Number(regHeight),
          weight: Number(regWeight),
          address: regAddress,
          membershipPlanId: regRole === 'member' ? regPlan : undefined
        };
        const res = await api.register(payload);
        onAuthSuccess(res.user, res.profile, res.token);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication operation failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Visual background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="absolute top-6 left-6">
        <button 
          onClick={onBackToLanding}
          className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-semibold py-2 px-3 bg-slate-800/60 border border-slate-700/50 rounded-xl transition-all"
          id="btn-back-landing"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          {isForgotPassword ? 'Reset Your Password' : isLogin ? 'Sign In to FitSync' : 'Create FitSync Account'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          {isForgotPassword ? (
            <span onClick={() => setIsForgotPassword(false)} className="cursor-pointer text-blue-400 hover:underline">Back to Login</span>
          ) : isLogin ? (
            <span>
              Or{' '}
              <button onClick={() => setIsLogin(false)} className="font-semibold text-blue-400 hover:underline">
                create a new member account
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button onClick={() => setIsLogin(true)} className="font-semibold text-blue-400 hover:underline">
                Sign In instead
              </button>
            </span>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md md:max-w-xl relative z-10">
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          
          {/* Quick Demo Login Panel */}
          {isLogin && !isForgotPassword && (
            <div className="mb-6 p-4 bg-slate-850 border border-slate-700/80 rounded-xl">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> One-Click Demo Access
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoLogin(acc.email, acc.pass)}
                    className="flex items-center gap-2 p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/30 text-left rounded-lg text-xs font-semibold text-slate-200 transition-all hover:border-blue-500/40"
                    id={`demo-login-${acc.role}-${idx}`}
                  >
                    {acc.icon}
                    <div className="truncate">
                      <div>{acc.name}</div>
                      <div className="text-xxs text-slate-400 font-normal truncate">{acc.email}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3.5 bg-red-900/40 border border-red-700 text-red-200 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3.5 bg-emerald-950/40 border border-emerald-700 text-emerald-200 rounded-xl text-sm font-semibold">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* REGISTER FLUID ADDITIONAL FIELDS */}
            {!isLogin && !isForgotPassword && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Are you joining as a:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('member')}
                      className={`py-2.5 rounded-xl font-bold border transition-all text-xs ${
                        regRole === 'member' 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-slate-700/40 border-slate-650 text-slate-300'
                      }`}
                    >
                      Gym Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('trainer')}
                      className={`py-2.5 rounded-xl font-bold border transition-all text-xs ${
                        regRole === 'trainer' 
                          ? 'bg-emerald-600 border-emerald-500 text-white' 
                          : 'bg-slate-700/40 border-slate-650 text-slate-300'
                      }`}
                    >
                      Personal Trainer
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SHARED EMAIL FIELD */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={isLogin ? loginEmail : regEmail}
                  onChange={(e) => isLogin ? setLoginEmail(e.target.value) : setRegEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                />
              </div>
            </div>

            {/* SHARED PASSWORD FIELD */}
            {!isForgotPassword && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                  {isLogin && (
                    <button 
                      type="button"
                      onClick={() => setIsForgotPassword(true)} 
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={isLogin ? loginPassword : regPassword}
                    onChange={(e) => isLogin ? setLoginPassword(e.target.value) : setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* MEMBER SIGN-UP DETAILED FORMS */}
            {!isLogin && !isForgotPassword && (
              <div className="space-y-4 pt-2 border-t border-slate-700/30">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Age</label>
                    <input
                      type="number"
                      value={regAge}
                      onChange={(e) => setRegAge(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={regHeight}
                      onChange={(e) => setRegHeight(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={regWeight}
                      onChange={(e) => setRegWeight(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                    />
                  </div>
                </div>

                {regRole === 'member' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Select Membership Plan</label>
                    <select
                      value={regPlan}
                      onChange={(e) => setRegPlan(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                    >
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (₹{p.price}/mo)</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Home Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="123 Gym Lane, City"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-650 text-white font-bold rounded-xl transition-all shadow-md flex justify-center items-center gap-1.5 text-sm"
              >
                {loading ? 'Processing...' : isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

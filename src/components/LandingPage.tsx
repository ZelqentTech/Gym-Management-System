import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Dumbbell, Shield, Users, Trophy, ChevronDown, Check, 
  Mail, Phone, MapPin, Menu, X, ArrowRight, Star, HelpCircle 
} from 'lucide-react';
import { MembershipPlan } from '../types';

interface LandingPageProps {
  plans: MembershipPlan[];
  onGetStarted: () => void;
  onLoginClick: () => void;
}

export default function LandingPage({ plans, onGetStarted, onLoginClick }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

  const features = [
    { icon: <Dumbbell className="w-6 h-6 text-blue-600" />, title: "Elite Equipment", desc: "Premium hammer strength machines, Olympic barbells, and 100+ cardio systems." },
    { icon: <Shield className="w-6 h-6 text-emerald-500" />, title: "Expert Coaching", desc: "1-on-1 personal training, biomechanical coaching, and precise posture correction." },
    { icon: <Users className="w-6 h-6 text-orange-500" />, title: "Community Classes", desc: "High-intensity metabolic conditioning, power yoga, and spinning workshops daily." },
    { icon: <Trophy className="w-6 h-6 text-blue-600" />, title: "Result Tracking", desc: "Interactive body composition audits, customized workout grids, and diet planners." }
  ];

  const trainers = [
    {
      name: "Marcus Steel",
      role: "Head Coach, Strength & Power",
      certs: "CSCS, NASM-PES, 8+ Years Exp",
      desc: "Specialist in high-performance conditioning, Olympic weightlifting, and sports performance.",
      img: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300&h=350&fit=crop"
    },
    {
      name: "Sarah Jenkins",
      role: "Yoga & Functional Mobility Lead",
      certs: "RYT-500 Yoga, FMS-1, 6+ Years Exp",
      desc: "Dedicated to holistic biomechanics, flow training, core strength, and injury rehabilitation.",
      img: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=300&h=350&fit=crop"
    }
  ];

  const testimonials = [
    { name: "Jessica Carter", role: "Elite Member", comment: "The custom diet and workout recommendations from FitSync completely changed my routine. I lost 8kg and built real, durable strength!", stars: 5 },
    { name: "Robert Miller", role: "Athlete", comment: "Having my trainer update my charts and check-ins via QR is incredibly smooth. The equipment here is absolute top tier.", stars: 5 }
  ];

  const faqs = [
    { q: "What are your opening hours?", a: "FitSync is open Monday to Friday from 06:00 to 22:00, and Saturday to Sunday from 07:00 to 20:00." },
    { q: "Can I switch my membership plan later?", a: "Absolutely! You can upgrade or downgrade your plan directly from the dashboard or by contacting support at any time." },
    { q: "Do you offer physical personal training?", a: "Yes! Our Premium and VIP plans include direct, 1-on-1 coaching and assessments with our certified coaches." },
    { q: "What is your QR Check-In system?", a: "When you join, you receive a dynamic QR code on your member dashboard. Simply scan it at the front desk tablet to automatically log your attendance!" }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      setContactSuccess(true);
      setTimeout(() => setContactSuccess(false), 4000);
      setContactForm({ name: '', email: '', message: '' });
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-100 shadow-sm" id="landing-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Dumbbell className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-xl font-bold tracking-tight text-blue-600">FitSync</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">About</a>
              <a href="#features" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Membership Plans</a>
              <a href="#trainers" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Our Trainers</a>
              <a href="#contact" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Contact</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={onLoginClick} 
                className="text-slate-700 hover:text-blue-600 font-semibold px-4 py-2 transition-colors"
                id="btn-login"
              >
                Sign In
              </button>
              <button 
                onClick={onGetStarted} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md shadow-blue-100 flex items-center gap-1.5"
                id="btn-signup"
              >
                Join Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="text-slate-700 hover:text-blue-600 p-1"
                id="btn-mobile-toggle"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-4 space-y-2 shadow-lg"
          >
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600">About</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600">Features</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600">Membership Plans</a>
            <a href="#trainers" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600">Our Trainers</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600">Contact</a>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button onClick={() => { onLoginClick(); setMobileMenuOpen(false); }} className="w-full text-center py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 rounded-md">Sign In</button>
              <button onClick={() => { onGetStarted(); setMobileMenuOpen(false); }} className="w-full text-center py-2.5 bg-blue-600 text-white rounded-md text-base font-semibold">Join Now</button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white py-24 md:py-32 overflow-hidden" id="hero-section">
        {/* Absolute Background image overlay */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1920&fit=crop" 
            alt="Gym background" 
            className="w-full h-full object-cover object-center scale-105 filter blur-xs"
          />
        </div>
        {/* Diagonal accents */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wider uppercase">
                <Trophy className="w-3.5 h-3.5" /> High Performance Gym
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Sync Your <span className="text-blue-500">Mind</span>,<br />
                Power Your <span className="text-emerald-400">Body</span>.
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                Join FitSync Elite Club. Experience premium training, real-time progress diagnostics, and customized AI-assisted diet and workout programs tailored to your anatomy.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={onGetStarted} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/30 flex items-center gap-2"
                  id="btn-hero-join"
                >
                  Start Your Journey <ArrowRight className="w-5 h-5" />
                </button>
                <a 
                  href="#pricing" 
                  className="bg-white/10 hover:bg-white/15 border border-white/20 text-white px-6 py-4 rounded-xl font-bold transition-all"
                >
                  View Membership Plans
                </a>
              </div>
              
              {/* Quick statistics badge */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-md">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-blue-400">1,500+</div>
                  <div className="text-xs text-slate-400">Active Members</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-400">12+</div>
                  <div className="text-xs text-slate-400">Certified Coaches</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-orange-400">99.2%</div>
                  <div className="text-xs text-slate-400">Success Rate</div>
                </div>
              </div>
            </motion.div>

            {/* Immersive Front Showcase Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.8 }}
              className="relative lg:ml-12"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900">
                <img 
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&fit=crop" 
                  alt="Athlete lifting weights" 
                  className="w-full h-[450px] object-cover filter brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                
                {/* Floating Glassmorphic Coach Assessment badge */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4">
                  <div className="bg-emerald-500 text-white p-2.5 rounded-lg">
                    <Dumbbell className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">AI-Driven Fitness Coaching</h3>
                    <p className="text-xs text-slate-300">Generate personal workout regimens based on your biometrics instantly.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            >
              <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">ABOUT OUR SANCTUARY</div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                Where Elite Science Meets Personal Fitness
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  At FitSync Elite Club, we believe that fitness is a deliberate discipline, not a random exercise. Founded in 2018, we have evolved from a local strength club to a cutting-edge athletic development club.
                </p>
                <p>
                  Our ecosystem synchronizes certified trainer programs, biometric logs, manual attendance check-ins, and dynamic progress trackers into a unified hub. Plus, with our advanced AI integration, members receive hyper-customized workout suggestions based on real anatomical constraints.
                </p>
              </div>
              <div className="pt-6 flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-slate-700">Premium Spa Rooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-slate-700">Nutrition Juice Bar</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.65, ease: "easeOut", delay: 0.15 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-4">
                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&fit=crop" alt="Gym weights" className="rounded-xl shadow-md w-full h-48 object-cover" />
                <img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=400&fit=crop" alt="Treadmills" className="rounded-xl shadow-md w-full h-64 object-cover" />
              </div>
              <div className="space-y-4 pt-8">
                <img src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=400&fit=crop" alt="Bench press" className="rounded-xl shadow-md w-full h-64 object-cover" />
                <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400&fit=crop" alt="Stretching" className="rounded-xl shadow-md w-full h-48 object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-100" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Engineered For Athletic Progression
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Discover a suite of elite systems constructed to optimize your athletic capabilities and keep you connected.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feat, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300"
                id={`feature-card-${idx}`}
              >
                <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="py-20 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">PRICING PLANS</div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Choose Your Level of Performance
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Choose an access plan that fits your personal schedule. Upgrade or downgrade any time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {plans.map((plan, idx) => {
              const isPremium = plan.id === 'plan-premium' || plan.id === 'plan-vip';
              return (
                <motion.div 
                  key={plan.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className={`relative rounded-2xl p-6 border flex flex-col justify-between transition-all duration-300 ${
                    isPremium 
                      ? 'border-blue-500 bg-slate-950 text-white shadow-xl scale-102' 
                      : 'border-slate-100 bg-white text-slate-900 shadow-sm'
                  }`}
                  id={`plan-${plan.id}`}
                >
                  {plan.id === 'plan-premium' && (
                    <div className="absolute -top-3 right-4 bg-blue-600 text-white text-xxs font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">
                      MOST POPULAR
                    </div>
                  )}
                  {plan.id === 'plan-vip' && (
                    <div className="absolute -top-3 right-4 bg-orange-500 text-white text-xxs font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">
                      ELITE PREMIUM
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-extrabold mb-1">{plan.name}</h3>
                    <p className={`text-xs ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>
                      Access level for {plan.durationMonths} month(s)
                    </p>
                    
                    <div className="my-6">
                      <span className="text-4xl font-extrabold">₹{plan.price}</span>
                      <span className={`text-sm ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}> / month</span>
                    </div>

                    <ul className="space-y-3 border-t pt-6 mb-8 border-slate-100">
                      {plan.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                      {plan.personalTraining && (
                        <li className="flex items-start gap-2 text-sm font-semibold">
                          <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                          <span>1-on-1 Personal Training</span>
                        </li>
                      )}
                      {plan.groupClasses && (
                        <li className="flex items-start gap-2 text-sm font-semibold">
                          <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                          <span>Group Classes Included</span>
                        </li>
                      )}
                      {plan.dietConsultation && (
                        <li className="flex items-start gap-2 text-sm font-semibold">
                          <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                          <span>Custom Diet Consultation</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <button 
                    onClick={onGetStarted}
                    className={`w-full py-3 rounded-xl font-bold transition-all text-sm cursor-pointer ${
                      isPremium 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    Select Plan
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trainers Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-100" id="trainers">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">EXPERIENCED COACHES</div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Meet Our Certified Elite Team
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Passionate coaches who will help you break plateaus and perfect your bio-mechanics.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {trainers.map((tr, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-6 items-center"
                id={`trainer-card-${idx}`}
              >
                <img 
                  src={tr.img} 
                  alt={tr.name} 
                  className="w-32 h-36 rounded-xl object-cover shadow-sm shrink-0"
                />
                <div className="text-center sm:text-left space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">{tr.name}</h3>
                  <div className="text-sm font-semibold text-blue-600">{tr.role}</div>
                  <div className="text-xs text-slate-400 font-medium">{tr.certs}</div>
                  <p className="text-sm text-slate-500 leading-relaxed pt-1">{tr.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Trusted by Hundreds of Athletes
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((test, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.55, delay: idx * 0.15, ease: "easeOut" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between"
                id={`testimonial-card-${idx}`}
              >
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(test.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 italic leading-relaxed">
                    "{test.comment}"
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100/50">
                  <div className="font-bold text-slate-900">{test.name}</div>
                  <div className="text-xs text-slate-400">{test.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xxs"
              >
                <button 
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <span className="flex items-center gap-2"><HelpCircle className="w-4 h-4 text-blue-500" /> {faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${faqOpen === idx ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === idx && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.25 }}
                    className="px-6 pb-5 pt-1 text-sm text-slate-500 leading-relaxed border-t border-slate-50"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="space-y-6"
            >
              <div>
                <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">GET IN TOUCH</div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Reach Out To Our Front Desk
                </h2>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  Have questions about memberships, private trainers, or corporate benefits? Drop us a line and our manager will reach out within 2 hours.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg text-blue-600 border border-slate-100">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Gym Location</h4>
                    <p className="text-xs text-slate-500">742 Strength Boulevard, Metro City, NY 10001</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg text-emerald-500 border border-slate-100">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Phone Support</h4>
                    <p className="text-xs text-slate-500">+1 (555) FIT-SYNC / +1 (555) 348-7962</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg text-orange-500 border border-slate-100">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Email Address</h4>
                    <p className="text-xs text-slate-500">desk@fitsync-elite.com</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
              className="bg-slate-50 p-8 rounded-2xl border border-slate-100"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">Send A Quick Message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Your Message</label>
                  <textarea 
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="How can we help your fitness path today?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md text-sm cursor-pointer"
                >
                  Submit Inquiry
                </button>

                {contactSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold text-center border border-emerald-200"
                  >
                    Your inquiry has been logged! Our staff will simulate reaching out shortly.
                  </motion.div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Dumbbell className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold tracking-tight">FitSync</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Synchronizing physical conditioning, advanced biomechanics, and AI analytics. Join the gym elite today.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#about" className="hover:text-white">About Our Gym</a></li>
              <li><a href="#features" className="hover:text-white">Performance Features</a></li>
              <li><a href="#pricing" className="hover:text-white">Membership pricing</a></li>
              <li><a href="#trainers" className="hover:text-white">Our Coaches</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Integrations & Tech</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>Gemini AI Workout Engine</li>
              <li>Gemini Diet Planner</li>
              <li>Interactive Biometric BMI Logs</li>
              <li>QR Check-In Terminal</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Opening Hours</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {plans.length > 0 ? "Mon-Fri: 06:00 - 22:00" : ""} <br />
              Sat-Sun: 07:00 - 20:00 <br />
              <span className="text-blue-400 font-semibold text-xxs mt-2 block">FitSync Elite Club Ltd © 2026</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

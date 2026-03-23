import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  LayoutDashboard, GraduationCap, Briefcase, 
  Settings, LogOut, ChevronRight, PlayCircle,
  FileAudio, Zap, CheckCircle2, Brain, Sparkles,
  AlertCircle, Check, Play, Pause, Volume2, X,
  ChevronLeft, FileText, Search, Menu, Clock, User, History,
  Moon, Sun, Shield, Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components
import Navbar from "./components/Navbar";
import ModernVideoInput from "./components/ModernVideoInput";
import OnboardingSection from "./components/OnboardingSection";
import ScoreTable from "./components/ScoreTable";
import RoleSelector from "./components/RoleSelector";
import ProfileSection from "./components/ProfileSection";
import AuthPage from "./components/AuthPage";
import { useTheme } from "./components/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Axios interceptor for JWT
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 400) {
      console.error("--- API 400 Error Details ---");
      console.error("URL:", error.config.url);
      console.error("Data:", error.response.data);
      console.error("-----------------------------");
    }
    return Promise.reject(error);
  }
);

// --- Main App Component ---
function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [modules, setModules] = useState([]);
  const [records, setRecords] = useState([]);
  const [user, setUser] = useState(null);
  const [authScreen, setAuthScreen] = useState(null); // null, "login", "register"
  const [selectedRole, setSelectedRole] = useState(null);
  const [processingTarget, setProcessingTarget] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showHome, setShowHome] = useState(true);
  const [showAccountPopover, setShowAccountPopover] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { isDarkMode } = useTheme();

  // Auto-login on mount
  useEffect(() => {
    const tryAutoLogin = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (token && storedUser) {
        try {
          const res = await api.get("/api/auth/me");
          const userData = res.data.user;
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } catch {
          // Token invalid — clear
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setAuthLoading(false);
    };

    const fetchDemoAccount = async (role = "sde2") => {
      try {
        const res = await api.get(`/api/auth/demo?role=${role}`);
        setUser(res.data.user);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setAuthScreen(null);
        setShowHome(false);
      } catch (err) {
        console.error("Failed to fetch demo account:", err);
      }
    };

    tryAutoLogin();
  }, []);

  // Fetch records when user logs in
  useEffect(() => {
    if (user) {
      api.get("/api/records")
        .then(res => setRecords(res.data))
        .catch(err => console.error("Failed to fetch records:", err));
    }
  }, [user]);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setAuthScreen(null);
    setShowHome(false);
    setSelectedRole(userData.role);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setRecords([]);
    setModules([]);
    setSelectedModule(null);
    setSelectedRole(null);
    setActiveTab("dashboard");
    setAuthScreen(null);
    setShowHome(true);
  };

  const handleRoleSelect = async (roleId) => {
    // If guest, log in as demo
    if (!user || user.email.includes("demo")) {
      try {
        const res = await api.get(`/api/auth/demo?role=${roleId}`);
        setUser(res.data.user);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setShowHome(false);
        setSelectedRole(roleId);
      } catch (err) {
        console.error("Demo login failed:", err);
        const backendError = err.response?.data?.details || err.response?.data?.message || err.message;
        alert(`Render Backend Crashed! Details: ${backendError}\n\nThis usually means you missed the JWT_SECRET in your Render dashboard environment variables, or your MongoDB Network Access isn't set to 0.0.0.0/0.`);
        
        // Fallback to register if demo fails
        setSelectedRole(roleId);
        setAuthScreen("register");
      }
    } else {
      // Real user just switches view (though normally they'd stick to their role)
      setSelectedRole(roleId);
      setShowHome(false);
    }
  };

  const handleProcessStart = (target) => {
    setProcessingTarget(target);
    setSelectedModule(null);
  };

  const handleProcessComplete = (newModule) => {
    setModules([newModule, ...modules]);
    setProcessingTarget(null);
    setSelectedModule(newModule);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Auth screens
  if (authScreen === "login") {
    return (
      <div className="min-h-screen bg-bg-primary transition-colors duration-300">
        <Navbar user={null} searchQuery="" setSearchQuery={() => {}} onSignInClick={() => {}} />
        <AuthPage
          mode="login"
          onAuthSuccess={handleAuthSuccess}
          onBack={() => setAuthScreen(null)}
        />
      </div>
    );
  }

  if (authScreen === "register" && selectedRole) {
    return (
      <div className="min-h-screen bg-bg-primary transition-colors duration-300">
        <Navbar user={null} searchQuery="" setSearchQuery={() => {}} onSignInClick={() => setAuthScreen("login")} />
        <AuthPage
          mode="register"
          selectedRole={selectedRole}
          onAuthSuccess={handleAuthSuccess}
          onBack={() => { setAuthScreen(null); setSelectedRole(null); }}
        />
      </div>
    );
  }

  // Not logged in or Home explicitly requested
  if (!user || showHome) {
    return (
      <div className="min-h-screen bg-bg-primary transition-colors duration-300">
        <Navbar 
          user={user} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onSignInClick={() => setAuthScreen("login")} 
          onHomeClick={() => setShowHome(true)}
        />
        <RoleSelector onSelectRole={handleRoleSelect} />
      </div>
    );
  }   // Logged in — main dashboard
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col transition-colors duration-300">
      <Navbar 
        user={user} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onSignInClick={() => {}} 
        onHomeClick={() => setShowHome(true)}
      />

      {/* Mobile Top-Bar */}
      <div className="lg:hidden h-14 bg-bg-secondary border-b border-border-primary flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-2" onClick={() => setShowHome(true)}>
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Zap size={16} fill="currentColor" />
          </div>
          <span className="font-black tracking-tighter text-base">OnboardHQ</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-1.5 text-text-secondary hover:text-text-primary transition-colors bg-bg-primary rounded-xl border border-border-primary"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Backdrop (Mobile) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {(isSidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside 
              initial={window.innerWidth < 1024 ? { x: -300 } : false}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className={`
                fixed inset-y-0 left-0 w-72 bg-bg-secondary p-6 border-r border-border-primary z-50 flex flex-col
                lg:relative lg:translate-x-0 lg:flex
                ${isSidebarOpen ? 'flex' : 'hidden lg:flex'}
              `}
            >
              <div className="flex lg:hidden items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                    <Zap size={18} fill="currentColor" />
                  </div>
                  <span className="font-black text-xl text-text-primary tracking-tight">OnboardMenu</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-bg-primary rounded-lg">
                  <X size={20} />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <p className="px-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Growth Center</p>
                  <SidebarItem 
                    icon={<LayoutDashboard size={20} />} 
                    label="Welcome Hub" 
                    active={activeTab === "dashboard"} 
                    onClick={() => { setActiveTab("dashboard"); setSelectedModule(null); setShowHome(false); setIsSidebarOpen(false); }} 
                  />
                  <SidebarItem 
                    icon={<GraduationCap size={20} />} 
                    label="Growth Path" 
                    active={activeTab === "learning"} 
                    onClick={() => { setActiveTab("learning"); setSelectedModule(null); setShowHome(false); setIsSidebarOpen(false); }} 
                  />
                  <SidebarItem 
                    icon={<Briefcase size={20} />} 
                    label="Essentials" 
                    active={activeTab === "onboarding"} 
                    onClick={() => { setActiveTab("onboarding"); setSelectedModule(null); setShowHome(false); setIsSidebarOpen(false); }} 
                  />
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                   <div className="flex justify-between items-center mb-1.5">
                     <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Knowledge Index</span>
                     <span className="text-[10px] font-bold text-text-secondary">82%</span>
                   </div>
                   <div className="h-1.5 w-full bg-bg-primary rounded-full overflow-hidden">
                     <div className="h-full w-[82%] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                   </div>
                   <p className="mt-3 text-[10px] text-text-secondary leading-tight">
                     Your retention rate improved by 12% today!
                   </p>
                </div>
              </div>

              {/* Bottom Account Section */}
              <div className="pt-6 relative border-t border-border-primary">
                <AnimatePresence>
                  {showAccountPopover && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full left-0 w-full mb-4 bg-bg-secondary border border-border-primary rounded-[2rem] shadow-2xl p-4 space-y-2 z-50"
                    >
                      <button 
                        onClick={() => { setActiveTab("profile"); setSelectedModule(null); setShowAccountPopover(false); setIsSidebarOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-primary transition-colors text-sm font-bold"
                      >
                        <User size={18} className="text-emerald-500" /> My Profile
                      </button>
                      <button 
                        onClick={() => { setActiveTab("settings"); setSelectedModule(null); setShowAccountPopover(false); setIsSidebarOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-primary transition-colors text-sm font-bold"
                      >
                        <Settings size={18} className="text-emerald-500" /> Settings
                      </button>
                      <hr className="border-border-primary my-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors text-sm font-bold"
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => setShowAccountPopover(!showAccountPopover)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${showAccountPopover ? 'bg-bg-primary border-emerald-500/30' : 'bg-transparent border-transparent hover:bg-bg-primary'}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-black truncate">{user?.name}</p>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{user?.role}</p>
                  </div>
                  <ChevronRight size={16} className={`text-text-secondary transition-transform ${showAccountPopover ? 'rotate-90' : ''}`} />
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 relative">
          <AnimatePresence mode="wait">
            {selectedModule ? (
                <motion.div
                  key="active-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <ActiveModuleView 
                    module={selectedModule} 
                    onBack={() => setSelectedModule(null)} 
                    onQuizComplete={async (score, total) => {
                      const isPass = (score / total) >= 0.6 && score > 0;
                      const payload = {
                        moduleId: selectedModule.id,
                        videoTitle: selectedModule.title,
                        score,
                        totalQuestions: total,
                        status: score === total ? "Perfect" : isPass ? "Passed" : "Failed"
                      };
                      
                      const optimisticRecord = { ...payload, _id: Date.now(), date: new Date().toISOString().split('T')[0] };
                      setRecords(prev => [optimisticRecord, ...prev]);

                      try {
                        await api.post("/api/records", payload);
                      } catch (err) {
                        console.error("Failed to save record to DB:", err);
                      }
                    }}
                  />
                </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-7xl mx-auto space-y-4"
              >
                {activeTab === "dashboard" && (
                  <>
                    <div className="space-y-1 border-l-4 border-emerald-500 pl-4 py-1">
                        <h2 className="text-2xl font-black tracking-tight text-text-primary uppercase">Your Career Growth</h2>
                        <p className="text-text-secondary text-sm font-medium">Personalized training for your role as an <span className="text-emerald-500 font-bold uppercase tracking-widest">{user?.role || selectedRole || 'Professional'}</span>.</p>
                    </div>
                    <ModernVideoInput onProcessStart={handleProcessStart} />
                    {processingTarget && (
                      <ProcessPipeline 
                        target={processingTarget} 
                        onComplete={handleProcessComplete} 
                      />
                    )}
                    <DashboardGrid 
                      modules={modules} 
                      onSelectModule={setSelectedModule} 
                    />
                  </>
                )}

                {activeTab === "learning" && (
                  <div className="space-y-12">
                    <ScoreTable records={records} />
                    <DashboardGrid 
                      title="Completed Learning"
                      modules={modules.filter(m => !m.isOnboarding)} 
                      onSelectModule={setSelectedModule} 
                    />
                  </div>
                )}

                {activeTab === "onboarding" && (
                  <OnboardingSection 
                    role={selectedRole}
                    modules={modules.filter(m => m.isOnboarding)} 
                    onSelectModule={setSelectedModule} 
                  />
                )}

                {activeTab === "profile" && (
                  <ProfileSection 
                    user={user}
                    records={records}
                    modules={modules}
                  />
                )}

                {activeTab === "settings" && (
                  <SettingsPanel user={user} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// --- Settings Panel ---
const SettingsPanel = ({ user }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2 border-l-4 border-emerald-500 pl-6 py-2">
        <h2 className="text-3xl font-black tracking-tight">Settings</h2>
        <p className="text-text-secondary font-medium">Manage your account and preferences.</p>
      </div>

      {/* Account Info */}
      <div className="bg-bg-secondary rounded-[2.5rem] border border-border-primary p-8 space-y-6 shadow-sm">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <Shield size={20} className="text-emerald-500" /> Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Name</label>
            <p className="text-lg font-bold">{user.name}</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Email</label>
            <p className="text-lg font-bold">{user.email}</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Role</label>
            <p className="text-lg font-bold capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-bg-secondary rounded-[2.5rem] border border-border-primary p-8 space-y-6 shadow-sm">
        <h3 className="text-xl font-bold flex items-center gap-3">
          {isDarkMode ? <Moon size={20} className="text-blue-600" /> : <Sun size={20} className="text-blue-600" />} Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold">Dark Mode</p>
            <p className="text-sm text-text-secondary">Toggle between light and dark themes</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-14 h-8 rounded-full transition-colors relative ${isDarkMode ? "bg-blue-600" : "bg-border-primary"}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-sm ${isDarkMode ? "left-7" : "left-1"}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
      active 
      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25" 
      : "text-text-secondary hover:bg-bg-primary hover:text-text-primary"
    }`}
  >
    <span className={`${active ? "text-white" : "group-hover:text-blue-500"} transition-colors`}>{icon}</span>
    <span className="text-sm font-bold tracking-tight">{label}</span>
    {active && <ChevronRight size={16} className="ml-auto opacity-70" />}
  </button>
);

const DashboardGrid = ({ title = "Your Learning Modules", modules, onSelectModule }) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.length === 0 ? (
                <div className="col-span-full py-20 text-center space-y-4 bg-bg-secondary/50 rounded-3xl border border-dashed border-border-primary">
                    <div className="w-16 h-16 bg-bg-primary rounded-full flex items-center justify-center mx-auto text-text-secondary/50">
                        <PlayCircle size={32} />
                    </div>
                    <div>
                        <p className="text-text-primary font-bold">No modules found</p>
                        <p className="text-text-secondary text-sm">Start by processing a video in the dashboard.</p>
                    </div>
                </div>
            ) : (
                modules.map((mod, idx) => (
                    <motion.div
                        key={mod.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.2 }}
                        whileHover={{ y: -5 }}
                        onClick={() => onSelectModule(mod)}
                        className="bg-bg-secondary rounded-2xl overflow-hidden border border-border-primary hover:shadow-xl transition-all cursor-pointer group"
                    >
                        <div className="aspect-video relative overflow-hidden bg-bg-primary">
                            <img src={mod.thumb} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-[10px] font-bold rounded">
                                {mod.duration}
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{mod.department}</span>
                            <h4 className="font-bold text-text-primary leading-tight group-hover:text-blue-600 transition-colors">{mod.title}</h4>
                            <div className="flex items-center gap-3 pt-2">
                                <div className="flex-1 h-1.5 bg-bg-primary rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" style={{ width: `${mod.progress}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-text-secondary">{mod.progress}%</span>
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    </div>
);

const ProcessPipeline = ({ target, onComplete }) => {
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [liveTranscripts, setLiveTranscripts] = useState([]);

  useEffect(() => {
    const runPipeline = async () => {
      try {
        setStep(0);
        let uploadPromise;

        if (target.file) {
          const formData = new FormData();
          formData.append("video", target.file);
          formData.append("fullLength", target.fullLength);
          uploadPromise = api.post("/api/upload-convert", formData);
        }

        const uploadRes = await uploadPromise;

        // Check if cached
        if (uploadRes.data.cached) {
          setStep(4);
          onComplete({
            id: Date.now(),
            title: target.file ? target.file.name : target.url,
            department: "AI Analysis",
            duration: "Processed",
            status: "Completed",
            progress: 100,
            thumb: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
            transcript: uploadRes.data.transcript.map((text, i) => ({ time: "00:00", text: typeof text === 'string' ? text : text.text })),
            summary: uploadRes.data.summary || [],
            quiz: uploadRes.data.quiz || [],
            audioUrl: uploadRes.data.cloudinaryUrl,
            videoUrl: uploadRes.data.videoUrl || uploadRes.data.cloudinaryUrl
          });
          return;
        }

        const chunks = uploadRes.data.chunks;
        const fullCloudinaryUrl = uploadRes.data.cloudinaryUrl;
        const videoCloudinaryUrl = uploadRes.data.videoUrl;
        const fileHash = uploadRes.data.fileHash;

        setStep(1);
        setLiveTranscripts(new Array(chunks.length).fill(null));
        let chunkTranscripts = new Array(chunks.length).fill("");

        const processChunkWithGroq = async (chunk, idx) => {
          const res = await api.post("/api/groq-transcript", { filename: chunk.filename });
          chunkTranscripts[idx] = res.data.text;
          setLiveTranscripts(prev => {
            const updated = [...prev];
            updated[idx] = { text: res.data.text };
            return updated;
          });
        };

        for (let i = 0; i < chunks.length; i++) {
          await processChunkWithGroq(chunks[i], i);
        }

        setStep(2);
        const summaryQuizRes = await api.post("/api/quiz/summary-and-quiz", {
          transcript: chunkTranscripts.join(" "),
        });

        const { summary, quiz } = summaryQuizRes.data;
        setStep(4);

        // Save to cache in background
        try {
          await api.post("/api/upload-convert/cache", {
            fileHash,
            fileName: target.file ? target.file.name : target.url,
            transcript: chunkTranscripts,
            summary: summary || [],
            quiz: quiz || [],
            audioUrl: fullCloudinaryUrl,
            videoUrl: videoCloudinaryUrl,
          });
        } catch (cacheErr) {
          console.error("Cache save failed:", cacheErr);
        }

        onComplete({
          id: Date.now(),
          title: target.file ? target.file.name : target.url,
          department: "AI Analysis",
          duration: "Processed",
          status: "Completed",
          progress: 100,
          thumb: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
          transcript: chunkTranscripts.map((text, i) => ({ time: "00:00", text })),
          summary: summary || [],
          quiz: quiz || [],
          audioUrl: fullCloudinaryUrl,
          videoUrl: videoCloudinaryUrl
        });

      } catch (err) {
        setError(err.message || "Processing failed");
      }
    };
    runPipeline();
  }, [target, onComplete]);

  const steps = [
    { label: "Converting to MP3", icon: <Volume2 size={18} /> },
    { label: "Transcribing Audio", icon: <Zap size={18} /> },
    { label: "AI Synthesis", icon: <Brain size={18} /> },
    { label: "Formatting Results", icon: <Sparkles size={18} /> },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-10 bg-bg-secondary rounded-[2.5rem] border border-border-primary shadow-2xl space-y-8 my-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-bg-primary">
            <motion.div 
                className="h-full bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-400" 
                initial={{ width: 0 }}
                animate={{ width: `${(step / steps.length) * 100}%` }}
            />
        </div>

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 animate-pulse">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Deep Analysis in Progress</h3>
                    <p className="text-sm text-text-secondary">Generating intelligent insights...</p>
                </div>
            </div>
            <span className="text-2xl font-black text-blue-600">{Math.round((step / steps.length) * 100)}%</span>
        </div>

        <div className="grid grid-cols-4 gap-4">
            {steps.map((s, idx) => (
                <div key={idx} className={`flex flex-col items-center gap-2 ${step < idx ? 'opacity-30' : 'opacity-100'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${step > idx ? 'bg-green-500 text-white' : step === idx ? 'bg-blue-600 text-white animate-bounce' : 'bg-bg-primary text-text-secondary'}`}>
                        {step > idx ? <Check size={20} /> : s.icon}
                    </div>
                </div>
            ))}
        </div>

        {error && (
            <div className="p-4 bg-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2">
                <AlertCircle size={16} /> {error}
            </div>
        )}
    </div>
  );
};

// --- Premium Video Player Component ---
const VideoPlayer = ({ src, poster }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);
  const controlsTimeout = useRef(null);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    setProgress((current / total) * 100);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(newProgress);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // Determine if it's likely an audio file
  const isAudio = src?.endsWith('.mp3') || src?.includes('audio');

  return (
    <div 
      className="relative group w-full h-full bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {isAudio ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-[60px] animate-pulse rounded-full" />
            <div className="relative w-32 h-32 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
              <div className="flex gap-1.5 items-end h-12">
                {[0.4, 0.7, 1.0, 0.6, 0.8, 0.5, 0.9].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: isPlaying ? [12, 48 * h, 12] : 12 }}
                    transition={{ repeat: Infinity, duration: 1 + i * 0.1, ease: "easeInOut" }}
                    className="w-1.5 bg-blue-500 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-blue-400 font-bold tracking-[0.2em] uppercase text-[10px] animate-pulse">Intelligence Stream - Audio Interface</p>
        </div>
      ) : null}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${isAudio ? 'opacity-0' : 'opacity-100'}`}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        playsInline
      />

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-x-4 bottom-4 z-20 flex flex-col gap-3 p-4 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] shadow-2xl"
          >
            {/* Progress Bar */}
            <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden group/progress cursor-pointer">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressChange}
                className="absolute inset-0 w-full opacity-0 z-30 cursor-pointer"
              />
              <div 
                className="absolute h-full bg-gradient-to-r from-blue-600 to-cyan-400 z-10" 
                style={{ width: `${progress}%` }} 
              />
              <div className="absolute inset-0 bg-white/5" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-0.5" fill="currentColor" />}
                </button>
                
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-xs font-black text-white">{formatTime(videoRef.current?.currentTime || 0)}</span>
                  <span className="text-xs font-bold text-white/30">/</span>
                  <span className="text-xs font-bold text-white/50">{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 group/vol">
                  <Volume2 size={18} className="text-white/50 group-hover/vol:text-white transition-colors" />
                  <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white/40 w-[80%]" />
                  </div>
                </div>
                <button className="text-white/50 hover:text-white transition-colors">
                  <Settings size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Play Button (Large Overlay) */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl shadow-blue-500/40 backdrop-blur-sm z-10 border border-white/20"
          >
            <Play size={40} className="ml-1.5" fill="currentColor" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActiveModuleView = ({ module, onBack, onQuizComplete }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isQuizActive, setIsQuizActive] = useState(false);

  const calculateScore = (answers = quizAnswers) => {
    return module.quiz.reduce((acc, q, idx) => acc + (answers[idx] === q.answer ? 1 : 0), 0);
  };

  const handleNextQuestion = (latestAnswers = quizAnswers) => {
    if (currentQuestionIndex < module.quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(30);
    } else {
      setQuizSubmitted(true);
      const finalScore = calculateScore(latestAnswers);
      onQuizComplete(finalScore, module.quiz.length);
    }
  };

  const handleAnswer = (optionIdx) => {
    const nextAnswers = { ...quizAnswers, [currentQuestionIndex]: optionIdx };
    setQuizAnswers(nextAnswers);
    setTimeout(() => {
      handleNextQuestion(nextAnswers);
    }, 300);
  };

  const handleStartQuiz = () => {
    setIsQuizActive(true);
    setTimeLeft(30);
  };

  useEffect(() => {
    let timer;
    if (activeTab === 'quiz' && !quizSubmitted && isQuizActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !quizSubmitted) {
      handleNextQuestion();
    }
    return () => clearInterval(timer);
  }, [activeTab, timeLeft, quizSubmitted, isQuizActive]);

  const score = calculateScore();
  const passThreshold = 0.6;
  const isPass = (score / module.quiz.length) >= passThreshold && score > 0;

  return (
    <div className="space-y-8 pb-20">
      <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-bold group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Media & Content */}
        <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-border-primary">
            <VideoPlayer src={module.videoUrl} poster={module.thumb} />
            </div>

            <div className="bg-bg-secondary rounded-[2.5rem] p-8 border border-border-primary space-y-6 shadow-sm">
                <div className="flex gap-2 p-1 bg-bg-primary rounded-2xl w-fit">
                    {['summary', 'quiz'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-bg-secondary text-blue-600 shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="min-h-[350px]">
                    {activeTab === 'summary' && (
                        <ul className="space-y-4">
                            {module.summary?.map((s, i) => (
                                <motion.li key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4 group">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <p className="text-text-primary leading-relaxed font-medium">{s}</p>
                                </motion.li>
                            ))}
                        </ul>
                    )}

                    {activeTab === 'quiz' && (
                        <div className="space-y-8">
                            {!isQuizActive && !quizSubmitted ? (
                                <div className="text-center py-12 space-y-6">
                                    <div className="w-20 h-20 bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <History size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black">Elite Assessment Ready</h3>
                                    <p className="text-text-secondary font-medium max-w-md mx-auto">
                                        30 seconds per question. One chance to pass. Excellence is required.
                                    </p>
                                    <button 
                                        onClick={handleStartQuiz}
                                        disabled={!module.quiz || module.quiz.length === 0}
                                        className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Initiate Assessment
                                    </button>
                                </div>
                            ) : quizSubmitted ? (
                                <div className="relative p-10 rounded-[3rem] bg-slate-900 overflow-hidden shadow-2xl border border-white/10 group">
                                    <div className={`absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-colors duration-1000 ${isPass ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <div className={`absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-colors duration-1000 ${isPass ? 'bg-blue-500' : 'bg-rose-500'}`} />
                                    
                                    <div className="relative z-10 text-center space-y-8">
                                        <div className="space-y-4">
                                            <motion.div 
                                                initial={{ scale: 0.5, opacity: 0 }} 
                                                animate={{ scale: 1, opacity: 1 }}
                                                className={`inline-block px-6 py-2 rounded-full font-black text-sm tracking-[0.3em] uppercase border-2 shadow-lg ${
                                                    isPass 
                                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-emerald-500/20' 
                                                    : 'bg-red-500/10 border-red-500 text-red-400 shadow-red-500/20'
                                                }`}
                                            >
                                                {isPass ? 'Mission Success' : 'Mission Failure'}
                                            </motion.div>
                                            
                                            <div className="relative inline-block">
                                                <div className={`absolute inset-0 blur-3xl opacity-30 ${isPass ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                <div className="relative text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
                                                    {score}<span className="text-4xl text-white/40 font-bold ml-1">/{module.quiz?.length || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="max-w-md mx-auto p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
                                            <p className="text-slate-300 font-medium text-lg leading-relaxed italic">
                                                {isPass 
                                                    ? "Elite performance detected. Your intelligence benchmarks are optimal for the next phase of deployment." 
                                                    : "Intelligence threshold not met. Review the core modules below and re-initialize the assessment."}
                                            </p>
                                        </div>

                                        <div className="text-left max-w-2xl mx-auto space-y-4 pt-4 border-t border-white/10">
                                            <h4 className="text-white font-black text-xl mb-4 tracking-tight">Intelligence Breakdown</h4>
                                            {module.quiz?.map((q, idx) => {
                                                const isCorrect = quizAnswers[idx] === q.answer;
                                                return (
                                                    <div key={idx} className={`p-5 rounded-2xl border ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'} flex flex-col gap-2`}>
                                                        <p className="text-white font-bold">{idx + 1}. {q.question}</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                            <div>
                                                                <span className="text-white/50 block text-xs uppercase tracking-wider font-bold mb-1">Your Selected Answer</span>
                                                                <span className={`${isCorrect ? 'text-emerald-400' : 'text-red-400'} font-bold`}>
                                                                    {q.options[quizAnswers[idx]] || "No Answer"}
                                                                </span>
                                                            </div>
                                                            {!isCorrect && (
                                                                <div>
                                                                    <span className="text-white/50 block text-xs uppercase tracking-wider font-bold mb-1">Correct Answer</span>
                                                                    <span className="text-emerald-400 font-bold">{q.options[q.answer]}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                                            {!isPass && (
                                                <button 
                                                    onClick={() => { setQuizSubmitted(false); setIsQuizActive(false); setCurrentQuestionIndex(0); setQuizAnswers({}); }}
                                                    className="px-10 py-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-2xl font-black text-white transition-all hover:scale-105 active:scale-95"
                                                >
                                                    Restart Assessment
                                                </button>
                                            )}
                                            <button 
                                                onClick={onBack} 
                                                className={`px-10 py-4 rounded-2xl font-black text-slate-900 transition-all hover:scale-105 active:scale-95 shadow-xl ${
                                                    isPass ? 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/20' : 'bg-white hover:bg-slate-100 shadow-white/10'
                                                }`}
                                            >
                                                Finalize & Return
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 relative">
                                    <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden">
                                        <motion.div 
                                            className={`h-full ${timeLeft < 10 ? 'bg-red-500' : 'bg-blue-600'}`}
                                            initial={{ width: '100%' }}
                                            animate={{ width: `${(timeLeft / 30) * 100}%` }}
                                            transition={{ duration: 1, ease: 'linear' }}
                                        />
                                    </div>

                                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-text-secondary">
                                        <span>Question {currentQuestionIndex + 1} of {module.quiz?.length || 0}</span>
                                        <span className={timeLeft < 10 ? 'text-red-500 animate-pulse' : ''}>{timeLeft}s Remaining</span>
                                    </div>

                                    <div className="space-y-6">
                                        <h5 className="font-black text-2xl leading-tight tracking-tight">
                                            {module.quiz?.[currentQuestionIndex]?.question}
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {module.quiz?.[currentQuestionIndex]?.options.map((opt, optIdx) => (
                                                <button 
                                                    key={optIdx}
                                                    onClick={() => handleAnswer(optIdx)}
                                                    className={`group p-5 rounded-[1.5rem] text-left border-2 transition-all font-bold flex items-center gap-4 ${
                                                        quizAnswers[currentQuestionIndex] === optIdx 
                                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                                                        : 'border-border-primary hover:border-blue-400 bg-bg-primary/30'
                                                    }`}
                                                >
                                                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-colors ${
                                                        quizAnswers[currentQuestionIndex] === optIdx 
                                                        ? 'bg-blue-600 border-blue-600 text-white' 
                                                        : 'border-border-primary group-hover:border-blue-400 text-text-secondary'
                                                    }`}>
                                                        {String.fromCharCode(65 + optIdx)}
                                                    </span>
                                                    <span className="flex-1">{opt}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right: Sidebar Info */}
        <div className="space-y-6">
            <div className="bg-bg-secondary border border-border-primary rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                <h4 className="font-bold text-xl flex items-center gap-2">
                    <Sparkles size={20} className="text-blue-600" /> Module Insights
                </h4>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary font-medium">Difficulty Level</span>
                        <span className="font-bold text-blue-600">Intermediate</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary font-medium">Estimated Time</span>
                        <span className="font-bold text-blue-600">15-20 mins</span>
                    </div>
                </div>
                <div className="p-4 bg-bg-primary rounded-2xl space-y-2">
                    <div className="flex justify-between text-xs font-bold text-text-secondary">
                        <span>Readiness</span>
                        <span>{Math.round(((module.transcript?.length || 0) / 50) * 100)}%</span>
                    </div>
                    <div className="h-1 bg-border-primary rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: '65%' }} />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;

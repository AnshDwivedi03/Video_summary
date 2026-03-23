import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  LayoutDashboard, GraduationCap, Briefcase, 
  Settings, LogOut, ChevronRight, PlayCircle,
  FileAudio, Zap, CheckCircle2, Brain, Sparkles,
  AlertCircle, Check, Play, Pause, Volume2, X,
  ChevronLeft, FileText, Search, Menu, Clock, User, History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components
import Navbar from "./components/Navbar";
import ModernVideoInput from "./components/ModernVideoInput";
import OnboardingSection from "./components/OnboardingSection";
import ScoreTable from "./components/ScoreTable";
import RoleSelector from "./components/RoleSelector";
import ProfileSection from "./components/ProfileSection";
import { useTheme } from "./components/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// --- Main App Component ---
function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [modules, setModules] = useState([]);
  const [records, setRecords] = useState([]);
  const [user, setUser] = useState({ name: "Ansh Dwivedi" });

  useEffect(() => {
    // Fetch user records on load
    axios.get(`${API_URL}/api/records/${user.name}`)
      .then(res => setRecords(res.data))
      .catch(err => console.error("Failed to fetch records:", err));
  }, [user.name]);
  const [processingTarget, setProcessingTarget] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [userRole, setUserRole] = useState(null); // fresher, experienced

  const { isDarkMode } = useTheme();

  const handleProcessStart = (target) => {
    setProcessingTarget(target);
    setSelectedModule(null);
  };

  const handleProcessComplete = (newModule) => {
    setModules([newModule, ...modules]);
    setProcessingTarget(null);
    setSelectedModule(newModule);
  };

  if (!userRole) {
    return (
      <div className="min-h-screen bg-bg-primary transition-colors duration-300">
        <Navbar 
          user={user} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onSignInClick={() => console.log("Sign in")} 
        />
        <RoleSelector onSelectRole={setUserRole} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-bg-primary text-text-primary flex flex-col transition-colors duration-300`}>
      <Navbar 
        user={user} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onSignInClick={() => console.log("Sign in")} 
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 hidden lg:flex flex-col border-r border-border-primary bg-bg-secondary p-6 space-y-8">
          <div className="space-y-2">
            <p className="px-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Growth Center</p>
            <SidebarItem 
              icon={<LayoutDashboard size={20} />} 
              label="Welcome Hub" 
              active={activeTab === "dashboard"} 
              onClick={() => { setActiveTab("dashboard"); setSelectedModule(null); }} 
            />
            <SidebarItem 
              icon={<GraduationCap size={20} />} 
              label="Growth Path" 
              active={activeTab === "learning"} 
              onClick={() => { setActiveTab("learning"); setSelectedModule(null); }} 
            />
            <SidebarItem 
              icon={<Briefcase size={20} />} 
              label="Essentials" 
              active={activeTab === "onboarding"} 
              onClick={() => { setActiveTab("onboarding"); setSelectedModule(null); }} 
            />
          </div>

          <div className="space-y-2">
            <p className="px-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Personal</p>
            <SidebarItem 
              icon={<User size={20} />} 
              label="My Profile" 
              active={activeTab === "profile"} 
              onClick={() => { setActiveTab("profile"); setSelectedModule(null); }} 
            />
          </div>

          <div className="pt-8 space-y-2 border-t border-border-primary">
            <p className="px-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Account</p>
            <SidebarItem icon={<Settings size={20} />} label="Settings" />
            <SidebarItem icon={<LogOut size={20} />} label="Logout" />
          </div>

          <div className="mt-auto p-5 rounded-3xl bg-gradient-to-br from-blue-600/10 to-violet-600/10 border border-blue-500/20">
             <div className="flex justify-between items-center mb-2">
               <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Knowledge Index</span>
               <span className="text-[10px] font-bold text-text-secondary">82%</span>
             </div>
             <div className="h-1.5 w-full bg-bg-primary rounded-full overflow-hidden">
               <div className="h-full w-[82%] bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" />
             </div>
             <p className="mt-3 text-[10px] text-text-secondary leading-tight">
               Your retention rate has improved by 12% this week!
             </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
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
                        userId: user.name,
                        moduleId: selectedModule.id,
                        videoTitle: selectedModule.title,
                        score,
                        totalQuestions: total,
                        status: score === total ? "Perfect" : isPass ? "Passed" : "Failed"
                      };
                      
                      // Optimistic UI update
                      const optimisticRecord = { ...payload, id: Date.now(), date: new Date().toISOString().split('T')[0] };
                      setRecords(prev => [optimisticRecord, ...prev]);

                      try {
                        await axios.post(`${API_URL}/api/records`, payload);
                        // Optional: refetch or update with real DB ID if needed, 
                        // but the optimistic update works nicely for the demo.
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
                className="max-w-7xl mx-auto space-y-12"
              >
                {activeTab === "dashboard" && (
                  <>
                    <div className="space-y-2 border-l-4 border-blue-600 pl-6 py-2">
                        <h2 className="text-3xl font-black tracking-tight">Your Career Growth</h2>
                        <p className="text-text-secondary font-medium">Personalized training for your role as an <span className="text-blue-600 capitalize font-bold">{userRole}</span>.</p>
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
                    role={userRole}
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
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -5 }}
                        onClick={() => onSelectModule(mod)}
                        className="bg-bg-secondary rounded-3xl overflow-hidden border border-border-primary hover:shadow-2xl transition-all cursor-pointer group"
                    >
                        <div className="aspect-video relative overflow-hidden bg-bg-primary">
                            <img src={mod.thumb} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-[10px] font-bold rounded">
                                {mod.duration}
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
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
  const [displayProgress, setDisplayProgress] = useState(0);
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
          uploadPromise = axios.post(`${API_URL}/api/upload-convert`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        const uploadRes = await uploadPromise;
        const chunks = uploadRes.data.chunks;
        const fullCloudinaryUrl = uploadRes.data.cloudinaryUrl;

        setStep(1);
        setLiveTranscripts(new Array(chunks.length).fill(null));
        let chunkTranscripts = new Array(chunks.length).fill("");

        const processChunkWithGroq = async (chunk, idx) => {
          const res = await axios.post(`${API_URL}/api/groq-transcript`, { filename: chunk.filename });
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
        const summaryQuizRes = await axios.post(`${API_URL}/api/quiz/summary-and-quiz`, {
          transcript: chunkTranscripts.join(" "),
        });

        const { summary, quiz } = summaryQuizRes.data;
        setStep(4);

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
          audioUrl: fullCloudinaryUrl
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

const ActiveModuleView = ({ module, onBack, onQuizComplete }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isQuizActive, setIsQuizActive] = useState(false);

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

  const handleStartQuiz = () => {
    setIsQuizActive(true);
    setTimeLeft(30);
  };

  const handleAnswer = (optionIdx) => {
    setQuizAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIdx }));
    setTimeout(() => {
      handleNextQuestion();
    }, 300);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < module.quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(30);
    } else {
      setQuizSubmitted(true);
      const finalScore = calculateScore();
      onQuizComplete(finalScore, module.quiz.length);
    }
  };

  const calculateScore = () => {
    return module.quiz.reduce((acc, q, idx) => acc + (quizAnswers[idx] === q.answer ? 1 : 0), 0);
  };

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
                {module.audioUrl ? (
                    <video src={module.audioUrl} controls className="w-full h-full" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white space-y-4 bg-gradient-to-br from-slate-900 to-slate-800">
                        <Volume2 size={48} className="opacity-50" />
                        <p className="font-bold opacity-70 italic tracking-widest uppercase text-xs text-center px-10 leading-relaxed max-w-md">Audio Analysis Session - Core Intelligence Pipeline</p>
                    </div>
                )}
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
                                    {/* Aura Glow Background */}
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
                                    {/* Timer Bar */}
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

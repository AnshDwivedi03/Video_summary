import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Search, Menu, BookOpen, LayoutDashboard, FileText,
  GraduationCap, UploadCloud, CheckCircle2, ChevronLeft,
  PlayCircle, Clock, Check, AlertCircle, Play, Pause, FileAudio,
  X, FileVideo, Music, Youtube, Scissors, Settings2,
  Volume2, Sparkles, Zap, Brain
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// --- Custom Styles for clean corporate look ---
const globalStyles = `
  body {
    background-color: #f8fafc; /* slate-50 */
    color: #0f172a; /* slate-900 */
  }
  
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

  .fade-in { animation: fadeIn 0.4s ease-in-out; }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .pulse-border {
    animation: pulseBorder 2s infinite;
  }
  @keyframes pulseBorder {
    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
    70% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
  }

  .glow-border {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.15), 0 0 60px rgba(99, 102, 241, 0.05);
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.8);
  }

  .gradient-text {
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .progress-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shimmer 1.5s infinite;
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

// --- Mock Data ---
const MOCK_MODULES = [
  {
    id: 1,
    title: "Information Security & Compliance 2026",
    department: "IT & Security",
    duration: "45:00",
    status: "Pending",
    progress: 0,
    thumb: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    summary: [
      "Introduction to 2026 Information Security policies.",
      "Data is classified into three tiers: Public, Internal, and Highly Confidential.",
      "Highly Confidential data (PII, financials, source code) must be encrypted and never stored locally.",
      "Employees must use secondary verification (e.g., Slack) for urgent external email requests to prevent phishing.",
      "Device security requires mandatory screensavers locking after 5 minutes of inactivity."
    ],
    transcript: [
      { time: "00:00", text: "Welcome everyone to the 2026 Information Security and Compliance induction." },
      { time: "00:15", text: "Today we are going to cover the mandatory protocols for handling customer data, managing your device security, and identifying phishing attempts." },
      { time: "00:35", text: "Let's start with data classification. We have three tiers: Public, Internal, and Highly Confidential." },
      { time: "00:50", text: "Highly Confidential data includes PII, financial records, and proprietary source code. This data must never be stored on local unencrypted drives." },
      { time: "01:15", text: "Next, regarding phishing. If you receive an email from an unknown sender requesting urgent action, always verify via a secondary channel like Slack." }
    ],
    quiz: [
      {
        question: "What are the three tiers of data classification at Acme Corp?",
        options: ["Public, Private, Secret", "Public, Internal, Highly Confidential", "Open, Restricted, Classified"],
        answer: 1
      },
      {
        question: "Which of the following is considered 'Highly Confidential' data?",
        options: ["Public marketing materials", "Internal cafeteria menus", "Customer PII and source code"],
        answer: 2
      },
      {
        question: "What is the recommended protocol if you suspect a phishing email?",
        options: ["Click the link to investigate", "Forward it to all employees", "Verify the sender via a secondary channel like Slack"],
        answer: 2
      }
    ]
  }
];


// --- Components ---

const Navbar = ({ onHome, searchQuery, setSearchQuery }) => (
  <header className="sticky top-0 w-full h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-6 shadow-sm">
    <div className="flex items-center gap-4 cursor-pointer" onClick={onHome}>
      <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
        <BookOpen size={18} />
      </div>
      <div className="text-xl font-bold tracking-tight text-slate-900">
        Onboard<span className="text-blue-600">HQ</span>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search transcripts, policies..."
          className="bg-transparent border-none focus:outline-none w-48 placeholder:text-slate-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold border border-slate-300">
        JD
      </div>
    </div>
  </header>
);

const Sidebar = () => {
  const links = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", active: true },
    { icon: <GraduationCap size={20} />, label: "My Learning" },
    { icon: <FileText size={20} />, label: "Transcripts" },
  ];

  return (
    <aside className="w-64 hidden md:block border-r border-slate-200 bg-white h-[calc(100vh-64px)] p-4">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Main Menu</div>
        {links.map((link, idx) => (
          <button
            key={idx}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${link.active
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
          >
            <div className={link.active ? "text-blue-600" : "text-slate-400"}>
              {link.icon}
            </div>
            {link.label}
          </button>
        ))}
      </div>
    </aside>
  );
};

const ProcessPipeline = ({ target, onComplete }) => {
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [liveTranscripts, setLiveTranscripts] = useState([]);

  useEffect(() => {
    const runPipeline = async () => {
      try {
        setStep(0);
        let uploadPromise;

        // Step 0: Upload / Initial processing
        if (target.file) {
          const formData = new FormData();
          formData.append("video", target.file);
          formData.append("fullLength", target.fullLength);
          formData.append("startTime", target.startTime || 0);
          formData.append("endTime", target.endTime || 0);

          uploadPromise = axios.post(`${API_URL}/api/upload-convert`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else if (target.url) {
          uploadPromise = axios.post(`${API_URL}/api/youtube-convert`, {
            url: target.url,
            fullLength: target.fullLength,
            startTime: target.startTime || 0,
            endTime: target.endTime || 0
          });
        } else {
          throw new Error("No target file or URL provided.");
        }

        const uploadRes = await uploadPromise;
        const chunks = uploadRes.data.chunks; // [{ chunkIndex, start, end, filename }]
        const fullCloudinaryUrl = uploadRes.data.cloudinaryUrl;

        setStep(1); // Transcribing

        // Step 1: Processing chunks concurrently with Groq Whisper
        setLiveTranscripts(new Array(chunks.length).fill(null));
        let chunkTranscripts = new Array(chunks.length).fill("");

        const formatSecs = (secs) => {
          const m = Math.floor(secs / 60);
          const s = Math.floor(secs % 60);
          return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        const processChunkWithGroq = async (chunk, idx) => {
          try {
            const res = await axios.post(`${API_URL}/api/groq-transcript`, { filename: chunk.filename });
            chunkTranscripts[idx] = res.data.text;
            setLiveTranscripts(prev => {
              const updated = [...prev];
              updated[idx] = { time: formatSecs(chunk.start), text: res.data.text };
              return updated;
            });
          } catch (err) {
            console.error("Groq chunk error:", err);
            throw new Error(`Transcription failed for chunk ${idx + 1}`);
          }
        };

        // Process chunks sequentially to avoid Groq rate limits
        for (let i = 0; i < chunks.length; i++) {
          await processChunkWithGroq(chunks[i], i);
        }

        setStep(2); // Transcription complete, Synthesis next
        await new Promise(r => setTimeout(r, 1000));
        setStep(3); // Generating Quiz and Summary

        const fullTranscriptText = chunkTranscripts.join(" ");

        // Step 3: Global Summary and Quiz generation
        const summaryQuizRes = await axios.post(`${API_URL}/api/quiz/summary-and-quiz`, {
          transcript: fullTranscriptText,
        });

        const { summary, quiz } = summaryQuizRes.data;

        setStep(4); // Formatting Done
        
        const finalTranscript = chunks.map((c, i) => ({
          time: formatSecs(c.start),
          text: chunkTranscripts[i]
        })).filter(t => t.text);

        const newModuleData = {
          id: Date.now(),
          title: target.file ? target.file.name : target.url,
          department: "Processed Video",
          duration: "Processed",
          status: "Completed",
          progress: 100,
          thumb: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
          transcript: finalTranscript,
          summary: summary || ["Summary could not be generated."],
          quiz: quiz || [],
          audioUrl: fullCloudinaryUrl,
          videoUrl: target.file ? URL.createObjectURL(target.file) : null
        };

        setTimeout(() => onComplete(newModuleData), 1500);

      } catch (err) {
        console.error("Pipeline Error:", err);
        setError(err.response?.data?.message || err.response?.data?.error || err.message || "An error occurred during processing.");
      }
    };

    runPipeline();
  }, [target, onComplete]);

  const steps = [
    { label: `Converting ${target.fullLength ? 'Full Video' : 'Selected Segment'} to MP3`, icon: <FileAudio size={18} />, accent: 'from-blue-500 to-cyan-400' },
    { label: "Transcribing Audio via Groq Whisper", icon: <Zap size={18} />, accent: 'from-violet-500 to-purple-400' },
    { label: "Stitching Complete Transcript", icon: <CheckCircle2 size={18} />, accent: 'from-emerald-500 to-teal-400' },
    { label: "Generating Summary & Quiz (Groq / Llama 3)", icon: <Brain size={18} />, accent: 'from-amber-500 to-orange-400' },
  ];

  const totalProgress = steps.length > 0 ? Math.min(((step + 1) / steps.length) * 100, 100) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto slide-up mt-6">
      {/* Glassmorphism processing card */}
      <div className="glass-card rounded-2xl p-8 glow-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Processing Training Material</h3>
              <p className="text-sm text-slate-500">Intelligent processing pipeline</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold gradient-text">{Math.round(totalProgress)}%</span>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mb-10">
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 via-violet-500 to-purple-600 rounded-full transition-all duration-700 ease-out relative overflow-hidden" style={{ width: `${totalProgress}%` }}>
              <div className="absolute inset-0 progress-shimmer" />
            </div>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100">
            <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <>
            {/* Horizontal stepper */}
            <div className="flex items-start justify-between relative px-4">
              {/* Connecting line behind the icons */}
              <div className="absolute top-7 left-[calc(12.5%+8px)] right-[calc(12.5%+8px)] h-1 bg-slate-100 rounded-full z-0">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${step > 0 ? Math.min(((step) / (steps.length - 1)) * 100, 100) : 0}%` }}
                />
              </div>

              {steps.map((s, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 relative z-10 flex-1">
                  {/* Icon circle */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    step > idx ? 'bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30 scale-100' :
                    step === idx ? `bg-gradient-to-br ${s.accent} text-white shadow-lg pulse-border scale-110` :
                    'bg-slate-100 text-slate-400 scale-95'
                  }`}>
                    {step > idx ? <Check size={24} strokeWidth={3} /> : React.cloneElement(s.icon, { size: 24 })}
                  </div>

                  {/* Label */}
                  <span className={`text-xs font-semibold text-center max-w-[120px] leading-tight transition-colors duration-500 ${
                    step > idx ? 'text-emerald-700' :
                    step === idx ? 'text-slate-800' :
                    'text-slate-400'
                  }`}>
                    {s.label}
                  </span>

                  {/* Status badge */}
                  {step === idx && (
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                  {step > idx && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">Done</span>
                  )}
                </div>
              ))}
            </div>
            
            {step >= 1 && liveTranscripts.length > 0 && (
              <div className="mt-8 p-5 bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 rounded-xl max-h-56 overflow-y-auto slide-up">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-violet-500" />
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Live Transcript Stream</h4>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-600 font-medium">{liveTranscripts.filter(Boolean).length}/{liveTranscripts.length} chunks</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {liveTranscripts.map((lt, idx) => (
                    <div key={idx} className={`flex gap-3 text-sm p-2.5 rounded-lg transition-all ${
                      lt ? 'bg-white/60 border border-slate-100 shadow-sm' : 'opacity-50'
                    }`}>
                      <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-md ${
                        lt ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {lt ? lt.time : `#${idx + 1}`}
                      </span>
                      <span className={lt ? 'text-slate-700 leading-relaxed' : 'text-slate-400 italic'}>
                        {lt ? (lt.text.length > 200 ? lt.text.substring(0, 200) + '...' : lt.text) : 'Processing...'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const UploadSection = ({ onProcessStart }) => {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Settings
  const [fullLength, setFullLength] = useState(true);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(100);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  useEffect(() => {
    if (url || file) {
      setIsFetchingMeta(true);
      const timer = setTimeout(() => {
        const mockDuration = file ? 1245 : 870;
        setVideoDuration(mockDuration);
        setStartTime(0);
        setEndTime(mockDuration);
        setIsFetchingMeta(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setVideoDuration(0);
    }
  }, [url, file]);

  const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleProcess = () => {
    if (!url && !file) return;
    onProcessStart({ file, url, fullLength }); // pass target configuration upwards
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setUrl("");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUrl("");
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-8 mb-8 shadow-sm">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Ingest New Training Material</h2>
        <p className="text-slate-600 mb-6">
          Upload an MP4 or paste a YouTube/Video link. The pipeline will extract the audio, transcribe it, summarize key points, and generate a retention quiz automatically.
        </p>

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-6 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 bg-slate-50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <FileVideo size={24} />
              </div>
              <div className="text-slate-900 font-medium">
                {file.name} <span className="text-slate-500 text-sm">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
              </div>
              <button onClick={() => setFile(null)} className="text-red-500 text-sm font-medium hover:underline flex items-center gap-1">
                <X size={14} /> Remove File
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-2">
                <UploadCloud size={24} />
              </div>
              <p className="text-slate-700 font-medium text-sm">Drag and drop your video file here</p>
              <p className="text-slate-500 text-xs mb-4">MP4, MOV, or AVI up to 500MB</p>
              <label className="cursor-pointer bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Browse Files
                <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">OR PASTE LINK</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Youtube className="text-slate-400" size={18} />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-shadow disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              placeholder="e.g., https://youtube.com/watch?v=... or internal MP4 link"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (e.target.value) setFile(null);
              }}
              disabled={!!file}
            />
          </div>
        </div>

        {/* Extraction Settings Panel */}
        <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Settings2 size={16} className="text-slate-500" />
              Extraction Settings
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={fullLength}
                onChange={(e) => setFullLength(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Process Full Length</span>
            </label>
          </div>

          {!fullLength && (
            <div className="fade-in pt-4 pb-1">
              {isFetchingMeta ? (
                <div className="flex items-center justify-center py-6 gap-3 text-slate-500">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Analyzing video length...</span>
                </div>
              ) : videoDuration > 0 ? (
                <>
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                    <span>Start Position ({formatTime(startTime)})</span>
                    <span>End Position ({formatTime(endTime)})</span>
                  </div>

                  {/* Custom Dual Range Slider based on Time */}
                  <div className="relative h-2 bg-slate-200 rounded-full my-5">
                    {/* Active Track */}
                    <div
                      className="absolute h-full bg-blue-500 rounded-full"
                      style={{ left: `${(startTime / videoDuration) * 100}%`, right: `${100 - (endTime / videoDuration) * 100}%` }}
                    />

                    {/* Input 1: Start */}
                    <input
                      type="range"
                      min="0" max={videoDuration}
                      value={startTime}
                      onChange={e => setStartTime(Math.min(Number(e.target.value), endTime - 1))}
                      className="absolute w-full -top-1.5 h-5 opacity-0 cursor-pointer pointer-events-auto"
                      style={{ zIndex: startTime > (videoDuration / 2) ? 5 : 4 }}
                    />

                    {/* Input 2: End */}
                    <input
                      type="range"
                      min="0" max={videoDuration}
                      value={endTime}
                      onChange={e => setEndTime(Math.max(Number(e.target.value), startTime + 1))}
                      className="absolute w-full -top-1.5 h-5 opacity-0 cursor-pointer pointer-events-auto"
                      style={{ zIndex: endTime < (videoDuration / 2) ? 5 : 4 }}
                    />

                    {/* Visual Thumbs */}
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full pointer-events-none shadow-md transition-transform" style={{ left: `calc(${(startTime / videoDuration) * 100}% - 8px)` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full pointer-events-none shadow-md transition-transform" style={{ left: `calc(${(endTime / videoDuration) * 100}% - 8px)` }} />
                  </div>

                  <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                    <Scissors size={14} className="text-slate-400" />
                    Segment selected: <span className="font-semibold text-slate-700">{formatTime(endTime - startTime)}</span> to be processed.
                  </p>
                </>
              ) : (
                <div className="py-4 text-center text-xs text-slate-500 bg-slate-100 rounded border border-slate-200 border-dashed">
                  Please provide a video link or file first to select specific segments.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleProcess}
            disabled={!url && !file}
            className="px-8 py-3 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            Extract MP3 & Process
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardGrid = ({ modules, onSelectModule }) => (
  <div>
    <h3 className="text-lg font-bold text-slate-900 mb-4">Your Learning Modules</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map((mod) => (
        <div
          key={mod._id || mod.id}
          onClick={() => onSelectModule(mod)}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col group"
        >
          <div className="relative h-40 overflow-hidden bg-slate-100">
            <img src={mod.thumb} alt={mod.title} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors" />
            <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-xs font-medium px-2 py-1 rounded">
              {mod.duration}
            </div>
            {mod.status === "Completed" && (
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                <Check size={12} /> Completed
              </div>
            )}
          </div>
          <div className="p-4 flex flex-col flex-1">
            <div className="text-xs font-semibold text-blue-600 mb-1">{mod.department}</div>
            <h4 className="font-bold text-slate-900 text-sm leading-snug mb-3 flex-1">{mod.title}</h4>

            <div className="flex items-center gap-2 mt-auto">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${mod.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                  style={{ width: `${mod.progress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-500">{mod.progress}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ActiveModuleView = ({ module, onBack }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [mediaMode, setMediaMode] = useState(module.videoUrl ? 'video' : 'audio');

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);
  const mediaRef = useRef(null);
  const audioRef = useRef(null);

  const isValidQuiz = module.quiz && Array.isArray(module.quiz) && module.quiz.length > 0;
  const score = isValidQuiz ? Object.keys(quizAnswers).reduce((acc, idx) => {
    return acc + (quizAnswers[idx] === module.quiz[idx].answer ? 1 : 0);
  }, 0) : 0;

  const activeRef = mediaMode === 'video' ? mediaRef : audioRef;

  const togglePlay = () => {
    if (!activeRef.current) return;
    if (isPlaying) activeRef.current.pause();
    else activeRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (activeRef.current) setCurrentTime(activeRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (activeRef.current) setMediaDuration(activeRef.current.duration);
  };

  const handleSeek = (e) => {
    if (!activeRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    activeRef.current.currentTime = pos * mediaDuration;
  };

  return (
    <div className="w-full max-w-6xl mx-auto slide-up pb-12">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6 font-medium group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </button>

      {/* Module title banner */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        <div className="relative z-10">
          <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest mb-1">{module.department}</p>
          <h2 className="text-white text-xl font-bold">{module.title}</h2>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Media & Transcript */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Video/Audio Player */}
          <div className="rounded-2xl overflow-hidden shadow-xl glow-border bg-slate-900">
            {/* Media toggle buttons */}
            {module.videoUrl && (
              <div className="flex bg-slate-800/50 border-b border-slate-700/50">
                <button
                  onClick={() => { setMediaMode('video'); setIsPlaying(false); }}
                  className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    mediaMode === 'video' ? 'text-white bg-gradient-to-r from-blue-600/30 to-violet-600/30 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <PlayCircle size={14} /> Video Player
                </button>
                <button
                  onClick={() => { setMediaMode('audio'); setIsPlaying(false); }}
                  className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    mediaMode === 'audio' ? 'text-white bg-gradient-to-r from-violet-600/30 to-purple-600/30 border-b-2 border-violet-400' : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Volume2 size={14} /> Audio Only
                </button>
              </div>
            )}

            {/* Video view */}
            {mediaMode === 'video' && module.videoUrl ? (
              <div className="aspect-video bg-black">
                <video
                  ref={mediaRef}
                  src={module.videoUrl}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            ) : (
              /* Audio visualization */
              <div className="aspect-video relative flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 overflow-hidden">
                <div className="absolute inset-0">
                  {/* Animated gradient orbs */}
                  <div className="absolute top-10 left-10 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-10 right-10 w-40 h-40 bg-violet-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}} />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-5">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center border border-blue-400/20 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
                    <Music size={36} className="text-blue-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-white font-bold text-lg mb-1">Extracted Audio Track</h3>
                    <p className="text-slate-400 text-sm">High Quality MP3 • 128kbps</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden audio element for audio mode */}
            <audio
              ref={audioRef}
              src={module.audioUrl}
              onTimeUpdate={mediaMode === 'audio' ? handleTimeUpdate : undefined}
              onLoadedMetadata={mediaMode === 'audio' ? handleLoadedMetadata : undefined}
              onEnded={() => setIsPlaying(false)}
              hidden
            />

            {/* Playback controls */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 border-t border-slate-700/50 flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center hover:from-blue-400 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/25 flex-shrink-0"
              >
                {isPlaying ? <Pause size={20} className="text-white" fill="currentColor" /> : <Play size={20} className="text-white ml-0.5" fill="currentColor" />}
              </button>
              <div className="flex-1 flex items-center gap-3">
                <span className="text-blue-300 text-xs font-bold tabular-nums">{formatTime(currentTime)}</span>
                <div className="flex-1 h-2 bg-slate-700/80 rounded-full overflow-hidden cursor-pointer group relative" onClick={handleSeek}>
                  <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full relative group-hover:from-blue-400 group-hover:to-violet-400 transition-colors" style={{ width: `${(currentTime / mediaDuration) * 100 || 0}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-slate-400 text-xs font-bold tabular-nums">{formatTime(mediaDuration)}</span>
              </div>
            </div>
          </div>

          {/* Transcript View */}
          <div className="glass-card rounded-2xl p-6 shadow-sm flex-1 glow-border flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <FileText className="text-white" size={16} />
                </div>
                Searchable Transcript
              </h3>
              <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                {module.transcript ? module.transcript.length : 0} segments
              </span>
            </div>
            <div className="space-y-3 overflow-y-auto pr-2 flex-1">
              {module.transcript && module.transcript.map((line, idx) => (
                <div key={idx} className="flex gap-3 group cursor-pointer p-3 rounded-xl hover:bg-blue-50/50 transition-all border border-transparent hover:border-blue-100" style={{animationDelay: `${idx * 50}ms`}}>
                  <span className="text-xs font-bold text-blue-700 bg-gradient-to-br from-blue-50 to-blue-100 px-2.5 py-1 rounded-lg h-fit tabular-nums whitespace-nowrap">
                    {line.time}
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors flex-1 break-words whitespace-pre-wrap">
                    {line.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Output & Quiz */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          <div className="glass-card rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1 glow-border">
            <div className="flex bg-gradient-to-r from-slate-50 to-blue-50/50">
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex-1 py-3.5 text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
                  activeTab === 'summary' ? 'border-blue-600 text-blue-700 bg-blue-50/80' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles size={14} />
                Summary
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex-1 py-3.5 text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
                  activeTab === 'quiz' ? 'border-violet-600 text-violet-700 bg-violet-50/80' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Brain size={14} />
                Knowledge Quiz
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {activeTab === 'summary' && (
                <div className="fade-in">
                  <div className="flex items-center gap-2 mb-5 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-white" />
                    </div>
                    <span className="text-xs font-bold text-emerald-700">Auto-generated summary</span>
                  </div>
                  <div className="space-y-4">
                    {module.summary && module.summary.map((paragraph, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50/60 border border-slate-100 hover:bg-blue-50/30 hover:border-blue-100 transition-all border-l-4 border-l-blue-400" style={{animationDelay: `${idx * 80}ms`}}>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{paragraph}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'quiz' && (
                <div className="fade-in flex flex-col h-full">
                  {!isValidQuiz ? (
                    <div className="text-sm text-slate-500 py-4 text-center">Quiz data is not available for this module.</div>
                  ) : !quizSubmitted ? (
                    <>
                      <div className="mb-4">
                        <h4 className="text-sm font-bold text-slate-900">Active Learning Check</h4>
                        <p className="text-xs text-slate-500 mt-1">Answer these questions to verify retention.</p>
                      </div>
                      <div className="space-y-6 flex-1">
                        {module.quiz.map((q, qIdx) => (
                          <div key={qIdx}>
                            <p className="text-sm font-medium text-slate-800 mb-3">{qIdx + 1}. {q.question}</p>
                            <div className="space-y-2">
                              {q.options && q.options.map((opt, oIdx) => (
                                <label key={oIdx} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300">
                                  <input
                                    type="radio"
                                    name={`q-${qIdx}`}
                                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                                    checked={quizAnswers[qIdx] === oIdx}
                                    onChange={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                  />
                                  <span className="text-sm text-slate-700 leading-snug">{opt}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        disabled={Object.keys(quizAnswers).length !== module.quiz.length}
                        className="w-full mt-6 py-3 bg-slate-900 text-white font-semibold text-sm rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Submit Answers
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8 fade-in">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${score === module.quiz.length ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        <GraduationCap size={32} />
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">
                        {score === module.quiz.length ? 'Perfect Score!' : 'Good Effort!'}
                      </h4>
                      <p className="text-slate-600 mb-6">You scored {score} out of {module.quiz.length} correct.</p>

                      <div className="w-full space-y-3 mb-6">
                        {module.quiz.map((q, qIdx) => {
                          const isCorrect = quizAnswers[qIdx] === q.answer;
                          return (
                            <div key={qIdx} className={`p-3 rounded-lg text-left text-sm border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                              <span className="font-medium text-slate-900 block mb-1">Q{qIdx + 1}: {isCorrect ? 'Correct' : 'Incorrect'}</span>
                              <span className="text-slate-600 text-xs">Correct answer: {q.options[q.answer]}</span>
                            </div>
                          )
                        })}
                      </div>

                      <button
                        onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); setActiveTab('summary'); }}
                        className="text-blue-600 font-medium text-sm hover:underline"
                      >
                        Review Summary Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeModule, setActiveModule] = useState(null);
  const [processTarget, setProcessTarget] = useState(null);
  const [modules, setModules] = useState(MOCK_MODULES);
  const [searchQuery, setSearchQuery] = useState("");

  const handleProcessStart = (targetData) => {
    // targetData represents { file, url, fullLength, startTime, endTime }
    setProcessTarget(targetData);
    setActiveModule(null); // Hide dashboard, show pipeline
  };

  const handleProcessComplete = (newModule) => {
    setModules([newModule, ...modules]);
    setProcessTarget(null);
    setActiveModule(newModule); // Hide pipeline, show active view
  };

  const filteredModules = modules.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <style>{globalStyles}</style>

      <Navbar
        onHome={() => { setActiveModule(null); setProcessTarget(null); setSearchQuery(""); }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          {processTarget ? (
            <ProcessPipeline target={processTarget} onComplete={handleProcessComplete} />
          ) : !activeModule ? (
            <div className="max-w-6xl mx-auto fade-in">
              <UploadSection onProcessStart={handleProcessStart} />
              <DashboardGrid modules={filteredModules} onSelectModule={setActiveModule} />
            </div>
          ) : (
            <ActiveModuleView
              module={activeModule}
              onBack={() => setActiveModule(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

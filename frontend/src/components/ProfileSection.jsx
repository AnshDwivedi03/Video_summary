import React, { useState } from "react";
import { User, Award, BookOpen, Clock, ChevronRight, FileText, CheckCircle2, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProfileSection = ({ user, records = [], modules = [] }) => {
  const [expandedId, setExpandedId] = useState(null);

  // Combine records with their module data
  const learningHistory = records.map(record => {
    const module = modules.find(m => m._id === record.moduleId || m.id === record.moduleId);
    return {
      ...record,
      moduleTitle: module?.title || "Unknown Module",
      summary: module?.summary || "No summary available for this module.",
      thumbnail: module?.thumb || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800"
    };
  });

  const stats = [
    { label: "Modules Completed", value: learningHistory.length, icon: <BookOpen className="text-blue-500" /> },
    { label: "Average Score", value: learningHistory.length ? `${Math.round(learningHistory.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) / learningHistory.length)}%` : "N/A", icon: <Award className="text-violet-500" /> },
    { label: "Learning Hours", value: "1.2h", icon: <Clock className="text-cyan-500" /> }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-bg-secondary p-10 rounded-[3rem] border border-border-primary shadow-xl shadow-blue-500/5">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 p-1">
            <div className="w-full h-full rounded-full bg-bg-secondary flex items-center justify-center border-4 border-bg-secondary overflow-hidden">
               <User size={64} className="text-blue-600" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-4 border-bg-secondary rounded-full flex items-center justify-center text-white">
            <CheckCircle2 size={20} />
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-4xl font-black tracking-tight">{user.name}</h1>
          <p className="text-text-secondary font-medium text-lg">Growth Associate • OnboardHQ Early Access</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
            <span className="px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-bold uppercase tracking-widest">Engineering</span>
            <span className="px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 text-xs font-bold uppercase tracking-widest">Product</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 border-l border-border-primary pl-10 hidden lg:grid">
          {stats.map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* History Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-4">
          <History className="text-blue-600" size={24} />
          <h2 className="text-2xl font-black tracking-tight">Your Learning Passport</h2>
        </div>

        <div className="space-y-4">
          {learningHistory.length === 0 ? (
            <div className="p-12 rounded-[2rem] border-2 border-dashed border-border-primary text-center space-y-4">
              <div className="w-16 h-16 bg-bg-secondary rounded-2xl flex items-center justify-center mx-auto text-text-secondary">
                <BookOpen size={32} />
              </div>
              <p className="text-text-secondary font-medium">No learning records found yet. Start your first module!</p>
            </div>
          ) : (
            learningHistory.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-bg-secondary rounded-[2rem] border border-border-primary hover:border-blue-500/30 transition-all overflow-hidden"
              >
                <div 
                  className="p-6 flex items-center gap-6 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === index ? null : index)}
                >
                  <div className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-border-primary">
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate group-hover:text-blue-600 transition-colors">{item.moduleTitle}</h3>
                    <div className="flex items-center gap-4 text-xs text-text-secondary font-medium">
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(item.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-bg-primary text-text-primary rounded-md border border-border-primary">Score: {item.score}/{item.totalQuestions}</span>
                      <span className={`px-2 py-0.5 rounded-md border font-bold uppercase tracking-tighter text-[10px] ${
                        item.status === 'Failed' 
                        ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                        : item.status === 'Perfect'
                        ? 'bg-green-500/10 border-green-500/20 text-green-500'
                        : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                      }`}>
                        {item.status || 'Completed'}
                      </span>
                    </div>
                  </div>

                  <div className={`transition-transform duration-300 ${expandedId === index ? 'rotate-90' : ''}`}>
                    <ChevronRight size={20} className="text-text-secondary" />
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border-primary bg-bg-primary/30"
                    >
                      <div className="p-8 space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-widest">
                            <FileText size={16} />
                            Intelligence Summary
                          </div>
                          <p className="text-text-secondary leading-relaxed font-medium bg-bg-secondary/50 p-6 rounded-2xl border border-border-primary italic">
                            "{item.summary}"
                          </p>
                        </div>
                        
                        <div className="flex justify-end">
                            <button className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
                                Re-watch Module
                            </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;

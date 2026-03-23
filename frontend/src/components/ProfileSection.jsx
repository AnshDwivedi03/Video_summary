import React, { useState } from "react";
import { User, Award, BookOpen, Clock, ChevronRight, FileText, CheckCircle2, History, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProfileSection = ({ user, records = [], modules = [] }) => {
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

  const modulesCompleted = learningHistory.length;

  return (
    <div className="w-full h-fit flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Window - Refactored to be a page component */}
      <div className="relative w-full bg-bg-secondary rounded-[3rem] border border-border-primary shadow-sm overflow-hidden flex flex-col">

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Top Section: User & Stats */}
          <div className="p-10 pb-0 flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 p-1 shadow-lg shadow-emerald-500/20">
                  <div className="w-full h-full rounded-[1.8rem] bg-bg-secondary flex items-center justify-center border-2 border-transparent overflow-hidden">
                    <User size={52} className="text-emerald-500" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-bg-secondary rounded-full flex items-center justify-center text-white">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-tighter text-text-primary">{user.name}</h1>
                <p className="text-emerald-600 font-bold uppercase tracking-[0.2em] text-xs">
                  {user.role} • Certified Expert
                </p>
                <div className="flex gap-2 pt-2">
                  <div className="px-3 py-1 rounded-lg bg-bg-primary border border-border-primary text-[10px] font-black uppercase text-text-secondary">Level 12</div>
                  <div className="px-3 py-1 rounded-lg bg-bg-primary border border-border-primary text-[10px] font-black uppercase text-text-secondary">Active Access</div>
                </div>
              </div>
            </div>

            <div className="bg-bg-primary rounded-[2rem] border border-border-primary p-6 px-10 text-center md:text-right space-y-1 min-w-[200px]">
                <BookOpen className="text-emerald-600 mb-2 md:ml-auto" size={24} />
                <p className="text-4xl font-black text-text-primary">{modulesCompleted}</p>
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">Modules Completed</p>
            </div>
          </div>

          {/* Track Record Header */}
          <div className="px-10 mt-12 mb-6">
            <div className="flex items-center gap-3">
              <Shield className="text-emerald-600" size={24} />
              <h2 className="text-2xl font-black tracking-tight">Track Record</h2>
              <div className="flex-1 h-px bg-border-primary ml-4" />
            </div>
          </div>

          {/* Records List */}
          <div className="px-10 pb-10 space-y-4">
            {learningHistory.length === 0 ? (
              <div className="p-12 rounded-[2rem] border-2 border-dashed border-border-primary text-center space-y-4">
                <div className="w-16 h-16 bg-bg-secondary rounded-2xl flex items-center justify-center mx-auto text-text-secondary/30">
                  <History size={32} />
                </div>
                <p className="text-text-secondary font-bold">No performance history found yet.</p>
              </div>
            ) : (
              learningHistory.map((item, index) => {
                const accuracy = Math.round((item.score / item.totalQuestions) * 100);
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-6 p-5 bg-bg-primary/50 hover:bg-bg-primary rounded-2xl border border-transparent hover:border-border-primary transition-all group"
                  >
                    <div className="w-16 h-12 bg-bg-secondary rounded-xl overflow-hidden shrink-0 border border-border-primary">
                      <img src={item.thumbnail} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-sm truncate">{item.moduleTitle}</h4>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-text-secondary">
                        <span className="flex items-center gap-1"><Clock size={10} /> {new Date(item.date).toLocaleDateString()}</span>
                        <span className="w-1 h-1 rounded-full bg-border-primary" />
                        <span className={`uppercase ${accuracy >= 80 ? 'text-emerald-600' : ''}`}>{item.status || 'Verified'}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-black">{item.score}/{item.totalQuestions}</div>
                      <div className="w-16 h-1 bg-border-primary rounded-full mt-1">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${accuracy}%` }} />
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;

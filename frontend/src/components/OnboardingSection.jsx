import React from "react";
import { Play, Clock, ChevronRight, Briefcase, Users, Star } from "lucide-react";
import { motion } from "framer-motion";

const OnboardingSection = ({ modules = [], onSelectModule, role = 'sde1' }) => {
  const displayModules = modules.filter(m => !m.roles || m.roles.includes(role));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight uppercase">{role} Training Path</h2>
          <p className="text-text-secondary mt-1">Curated intelligence modules specifically for your position.</p>
        </div>
        <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full">
                <Briefcase size={14} /> Organization
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-full">
                <Users size={14} /> New Hires
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayModules.map((mod, idx) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onSelectModule(mod)}
            className="group relative bg-bg-secondary rounded-3xl overflow-hidden border border-border-primary hover:border-blue-400/50 hover:shadow-2xl transition-all cursor-pointer"
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={mod.thumb} 
                alt={mod.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <Play size={20} fill="currentColor" />
                </div>
                <span className="text-white text-sm font-bold">{mod.duration}</span>
              </div>
              <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                Onboarding
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{mod.department}</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={12} fill="currentColor" />
                  <span className="text-xs font-bold">Required</span>
                </div>
              </div>
              <h4 className="font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors">{mod.title}</h4>
              <div className="flex items-center justify-between pt-2 border-t border-border-primary">
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Clock size={14} />
                  <span>Valid until 2026</span>
                </div>
                <ChevronRight size={18} className="text-text-secondary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingSection;

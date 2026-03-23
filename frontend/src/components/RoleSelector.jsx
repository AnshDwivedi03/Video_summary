import React from "react";
import { Code, Terminal, Database, Lightbulb, ChevronRight, UserRound, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const RoleSelector = ({ onSelectRole }) => {
  const positions = [
    {
      id: 'sde1',
      title: "SDE 1",
      desc: "New joiners and junior engineers focused on core tools and culture.",
      icon: <Terminal size={32} />,
      color: "blue"
    },
    {
      id: 'sde2',
      title: "SDE 2",
      desc: "Mid-level engineers mastering best practices and architecture.",
      icon: <Code size={32} />,
      color: "violet"
    },
    {
      id: 'sde3',
      title: "SDE 3 / Lead",
      desc: "Senior technical leaders focused on deep systems and scaling.",
      icon: <Database size={32} />,
      color: "cyan"
    },
    {
      id: 'pm',
      title: "Product Manager",
      desc: "Strategic minds focused on product vision and company strategy.",
      icon: <Lightbulb size={32} />,
      color: "amber"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 py-6 sm:py-8 px-4">
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1 sm:mb-2">
          <ShieldCheck size={14} /> Identity Verification
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-text-primary">
          Select Your <span className="text-emerald-600 underline decoration-emerald-500/30 underline-offset-4 sm:underline-offset-8">Position</span>
        </h1>
        <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto font-medium px-2">
          Welcome to the team. Please select your hired position to unlock your personalized intelligence training path.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {positions.map((pos) => (
          <motion.div
            key={pos.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectRole(pos.id)}
            className={`relative group p-6 rounded-[2rem] bg-bg-secondary border border-border-primary hover:border-emerald-500/50 hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col justify-between active:bg-emerald-500/5`}
          >
            <div className={`absolute -top-6 -right-6 p-8 text-${pos.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
               {pos.icon}
            </div>
            
            <div className="space-y-6">
              <div className={`w-12 h-12 rounded-xl bg-${pos.color}-100 dark:bg-${pos.color}-900/30 text-${pos.color}-600 flex items-center justify-center pointer-events-none`}>
                {pos.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tight">{pos.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed font-medium">
                  {pos.desc}
                </p>
              </div>
            </div>

            <div className={`mt-6 flex items-center gap-2 text-${pos.color}-600 font-bold group-hover:gap-4 transition-all uppercase tracking-widest text-[9px] pointer-events-none`}>
              Unlock Training <ChevronRight size={12} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;

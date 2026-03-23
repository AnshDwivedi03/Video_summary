import React from "react";
import { CheckCircle2, History, Award, BookOpen, Clock } from "lucide-react";
import { motion } from "framer-motion";

const ScoreTable = ({ records = [] }) => {
  // Mock records if none
  const displayRecords = records.length > 0 ? records : [
    {
      id: 1,
      videoTitle: "Information Security Induction",
      score: 3,
      totalQuestions: 3,
      date: "2026-03-22",
      status: "Perfect"
    },
    {
      id: 2,
      videoTitle: "React 19 Performance Hooks",
      score: 4,
      totalQuestions: 5,
      date: "2026-03-21",
      status: "Passed"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shadow-inner">
              <History size={24} />
          </div>
          <div>
              <h3 className="text-2xl font-black tracking-tight">Intelligence Ledger</h3>
              <p className="text-sm text-text-secondary font-medium">Historical performance and assessment records.</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-8">
            <div className="text-center">
                <div className="text-2xl font-black text-emerald-600">{displayRecords.length}</div>
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Sessions</div>
            </div>
            <div className="w-px h-8 bg-border-primary" />
            <div className="text-center">
                <div className="text-2xl font-black text-emerald-600">
                    {Math.round(displayRecords.reduce((acc, r) => acc + (r.score/r.totalQuestions), 0) / (displayRecords.length || 1) * 100)}%
                </div>
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Avg accuracy</div>
            </div>
        </div>
      </div>

      <div className="space-y-3">
        {displayRecords.map((record, idx) => {
          const accuracy = Math.round((record.score / record.totalQuestions) * 100);
          const isPerfect = record.score === record.totalQuestions;
          
          return (
            <motion.div 
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative bg-bg-secondary rounded-[2rem] border border-border-primary p-4 hover:border-emerald-500/30 hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-bg-primary flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
                <Award size={24} />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-black tracking-tight text-text-primary group-hover:text-emerald-600 transition-colors truncate">
                  {record.videoTitle}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                        <Clock size={12} /> {record.date}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border-primary" />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isPerfect ? 'text-emerald-500' : 'text-text-secondary'}`}>
                        {record.status || (accuracy >= 80 ? 'Elite' : 'Standard')}
                    </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                    <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-2xl font-black text-text-primary">{record.score}</span>
                        <span className="text-sm font-bold text-text-secondary">/ {record.totalQuestions}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-1.5 bg-bg-primary rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${accuracy}%` }}
                                className={`h-full rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]`}
                            />
                        </div>
                        <span className="text-xs font-black text-emerald-600">{accuracy}%</span>
                    </div>
                </div>
                
                <div className={`hidden sm:flex w-10 h-10 rounded-full items-center justify-center ${isPerfect ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-bg-primary text-text-secondary'}`}>
                    {isPerfect ? <CheckCircle2 size={20} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                </div>
              </div>
            </motion.div>
          );
        })}

        {displayRecords.length === 0 && (
            <div className="py-20 text-center space-y-4 bg-bg-secondary/50 rounded-[3rem] border border-dashed border-border-primary">
                <div className="w-16 h-16 bg-bg-primary rounded-full flex items-center justify-center mx-auto text-text-secondary/30">
                    <History size={32} />
                </div>
                <p className="text-text-secondary font-bold">No records found in the intelligence ledger.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ScoreTable;

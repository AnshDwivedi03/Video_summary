import React from "react";
import { CheckCircle2, History, Award, BookOpen } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center">
            <History size={20} />
        </div>
        <div>
            <h3 className="text-xl font-bold">Quiz History</h3>
            <p className="text-sm text-text-secondary">Track your learning progress and performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-bg-secondary border border-border-primary shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                <BookOpen size={24} />
            </div>
            <div>
                <div className="text-2xl font-bold">{displayRecords.length}</div>
                <div className="text-xs text-text-secondary font-medium uppercase tracking-wider">Quizzes Taken</div>
            </div>
        </div>
        <div className="p-4 rounded-2xl bg-bg-secondary border border-border-primary shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
                <Award size={24} />
            </div>
            <div>
                <div className="text-2xl font-bold">{displayRecords.filter(r => r.score === r.totalQuestions).length}</div>
                <div className="text-xs text-text-secondary font-medium uppercase tracking-wider">Perfect Scores</div>
            </div>
        </div>
      </div>

      <div className="bg-bg-secondary rounded-2xl border border-border-primary overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-primary/50 text-text-secondary">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-b border-border-primary">Video Title</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-b border-border-primary">Score</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-b border-border-primary">Accuracy</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-b border-border-primary">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-b border-border-primary text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary">
              {displayRecords.map((record, idx) => (
                <motion.tr 
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-bg-primary/30 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-sm">{record.videoTitle}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-blue-600">{record.score}</span>
                    <span className="text-text-secondary"> / {record.totalQuestions}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 w-24 bg-bg-primary rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${record.score / record.totalQuestions > 0.8 ? 'bg-green-500' : 'bg-blue-500'}`} 
                                style={{ width: `${(record.score / record.totalQuestions) * 100}%` }} 
                            />
                        </div>
                        <span className="text-xs font-bold">{Math.round((record.score / record.totalQuestions) * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">{record.date}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        record.status === 'Perfect' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : record.status === 'Failed'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {record.status === 'Perfect' && <CheckCircle2 size={10} />}
                      {record.status || 'Completed'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScoreTable;

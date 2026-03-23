import React, { useState } from "react";
import { UploadCloud, Sparkles, X, FileVideo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ModernVideoInput = ({ onProcessStart }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleProcess = () => {
    if (!file) return;
    onProcessStart({ file, url: null, fullLength: true });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-2">
      {/* Upload Card */}
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.995 }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative group overflow-hidden rounded-2xl p-4 sm:p-5 border-2 border-dashed transition-all duration-200 ${
          isDragging ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-border-primary bg-bg-secondary hover:border-emerald-400/50'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/10">
            <UploadCloud size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg tracking-tight text-text-primary">Upload Training Media</h3>
            <p className="text-[10px] sm:text-xs text-text-secondary font-medium">Drag & drop video or tap to browse</p>
          </div>
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={(e) => setFile(e.target.files[0])}
            accept="video/*"
          />
        </div>
        
        <AnimatePresence>
          {file && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="mt-4 p-3 rounded-xl bg-bg-primary border border-border-primary flex items-center gap-3 shadow-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                <FileVideo size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{file.name}</p>
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {file && !isDragging && (
        <motion.button
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleProcess}
          className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] text-sm uppercase tracking-wider"
        >
          <Sparkles size={16} />
          Start Intelligence Pipeline
        </motion.button>
      )}
    </div>
  );
};

export default ModernVideoInput;

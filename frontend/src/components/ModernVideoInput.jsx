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
    <div className="w-full max-w-2xl mx-auto py-4">
      {/* Upload Card */}
      <motion.div
        whileHover={{ y: -5 }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative group overflow-hidden rounded-[2.5rem] p-12 border-2 border-dashed transition-all duration-300 ${
          isDragging ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-border-primary bg-bg-secondary hover:border-blue-400/50'
        }`}
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-[2rem] bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/10">
            <UploadCloud size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="font-black text-2xl tracking-tight">Upload Training Media</h3>
            <p className="text-sm text-text-secondary font-medium">Drag & drop your video or click to browse files</p>
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-8 p-5 rounded-2xl bg-bg-primary border border-border-primary flex items-center gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                <FileVideo size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{file.name}</p>
                <p className="text-xs text-text-secondary font-medium uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {file && !isDragging && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleProcess}
          className="w-full mt-6 py-4 rounded-[2rem] bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-black shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
        >
          <Sparkles size={20} />
          Start Intelligence Pipeline
        </motion.button>
      )}
    </div>
  );
};

export default ModernVideoInput;

import React from "react";
import { BookOpen, Search, Moon, Sun, User as UserIcon } from "lucide-react";
import { useTheme } from "./ThemeContext";

const Navbar = ({ user, searchQuery, setSearchQuery, onSignInClick, onHomeClick }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 w-full h-20 bg-bg-secondary/80 backdrop-blur-xl border-b border-border-primary z-50 flex items-center justify-between px-8 shadow-sm">
      <div 
        onClick={onHomeClick}
        className="flex items-center gap-4 cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
          <BookOpen size={22} />
        </div>
        <div className="text-2xl font-black tracking-tighter text-text-primary">
          Onboard<span className="text-blue-600">HQ</span>
        </div>
      </div>

      <div className="hidden md:flex items-center flex-1 max-w-lg mx-12">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary group-focus-within:text-blue-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search learning material..."
            className="block w-full pl-12 pr-4 py-3 bg-bg-primary border border-border-primary rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-bg-primary border border-border-primary text-text-secondary hover:text-blue-600 hover:border-blue-400/50 transition-all shadow-sm"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {user ? (
          <div className="flex items-center gap-3 pl-4 border-l border-border-primary">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{user.name}</p>
              <p className="text-[10px] text-text-secondary font-medium uppercase tracking-widest mt-1">{user.role?.toUpperCase() || "Member"}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-100 to-violet-100 dark:from-blue-900/40 dark:to-violet-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
              {user.name?.[0]?.toUpperCase()}
            </div>
          </div>
        ) : (
          <button 
            onClick={onSignInClick}
            className="w-10 h-10 rounded-2xl bg-bg-primary border border-border-primary flex items-center justify-center text-text-secondary hover:text-blue-600 hover:border-blue-400/50 transition-all shadow-sm"
            title="Sign In"
          >
            <UserIcon size={20} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;

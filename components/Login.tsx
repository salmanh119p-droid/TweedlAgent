import React, { useState } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, Moon, Sun } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, theme, toggleTheme }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for a better feel
    setTimeout(() => {
      // Hardcoded credentials
      if (username === 'TweedlAI' && password === 'TW3d#11@AWP') {
        localStorage.setItem('tweedl_auth_token', 'valid-session-' + Date.now());
        onLogin();
      } else {
        setError('Invalid credentials. Access denied.');
        setIsLoading(false);
      }
    }, 800);
  };

  const inputClass = `
    block w-full rounded-xl border-slate-200 dark:border-white/10 shadow-sm 
    focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 
    pl-10 p-3 border 
    bg-white/50 dark:bg-black/20 
    text-slate-900 dark:text-white 
    caret-slate-900 dark:caret-white
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    transition-all duration-200
    backdrop-blur-sm
  `;

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-200">
      
      {/* Background Gradient & Watermark - Matching App.tsx */}
      <div className="absolute inset-0 z-[-1]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-100 to-white dark:from-indigo-950 dark:via-slate-950 dark:to-black"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] dark:bg-indigo-600/20"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px] dark:bg-purple-900/20"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
           <h1 className="text-[30vw] font-black text-slate-900/5 dark:text-white/5 tracking-tighter leading-none whitespace-nowrap blur-sm">
            TWEEDL
          </h1>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleTheme}
          className="p-3 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10 rounded-full transition-all backdrop-blur-sm"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <span className="text-white font-bold text-3xl tracking-tighter">T</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">
          Tweedl Admin
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
          Authorized personnel only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 sm:rounded-2xl sm:px-10 border border-white/40 dark:border-white/10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50/80 dark:bg-red-900/20 p-4 border border-red-200/50 dark:border-red-800/30 backdrop-blur-sm animate-pulse">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ShieldCheck className="h-5 w-5 text-red-500 dark:text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/20 text-sm font-bold text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                  ${isLoading ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'}
                `}
              >
                {isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-slate-500 dark:text-slate-500 font-mono text-xs">SECURE ENVIRONMENT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
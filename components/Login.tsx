import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  onNavigateToRegister: () => void;
  error: string | null;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToRegister, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Giriş Yap</h1>
          <p className="text-slate-400">OtoParça Pro hesabınıza erişin</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Kullanıcı adınız"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Şifre</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-900/50 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
              />
              <span className="text-slate-400 group-hover:text-slate-300 transition-colors">Beni Hatırla</span>
            </label>
            <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">Şifremi Unuttum</button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-900/20"
          >
            Giriş Yap
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Hesabınız yok mu?{' '}
          <button onClick={onNavigateToRegister} className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Kayıt Ol
          </button>
        </div>
      </div>
    </div>
  );
};

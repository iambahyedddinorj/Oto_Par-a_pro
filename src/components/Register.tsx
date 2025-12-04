
import React, { useState } from 'react';
import { registerUser } from '../services/firebaseService';

interface RegisterProps {
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerUser(formData.email, formData.password, {
        name: formData.name,
        username: formData.username
      });
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("permission-denied") || err.code === "permission-denied") {
          setError("Kayıt olunamadı: Veritabanı izni yok. Firebase Konsol -> Firestore Database -> Rules kısmını 'allow read, write: if true;' yapınız.");
      } else if (err.code === 'auth/email-already-in-use') {
          setError('Bu e-posta adresi zaten kullanımda.');
      } else if (err.code === 'auth/weak-password') {
          setError('Şifre en az 6 karakter olmalıdır.');
      } else {
          setError('Kayıt olurken hata: ' + err.message);
      }
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fadeIn">
        <div className="w-full max-w-md bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-sm text-center">
           <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
             </svg>
           </div>
           <h2 className="text-2xl font-bold text-white mb-2">Kayıt Başarılı!</h2>
           <p className="text-slate-300 mb-6 leading-relaxed">
             Hesabınız oluşturuldu. Güvenlik nedeniyle, giriş yapabilmek için 
             <span className="text-yellow-400 font-bold"> Admin onayı</span> gerekmektedir.
             Onaylandıktan sonra giriş yapabilirsiniz.
           </p>
           <button
             onClick={onNavigateToLogin}
             className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all"
           >
             Giriş Ekranına Dön
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Kayıt Ol</h1>
          <p className="text-slate-400">Yeni bir hesap oluşturun</p>
        </div>

        {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center break-words">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Ad Soyad</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Adınız Soyadınız"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Kullanıcı Adı</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Kullanıcı adı"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">E-posta</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Şifre</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg mt-4 disabled:opacity-50"
          >
            {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Zaten hesabınız var mı?{' '}
          <button onClick={onNavigateToLogin} className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Giriş Yap
          </button>
        </div>
      </div>
    </div>
  );
};

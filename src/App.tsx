
import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { UserProfile } from './components/UserProfile';
import { auth, getUserData, createMissingUserDoc, logoutUser, updateUserData } from './services/firebaseService';
import { onAuthStateChanged } from 'firebase/auth';

type ViewState = 'login' | 'register' | 'dashboard' | 'admin' | 'profile' | 'pending';

// SENİN ÖZEL ID'N (Otomatik Admin olması için)
const MY_SUPER_ADMIN_ID = "ByNthR6Fp4YBiBqtB3Di4jZuqnp2";

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Kullanıcı giriş yaptı, verilerini Firestore'dan çek
        let userData = await getUserData(firebaseUser.uid);

        // Eğer veritabanında dosya yoksa OTOMATİK OLUŞTUR (Self-Healing)
        if (!userData) {
          console.log("Kullanıcı verisi eksik, otomatik oluşturuluyor...");
          userData = await createMissingUserDoc(firebaseUser.uid, firebaseUser.email);
        }

        // ÖZEL KONTROL: Eğer giriş yapan sensen, otomatik ADMIN yap
        if (firebaseUser.uid === MY_SUPER_ADMIN_ID) {
            if (userData.role !== 'admin' || !userData.isApproved) {
                await updateUserData(firebaseUser.uid, { role: 'admin', isApproved: true });
                userData.role = 'admin';
                userData.isApproved = true;
            }
        }

        setCurrentUser(userData);

        // Yönlendirme mantığı
        if (!userData.isApproved) {
            setView('pending'); // Onay bekliyor ekranı
        } else {
            setView('dashboard');
        }
      } else {
        // Çıkış yapıldı
        setCurrentUser(null);
        setView('login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setView('login');
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  // ONAY BEKLEME EKRANI
  if (view === 'pending' && currentUser) {
      return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl">
                <div className="w-20 h-20 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Hesap Onayı Bekleniyor</h1>
                <p className="text-slate-400 mb-6">Hesabınız oluşturuldu ancak güvenlik nedeniyle yönetici onayı gerekmektedir.</p>
                
                <div className="bg-black/30 p-4 rounded-lg mb-6 text-left">
                    <p className="text-xs text-slate-500 mb-1 uppercase font-bold">Kullanıcı ID (UID)</p>
                    <code className="text-sm font-mono text-green-400 break-all select-all">{currentUser.id}</code>
                    <p className="text-[10px] text-slate-600 mt-2">Bu ID'yi sistem yöneticisine ileterek onayı hızlandırabilirsiniz.</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => window.location.reload()} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors">
                        Kontrol Et ve Yenile
                    </button>
                    <button onClick={handleLogout} className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-bold transition-colors">
                        Çıkış
                    </button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500 selection:text-white">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        {view === 'login' && (
          <Login 
            onNavigateToRegister={() => setView('register')}
          />
        )}
        
        {view === 'register' && (
          <Register 
            onNavigateToLogin={() => setView('login')}
          />
        )}

        {currentUser && (
          <>
            {view === 'dashboard' && (
              <Dashboard 
                currentUser={currentUser} 
                onLogout={handleLogout}
                onNavigateToProfile={() => setView('profile')}
                onNavigateToAdmin={() => setView('admin')}
              />
            )}

            {view === 'admin' && currentUser.role === 'admin' && (
              <AdminPanel 
                onBack={() => setView('dashboard')}
              />
            )}

            {view === 'profile' && (
              <UserProfile 
                user={currentUser} 
                onBack={() => setView('dashboard')}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;

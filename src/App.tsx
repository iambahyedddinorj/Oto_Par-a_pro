
import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { UserProfile } from './components/UserProfile';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

type ViewState = 'login' | 'register' | 'dashboard' | 'admin' | 'profile';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch details from Firestore
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data() as User;
            // Ensure ID is set from Firestore
            const fullUser: User = { ...userData, id: firebaseUser.uid };
            
            if (!fullUser.isApproved && fullUser.role !== 'admin') {
              setLoginError('Hesabınız henüz Admin tarafından onaylanmadı.');
              await signOut(auth);
              setCurrentUser(null);
              setView('login');
            } else {
              setCurrentUser(fullUser);
              setView('dashboard');
              setLoginError(null);
            }
          } else {
            console.error("No such user document!");
            setLoginError("Kullanıcı verisi bulunamadı.");
            await signOut(auth);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setLoginError("Veri bağlantı hatası.");
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setView('login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateUser = (updatedUser: User) => {
    // If updating self in Admin/Profile panels, update local state immediately for UX
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView('login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
            error={loginError}
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
                onUpdateUser={handleUpdateUser}
                onBack={() => setView('dashboard')}
              />
            )}

            {view === 'profile' && (
              <UserProfile 
                user={currentUser} 
                onUpdateUser={handleUpdateUser}
                onBack={() => setView('dashboard')}
              />
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out forwards;
        }
        .animate-fadeInRight {
          animation: fadeInRight 0.4s ease-out forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0; /* Important for stagger delay */
        }
        .animate-zoomIn {
          animation: zoomIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
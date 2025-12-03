
import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { UserProfile } from './components/UserProfile';

type ViewState = 'login' | 'register' | 'dashboard' | 'admin' | 'profile';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Initialize with admin user if empty
  useEffect(() => {
    if (users.length === 0) {
      setUsers([
        {
          id: '1',
          name: 'Sistem Yöneticisi',
          username: 'admin',
          email: 'admin@otoparca.pro',
          password: '123',
          role: 'admin',
          isApproved: true, // Admin is always approved
          allowedBrands: [] // Access all
        }
      ]);
    }
  }, []);

  const handleLogin = (username: string, password: string) => {
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      if (!user.isApproved) {
        setLoginError('Hesabınız henüz Admin tarafından onaylanmadı.');
        return;
      }
      setCurrentUser(user);
      setView('dashboard');
      setLoginError(null);
    } else {
      setLoginError('Kullanıcı adı veya şifre hatalı.');
    }
  };

  const handleRegister = (data: Omit<User, 'id' | 'role' | 'isApproved'>) => {
    const newUser: User = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      isApproved: false // New users require approval
    };
    setUsers([...users, newUser]);
    // Do not log in automatically. User stays on Register page to see success message or goes to Login.
  };

  const handleCreateUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
        ...userData,
        id: Math.random().toString(36).substr(2, 9),
    };
    setUsers([...users, newUser]);
  }

  const handleUpdateUser = (updatedUser: User) => {
    const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(newUsers);
    
    // If updating self, update current session
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
  };

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
            onLogin={handleLogin} 
            onNavigateToRegister={() => setView('register')}
            error={loginError}
          />
        )}
        
        {view === 'register' && (
          <Register 
            onRegister={handleRegister} 
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
                users={users} 
                onUpdateUser={handleUpdateUser}
                onCreateUser={handleCreateUser}
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

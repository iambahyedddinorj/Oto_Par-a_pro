
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { BRANDS } from './BrandSelector';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

interface AdminPanelProps {
  onUpdateUser: (updatedUser: User) => void;
  onBack: () => void;
}

type TabType = 'pending' | 'users' | 'admins';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onUpdateUser, onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [operationLoading, setOperationLoading] = useState(false);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList: User[] = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(userList);
      
      // Auto switch to pending if any
      if (userList.some(u => !u.isApproved)) {
        setActiveTab('pending');
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users by category
  const pendingUsers = users.filter(u => !u.isApproved);
  const activeUsers = users.filter(u => u.isApproved && u.role === 'user');
  const adminUsers = users.filter(u => u.role === 'admin');

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setOperationLoading(true);
      try {
        const userRef = doc(db, "users", editingUser.id);
        const { id, ...dataToUpdate } = editingUser; // Exclude ID from update data
        await updateDoc(userRef, dataToUpdate as any);
        
        // Update local state
        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
        onUpdateUser(editingUser); // Propagate to App.tsx
        setEditingUser(null);
      } catch (error) {
        console.error("Error updating user:", error);
        alert("Güncelleme başarısız oldu.");
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const handleApprove = async (user: User) => {
    if (window.confirm(`${user.name} kullanıcısını onaylamak istiyor musunuz?`)) {
      setOperationLoading(true);
      try {
        const userRef = doc(db, "users", user.id);
        const updatedUser = { ...user, isApproved: true };
        await updateDoc(userRef, { isApproved: true });
        
        setUsers(users.map(u => u.id === user.id ? updatedUser : u));
        onUpdateUser(updatedUser);
      } catch (error) {
        console.error("Error approving user:", error);
        alert("Onay işlemi başarısız.");
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const toggleBrandPermission = (brandName: string) => {
    if (editingUser) {
      const currentBrands = editingUser.allowedBrands || [];
      const newBrands = currentBrands.includes(brandName)
        ? currentBrands.filter(b => b !== brandName)
        : [...currentBrands, brandName];
      setEditingUser({ ...editingUser, allowedBrands: newBrands });
    }
  };

  // Helper for rendering permissions
  const renderBrandPermissions = (currentAllowed: string[] | undefined) => (
    <div className="space-y-2 mt-4">
      <label className="block text-sm font-medium text-slate-400 mb-2">Marka Yetkileri (Boş = Tümü)</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {BRANDS.map(brand => {
          // For editing/creating, we need to know if it's explicitly selected in the array
          const isSelected = currentAllowed?.includes(brand.name) || false;
          
          return (
            <button
              key={brand.id}
              type="button"
              onClick={() => toggleBrandPermission(brand.name)}
              className={`text-xs px-3 py-2 rounded-lg border flex items-center justify-between transition-colors
                ${isSelected 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-200' 
                  : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'}`}
            >
              <span>{brand.name}</span>
              {isSelected && (
                <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-500 mt-1">
        * Hiçbir seçim yapılmazsa kullanıcı tüm markaları görebilir. Seçim yapılırsa sadece seçilenleri görür.
      </p>
    </div>
  );

  const renderTable = (data: User[], showApprove: boolean) => (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-bold">
            <tr>
              <th className="p-4">Kullanıcı Bilgileri</th>
              <th className="p-4">Ad Soyad</th>
              <th className="p-4">Durum</th>
              <th className="p-4">İzinler</th>
              <th className="p-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                  Bu kategoride kullanıcı bulunmuyor.
                </td>
              </tr>
            ) : (
              data.map(user => (
                <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 font-medium text-white">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        {user.username}
                        <div className="text-xs text-slate-500 font-normal">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">
                     {user.isApproved ? (
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                         Aktif
                       </span>
                     ) : (
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse">
                         <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                         Onay Bekliyor
                       </span>
                     )}
                  </td>
                  <td className="p-4">
                    {user.role === 'admin' ? (
                      <span className="text-xs text-purple-400">Tam Yetki</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {!user.allowedBrands || user.allowedBrands.length === 0 ? (
                          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">Tümü</span>
                        ) : (
                          user.allowedBrands.slice(0, 3).map(b => (
                            <span key={b} className="text-[10px] text-blue-300 bg-blue-900/30 border border-blue-500/20 px-1.5 py-0.5 rounded">{b}</span>
                          ))
                        )}
                        {user.allowedBrands && user.allowedBrands.length > 3 && (
                           <span className="text-[10px] text-slate-500">+{user.allowedBrands.length - 3}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    {showApprove && !user.isApproved && (
                      <button 
                        onClick={() => handleApprove(user)}
                        disabled={operationLoading}
                        className="text-green-400 hover:text-green-300 px-3 py-1 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 transition-colors text-sm font-semibold flex items-center gap-1 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Onayla
                      </button>
                    )}
                    <button 
                      onClick={() => setEditingUser(user)}
                      className="text-slate-400 hover:text-white px-3 py-1 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                    >
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          Kullanıcı Yönetimi
        </h1>
        <div className="flex gap-2">
            <button 
            onClick={onBack}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 flex items-center gap-2"
            >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Panele Dön
            </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-slate-500">Kullanıcılar yükleniyor...</p>
        </div>
      ) : (
        <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-700/50 pb-1 overflow-x-auto">
                <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-t-lg font-medium text-sm flex items-center gap-2 transition-colors relative
                    ${activeTab === 'pending' 
                    ? 'bg-slate-800 text-yellow-400 border-t border-x border-slate-700' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}
                >
                Onay Bekleyenler
                {pendingUsers.length > 0 && (
                    <span className="bg-yellow-500 text-slate-900 text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    {pendingUsers.length}
                    </span>
                )}
                </button>
                
                <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-t-lg font-medium text-sm flex items-center gap-2 transition-colors
                    ${activeTab === 'users' 
                    ? 'bg-slate-800 text-blue-400 border-t border-x border-slate-700' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}
                >
                Kayıtlı Kullanıcılar
                <span className="bg-slate-700 text-slate-300 text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {activeUsers.length}
                </span>
                </button>

                <button
                onClick={() => setActiveTab('admins')}
                className={`px-4 py-2 rounded-t-lg font-medium text-sm flex items-center gap-2 transition-colors
                    ${activeTab === 'admins' 
                    ? 'bg-slate-800 text-purple-400 border-t border-x border-slate-700' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}
                >
                Yöneticiler
                <span className="bg-slate-700 text-slate-300 text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {adminUsers.length}
                </span>
                </button>
            </div>

            {/* Content */}
            <div className="animate-fadeIn">
                {activeTab === 'pending' && (
                <>
                    <div className="mb-4 text-sm text-yellow-400/80 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Yeni kayıt olan kullanıcılar burada listelenir. Giriş yapabilmeleri için "Onayla" butonuna basmalısınız.
                    </div>
                    {renderTable(pendingUsers, true)}
                </>
                )}
                
                {activeTab === 'users' && (
                <>
                    <div className="mb-4 text-sm text-slate-400">
                    Sisteme kayıtlı ve onaylanmış standart kullanıcılar.
                    </div>
                    {renderTable(activeUsers, false)}
                </>
                )}

                {activeTab === 'admins' && (
                <>
                    <div className="mb-4 text-sm text-purple-400/80 bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                    ⚠️ Yönetici hesapları tam yetkiye sahiptir.
                    </div>
                    {renderTable(adminUsers, false)}
                </>
                )}
            </div>
        </>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl animate-fadeInDown overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-white mb-6">Kullanıcı Düzenle</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Ad Soyad</label>
                <input 
                  value={editingUser.name}
                  onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Kullanıcı Adı</label>
                <input 
                  value={editingUser.username}
                  onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">E-posta</label>
                <input 
                  value={editingUser.email}
                  disabled
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>

               {/* Role Management in Edit */}
               <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Rol</label>
                <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value as 'user' | 'admin'})}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                    <option value="user">Standart Kullanıcı</option>
                    <option value="admin">Yönetici</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">* Yönetici rolü tüm kısıtlamaları kaldırır.</p>
              </div>
              
              {/* Brand Permissions for Edit - Only Show if User is Standard User */}
              {editingUser.role === 'user' && renderBrandPermissions(editingUser.allowedBrands)}

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={operationLoading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                  {operationLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
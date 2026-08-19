'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import { UserData } from '@/types';
import Button from '@/components/ui/Button';
import Loader from '@/components/layout/Loader';
import SmartSplitLogo from '@/components/ui/SmartSplitLogo';
import { Shield, Trash2, LogOut } from 'lucide-react';
import { AuthContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const { logout } = React.useContext(AuthContext);
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data as any);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminApi.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white p-4 sm:p-8 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <SmartSplitLogo className="w-12 h-12" />
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-brand-blue via-purple-500 to-brand-orange bg-clip-text text-transparent italic">
              ADMIN CONTROL
            </h1>
          </div>
          <Button
            variant="danger"
            onClick={handleLogout}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl shadow-xl shadow-brand-orange/20 font-bold flex items-center justify-center gap-2"
          >
            <LogOut size={20} /> Sign Out
          </Button>
        </header>

        {error ? (
          <div className="bg-brand-orange/10 border border-brand-orange/20 text-brand-orange p-6 rounded-3xl mb-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-orange/20 flex items-center justify-center font-bold">!</div>
            <div>
              <p className="font-bold text-lg">Access Denied</p>
              <p className="opacity-80 font-medium">{error}</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 sm:gap-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-gray-100 dark:bg-white/[0.03] backdrop-blur-3xl border border-gray-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group">
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">Total Workforce</p>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-black tracking-tighter">{users.length}</p>
                  <p className="text-gray-400 dark:text-gray-500 font-bold pb-1">Users</p>
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-white/[0.03] backdrop-blur-3xl border border-gray-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group">
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">Capital Flow</p>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-black tracking-tighter text-brand-blue dark:text-brand-blue">
                    ${users.reduce((acc, u) => acc + (u.totalExpenses || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-white/[0.03] backdrop-blur-3xl border border-gray-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group">
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">Network Load</p>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-black tracking-tighter text-purple-500">
                    {users.reduce((acc, u) => acc + (u.loginCount || 0), 0)}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 font-bold pb-1">Sessions</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-white/[0.02] backdrop-blur-3xl border border-gray-100 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-2xl dark:shadow-none">
              <div className="p-8 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <Shield size={28} className="text-brand-blue" />
                  USER REPOSITORY
                </h2>
                <div className="px-4 py-1.5 bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue rounded-full text-xs font-black uppercase ring-1 ring-brand-blue/30">
                  Secure Access
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-white/5 uppercase text-[11px] tracking-[0.2em] text-gray-500 dark:text-gray-400 font-black">
                      <th className="px-10 py-6">Identity</th>
                      <th className="px-10 py-6">Capital Usage</th>
                      <th className="px-10 py-6">Session Cycle</th>
                      <th className="px-10 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300 group">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg transform rotate-3 transition-transform group-hover:rotate-0 ${user.isAdmin
                                ? 'bg-gradient-to-br from-purple-500 to-brand-blue text-white shadow-purple-500/20'
                                : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-white/10 dark:to-white/20 text-gray-700 dark:text-white shadow-black/5'}`}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-xl tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
                                {user.name}
                                {user.isAdmin && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-lg border border-purple-500/30 font-black uppercase">Core Admin</span>}
                              </span>
                              <span className="text-sm font-medium text-gray-400 dark:text-gray-500">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                              ${(user.totalExpenses || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] font-black uppercase text-brand-orange tracking-widest mt-1">Total Impact</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full overflow-hidden max-w-[80px]">
                              <div className="bg-purple-500 h-full" style={{ width: `${Math.min(user.loginCount || 0 * 5, 100)}%` }}></div>
                            </div>
                            <span className="text-lg font-bold text-gray-600 dark:text-gray-300">{user.loginCount || 0}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <button
                            disabled={user.isAdmin}
                            onClick={() => handleDeleteUser(user.id)}
                            className={`p-3 rounded-2xl transition-all duration-300 ${user.isAdmin
                                ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-30'
                                : 'text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 bg-gray-100 dark:bg-white/5 active:scale-90 hover:shadow-lg shadow-brand-orange/5'
                              }`}
                            title={user.isAdmin ? "Cannot remove core admins" : "Remove user"}
                          >
                            <Trash2 size={24} strokeWidth={2.5} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

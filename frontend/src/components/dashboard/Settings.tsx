import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User as UserIcon, Bell, Shield, CreditCard, Users, Lock, FileText } from 'lucide-react';
import { getAuthHeaders, removeToken } from '../../utils/auth';
import { useToast } from '../ui/ToastContext';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  role: string;
  timezone: string;
}

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [profile, setProfile] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    role: '',
    timezone: 'UTC'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/me`, {
          headers: getAuthHeaders()
        });
        if (response.status === 401) {
          removeToken();
          navigate('/login');
          return;
        }
        if (response.ok) {
          const data = await response.json();
          setProfile({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || '',
            company: data.company || '',
            role: data.role || '',
            timezone: data.timezone || 'UTC'
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          company: profile.company,
          role: profile.role,
          timezone: profile.timezone
        })
      });
      if (response.ok) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const menuItems = [
    { icon: <UserIcon size={18} />, label: "My profile", active: true },
    { icon: <Bell size={18} />, label: "Notifications", active: false },
    { icon: <Shield size={18} />, label: "Security and data", active: false },
    { icon: <CreditCard size={18} />, label: "Billing & usage", active: false },
    { icon: <Users size={18} />, label: "Members", active: false, locked: true },
    { icon: <Lock size={18} />, label: "Advanced security", active: false, locked: true },
    { icon: <FileText size={18} />, label: "Audit log", active: false, locked: true },
  ];

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors duration-300">
      <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-6 transition-colors duration-300">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-medium">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white ml-8">Settings</h1>
      </header>

      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800 h-full hidden md:block transition-colors duration-300">
          <nav className="space-y-1">
            {menuItems.map((item, idx) => (
              <button 
                key={idx}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm ${item.active ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </div>
                {item.locked && <Lock size={14} className="text-slate-400" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 md:p-12 bg-white dark:bg-slate-800 transition-colors duration-300">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">My profile</h2>
            
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-400 text-2xl font-bold">
                {profile.first_name ? profile.first_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <button className="text-primary-600 dark:text-primary-400 font-medium text-sm hover:underline">Edit Gravatar</button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email (required)</label>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{profile.email}</span>
                  <button className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white uppercase tracking-wide">Change Email</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password (required)</label>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <span className="text-slate-400 dark:text-slate-500 font-bold tracking-widest">••••••••</span>
                  <button className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white uppercase tracking-wide">Change Password</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">First name</label>
                  <input 
                    type="text" 
                    value={profile.first_name}
                    onChange={e => setProfile({...profile, first_name: e.target.value})}
                    className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-slate-800 dark:text-white bg-white dark:bg-slate-900/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Last name</label>
                  <input 
                    type="text" 
                    value={profile.last_name}
                    onChange={e => setProfile({...profile, last_name: e.target.value})}
                    className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-slate-800 dark:text-white bg-white dark:bg-slate-900/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Company</label>
                <input 
                  type="text" 
                  value={profile.company}
                  onChange={e => setProfile({...profile, company: e.target.value})}
                  className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-slate-800 dark:text-white bg-white dark:bg-slate-900/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Role</label>
                <select 
                  value={profile.role}
                  onChange={e => setProfile({...profile, role: e.target.value})}
                  className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-slate-800 dark:text-white appearance-none bg-white dark:bg-slate-900/50"
                >
                  <option value="">Select Role...</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product Management</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Design">Design</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-md shadow-primary-600/20 hover:bg-primary-700 hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

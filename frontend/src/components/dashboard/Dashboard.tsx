import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuthHeaders, removeToken } from '../../utils/auth';
import { PlusCircle, FileText, Calendar, ExternalLink, BarChart3, Trash2, User, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { useToast } from '../ui/ToastContext';

interface FormSummary {
  id: string;
  title: string;
  created_at: string;
  is_published: boolean;
}

interface UserProfile {
  email: string;
}

export const Dashboard: React.FC = () => {
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch User Profile
        const userRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/me`, {
          headers: getAuthHeaders()
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        // Fetch Forms
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/forms/`, {
          headers: getAuthHeaders()
        });
        if (response.status === 401) {
          removeToken();
          navigate('/login');
          return;
        }
        if (!response.ok) throw new Error('Failed to fetch forms');
        const data = await response.json();
        setForms(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleCreateNew = () => {
    // Generate a random ID for the new form
    const newId = Math.random().toString(36).substr(2, 9);
    navigate(`/builder/${newId}`);
  };

  const handleCopyLink = (formId: string) => {
    const url = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(formId);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (formId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`}/api/v1/forms/${formId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.status === 401) {
        removeToken();
        navigate('/login');
        return;
      }
      if (!response.ok) throw new Error('Failed to delete form');
      
      // Update UI
      setForms(prev => prev.filter(f => f.id !== formId));
      toast.success('Form deleted');
    } catch (err: any) {
      toast.error(`Error deleting form: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 sm:p-12 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-200/60 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-200/60 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none animate-blob animation-delay-2000" />
      <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-purple-200/60 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none animate-blob animation-delay-4000" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">My Forms</h1>
            <p className="text-slate-500 font-medium mt-2">Manage your forms and view submissions</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 font-medium">
                <User size={18} className="text-primary-500" />
                <span>{user.email}</span>
              </div>
            )}
            <button 
              onClick={handleCreateNew}
              className="group flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-500 hover:-translate-y-0.5 transition-all duration-200 font-bold shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)]"
            >
              <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              Create New Form
            </button>
            <button
              onClick={() => {
                removeToken();
                navigate('/login');
              }}
              className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 hover:-translate-y-0.5 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse flex items-center gap-3 text-slate-400 font-bold text-xl">
              <div className="w-6 h-6 rounded-full border-4 border-slate-300 border-t-primary-500 animate-spin" />
              Loading forms...
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 p-6 rounded-2xl font-bold border border-red-100 flex items-center gap-3">
            <span>⚠️</span> Error: {error}. Is the FastAPI server running?
          </div>
        ) : forms.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={32} className="text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No forms yet</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">You haven't created any forms. Click the button below to get started building your first form.</p>
            <button onClick={handleCreateNew} className="text-primary-600 font-bold hover:text-primary-700 underline underline-offset-4">Create your first form</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map(form => (
              <div key={form.id} className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                        <FileText size={24} />
                      </div>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">ID: {form.id}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(form.id, form.title)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete Form"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary-600 transition-colors">{form.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Calendar size={14} />
                    {new Date(form.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 border-t border-white/40 divide-x divide-white/40 bg-white/40">
                  <button 
                    onClick={() => handleCopyLink(form.id)}
                    className={`p-4 flex flex-col items-center justify-center text-sm font-bold transition-colors gap-1 ${copiedId === form.id ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'}`}
                  >
                    {copiedId === form.id ? <CheckCircle2 size={18} /> : <LinkIcon size={18} />}
                    {copiedId === form.id ? 'Copied!' : 'Copy Link'}
                  </button>
                  <Link 
                    to={`/dashboard/${form.id}/submissions`}
                    className="p-4 flex flex-col items-center justify-center text-sm font-bold text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors gap-1"
                  >
                    <BarChart3 size={18} />
                    Results
                  </Link>
                  <Link 
                    to={`/form/${form.id}`}
                    target="_blank"
                    className="p-4 flex flex-col items-center justify-center text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors gap-1"
                  >
                    <ExternalLink size={18} />
                    View Live
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

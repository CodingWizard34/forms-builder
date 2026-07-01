import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Settings, FileText, PlusCircle } from 'lucide-react';

export const CommandMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const actions = [
    { label: 'Create New Form', icon: <PlusCircle size={18} />, action: () => { const id = Math.random().toString(36).substr(2, 9); navigate(`/builder/${id}`); setIsOpen(false); } },
    { label: 'Go to Settings', icon: <Settings size={18} />, action: () => { navigate('/settings'); setIsOpen(false); } },
    { label: 'Go to Dashboard', icon: <FileText size={18} />, action: () => { navigate('/dashboard'); setIsOpen(false); } },
  ];

  const filtered = actions.filter(a => a.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          <Search size={20} className="text-slate-400 mr-3" />
          <input 
            type="text"
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent outline-none text-slate-800 text-lg placeholder:text-slate-400"
          />
          <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">ESC</div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Suggestions</div>
              {filtered.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.action}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors font-medium text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    {action.icon}
                  </div>
                  {action.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 font-medium">
              No results found for "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

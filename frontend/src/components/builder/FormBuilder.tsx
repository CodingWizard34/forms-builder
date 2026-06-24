import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDispatch, useSelector } from 'react-redux';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { PreviewForm } from './PreviewForm';
import { LogicBuilder } from './LogicBuilder';
import { Save, Eye, ArrowLeft, Edit2, LayoutTemplate, Workflow, Globe } from 'lucide-react';
import type { RootState } from '../../store';
import { updateTitle, setViewMode, loadForm, setIsPublished } from '../../store/slices/builderSlice';
import { getAuthHeaders, removeToken } from '../../utils/auth';
import { useToast } from '../ui/ToastContext';

export const FormBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const title = useSelector((state: RootState) => state.builder.title);
  const viewMode = useSelector((state: RootState) => state.builder.viewMode);
  const fields = useSelector((state: RootState) => state.builder.fields);
  const workflows = useSelector((state: RootState) => state.builder.workflows);
  const theme = useSelector((state: RootState) => state.builder.theme);
  const is_published = useSelector((state: RootState) => state.builder.is_published);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/forms/${id}`, {
          headers: getAuthHeaders()
        });
        if (response.status === 401) {
          removeToken();
          navigate('/login');
          return;
        }
        if (response.ok) {
          const data = await response.json();
          dispatch(loadForm({
            title: data.title,
            fields: data.fields,
            workflows: data.workflows,
            theme: data.theme || 'theme-blue',
            is_published: data.is_published
          }));
        }
      } catch (error) {
        console.error("Failed to load existing form", error);
      }
    };

    if (id) {
      fetchForm();
    }
  }, [id, dispatch, navigate]);

  const handleSave = async (publishStatus: boolean) => {
    setIsSaving(true);
    try {
      const payload = {
        id: id,
        title: title,
        fields: fields,
        workflows: workflows,
        theme: theme,
        is_published: publishStatus
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/forms/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        removeToken();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to save form');
      }

      await response.json();
      dispatch(setIsPublished(publishStatus));
      toast.success(publishStatus ? 'Form published successfully!' : 'Form unpublished successfully!');
    } catch (error) {
      console.error(error);
      toast.error(publishStatus ? 'Failed to publish form. Please try again.' : 'Failed to unpublish form.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden ${theme}`}>
        {/* Top Navbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center group relative max-w-sm w-full">
              {isEditingTitle ? (
                <input 
                  type="text"
                  autoFocus
                  value={title}
                  onChange={(e) => dispatch(updateTitle(e.target.value))}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  className="text-xl font-bold bg-white text-slate-800 border-2 border-primary-500 rounded-lg px-2 py-0.5 outline-none w-full"
                  placeholder="Enter form name..."
                />
              ) : (
                <div 
                  onClick={() => setIsEditingTitle(true)}
                  className="flex items-center gap-2 cursor-text px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100 transition-colors w-full"
                >
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 truncate">
                    {title || 'Untitled Form'}
                  </h1>
                  <Edit2 size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => dispatch(setViewMode('builder'))}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${viewMode === 'builder' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutTemplate size={16} /> Builder
            </button>
            <button
              onClick={() => dispatch(setViewMode('logic'))}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${viewMode === 'logic' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Workflow size={16} /> Logic Workflows
            </button>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end">
            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 shadow-sm"
            >
              <Eye size={16} />
              Preview
            </button>
            <button 
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-bold transition-all shadow-sm ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
            >
              Unpublish
            </button>
            <button 
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
            >
              <Globe size={18} className={isSaving ? 'animate-pulse' : ''} /> 
              {isSaving ? 'Publishing...' : 'Publish Form'}
            </button>
          </div>
        </header>

        {/* Builder Layout */}
        <div className="flex flex-1 overflow-hidden relative">
          {viewMode === 'builder' ? (
            <>
              <Sidebar />
              <Canvas />
              <PropertiesPanel />
            </>
          ) : (
            <LogicBuilder />
          )}
        </div>
      </div>

      {isPreviewOpen && <PreviewForm onClose={() => setIsPreviewOpen(false)} />}
    </DndProvider>
  );
};

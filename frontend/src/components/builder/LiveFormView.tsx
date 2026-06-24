import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadForm } from '../../store/slices/builderSlice';
import type { RootState } from '../../store';
import { PreviewForm } from './PreviewForm';
import { Lock } from 'lucide-react';

export const LiveFormView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.builder.theme);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`}/api/v1/forms/${id}`);
        if (!response.ok) {
          throw new Error('Form not found');
        }
        const data = await response.json();
        
        setIsPublished(data.is_published);
        if (data.is_published === false) {
          setLoading(false);
          return;
        }

        // Hydrate Redux state with the fetched form
        dispatch(loadForm({
          title: data.title,
          fields: data.fields,
          workflows: data.workflows,
          theme: data.theme || 'theme-blue'
        }));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchForm();
    }
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-xl font-semibold text-slate-500">Loading form...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xl font-bold text-red-500">{error}</div>
      </div>
    );
  }

  if (isPublished === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-amber-400" />
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Form Unpublished</h2>
          <p className="text-slate-500">This form is currently not accepting responses. Please contact the form owner if you believe this is a mistake.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 relative overflow-hidden ${theme}`}>
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary-200/50 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none animate-blob animation-delay-2000" />
      <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-purple-200/50 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none animate-blob animation-delay-4000" />
      
      <div className="relative z-10">
        <PreviewForm formId={id} />
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadForm } from '../../store/slices/builderSlice';
import type { RootState } from '../../store';
import { PreviewForm } from './PreviewForm';

export const LiveFormView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.builder.theme);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`}/api/v1/forms/${id}`);
        if (!response.ok) {
          throw new Error('Form not found');
        }
        const data = await response.json();
        
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

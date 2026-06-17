import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Users, Clock, Link as LinkIcon } from 'lucide-react';
import type { FormField } from '../../store/slices/builderSlice';
import { getAuthHeaders } from '../../utils/auth';
import { useToast } from '../ui/ToastContext';

interface Submission {
  id: number;
  form_id: string;
  answers: Record<string, any>;
  submitted_at: string;
}

interface FormMetadata {
  id: string;
  title: string;
  fields: FormField[];
}

export const SubmissionsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [formMeta, setFormMeta] = useState<FormMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleCopyLink = () => {
    const url = `${window.location.origin}/form/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Form Metadata to get field labels (Public)
        const formRes = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`}/api/v1/forms/${id}`);
        if (!formRes.ok) throw new Error('Failed to fetch form metadata');
        const formData = await formRes.json();
        setFormMeta(formData);

        // Fetch Submissions (Protected)
        const subRes = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`}/api/v1/forms/${id}/submissions`, {
          headers: getAuthHeaders()
        });
        if (subRes.status === 401 || subRes.status === 403) throw new Error('Not authorized to view these submissions');
        if (!subRes.ok) throw new Error('Failed to fetch submissions');
        const subData = await subRes.json();
        setSubmissions(subData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleExportCSV = () => {
    if (!formMeta || submissions.length === 0) return;

    // Get all valid fields that have labels (exclude structural fields like page_break)
    const dataFields = formMeta.fields.filter(f => !['page_break', 'html_block', 'divider', 'paragraph'].includes(f.type));
    
    // Create headers
    const headers = ['Submission Date', ...dataFields.map(f => f.label || f.type)];
    
    // Create rows
    const rows = submissions.map(sub => {
      const dateStr = sub.submitted_at.endsWith('Z') ? sub.submitted_at : `${sub.submitted_at}Z`;
      const date = new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
      const rowData = dataFields.map(field => {
        const val = sub.answers[field.id];
        // Handle undefined, objects, or arrays
        if (val === undefined || val === null) return '';
        if (typeof val === 'object') return JSON.stringify(val).replace(/"/g, '""');
        return String(val).replace(/"/g, '""'); // Escape quotes for CSV
      });
      return [date, ...rowData];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${formMeta.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-3 text-slate-400 font-bold text-xl">
          <div className="w-6 h-6 rounded-full border-4 border-slate-300 border-t-primary-500 animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error || !formMeta) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Failed to load data</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link to="/dashboard" className="text-primary-600 font-bold hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Get dynamic columns for the table
  const dataColumns = formMeta.fields.filter(f => !['page_break', 'html_block', 'divider', 'paragraph'].includes(f.type));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{formMeta.title}</h1>
              <p className="text-slate-500 font-medium text-sm">Form Analytics & Submissions</p>
            </div>
          </div>
          
          <button 
            onClick={handleExportCSV}
            disabled={submissions.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_-6px_rgba(22,163,74,0.5)] hover:-translate-y-0.5"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Users size={28} />
            </div>
            <div>
              <p className="text-slate-500 font-medium">Total Responses</p>
              <h3 className="text-3xl font-extrabold text-slate-800">{submissions.length}</h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-slate-500 font-medium">Latest Submission</p>
              <h3 className="text-lg font-bold text-slate-800">
                {submissions.length > 0 
                  ? new Date(submissions[submissions.length - 1].submitted_at.endsWith('Z') ? submissions[submissions.length - 1].submitted_at : `${submissions[submissions.length - 1].submitted_at}Z`).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
                  : 'N/A'}
              </h3>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {submissions.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={24} className="text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Waiting for responses</h3>
              <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">Share your live form link to start collecting data.</p>
              <button 
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm mx-auto"
              >
                <LinkIcon size={18} />
                Copy Link
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50">
                      Date
                    </th>
                    {dataColumns.map(col => (
                      <th key={col.id} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {col.label || col.type}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-500 sticky left-0 bg-white group-hover:bg-slate-50/50">
                        {new Date(sub.submitted_at.endsWith('Z') ? sub.submitted_at : `${sub.submitted_at}Z`).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </td>
                      {dataColumns.map(col => (
                        <td key={col.id} className="px-6 py-4 text-sm text-slate-800 max-w-xs truncate" title={String(sub.answers[col.id] || '')}>
                          {sub.answers[col.id] !== undefined ? String(sub.answers[col.id]) : <span className="text-slate-300">-</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

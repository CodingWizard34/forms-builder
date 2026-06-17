import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ChevronDown, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { COUNTRIES } from '../../utils/countries';
import { useToast } from '../ui/ToastContext';
import confetti from 'canvas-confetti';
import type { RootState } from '../../store';
import type { FormField, FormWorkflow, WorkflowGroup, WorkflowCondition } from '../../store/slices/builderSlice';

interface PreviewFormProps {
  onClose?: () => void;
  formId?: string; // If provided, acts as live mode and submits to backend
}

export const PreviewForm: React.FC<PreviewFormProps> = ({ onClose, formId }) => {
  const fields = useSelector((state: RootState) => state.builder.fields);
  const workflows = useSelector((state: RootState) => state.builder.workflows);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const toast = useToast();

  // 1. Conditional Logic Evaluator
  const evaluateCondition = (condition: WorkflowCondition): boolean => {
    const answer = answers[condition.sourceFieldId] || '';
    const compareValue = condition.value;

    switch (condition.operator) {
      case 'equals': return answer.toString().toLowerCase() === compareValue.toLowerCase();
      case 'not_equals': return answer.toString().toLowerCase() !== compareValue.toLowerCase();
      case 'contains': return answer.toString().toLowerCase().includes(compareValue.toLowerCase());
      case 'greater_than': return Number(answer) > Number(compareValue);
      case 'less_than': return Number(answer) < Number(compareValue);
      default: return false;
    }
  };

  const evaluateGroup = (group: WorkflowGroup): boolean => {
    if (group.conditions.length === 0) return true;

    const results = group.conditions.map(node => {
      if (node.type === 'condition') return evaluateCondition(node);
      return evaluateGroup(node);
    });

    return group.match === 'all' ? results.every(Boolean) : results.some(Boolean);
  };

  // 2. Filter visible fields based on logic
  const visibleFields = useMemo(() => {
    const hiddenSet = new Set<string>();
    const showTargetSet = new Set<string>();
    const showMatchSet = new Set<string>();

    workflows.forEach(workflow => {
      const isMatch = evaluateGroup(workflow.rootGroup);
      
      workflow.targetFieldIds.forEach(targetId => {
        if (workflow.action === 'show') {
          showTargetSet.add(targetId);
          if (isMatch) showMatchSet.add(targetId);
        } else if (workflow.action === 'hide') {
          if (isMatch) hiddenSet.add(targetId);
        }
      });
    });

    return fields.filter(field => {
      if (hiddenSet.has(field.id)) return false;
      if (showTargetSet.has(field.id)) return showMatchSet.has(field.id);
      return true;
    });
  }, [fields, workflows, answers]);

  // 3. Paginate fields into steps based on page_breaks
  const steps = useMemo(() => {
    const paginatedSteps: FormField[][] = [[]];
    let stepIndex = 0;

    visibleFields.forEach(field => {
      if (field.type === 'page_break') {
        stepIndex++;
        paginatedSteps[stepIndex] = [];
      } else {
        paginatedSteps[stepIndex].push(field);
      }
    });

    return paginatedSteps.filter(step => step.length > 0 || paginatedSteps.length === 1);
  }, [visibleFields]);

  const currentFields = steps[currentStep] || [];
  const isLastStep = currentStep === steps.length - 1;

  const handleChange = (id: string, value: any) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    // Basic validation could go here
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLastStep) {
      handleNext();
      return;
    }

    if (formId) {
      // Live mode: submit to backend
      setIsSubmitting(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`}/api/v1/forms/${formId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers })
        });
        
        if (!response.ok) {
          throw new Error('Submission failed');
        }
        setIsSubmitted(true);
        toast.success('Form submitted successfully!');
        
        // Fire confetti!
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f43f5e', '#8b5cf6']
        });
      } catch (error) {
        console.error(error);
        toast.error('Failed to submit form. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Preview mode: just show success screen
      console.log('Preview Form Submitted with answers:', answers);
      setIsSubmitted(true);
    }
  };

  const renderInput = (field: FormField) => {
    const value = answers[field.id] || '';
    const commonClasses = "w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-800 outline-none transition-all placeholder:text-slate-400 shadow-sm";

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
      case 'time':
      case 'website':
        return (
          <input 
            type={field.type === 'website' ? 'url' : field.type} 
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={commonClasses}
          />
        );
      case 'phone':
        return (
          <div className="flex gap-2 relative group">
            <div className="relative">
              <select
                value={answers[`${field.id}_code`] || '+1'}
                onChange={(e) => handleChange(`${field.id}_code`, e.target.value)}
                className="appearance-none w-[130px] bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-slate-700 outline-none shadow-inner cursor-pointer"
                style={{ padding: '0.875rem' }}
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.dialCode}>
                    {c.flag} {c.dialCode}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <input
              type="tel"
              required={field.required}
              placeholder={field.placeholder || '(555) 000-0000'}
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-slate-800 placeholder:text-slate-400 outline-none shadow-inner"
              style={{ padding: '0.875rem' }}
            />
          </div>
        );
      case 'country':
        return (
          <div className="relative group">
            <select
              required={field.required}
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="appearance-none w-full bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-slate-800 outline-none shadow-inner cursor-pointer"
              style={{ padding: '0.875rem' }}
            >
              <option value="" disabled>{field.placeholder || '-- Select Country --'}</option>
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        );
      case 'textarea':
      case 'address':
        return (
          <textarea 
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={commonClasses}
          />
        );
      case 'dropdown':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            required={field.required}
            className={commonClasses}
          >
            <option value="" disabled>{field.placeholder || 'Select an option'}</option>
            {field.options?.filter(opt => opt.trim() !== '').map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.filter(opt => opt.trim() !== '').map((opt, i) => (
              <label key={i} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input 
                  type="radio" 
                  name={field.id}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  required={field.required}
                  className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500"
                />
                <span className="text-slate-700">{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        const checkedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options?.filter(opt => opt.trim() !== '').map((opt, i) => (
              <label key={i} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input 
                  type="checkbox" 
                  value={opt}
                  checked={checkedValues.includes(opt)}
                  onChange={(e) => {
                    const newValues = e.target.checked 
                      ? [...checkedValues, opt]
                      : checkedValues.filter(v => v !== opt);
                    handleChange(field.id, newValues);
                  }}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                />
                <span className="text-slate-700">{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'single_checkbox':
        return (
          <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
            <input 
              type="checkbox" 
              checked={!!value}
              onChange={(e) => handleChange(field.id, e.target.checked)}
              required={field.required}
              className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
            />
            <span className="text-slate-700">{field.placeholder || 'Check this box'}</span>
          </label>
        );
      case 'rating':
        return (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <button
                key={i}
                type="button"
                onClick={() => handleChange(field.id, i)}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all ${value === i ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-slate-200 text-slate-400 hover:border-primary-300 hover:text-primary-500'}`}
              >
                {i}
              </button>
            ))}
          </div>
        );
      case 'file_upload':
        return (
          <div className="w-full relative p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-500 text-center font-medium hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer flex flex-col items-center gap-2">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              required={field.required}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleChange(field.id, file.name);
              }}
            />
            <span className="text-2xl">📁</span>
            <span className="truncate max-w-full px-4">{answers[field.id] ? answers[field.id] : 'Click or drag file to upload'}</span>
          </div>
        );
      case 'heading':
        return (
          <div className={`mb-2 ${field.textAlign === 'center' ? 'text-center' : field.textAlign === 'right' ? 'text-right' : 'text-left'}`}>
            <h2 className={`text-xl text-slate-800 ${field.isBold ? 'font-bold' : 'font-semibold'}`}>{field.content || 'Section Title'}</h2>
          </div>
        );
      case 'paragraph':
        return (
          <p className={`text-slate-600 leading-relaxed whitespace-pre-wrap ${field.textAlign === 'center' ? 'text-center' : field.textAlign === 'right' ? 'text-right' : 'text-left'} ${field.isBold ? 'font-bold' : ''}`}>
            {field.content || ''}
          </p>
        );
      case 'divider':
        return <hr className="my-6 border-slate-200" />;
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Form Submitted!</h2>
          <p className="text-slate-500 mb-8">Thank you for your response. Your data has been successfully recorded.</p>
          <button 
            onClick={() => {
              if (onClose) onClose();
              else window.location.reload();
            }}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            {formId ? "Submit Another Response" : "Close Preview"}
          </button>
        </div>
      </div>
    );
  }

  const containerClass = formId 
    ? "min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 bg-transparent" 
    : "fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 overflow-y-auto";

  const formBoxClass = formId
    ? "bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl max-w-3xl w-full flex flex-col relative overflow-hidden border border-white/50 min-h-[600px]"
    : "bg-white rounded-3xl shadow-2xl max-w-3xl w-full flex flex-col my-auto relative overflow-hidden border border-slate-200/50 min-h-[600px]";

  return (
    <div className={containerClass}>
      <div className={formBoxClass}>
        {/* Header */}
        <div className={`px-8 py-6 border-b border-white/50 flex items-center justify-between sticky top-0 z-10 ${formId ? 'bg-white/40' : 'bg-white'}`}>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">
              {formId ? "Submit Form" : "Preview Form"}
            </h2>
            {steps.length > 1 && (
              <p className="text-sm font-bold text-primary-600 mt-1 uppercase tracking-wider">
                Step {currentStep + 1} of {steps.length}
              </p>
            )}
          </div>
          {!formId && onClose && (
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Form Body */}
        <div className="flex-1 p-8 sm:p-12 overflow-y-auto">
          <form id="preview-form" onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
            {currentFields.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium">
                No fields visible on this step.
              </div>
            ) : (
              currentFields.map((field, index) => (
                <div 
                  key={field.id} 
                  className="space-y-2 group animate-fade-in-up"
                  style={{ animationFillMode: 'both', animationDelay: `${index * 50}ms` }}
                >
                  {!['html_block', 'paragraph', 'divider'].includes(field.type) && (
                    <label className="block text-[15px] font-bold text-slate-800 tracking-wide">
                      {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                  )}
                  {field.helpText && !['html_block', 'paragraph', 'divider'].includes(field.type) && (
                    <p className="text-sm text-slate-500 font-medium pb-1">{field.helpText}</p>
                  )}
                  {renderInput(field)}
                </div>
              ))
            )}
          
          <div className="flex justify-between pt-8 mt-8 border-t border-slate-200">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-3 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm border border-slate-200 flex items-center gap-2"
              >
                <ArrowLeft size={20} /> Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 transition-all shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLastStep ? (isSubmitting ? 'Submitting...' : 'Submit') : 'Next'} {!isLastStep && <ArrowRight size={20} />}
            </button>
          </div>
        </form>
        </div>

        {/* Progress Bar */}
        {steps.length > 1 && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 z-20">
            <div 
              className="h-full bg-primary-500 transition-all duration-500 ease-out" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

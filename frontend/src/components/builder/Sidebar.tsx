import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import { 
  Type, Mail, Hash, Phone, AlignLeft, ChevronDown, 
  CheckSquare, CircleDot, Calendar, Star, Minus,
  Upload, Clock, Link, MapPin, Heading1, SplitSquareHorizontal, Pilcrow, Check, Globe,
  MessageSquare, Briefcase
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loadForm } from '../../store/slices/builderSlice';
import type { RootState } from '../../store';
import { FORM_TEMPLATES } from '../../constants/templates';
import type { FieldType } from '../../store/slices/builderSlice';

const fieldTypes: { type: FieldType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Short Text', icon: <Type size={18} /> },
  { type: 'textarea', label: 'Long Text', icon: <AlignLeft size={18} /> },
  { type: 'email', label: 'Email', icon: <Mail size={18} /> },
  { type: 'number', label: 'Number', icon: <Hash size={18} /> },
  { type: 'phone', label: 'Phone', icon: <Phone size={18} /> },
  { type: 'address', label: 'Address', icon: <MapPin size={18} /> },
  { type: 'website', label: 'Website', icon: <Link size={18} /> },
  { type: 'dropdown', label: 'Dropdown', icon: <ChevronDown size={18} /> },
  { type: 'country', label: 'Country', icon: <Globe size={18} /> },
  { type: 'radio', label: 'Single Choice', icon: <CircleDot size={18} /> },
  { type: 'checkbox', label: 'Multiple Choice', icon: <CheckSquare size={18} /> },
  { type: 'single_checkbox', label: 'Single Checkbox', icon: <Check size={18} /> },
  { type: 'date', label: 'Date', icon: <Calendar size={18} /> },
  { type: 'time', label: 'Time', icon: <Clock size={18} /> },
  { type: 'file_upload', label: 'File Upload', icon: <Upload size={18} /> },
  { type: 'rating', label: 'Rating', icon: <Star size={18} /> },
  { type: 'heading', label: 'Section Title', icon: <Heading1 size={18} /> },
  { type: 'paragraph', label: 'Paragraph Text', icon: <Pilcrow size={18} /> },
  { type: 'divider', label: 'Divider', icon: <Minus size={18} /> },
  { type: 'page_break', label: 'Page Break', icon: <SplitSquareHorizontal size={18} className="text-indigo-500" /> },
];

interface SidebarItemProps {
  type: FieldType;
  label: string;
  icon: React.ReactNode;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ type, label, icon }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FIELD,
    item: { type, isNew: true },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      className={`group flex items-center gap-3 p-3.5 mb-3 bg-white border border-slate-200 rounded-xl cursor-grab hover:bg-slate-50 hover:border-primary-300 transition-all duration-300 shadow-sm ${
        isDragging ? 'opacity-40 scale-95 shadow-none' : 'hover:scale-[1.02] hover:shadow-md hover:shadow-primary-500/10'
      }`}
    >
      <div className="text-slate-400 group-hover:text-primary-500 transition-colors">{icon}</div>
      <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const currentFields = useSelector((state: RootState) => state.builder.fields);

  const handleLoadTemplate = (templateId: string) => {
    const template = FORM_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    
    if (currentFields.length > 0) {
      if (!window.confirm("Are you sure? Loading a template will replace all your current fields.")) {
        return;
      }
    }
    
    dispatch(loadForm({
      title: template.title,
      fields: template.fields,
      workflows: []
    }));
  };

  const getTemplateIcon = (iconName: string) => {
    if (iconName === 'MessageSquare') return <MessageSquare size={16} />;
    if (iconName === 'Briefcase') return <Briefcase size={16} />;
    if (iconName === 'Star') return <Star size={16} />;
    return <Type size={16} />;
  };

  return (
    <div className="w-72 bg-slate-50/80 backdrop-blur-md border-r border-slate-200 p-5 h-full overflow-y-auto custom-scrollbar z-10 shadow-lg shadow-slate-200/50 relative flex flex-col gap-6">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none" />
      
      <div className="relative">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Templates</h3>
        <div className="grid grid-cols-1 gap-2">
          {FORM_TEMPLATES.map((template) => (
            <button 
              key={template.id}
              onClick={() => handleLoadTemplate(template.id)}
              className="flex items-center gap-3 p-3 bg-white/50 border border-slate-200 rounded-xl hover:bg-white hover:border-primary-300 hover:shadow-md hover:text-primary-600 transition-all text-left text-sm font-semibold text-slate-600 w-full group"
            >
              <div className="text-primary-400 group-hover:text-primary-500">
                {getTemplateIcon(template.icon)}
              </div>
              {template.name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Form Elements</h3>
        <div className="relative">
          {fieldTypes.map((field) => (
            <SidebarItem key={field.type} type={field.type} label={field.label} icon={field.icon} />
          ))}
        </div>
      </div>
    </div>
  );
};

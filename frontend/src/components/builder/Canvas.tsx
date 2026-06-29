import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrop, useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import type { RootState } from '../../store';
import { addField, reorderFields, selectField } from '../../store/slices/builderSlice';
import type { FormField, FieldType } from '../../store/slices/builderSlice';
import { GripVertical, MousePointer2, ChevronDown } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface CanvasItemProps {
  field: FormField;
  index: number;
}

const CanvasItem: React.FC<CanvasItemProps> = ({ field, index }) => {
  const dispatch = useDispatch();
  const selectedFieldId = useSelector((state: RootState) => state.builder.selectedFieldId);
  const fields = useSelector((state: RootState) => state.builder.fields);
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.FIELD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) return;
      if (item.isNew) return; // Don't reorder new items until dropped

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      dispatch(reorderFields({ dragIndex, hoverIndex }));
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.FIELD,
    item: () => {
      return { id: field.id, index, isNew: false };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));
  const isSelected = selectedFieldId === field.id;

  const isStaticContent = ['html_block', 'paragraph', 'divider', 'page_break'].includes(field.type);

  return (
    <div
      ref={ref as unknown as React.LegacyRef<HTMLDivElement>}
      onClick={(e) => {
        e.stopPropagation();
        dispatch(selectField(field.id));
      }}
      className={`relative group p-6 bg-white border-2 rounded-2xl cursor-pointer transition-all duration-200 animate-scale-in ${
        isSelected 
          ? 'border-primary-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] scale-[1.01] z-10 ring-4 ring-primary-50' 
          : 'border-transparent shadow-sm hover:border-slate-300 hover:shadow-md'
      } ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}`}
      data-handler-id={handlerId}
    >
      {/* Drag handle */}
      <div 
        ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical size={20} />
      </div>

      <div className="pl-6 pointer-events-none">
        {/* Only render label for actual inputs */}
        {!isStaticContent && (
          <label className="block text-[15px] font-bold text-slate-800 tracking-wide group-hover:text-primary-600 transition-colors">
            {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {field.helpText && !isStaticContent && (
          <p className="text-sm text-slate-500 font-medium pb-1 mt-1">{field.helpText}</p>
        )}

        <div className={isStaticContent ? '' : 'mt-3 opacity-90'}>
          {['text', 'email', 'number', 'website', 'date', 'time'].includes(field.type) && (
            <input type={field.type === 'website' ? 'url' : field.type} disabled placeholder={field.placeholder || ''} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 cursor-not-allowed placeholder:text-slate-400" />
          )}

          {field.type === 'phone' && (
            <div className="flex gap-2">
              <div className="w-[120px] p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-between opacity-80 cursor-not-allowed">
                <span className="text-sm font-medium">🇺🇸 +1</span>
                <ChevronDown size={14} />
              </div>
              <input type="tel" disabled placeholder={field.placeholder || '(555) 000-0000'} className="flex-1 p-3 border border-slate-200 rounded-xl bg-slate-50 cursor-not-allowed placeholder:text-slate-400" />
            </div>
          )}

          {field.type === 'country' && (
            <div className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-between opacity-80 cursor-not-allowed">
              <span>{field.placeholder || '-- Select Country --'}</span>
              <ChevronDown size={16} />
            </div>
          )}
          {['textarea', 'address'].includes(field.type) && (
            <textarea disabled placeholder={field.placeholder || ''} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 placeholder-slate-400 shadow-inner" rows={3} />
          )}
          {field.type === 'dropdown' && (
            <div className="relative pointer-events-none">
              <select className="appearance-none w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium">
                <option value="">{field.placeholder || 'Select an option'}</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          )}
          {field.type === 'radio' && (
            <div className="space-y-2 pointer-events-none">
              {field.options?.filter(opt => opt.trim() !== '').map((opt, i) => (
                <label key={i} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50 opacity-80">
                  <input type="radio" disabled className="w-4 h-4 text-primary-600 border-slate-300" />
                  <span className="text-slate-600">{opt}</span>
                </label>
              ))}
            </div>
          )}
          {field.type === 'checkbox' && (
            <div className="space-y-2 pointer-events-none">
              {field.options?.filter(opt => opt.trim() !== '').map((opt, i) => (
                <label key={i} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50 opacity-80">
                  <input type="checkbox" disabled className="w-4 h-4 text-primary-600 rounded border-slate-300" />
                  <span className="text-slate-600">{opt}</span>
                </label>
              ))}
            </div>
          )}
          {field.type === 'single_checkbox' && (
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 text-sm font-medium pointer-events-none opacity-80">
              <input disabled type="checkbox" className="w-4 h-4 text-primary-600 rounded border-slate-300" />
              <span>{field.placeholder || 'Check this box'}</span>
            </label>
          )}
          {field.type === 'rating' && (
            <div className="flex gap-2 pointer-events-none">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold text-lg bg-white border-slate-200 text-slate-400">
                  {i}
                </div>
              ))}
            </div>
          )}
          {field.type === 'file_upload' && (
            <div className="w-full p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-500 text-center font-medium pointer-events-none flex flex-col items-center gap-2">
              <span className="text-2xl">📁</span>
              <span>Click or drag file to upload</span>
            </div>
          )}
          {field.type === 'heading' && (
            <div className={`pointer-events-none mb-2 ${field.textAlign === 'center' ? 'text-center' : field.textAlign === 'right' ? 'text-right' : 'text-left'}`}>
              <h2 className={`text-xl text-slate-800 ${field.isBold ? 'font-bold' : 'font-semibold'}`}>{field.content || 'Section Title'}</h2>
            </div>
          )}
          {field.type === 'paragraph' && (
            <p className={`text-slate-600 leading-relaxed whitespace-pre-wrap ${field.textAlign === 'center' ? 'text-center' : field.textAlign === 'right' ? 'text-right' : 'text-left'} ${field.isBold ? 'font-bold' : ''}`}>
              {field.content || 'Paragraph text will appear here...'}
            </p>
          )}
          {field.type === 'divider' && <hr className="my-6 border-slate-200" />}
          {field.type === 'page_break' && (
            <div className="flex justify-between items-center w-full py-2">
              {fields.filter(f => f.type === 'page_break')[0]?.id !== field.id ? (
                <button disabled className="px-6 py-2.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl font-bold text-sm">Back</button>
              ) : <div />}
              <button disabled className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-md shadow-primary-600/20 ml-auto">Next Step</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Canvas: React.FC = () => {
  const dispatch = useDispatch();
  const fields = useSelector((state: RootState) => state.builder.fields);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.FIELD,
    drop: (item: { type: FieldType; isNew: boolean }) => {
      if (item.isNew) {
        let placeholder = '';
        switch (item.type) {
          case 'email': placeholder = 'name@example.com'; break;
          case 'phone': placeholder = '+1 (555) 000-0000'; break;
          case 'website': placeholder = 'https://www.example.com'; break;
          case 'number': placeholder = 'e.g., 42'; break;
          case 'text': placeholder = 'Type your answer here...'; break;
          case 'textarea': placeholder = 'Type a detailed answer...'; break;
          case 'address': placeholder = 'Street address, City, State, ZIP'; break;
          case 'date': placeholder = 'MM/DD/YYYY'; break;
          case 'time': placeholder = 'HH:MM AM/PM'; break;
          case 'single_checkbox': placeholder = 'I agree to the terms and conditions'; break;
        }

        const newField: FormField = {
          id: generateId(),
          type: item.type,
          label: `New ${item.type}`,
          required: false,
          placeholder,
          options: ['dropdown', 'radio', 'checkbox'].includes(item.type) ? ['Option 1', 'Option 2', 'Option 3'] : undefined
        };
        dispatch(addField(newField));
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div 
      ref={drop as unknown as React.LegacyRef<HTMLDivElement>} 
      className={`flex-1 bg-slate-100/50 p-8 overflow-y-auto transition-colors relative custom-scrollbar ${isOver ? 'bg-primary-50' : ''}`}
      onClick={() => dispatch(selectField(null))}
    >
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      
      <div className="max-w-3xl mx-auto min-h-full relative z-10">
        {fields.length === 0 ? (
          <div className="h-64 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center bg-white/50 text-slate-500 backdrop-blur-sm transition-all hover:border-slate-400">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
              <MousePointer2 size={28} className="text-primary-400" />
            </div>
            <p className="font-semibold text-lg text-slate-600">Drag and drop fields here</p>
            <p className="text-sm text-slate-500 mt-1">to start building your form</p>
          </div>
        ) : (
          <div className="pb-32">
            {fields.map((field, index) => (
              <CanvasItem key={field.id} index={index} field={field} />
            ))}
            
            {/* Submit Button Mock at the bottom */}
            <div className="mt-8 p-6 bg-white border border-slate-200 rounded-2xl flex justify-between items-center shadow-sm relative group cursor-default">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 rounded-full">Form End</div>
              {fields.some(f => f.type === 'page_break') ? (
                <button disabled className="px-6 py-2.5 bg-slate-200 text-slate-500 rounded-xl font-bold text-sm">Back</button>
              ) : <div />}
              <button disabled className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20">Submit Form</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

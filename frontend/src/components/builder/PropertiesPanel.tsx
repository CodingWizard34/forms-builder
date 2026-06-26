import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { updateField, removeField, setTheme, updateSettings } from '../../store/slices/builderSlice';
import { Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Palette, Image as ImageIcon, Settings } from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const dispatch = useDispatch();
  const selectedFieldId = useSelector((state: RootState) => state.builder.selectedFieldId);
  const fields = useSelector((state: RootState) => state.builder.fields);
  const theme = useSelector((state: RootState) => state.builder.theme);
  const { cover_image, logo, max_responses, expires_at } = useSelector((state: RootState) => state.builder);
  const selectedField = fields.find((f) => f.id === selectedFieldId);

  const THEMES = [
    { id: 'theme-blue', name: 'Blue', bgClass: 'bg-blue-500', borderClass: 'border-blue-200' },
    { id: 'theme-emerald', name: 'Emerald', bgClass: 'bg-emerald-500', borderClass: 'border-emerald-200' },
    { id: 'theme-rose', name: 'Rose', bgClass: 'bg-rose-500', borderClass: 'border-rose-200' },
    { id: 'theme-violet', name: 'Violet', bgClass: 'bg-violet-500', borderClass: 'border-violet-200' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: 'cover_image' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(updateSettings({ [key]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!selectedField) {
    return (
      <div className="w-80 bg-white/95 backdrop-blur-md border-l border-slate-200 flex flex-col h-full z-10 shadow-xl relative">
        <div className="flex border-b border-slate-100 bg-white relative pt-4 pb-4 px-5 items-center gap-2">
          <Palette size={18} className="text-primary-500" />
          <h3 className="font-bold text-slate-800">Form Settings</h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Color Theme</label>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => dispatch(setTheme(t.id))}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === t.id ? 'border-primary-500 bg-primary-50/50 scale-105 shadow-sm' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  <div className={`w-8 h-8 rounded-full shadow-inner border ${t.bgClass} ${t.borderClass}`} />
                  <span className={`text-xs ${theme === t.id ? 'text-primary-700 font-bold' : 'text-slate-500 font-medium'}`}>{t.name}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">Changes apply instantly to the builder and live public forms.</p>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon size={16} className="text-slate-400" />
              <h4 className="text-sm font-bold text-slate-700">Custom Branding</h4>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500">Cover Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'cover_image')}
                className="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
              />
              {cover_image && (
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 mt-2">
                  <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">✓ Image uploaded</span>
                  <button onClick={() => dispatch(updateSettings({ cover_image: '' }))} className="text-[10px] text-red-500 font-bold hover:underline">Remove</button>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500">Logo Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'logo')}
                className="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
              />
              {logo && (
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 mt-2">
                  <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">✓ Logo uploaded</span>
                  <button onClick={() => dispatch(updateSettings({ logo: '' }))} className="text-[10px] text-red-500 font-bold hover:underline">Remove</button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings size={16} className="text-slate-400" />
              <h4 className="text-sm font-bold text-slate-700">Submission Limits</h4>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500">Max Responses</label>
              <input 
                type="number" 
                value={max_responses || ''} 
                onChange={(e) => dispatch(updateSettings({ max_responses: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="Unlimited"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500">Expiration Date</label>
              <input 
                type="datetime-local" 
                value={expires_at ? expires_at.slice(0, 16) : ''} 
                onChange={(e) => dispatch(updateSettings({ expires_at: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/50 outline-none transition-all text-slate-700"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    dispatch(updateField({ ...selectedField, [key]: value }));
  };

  const handleOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const options = e.target.value.split('\n');
    handleChange('options', options);
  };

  return (
    <div className="w-80 bg-white/95 backdrop-blur-md border-l border-slate-200 flex flex-col h-full z-10 shadow-xl relative">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
      
      <div className="flex border-b border-slate-100 bg-white relative pt-4 pb-4 px-5">
        <h3 className="font-bold text-slate-800">Field Properties</h3>
        <button 
          onClick={() => dispatch(removeField(selectedField.id))}
          className="absolute right-4 top-3 p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          title="Delete Field"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="p-5 space-y-6 overflow-y-auto flex-1 relative custom-scrollbar">
            {!['html_block', 'page_break', 'divider'].includes(selectedField.type) && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Field Label</label>
                  <input 
                    type="text" 
                    value={selectedField.label} 
                    onChange={(e) => handleChange('label', e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-800 outline-none transition-all placeholder:text-slate-400 shadow-inner"
                  />
                </div>

                <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl shadow-sm">
                  <label className="flex items-center justify-between cursor-pointer group w-full">
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Required Field</span>
                    <div className="relative inline-flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedField.required} 
                        onChange={(e) => handleChange('required', e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500 shadow-inner"></div>
                    </div>
                  </label>
                </div>
              </>
            )}

            {['text', 'email', 'number', 'phone', 'textarea', 'country'].includes(selectedField.type) && (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Placeholder
                </label>
                <input 
                  type="text" 
                  value={selectedField.placeholder || ''} 
                  onChange={(e) => handleChange('placeholder', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-800 outline-none transition-all placeholder:text-slate-400 shadow-inner"
                />
              </div>
            )}
            
            {selectedField.type === 'single_checkbox' && (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Checkbox Text</label>
                <input 
                  type="text" 
                  value={selectedField.placeholder || ''} 
                  onChange={(e) => handleChange('placeholder', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-800 outline-none transition-all placeholder:text-slate-400 shadow-inner"
                />
              </div>
            )}

            {['dropdown', 'radio', 'checkbox'].includes(selectedField.type) && (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Options (One per line)</label>
                <textarea 
                  rows={5}
                  value={selectedField.options?.join('\n') || ''} 
                  onChange={handleOptionsChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-800 outline-none transition-all placeholder:text-slate-400 shadow-inner custom-scrollbar"
                  placeholder="Option 1&#10;Option 2"
                />
              </div>
            )}

            {['heading', 'paragraph'].includes(selectedField.type) && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">
                    {selectedField.type === 'heading' ? 'Section Title' : 'Paragraph Content'}
                  </label>
                  <textarea 
                    rows={8}
                    value={selectedField.content || ''} 
                    onChange={(e) => handleChange('content', e.target.value)}
                    className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-800 outline-none transition-all shadow-inner custom-scrollbar ${selectedField.type === 'heading' ? 'font-bold text-lg' : ''}`}
                    placeholder={selectedField.type === 'heading' ? "Page 1: Information" : "Type your paragraph text here..."}
                  />
                </div>
                
                <div className="space-y-3 pt-2">
                  <label className="block text-sm font-semibold text-slate-700">Text Styling</label>
                  <div className="flex gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => handleChange('textAlign', 'left')}
                        className={`p-2 rounded-md transition-all ${selectedField.textAlign === 'left' || !selectedField.textAlign ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Align Left"
                      >
                        <AlignLeft size={18} />
                      </button>
                      <button
                        onClick={() => handleChange('textAlign', 'center')}
                        className={`p-2 rounded-md transition-all ${selectedField.textAlign === 'center' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Align Center"
                      >
                        <AlignCenter size={18} />
                      </button>
                      <button
                        onClick={() => handleChange('textAlign', 'right')}
                        className={`p-2 rounded-md transition-all ${selectedField.textAlign === 'right' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Align Right"
                      >
                        <AlignRight size={18} />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleChange('isBold', !selectedField.isBold)}
                      className={`p-2 rounded-lg border transition-all flex items-center justify-center w-10 ${selectedField.isBold ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700'}`}
                      title="Toggle Bold"
                    >
                      <Bold size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {!['heading', 'page_break', 'divider'].includes(selectedField.type) && (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Help Text (Optional)</label>
                <textarea 
                  rows={3}
                  value={selectedField.helpText || ''} 
                  onChange={(e) => handleChange('helpText', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-800 outline-none transition-all placeholder:text-slate-400 shadow-inner custom-scrollbar"
                  placeholder="Explain this question..."
                />
              </div>
            )}
      </div>
    </div>
  );
};


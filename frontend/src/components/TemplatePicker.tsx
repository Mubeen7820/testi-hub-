import React, { useState } from 'react';
import { useTestimonialStore } from '../store/testimonialStore';
import type { TemplateName, TemplateConfig } from '../types/testimonial';

const templates: TemplateConfig[] = [
  { id: 'minimal', name: 'Minimal', description: 'Clean & elegant' },
  { id: 'instagram', name: 'Instagram', description: 'Gradient card' },
  { id: 'whatsapp', name: 'WhatsApp', description: 'Chat style' },
  { id: 'dark-premium', name: 'Dark Premium', description: 'Bold & dark' },
  { id: 'linkedin', name: 'LinkedIn', description: 'Professional' },
  { id: 'glassmorphism', name: 'Glass', description: 'Frosted glass' },
  { id: 'geometric', name: 'Geometric', description: 'Orange & Grey' },
  { id: 'happy-bubble', name: 'Happy Bubble', description: 'Friendly smiley' },
  { id: 'deep-burgundy', name: 'Deep Burgundy', description: 'Royal gradient' },
  { id: 'classic-parchment', name: 'Classic Parchment', description: 'Traditional feel' },
  { id: 'corporate-grid', name: 'Corporate Grid', description: 'Professional & clean' },
  { id: 'azure-bubble', name: 'Azure Bubble', description: 'Modern chat style' },
];

export const TemplatePicker: React.FC = () => {
  const { selectedTemplate, setSelectedTemplate, data, updateData } = useTestimonialStore();

  const [templatePage, setTemplatePage] = useState(1);
  const [fontPage, setFontPage] = useState(1);

  const gradients: Record<TemplateName, string> = {
    minimal: 'bg-slate-100',
    instagram: 'bg-gradient-to-br from-indigo-400 to-purple-500',
    whatsapp: 'bg-emerald-100',
    'dark-premium': 'bg-gradient-to-br from-slate-900 to-blue-950',
    linkedin: 'bg-white border border-slate-200',
    glassmorphism: 'bg-gradient-to-br from-violet-900 to-indigo-900',
    geometric: 'bg-gradient-to-r from-orange-400 to-orange-500',
    'happy-bubble': 'bg-yellow-100 border border-yellow-200',
    'deep-burgundy': 'bg-gradient-to-br from-red-900 to-red-950',
    'classic-parchment': 'bg-[#c19a6b]',
    'corporate-grid': 'bg-white border border-gray-200 shadow-sm',
    'azure-bubble': 'bg-blue-500',
  };

  const fontFamilies = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Serif', value: 'Merriweather, serif' },
    { name: 'Monospace', value: "'Fira Code', monospace" },
    { name: 'Rounded', value: "'Quicksand', sans-serif" },
    { name: 'Bookman', value: '"Bookman Old Style", serif' },
    { name: 'Cambria', value: 'Cambria, serif' },
    { name: 'High Tower', value: '"High Tower Text", serif' },
    { name: 'Britannic', value: '"Britannic Bold", sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Tahoma', value: 'Tahoma, sans-serif' },
    { name: 'Palatino', value: '"Palatino Linotype", serif' },
    { name: 'Century Gothic', value: '"Century Gothic", sans-serif' },
  ];

  const TEMPLATES_PER_PAGE = 6;
  const FONTS_PER_PAGE = 6;

  const totalTemplatePages = Math.ceil(templates.length / TEMPLATES_PER_PAGE);
  const totalFontPages = Math.ceil(fontFamilies.length / FONTS_PER_PAGE);

  const displayedTemplates = templates.slice((templatePage - 1) * TEMPLATES_PER_PAGE, templatePage * TEMPLATES_PER_PAGE);
  const displayedFonts = fontFamilies.slice((fontPage - 1) * FONTS_PER_PAGE, fontPage * FONTS_PER_PAGE);

  const Pagination = ({ current, total, onChange }: { current: number, total: number, onChange: (page: number) => void }) => (
  <div className="flex justify-center items-center gap-2 mt-4">
    <button
      onClick={() => onChange(Math.max(current - 1, 1))}
      disabled={current === 1}
      className="text-xs font-bold text-blue-600 mr-2 disabled:opacity-50 disabled:cursor-not-allowed hover:text-blue-700"
    >
      Prev
    </button>
    {Array.from({ length: total }, (_, i) => i + 1).map(page => (
      <button
        key={page}
        onClick={() => onChange(page)}
        className={`w-7 h-7 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
          current === page
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
        }`}
      >
        {page}
      </button>
    ))}
    <button
      onClick={() => onChange(Math.min(current + 1, total))}
      disabled={current === total}
      className="text-xs font-bold text-blue-600 ml-2 disabled:opacity-50 disabled:cursor-not-allowed hover:text-blue-700"
    >
      Next
    </button>
  </div>
);


  return (
    <div className="space-y-8 animate-fade-up pb-8">
      
      {/* Template Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Select Template</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {displayedTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTemplate(t.id);
                updateData({ template: t.id });
              }}
              className={`p-3 rounded-md text-left transition-all duration-200 border ${
                selectedTemplate === t.id
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                  : 'border-border bg-background hover:border-gray-300'
              }`}
            >
              <div className={`w-full h-12 rounded-md mb-3 ${gradients[t.id]}`} />
              <p className="text-xs font-semibold text-foreground">{t.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t.description}</p>
            </button>
          ))}
        </div>
        {totalTemplatePages > 1 && (
          <Pagination current={templatePage} total={totalTemplatePages} onChange={setTemplatePage} />
        )}
      </div>

      {/* Customization Options */}
      <div className="bg-secondary/50 border border-border rounded-md p-5 space-y-6">
        <h3 className="text-sm font-semibold text-foreground">Customization</h3>

        {/* Font Family */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Font Variations</label>
          <div className="grid grid-cols-3 gap-2">
             {displayedFonts.map(font => (
                <button
                  key={font.value}
                  onClick={() => updateData({ fontFamily: font.value })}
                  className={`text-xs px-2 py-2 rounded-md transition-colors border text-center truncate ${
                     data.fontFamily === font.value ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                  style={{ fontFamily: font.value }}
                >
                  {font.name}
                </button>
             ))}
          </div>
          {totalFontPages > 1 && (
            <Pagination current={fontPage} total={totalFontPages} onChange={setFontPage} />
          )}
        </div>

        {/* Text Size */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex justify-between">
            Text Resizing <span>{data.fontSize}px</span>
          </label>
          <input 
             type="range"
             min="12"
             max="24"
             step="1"
             value={data.fontSize || 16}
             onChange={(e) => updateData({ fontSize: parseInt(e.target.value) })}
             className="w-full accent-blue-600"
          />
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Background Color</label>
              <div className="flex gap-2 items-center">
                 <input 
                    type="color" 
                    value={data.customBackgroundColor || '#FFFFFF'} 
                    onChange={(e) => updateData({ customBackgroundColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                 />
                 <span className="text-xs text-muted-foreground">{data.customBackgroundColor || '#FFFFFF'}</span>
              </div>
           </div>
           
           <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Text Color</label>
              <div className="flex gap-2 items-center">
                 <input 
                    type="color" 
                    value={data.customTextColor || '#000000'} 
                    onChange={(e) => updateData({ customTextColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                 />
                 <span className="text-xs text-muted-foreground">{data.customTextColor || '#000000'}</span>
              </div>
           </div>
           
           <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Watermark Color</label>
              <div className="flex gap-2 items-center">
                 <input 
                    type="color" 
                    value={data.watermarkColor || '#9ca3af'} 
                    onChange={(e) => updateData({ watermarkColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                 />
                 <span className="text-xs text-muted-foreground">{data.watermarkColor || '#9ca3af'}</span>
              </div>
           </div>
        </div>
        
      </div>
    </div>
  );
};

import React from 'react';
import type { TestimonialData } from '../types/testimonial';
import { Star, Quote } from 'lucide-react';

interface Props {
  data: TestimonialData;
  showWatermark: boolean;
}

const Stars: React.FC<{ rating: number; className?: string }> = ({ rating, className = '' }) => (
  <div className={`flex gap-0.5 ${className}`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} className={`w-4 h-4 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
    ))}
  </div>
);

const Avatar: React.FC<{ data: TestimonialData; size?: string }> = ({ data, size = 'w-10 h-10' }) => (
  <div className={`${size} rounded-full overflow-hidden bg-gray-300 flex-shrink-0`}>
    {data.profileImage ? (
      <img src={data.profileImage} alt={data.name} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-semibold text-sm">
        {data.name ? data.name[0].toUpperCase() : '?'}
      </div>
    )}
  </div>
);

export const MinimalTemplate: React.FC<Props> = ({ data, showWatermark }) => (
  <div 
    className="bg-white p-8 rounded-2xl transition-all" 
    style={{ 
       width: '100%', minHeight: 280, 
       backgroundColor: data.customBackgroundColor || undefined,
       fontFamily: data.fontFamily || undefined
    }}
  >
    <Quote className="w-8 h-8 mb-4 opacity-30" style={{ color: data.customTextColor }} />
    <p className="text-lg leading-relaxed mb-6 italic" style={{ color: data.customTextColor || '#1f2937', fontSize: data.fontSize }}>"{data.feedback}"</p>
    <Stars rating={data.rating} />
    <div className="flex items-center gap-3 mt-4">
      <Avatar data={data} />
      <div>
        <p className="font-semibold text-sm" style={{ color: data.customTextColor || '#111827' }}>{data.name || 'Anonymous'}</p>
        {(data.role || data.company) && (
          <p className="text-xs opacity-70" style={{ color: data.customTextColor || '#6b7280' }}>
            {data.role} {data.role && data.company ? 'at' : ''} {data.company}
          </p>
        )}
        <p className="text-xs opacity-50 mt-0.5" style={{ color: data.customTextColor || '#9ca3af' }}>{data.date} • {data.time}</p>
      </div>
    </div>
    {showWatermark && <p className="text-[10px] mt-4 text-right opacity-30" style={{ color: data.watermarkColor || data.customTextColor || '#9ca3af' }}>TestimonialHub</p>}
  </div>
);

export const InstagramTemplate: React.FC<Props> = ({ data, showWatermark }) => (
  <div 
    className="p-8 rounded-2xl text-white transition-all" 
    style={{ 
       width: '100%', minHeight: 280, 
       background: data.customBackgroundColor || 'linear-gradient(135deg, #667eea, #764ba2)',
       fontFamily: data.fontFamily || undefined
    }}
  >
    <Stars rating={data.rating} className="mb-4" />
    <p className="font-medium leading-relaxed mb-6" style={{ color: data.customTextColor || '#ffffff', fontSize: data.fontSize }}>"{data.feedback}"</p>
    <div className="flex items-center gap-3">
      <Avatar data={data} />
      <div style={{ color: data.customTextColor || '#ffffff' }}>
        <p className="font-semibold text-sm">{data.name || 'Anonymous'}</p>
        {(data.role || data.company) && (
          <p className="opacity-80 text-xs">
            {data.role} {data.company ? `@ ${data.company}` : ''}
          </p>
        )}
        {data.socialLink && <p className="opacity-70 text-xs mt-0.5">{data.socialLink}</p>}
      </div>
    </div>
    {showWatermark && <p className="text-[10px] mt-4 text-right" style={{ color: data.watermarkColor || 'rgba(255,255,255,0.3)' }}>TestimonialHub</p>}
  </div>
);

export const WhatsAppTemplate: React.FC<Props> = ({ data, showWatermark }) => (
  <div className="rounded-2xl overflow-hidden" style={{ width: '100%', minHeight: 280, background: data.customBackgroundColor || '#e5ddd5', fontFamily: data.fontFamily || undefined }}>
    <div className="p-3 text-center" style={{ background: '#075E54' }}>
      <p className="text-white text-xs font-medium">WhatsApp Chat</p>
    </div>
    <div className="p-4">
      <div className="bg-white rounded-lg p-3 max-w-[85%] ml-auto shadow-sm">
        <p className="text-sm leading-relaxed" style={{ color: data.customTextColor || '#1f2937', fontSize: data.fontSize }}>{data.feedback}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-gray-400">{data.time}</span>
          <span className="text-blue-400 text-[10px]">✓✓</span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 px-1">
        <Avatar data={data} size="w-6 h-6" />
        <span className="text-xs text-gray-600 font-medium">{data.name || 'Customer'}</span>
        <Stars rating={data.rating} className="ml-auto" />
      </div>
    </div>
    {showWatermark && <p className="text-[10px] px-4 pb-2 text-right" style={{ color: data.watermarkColor || '#9ca3af' }}>TestimonialHub</p>}
  </div>
);

export const DarkPremiumTemplate: React.FC<Props> = ({ data, showWatermark }) => (
  <div 
    className="p-8 rounded-2xl text-white transition-all border border-white/10" 
    style={{ 
       width: '100%', minHeight: 280, 
       background: data.customBackgroundColor || 'linear-gradient(145deg, #1a1a2e, #16213e)',
       fontFamily: data.fontFamily || undefined
    }}
  >
    <div className="flex items-center gap-3 mb-6">
      <Avatar data={data} size="w-12 h-12" />
      <div style={{ color: data.customTextColor || '#ffffff' }}>
        <p className="font-bold text-sm">{data.name || 'Anonymous'}</p>
        {(data.role || data.company) && (
          <p className="opacity-70 text-[10px] uppercase tracking-wider mb-1">
            {data.role} {data.company ? `| ${data.company}` : ''}
          </p>
        )}
        <Stars rating={data.rating} />
      </div>
    </div>
    <Quote className="w-6 h-6 mb-2 opacity-50" style={{ color: data.customTextColor || '#60a5fa' }} />
    <p className="leading-relaxed" style={{ color: data.customTextColor || '#e5e7eb', fontSize: data.fontSize }}>{data.feedback}</p>
    <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center" style={{ color: data.customTextColor || '#9ca3af' }}>
      <span className="text-xs opacity-70">{data.date} • {data.time}</span>
      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 capitalize opacity-90">{data.tag}</span>
    </div>
    {showWatermark && <p className="text-[10px] mt-3 text-right" style={{ color: data.watermarkColor || 'rgba(255,255,255,0.2)' }}>TestimonialHub</p>}
  </div>
);

export const LinkedInTemplate: React.FC<Props> = ({ data, showWatermark }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200" style={{ width: '100%', minHeight: 280, backgroundColor: data.customBackgroundColor || undefined, fontFamily: data.fontFamily || undefined }}>
    <div className="flex items-center gap-3 mb-4">
      <Avatar data={data} size="w-12 h-12" />
      <div>
        <p className="font-bold text-sm" style={{ color: data.customTextColor || '#111827' }}>{data.name || 'Anonymous'}</p>
        {data.socialLink && <p className="text-xs opacity-70" style={{ color: data.customTextColor || '#6b7280' }}>{data.socialLink}</p>}
        <p className="text-xs opacity-50" style={{ color: data.customTextColor || '#9ca3af' }}>{data.date}</p>
      </div>
    </div>
    <p className="text-sm leading-relaxed mb-4" style={{ color: data.customTextColor || '#374151', fontSize: data.fontSize }}>{data.feedback}</p>
    <Stars rating={data.rating} />
    <div className="mt-4 pt-3 border-t border-gray-100 flex gap-4">
      <span className="text-xs text-gray-400">👍 Like</span>
      <span className="text-xs text-gray-400">💬 Comment</span>
      <span className="text-xs text-gray-400">🔄 Repost</span>
    </div>
    {showWatermark && <p className="text-[10px] mt-3 text-right" style={{ color: data.watermarkColor || '#d1d5db' }}>TestimonialHub</p>}
  </div>
);

export const GlassmorphismTemplate: React.FC<Props> = ({ data, showWatermark }) => (
  <div className="relative p-8 rounded-2xl overflow-hidden text-white" style={{ width: '100%', minHeight: 280, background: data.customBackgroundColor || 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', fontFamily: data.fontFamily || undefined }}>
    <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
    <div className="relative z-10" style={{ color: data.customTextColor || '#ffffff' }}>
      <Stars rating={data.rating} className="mb-4" />
      <p className="text-lg leading-relaxed mb-6 font-light" style={{ fontSize: data.fontSize }}>"{data.feedback}"</p>
      <div className="flex items-center gap-3">
        <Avatar data={data} />
        <div>
          <p className="font-semibold text-sm">{data.name || 'Anonymous'}</p>
          <p className="text-white/50 text-xs">{data.date} • {data.time}</p>
        </div>
      </div>
      {showWatermark && <p className="text-[10px] mt-4 text-right" style={{ color: data.watermarkColor || 'rgba(255,255,255,0.2)' }}>TestimonialHub</p>}
    </div>
  </div>
);

export const GeometricTemplate: React.FC<Props> = ({ data, showWatermark }) => (
  <div className="relative p-8 rounded-2xl overflow-hidden" style={{ width: '100%', minHeight: 280, backgroundColor: data.customBackgroundColor || '#f3f4f6', fontFamily: data.fontFamily || undefined }}>
    <div className="absolute top-0 right-0 w-1/3 h-full" style={{ backgroundColor: data.customTextColor || '#f59e0b' }} />
    <div className="absolute bottom-0 left-0 w-1/4 h-1/4 opacity-20" style={{ backgroundColor: data.customTextColor || '#f59e0b' }}>
      <Quote className="w-full h-full p-2" />
    </div>
    <div className="relative z-10 bg-white/95 p-8 rounded-xl shadow-lg max-w-[85%] mx-auto mt-4">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-4 rounded-sm flex items-center justify-center text-white" style={{ backgroundColor: data.customTextColor || '#f59e0b' }}>
           <span className="font-bold text-xl">{data.name ? data.name[0].toUpperCase() : '?'}</span>
        </div>
        <div>
          <p className="text-xl font-bold" style={{ color: '#111827' }}>{data.name || 'Anonymous'}</p>
          <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">{data.role} {data.company ? `| ${data.company}` : ''}</p>
          <Stars rating={data.rating} className="mt-2" />
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed italic" style={{ fontSize: data.fontSize }}>
        "{data.feedback}"
      </p>
    </div>
    {showWatermark && <p className="text-[10px] absolute bottom-4 right-4 text-white">TestimonialHub</p>}
  </div>
);

export const HappyBubbleTemplate: React.FC<Props> = ({ data, showWatermark }) => (
  <div className="p-8 rounded-2xl flex items-center justify-center relative" style={{ width: '100%', minHeight: 280, backgroundColor: data.customBackgroundColor || '#fef9c3', fontFamily: data.fontFamily || undefined }}>
    <div className="absolute bottom-0 left-0 w-1/3 h-1/2 rounded-tr-full opacity-50" style={{ backgroundColor: data.customTextColor || '#fde047' }} />
    <div className="relative z-10 bg-white p-8 rounded-3xl rounded-bl-sm shadow-xl w-[90%]">
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl shadow-sm border border-yellow-200">
        😊
      </div>
      <Quote className="absolute top-4 left-4 w-8 h-8 opacity-10 text-yellow-500" />
      <p className="text-center text-gray-600 mt-4 leading-relaxed text-sm" style={{ fontSize: data.fontSize }}>
        "{data.feedback}"
      </p>
      <div className="mt-6 text-center">
        <p className="font-black text-gray-900 uppercase tracking-wider">{data.name || 'Anonymous'}</p>
        <p className="text-xs text-gray-400 mt-1">{data.role} {data.company ? `@ ${data.company}` : ''}</p>
      </div>
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white px-2 py-4 rounded-full shadow-md">
        <div className="flex flex-col gap-1">
          {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3 h-3 ${s <= data.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
        </div>
      </div>
    </div>
    {showWatermark && <p className="text-[10px] absolute bottom-4 right-4 text-gray-400">TestimonialHub</p>}
  </div>
);

export const DeepBurgundyTemplate: React.FC<Props> = ({ data, showWatermark }) => (
  <div className="p-10 rounded-2xl flex items-center justify-center relative" style={{ width: '100%', minHeight: 280, backgroundColor: data.customBackgroundColor || '#7f1d1d', fontFamily: data.fontFamily || undefined }}>
    <div className="relative z-10 bg-white p-8 rounded-3xl rounded-tr-sm shadow-2xl w-full">
      <div className="absolute -top-4 -left-4 w-10 h-10 bg-red-900 rounded-lg flex items-center justify-center shadow-lg">
        <Quote className="w-5 h-5 text-white" />
      </div>
      <div className="flex justify-between items-start mb-4 mt-2">
        <div>
          <p className="text-2xl font-bold text-red-900">{data.name || 'Anonymous'}</p>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{data.role} {data.company ? `| ${data.company}` : ''}</p>
        </div>
        <div className="flex flex-col gap-1">
          {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-4 h-4 ${s <= data.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed" style={{ fontSize: data.fontSize }}>
        "{data.feedback}"
      </p>
      <div className="absolute -bottom-6 -right-2 w-14 h-14 bg-red-900 rounded-full flex items-center justify-center text-white border-4 border-white">
        <Quote className="w-6 h-6 rotate-180" />
      </div>
    </div>
    <div className="absolute bottom-4 left-8 text-white/10 font-black text-6xl tracking-widest pointer-events-none">REAL</div>
    {showWatermark && <p className="text-[10px] absolute bottom-4 right-4 text-white/50">TestimonialHub</p>}
  </div>
);

export const ClassicParchmentTemplate: React.FC<Props> = ({ data, showWatermark }) => (
  <div className="p-10 rounded-2xl flex flex-col justify-center items-center relative" style={{ width: '100%', minHeight: 280, backgroundColor: data.customBackgroundColor || '#e5d5b7', fontFamily: data.fontFamily || undefined }}>
    <div className="absolute inset-4 border border-[#c8b38c] opacity-50 rounded-xl" />
    <div className="relative z-10 bg-[#8b4513] text-[#f5ebd9] p-6 rounded-2xl rounded-bl-sm shadow-xl w-[85%] mb-4">
      <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
        <Quote className="w-6 h-6 text-[#8b4513]" />
      </div>
      <p className="text-sm leading-relaxed italic text-center" style={{ fontSize: data.fontSize }}>
        "{data.feedback}"
      </p>
      <div className="absolute -bottom-3 left-10 w-6 h-6 bg-[#8b4513] rotate-45" />
    </div>
    <div className="flex items-center gap-4 w-[85%] mt-4">
      <div className="w-12 h-12 rounded-full bg-[#a0522d] border-2 border-white flex items-center justify-center text-white shadow-md">
        <span className="font-bold">{data.name ? data.name[0].toUpperCase() : '?'}</span>
      </div>
      <div>
        <p className="font-bold text-[#5c2e0e]">{data.name || 'Anonymous'}</p>
        <p className="text-xs text-[#8b4513] uppercase mb-1">{data.role} {data.company ? `| ${data.company}` : ''}</p>
        <Stars rating={data.rating} />
      </div>
    </div>
    {showWatermark && <p className="text-[10px] absolute bottom-2 right-4 text-[#8b4513]/50">TestimonialHub</p>}
  </div>
);

export const CorporateGridTemplate: React.FC<Props> = ({ data, showWatermark }) => (
  <div className="p-8 rounded-2xl bg-white border border-gray-200 relative overflow-hidden" style={{ width: '100%', minHeight: 280, backgroundColor: data.customBackgroundColor || undefined, fontFamily: data.fontFamily || undefined }}>
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
    <div className="relative z-10">
      <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-4">
        <div className="flex gap-4 items-center">
          <Avatar data={data} size="w-12 h-12" />
          <div>
            <p className="font-bold text-gray-900" style={{ color: data.customTextColor || undefined }}>{data.name || 'Anonymous'}</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">{data.role} {data.company ? `| ${data.company}` : ''}</p>
          </div>
        </div>
        <div className="text-right">
           <Stars rating={data.rating} />
           <p className="text-[10px] text-gray-400 mt-1">{data.date}</p>
        </div>
      </div>
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
        <Quote className="w-5 h-5 text-blue-600 mb-2" />
        <p className="text-gray-700 leading-relaxed text-sm" style={{ color: data.customTextColor || undefined, fontSize: data.fontSize }}>"{data.feedback}"</p>
      </div>
    </div>
    {showWatermark && <p className="text-[10px] absolute bottom-3 right-4 text-gray-300">TestimonialHub</p>}
  </div>
);

export const AzureBubbleTemplate: React.FC<Props> = ({ data, showWatermark }) => (
  <div className="p-8 rounded-2xl flex flex-col justify-center relative" style={{ width: '100%', minHeight: 280, backgroundColor: data.customBackgroundColor || '#e0f2fe', fontFamily: data.fontFamily || undefined }}>
    <div className="flex flex-col gap-4 max-w-[90%] mx-auto w-full relative z-10">
      <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-sm shadow-md self-end max-w-[80%]">
        <p className="text-sm leading-relaxed" style={{ fontSize: data.fontSize }}>"{data.feedback}"</p>
        <p className="text-[10px] text-blue-200 text-right mt-2">{data.time}</p>
      </div>
      <div className="flex items-end gap-3 self-start max-w-[80%]">
        <Avatar data={data} size="w-8 h-8" />
        <div className="bg-white p-4 rounded-2xl rounded-bl-sm shadow-md border border-blue-50">
           <p className="font-bold text-gray-900 text-sm" style={{ color: data.customTextColor || undefined }}>{data.name || 'Anonymous'}</p>
           <p className="text-xs text-gray-500 mb-2">{data.role}</p>
           <Stars rating={data.rating} />
        </div>
      </div>
    </div>
    {showWatermark && <p className="text-[10px] absolute bottom-3 right-4 text-blue-300">TestimonialHub</p>}
  </div>
);

export const templateMap = {
  minimal: MinimalTemplate,
  instagram: InstagramTemplate,
  whatsapp: WhatsAppTemplate,
  'dark-premium': DarkPremiumTemplate,
  linkedin: LinkedInTemplate,
  glassmorphism: GlassmorphismTemplate,
  geometric: GeometricTemplate,
  'happy-bubble': HappyBubbleTemplate,
  'deep-burgundy': DeepBurgundyTemplate,
  'classic-parchment': ClassicParchmentTemplate,
  'corporate-grid': CorporateGridTemplate,
  'azure-bubble': AzureBubbleTemplate,
};

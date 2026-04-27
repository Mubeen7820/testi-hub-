export interface TestimonialData {
  feedback: string;
  rating: number;
  date: string;
  time: string;
  name: string;
  role: string;
  company: string;
  websiteUrl: string;
  linkedinUrl: string;
  socialLink: string;
  profileImage: string | null;
  tone: 'positive' | 'neutral' | 'negative';
  tag: 'testimonial' | 'review' | 'recommendation';
  id?: string;
  isExported?: boolean;
  template?: TemplateName;
  imageHash?: string;
  
  // Customization
  customBackgroundColor?: string;
  customTextColor?: string;
  fontFamily?: string;
  fontSize?: number;
  watermarkColor?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TemplateName =
  | 'minimal'
  | 'instagram'
  | 'whatsapp'
  | 'dark-premium'
  | 'linkedin'
  | 'glassmorphism'
  | 'geometric'
  | 'happy-bubble'
  | 'deep-burgundy'
  | 'classic-parchment'
  | 'corporate-grid'
  | 'azure-bubble';

export interface TemplateConfig {
  id: TemplateName;
  name: string;
  description: string;
}

export type ExportFormat = 'png' | 'jpg' | 'pdf' | 'html';
export type ExportSize = 'instagram' | 'linkedin' | 'twitter' | 'custom';

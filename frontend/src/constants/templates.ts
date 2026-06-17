import type { FormField } from '../store/slices/builderSlice';

export interface FormTemplate {
  id: string;
  name: string;
  icon: string;
  title: string;
  fields: FormField[];
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'contact',
    name: 'Contact Form',
    icon: 'MessageSquare',
    title: 'Contact Us',
    fields: [
      { id: 'f1', type: 'heading', label: 'Section Title', content: 'Get in Touch', textAlign: 'center', isBold: true },
      { id: 'f2', type: 'paragraph', label: 'Paragraph', content: 'Fill out the form below and our team will get back to you within 24 hours.', textAlign: 'center' },
      { id: 'f3', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
      { id: 'f4', type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email address' },
      { id: 'f5', type: 'dropdown', label: 'How can we help?', required: true, placeholder: 'Select a topic', options: ['Sales Inquiry', 'Technical Support', 'Billing Question', 'Other'] },
      { id: 'f6', type: 'textarea', label: 'Message', required: true, placeholder: 'Type your message here...' }
    ]
  },
  {
    id: 'job',
    name: 'Job Application',
    icon: 'Briefcase',
    title: 'Job Application',
    fields: [
      { id: 'f1', type: 'heading', label: 'Section Title', content: 'Join Our Team', textAlign: 'left', isBold: true },
      { id: 'f2', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
      { id: 'f3', type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email address' },
      { id: 'f4', type: 'phone', label: 'Phone Number', required: true },
      { id: 'f5', type: 'dropdown', label: 'Position Applied For', required: true, options: ['Frontend Developer', 'Backend Developer', 'Product Manager', 'Designer'] },
      { id: 'f6', type: 'file_upload', label: 'Resume / CV', required: true },
      { id: 'f7', type: 'website', label: 'Portfolio URL (Optional)', required: false, placeholder: 'Enter URL (e.g., https://...)' },
      { id: 'f8', type: 'textarea', label: 'Cover Letter', required: true, placeholder: 'Write your cover letter here...' }
    ]
  },
  {
    id: 'feedback',
    name: 'Customer Feedback',
    icon: 'Star',
    title: 'Customer Feedback',
    fields: [
      { id: 'f1', type: 'heading', label: 'Section Title', content: 'How did we do?', textAlign: 'center', isBold: true },
      { id: 'f2', type: 'rating', label: 'Rate your overall experience', required: true },
      { id: 'f3', type: 'radio', label: 'Would you recommend us?', required: true, options: ['Yes, definitely', 'Maybe', 'No'] },
      { id: 'f4', type: 'textarea', label: 'What could we improve?', required: false, placeholder: 'Your honest feedback...' },
      { id: 'f5', type: 'single_checkbox', label: 'Permission', placeholder: 'May we contact you about your feedback?', required: false },
      { id: 'f6', type: 'email', label: 'Email Address (Optional)', required: false, placeholder: 'For follow-up...' }
    ]
  }
];

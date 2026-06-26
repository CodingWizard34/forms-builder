import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type FieldType = 
  | 'text' | 'email' | 'number' | 'phone' | 'textarea' 
  | 'dropdown' | 'radio' | 'checkbox' | 'single_checkbox' | 'date' 
  | 'rating' | 'divider' | 'page_break' | 'file_upload' 
  | 'time' | 'website' | 'address' | 'heading' | 'paragraph' | 'country';

export type LogicOperator = 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';

export interface WorkflowCondition {
  id: string;
  type: 'condition';
  sourceFieldId: string;
  operator: LogicOperator;
  value: string;
}

export interface WorkflowGroup {
  id: string;
  type: 'group';
  match: 'any' | 'all';
  conditions: (WorkflowCondition | WorkflowGroup)[];
}

export interface FormWorkflow {
  id: string;
  action: 'show' | 'hide';
  targetFieldIds: string[];
  rootGroup: WorkflowGroup;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  content?: string;
  textAlign?: 'left' | 'center' | 'right';
  isBold?: boolean;
}

export type ViewMode = 'builder' | 'logic';

export interface BuilderState {
  fields: FormField[];
  selectedFieldId: string | null;
  title: string;
  workflows: FormWorkflow[];
  viewMode: ViewMode;
  theme: string;
  is_published: boolean;
  cover_image?: string;
  logo?: string;
  max_responses?: number;
  expires_at?: string;
}

const initialState: BuilderState = {
  fields: [],
  selectedFieldId: null,
  title: 'Untitled Form',
  workflows: [],
  viewMode: 'builder',
  theme: 'theme-blue',
  is_published: false,
  cover_image: undefined,
  logo: undefined,
  max_responses: undefined,
  expires_at: undefined,
};

export const builderSlice = createSlice({
  name: 'builder',
  initialState,
  reducers: {
    setIsPublished: (state, action: PayloadAction<boolean>) => {
      state.is_published = action.payload;
    },
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
    updateTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },
    addField: (state, action: PayloadAction<FormField>) => {
      state.fields.push(action.payload);
      state.selectedFieldId = action.payload.id;
    },
    updateField: (state, action: PayloadAction<FormField>) => {
      const index = state.fields.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.fields[index] = action.payload;
      }
    },
    removeField: (state, action: PayloadAction<string>) => {
      state.fields = state.fields.filter(f => f.id !== action.payload);
      if (state.selectedFieldId === action.payload) {
        state.selectedFieldId = null;
      }
      // Also clean up references in workflows
      state.workflows.forEach(w => {
        w.targetFieldIds = w.targetFieldIds.filter(id => id !== action.payload);
      });
    },
    reorderFields: (state, action: PayloadAction<{ dragIndex: number; hoverIndex: number }>) => {
      const { dragIndex, hoverIndex } = action.payload;
      const draggedField = state.fields[dragIndex];
      state.fields.splice(dragIndex, 1);
      state.fields.splice(hoverIndex, 0, draggedField);
    },
    selectField: (state, action: PayloadAction<string | null>) => {
      state.selectedFieldId = action.payload;
    },
    addWorkflow: (state, action: PayloadAction<FormWorkflow>) => {
      state.workflows.push(action.payload);
    },
    updateWorkflow: (state, action: PayloadAction<FormWorkflow>) => {
      const index = state.workflows.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.workflows[index] = action.payload;
      }
    },
    removeWorkflow: (state, action: PayloadAction<string>) => {
      state.workflows = state.workflows.filter(w => w.id !== action.payload);
    },
    loadForm: (state, action: PayloadAction<{ title: string; fields: FormField[]; workflows: FormWorkflow[]; theme?: string; is_published?: boolean; cover_image?: string; logo?: string; max_responses?: number; expires_at?: string; }>) => {
      state.title = action.payload.title;
      state.fields = action.payload.fields;
      state.workflows = action.payload.workflows;
      if (action.payload.theme) {
        state.theme = action.payload.theme;
      }
      state.is_published = action.payload.is_published || false;
      state.cover_image = action.payload.cover_image;
      state.logo = action.payload.logo;
      state.max_responses = action.payload.max_responses;
      state.expires_at = action.payload.expires_at;
      state.selectedFieldId = null;
      state.viewMode = 'builder';
    },
    updateSettings: (state, action: PayloadAction<{ cover_image?: string; logo?: string; max_responses?: number; expires_at?: string; }>) => {
      if (action.payload.cover_image !== undefined) state.cover_image = action.payload.cover_image;
      if (action.payload.logo !== undefined) state.logo = action.payload.logo;
      if (action.payload.max_responses !== undefined) state.max_responses = action.payload.max_responses;
      if (action.payload.expires_at !== undefined) state.expires_at = action.payload.expires_at;
    }
  },
});

export const { 
  setIsPublished, setViewMode, updateTitle, setTheme, addField, updateField, removeField, 
  reorderFields, selectField, addWorkflow, updateWorkflow, removeWorkflow, loadForm, updateSettings
} = builderSlice.actions;
export default builderSlice.reducer;

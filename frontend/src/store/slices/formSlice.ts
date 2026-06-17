import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Form {
  id: string;
  title: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
  responses: number;
}

interface FormState {
  forms: Form[];
  activeForm: Form | null;
  loading: boolean;
  error: string | null;
}

const initialState: FormState = {
  forms: [],
  activeForm: null,
  loading: false,
  error: null,
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setForms: (state, action: PayloadAction<Form[]>) => {
      state.forms = action.payload;
    },
    setActiveForm: (state, action: PayloadAction<Form>) => {
      state.activeForm = action.payload;
    },
    addForm: (state, action: PayloadAction<Form>) => {
      state.forms.push(action.payload);
    },
  },
});

export const { setForms, setActiveForm, addForm } = formSlice.actions;
export default formSlice.reducer;

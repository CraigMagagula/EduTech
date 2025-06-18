
import { MaterialType } from './types';

export const APP_TITLE = "AI Educational Content Generator";
export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17";

export const MATERIAL_TYPE_OPTIONS = [
  { value: MaterialType.LESSON_PLAN, label: "Lesson Plan" },
  { value: MaterialType.STUDY_GUIDE, label: "Study Guide" },
  { value: MaterialType.QUIZ, label: "Quiz" },
  { value: MaterialType.FIND_RESOURCES, label: "Find Example Resources" },
];

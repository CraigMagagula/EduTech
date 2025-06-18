
export enum MaterialType {
  LESSON_PLAN = "Lesson Plan",
  STUDY_GUIDE = "Study Guide",
  QUIZ = "Quiz",
  FIND_RESOURCES = "Find Example Resources",
}

export interface EducationalMaterialRequest {
  materialType: MaterialType;
  topic: string;
  audience: string;
  objectives: string; // For FIND_RESOURCES, this will store "Specific Areas of Interest / Keywords"
  additionalDetails?: string;
}

export interface GroundingSource {
  uri: string;
  title?: string; // Title might not always be present
}

export interface GenerationResult {
  text: string;
  sources?: GroundingSource[];
}

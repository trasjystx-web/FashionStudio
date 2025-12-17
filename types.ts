export enum WorkflowStep {
  POSE_SELECTION = 1,
  CLOTHING_EDIT = 2,
  FINAL_GENERATION = 3,
  RESULT = 4
}

export enum CameraAngle {
  EYE_LEVEL = "Eye Level",
  LOW_ANGLE = "Low Angle (Heroic)",
  HIGH_ANGLE = "High Angle",
  DUTCH_ANGLE = "Dutch Angle (Dynamic)",
  PROFILE = "Side Profile"
}

export enum ImageResolution {
  RES_1K = "1K",
  RES_2K = "2K",
  RES_4K = "4K"
}

export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT = "3:4",
  LANDSCAPE = "4:3",
  MOBILE = "9:16",
  CINEMATIC = "16:9"
}

export interface Pose {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
}

export interface GeneratedImage {
  data: string; // Base64
  mimeType: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum PersonaId {
  LAWYER = 'lawyer',
  INTERVIEWER = 'interviewer',
  PSYCHOLOGIST = 'psychologist',
  SPIRITUAL = 'spiritual',
  REAL_ESTATE = 'real_estate',
  TEACHER = 'teacher',
  HANDYMAN = 'handyman',
  DATING_COACH = 'dating_coach',
  CHEF = 'chef',
  FITNESS = 'fitness',
  TRAVEL = 'travel',
  CUSTOM = 'custom',
}

export interface Persona {
  id: PersonaId;
  title: string;
  description: string;
  icon: string;
  color: string;
  systemInstruction: string;
  requiresFile?: boolean;
  fileLabel?: string;
  requiresCamera?: boolean;
  textInputLabel?: string;
  allowCustomPrompt?: boolean;
}

export interface AudioVolumeState {
  input: number;
  output: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  searchEntryPoint?: {
    renderedContent?: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 data url for display
  timestamp: number;
  isFinal?: boolean;
  groundingMetadata?: GroundingMetadata;
}

export interface SessionLog {
  id: string;
  personaId: PersonaId;
  startTime: number;
  endTime: number;
  messages: ChatMessage[];
}


export enum PersonaId {
  LAWYER = 'lawyer',
  INTERVIEWER = 'interviewer',
  PSYCHOLOGIST = 'psychologist',
  SPIRITUAL = 'spiritual',
  REAL_ESTATE = 'real_estate',
  TEACHER = 'teacher',
  HANDYMAN = 'handyman',
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
}

export interface AudioVolumeState {
  input: number;
  output: number;
}
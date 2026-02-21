// Global TypeScript declarations for the Web Speech API.
// All interfaces are declared in the global ambient scope (no export/import),
// which makes them available as global types throughout the project.

declare interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

declare interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

declare interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

declare interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

declare interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

declare interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

// Augment the Window interface so window.SpeechRecognition / window.webkitSpeechRecognition work
interface Window {
  SpeechRecognition: SpeechRecognitionConstructor;
  webkitSpeechRecognition: SpeechRecognitionConstructor;
}

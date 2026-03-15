"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInterface, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInterface, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInterface;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface VoiceCommandResult {
  action: string;
  params?: Record<string, string>;
  response: string;
}

interface UseVoiceCommandReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  lastResult: VoiceCommandResult | null;
}

// Voice command patterns and their actions
const COMMAND_PATTERNS: Array<{
  patterns: RegExp[];
  action: string;
  getParams?: (match: RegExpMatchArray) => Record<string, string>;
  response: string;
}> = [
  // Navigation commands
  {
    patterns: [
      /(?:go to|open|show|navigate to)\s*(?:the\s*)?home(?:\s*page)?/i,
      /(?:take me|bring me)\s*(?:to\s*)?home/i,
    ],
    action: "navigate:/",
    response: "Taking you to the home page",
  },
  {
    patterns: [
      /(?:find|show|search|look for)\s*(?:me\s*)?(?:a\s*)?(?:hospital|hospitals|facility|facilities|clinic|clinics)/i,
      /(?:go to|open)\s*facilities/i,
    ],
    action: "navigate:/facilities",
    response: "Opening healthcare facilities",
  },
  {
    patterns: [
      /(?:i need|call|get)\s*(?:an?\s*)?(?:ambulance|emergency|help)/i,
      /emergency/i,
      /(?:go to|open)\s*emergency/i,
    ],
    action: "navigate:/emergency",
    response: "Opening emergency services. Stay calm, help is available.",
  },
  {
    patterns: [
      /(?:find|show|search|look for)\s*(?:me\s*)?(?:an?\s*)?ambulance/i,
      /ambulance\s*(?:near me|nearby)?/i,
    ],
    action: "navigate:/ambulance",
    response: "Finding ambulances near you",
  },
  {
    patterns: [
      /(?:check|analyze)\s*(?:my\s*)?symptoms?/i,
      /(?:i feel|i am feeling|i have)\s*(?:sick|unwell|ill)/i,
      /symptom\s*checker/i,
    ],
    action: "navigate:/dashboard/symptom-checker",
    response: "Opening the symptom checker",
  },
  {
    patterns: [
      /(?:show|view|check)\s*(?:my\s*)?(?:health\s*)?alerts?/i,
      /(?:any\s*)?(?:health\s*)?alerts?\s*(?:for me)?/i,
    ],
    action: "navigate:/alerts",
    response: "Showing health alerts",
  },
  {
    patterns: [
      /(?:go to|open|show)\s*(?:my\s*)?(?:profile|account|settings)/i,
    ],
    action: "navigate:/dashboard/profile",
    response: "Opening your profile",
  },
  {
    patterns: [
      /(?:go to|open|show)\s*(?:my\s*)?dashboard/i,
    ],
    action: "navigate:/dashboard",
    response: "Opening your dashboard",
  },
  // Search commands
  {
    patterns: [
      /(?:find|search|look for)\s*(?:hospitals?|facilities?|clinics?)\s*(?:in|near|at)\s+(.+)/i,
    ],
    action: "search:facilities",
    getParams: (match) => ({ query: match[1] }),
    response: "Searching for facilities",
  },
  {
    patterns: [
      /(?:find|search|look for)\s+(.+)\s*(?:hospital|facility|clinic)/i,
    ],
    action: "search:facilities",
    getParams: (match) => ({ query: match[1] }),
    response: "Searching for facilities",
  },
  // Information commands
  {
    patterns: [
      /(?:what is|tell me about|explain)\s*(?:nhis|national health insurance)/i,
    ],
    action: "info:nhis",
    response: "NHIS is Ghana's National Health Insurance Scheme that provides affordable healthcare to citizens.",
  },
  {
    patterns: [
      /(?:what are|tell me about)\s*(?:the\s*)?(?:common\s*)?diseases?\s*(?:in|around)\s*(?:my area|here|ghana)?/i,
    ],
    action: "info:diseases",
    response: "Common diseases in Ghana include Malaria, Cholera, and Typhoid. Check health alerts for your specific area.",
  },
  // Emergency numbers
  {
    patterns: [
      /(?:what is|what's)\s*(?:the\s*)?emergency\s*(?:number|phone|hotline)/i,
      /emergency\s*(?:number|phone|hotline)/i,
    ],
    action: "info:emergency",
    response: "The national emergency number is 112. For ambulance services, call 193.",
  },
  // Help command
  {
    patterns: [
      /(?:help|what can you do|commands|voice commands)/i,
    ],
    action: "help",
    response: "You can say: Find hospitals, Emergency help, Check symptoms, Show alerts, Find ambulance, or navigate to any page.",
  },
];

export function useVoiceCommand(): UseVoiceCommandReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<VoiceCommandResult | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  const router = useRouter();

  // Check for browser support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-GH"; // English (Ghana)
        
        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
          setTranscript("");
        };

        recognition.onresult = (event) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const transcriptText = result[0].transcript;
          setTranscript(transcriptText);

          if (result.isFinal) {
            processCommand(transcriptText);
          }
        };

        recognition.onerror = (event) => {
          setError(event.error === "no-speech" ? "No speech detected" : `Error: ${event.error}`);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const processCommand = useCallback((text: string) => {
    const normalizedText = text.toLowerCase().trim();
    
    for (const command of COMMAND_PATTERNS) {
      for (const pattern of command.patterns) {
        const match = normalizedText.match(pattern);
        if (match) {
          const params = command.getParams ? command.getParams(match) : undefined;
          const result: VoiceCommandResult = {
            action: command.action,
            params,
            response: command.response,
          };
          
          setLastResult(result);
          executeCommand(result);
          speak(command.response);
          return;
        }
      }
    }

    // No command matched
    const fallbackResponse = "I didn't understand that. Try saying 'help' for available commands.";
    setLastResult({
      action: "unknown",
      response: fallbackResponse,
    });
    speak(fallbackResponse);
  }, []);

  const executeCommand = useCallback((result: VoiceCommandResult) => {
    const { action, params } = result;

    if (action.startsWith("navigate:")) {
      const path = action.replace("navigate:", "");
      router.push(path);
    } else if (action.startsWith("search:")) {
      const type = action.replace("search:", "");
      if (type === "facilities" && params?.query) {
        router.push(`/facilities?query=${encodeURIComponent(params.query)}`);
      }
    }
    // Info commands just speak the response, no navigation needed
  }, [router]);

  const speak = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-GH";
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting recognition:", err);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    lastResult,
  };
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

const VOICE_REPLIES_KEY = "aura_voice_replies";
const RECOGNITION_LANG = "en-US";

export interface UseVoiceOptions {
  // Called with the latest (possibly partial) transcript while listening, so
  // the UI can stream words into the input box.
  onPartialTranscript?: (text: string) => void;
  // Called once with the final transcript when the user stops talking.
  onFinalTranscript?: (text: string) => void;
}

export interface UseVoice {
  isListening: boolean;
  isSpeaking: boolean;
  voiceRepliesOn: boolean;
  interimText: string;
  supportsSTT: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  toggleVoiceReplies: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
}

// Whether speech-to-text is available on this platform. On web we look for the
// browser Web Speech API (absent in Firefox); on native the module is present
// in a dev/EAS build (not in Expo Go).
function detectSttSupport(): boolean {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return false;
    const w = window as unknown as {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
  }
  return true;
}

// Strip markdown, emoji and the leading warning glyph so the text-to-speech
// voice reads clean sentences instead of "asterisk asterisk".
function cleanForSpeech(text: string): string {
  return text
    .replace(/[*_`#>~]/g, "")
    .replace(/\u26A0\uFE0F?/g, "")
    .replace(
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu,
      "",
    )
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function useVoice(options: UseVoiceOptions = {}): UseVoice {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceRepliesOn, setVoiceRepliesOn] = useState(false);
  const [interimText, setInterimText] = useState("");

  // Keep the latest callbacks in refs so the speech event subscriptions below
  // never read stale closures.
  const onPartialRef = useRef(options.onPartialTranscript);
  const onFinalRef = useRef(options.onFinalTranscript);
  onPartialRef.current = options.onPartialTranscript;
  onFinalRef.current = options.onFinalTranscript;

  const supportsSTT = detectSttSupport();

  useEffect(() => {
    AsyncStorage.getItem(VOICE_REPLIES_KEY)
      .then((stored) => {
        if (stored === "1") setVoiceRepliesOn(true);
      })
      .catch(() => {});
  }, []);

  // ----- Speech-to-text events -----
  useSpeechRecognitionEvent("start", () => setIsListening(true));
  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    setInterimText("");
  });
  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript ?? "";
    if (!transcript) return;
    if (event.isFinal) {
      setInterimText("");
      onFinalRef.current?.(transcript);
    } else {
      setInterimText(transcript);
      onPartialRef.current?.(transcript);
    }
  });
  useSpeechRecognitionEvent("error", (event) => {
    // "no-speech" / "aborted" are benign user-driven outcomes; just reset.
    if (event.error && event.error !== "no-speech" && event.error !== "aborted") {
      console.warn(`Speech recognition error: ${event.error} ${event.message ?? ""}`);
    }
    setIsListening(false);
    setInterimText("");
  });

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback(async () => {
    if (!supportsSTT) return;
    // Never talk over the user.
    Speech.stop();
    setIsSpeaking(false);
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        console.warn("Microphone / speech permission was not granted.");
        return;
      }
      setInterimText("");
      ExpoSpeechRecognitionModule.start({
        lang: RECOGNITION_LANG,
        interimResults: true,
        continuous: false,
      });
    } catch (err) {
      // Most common cause on native is running in Expo Go (no native module).
      console.warn(
        "Could not start speech recognition. On a phone this needs a dev/EAS build.",
        err,
      );
      setIsListening(false);
    }
  }, [supportsSTT]);

  const stopListening = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // ignore – may already be stopped
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string) => {
    const clean = cleanForSpeech(text);
    if (!clean) return;
    Speech.stop();
    setIsSpeaking(true);
    Speech.speak(clean, {
      language: RECOGNITION_LANG,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, []);

  const toggleVoiceReplies = useCallback(() => {
    setVoiceRepliesOn((prev) => {
      const next = !prev;
      AsyncStorage.setItem(VOICE_REPLIES_KEY, next ? "1" : "0").catch(() => {});
      if (!next) {
        Speech.stop();
        setIsSpeaking(false);
      }
      return next;
    });
  }, []);

  // Stop any audio/listening when the screen using this hook unmounts.
  useEffect(() => {
    return () => {
      Speech.stop();
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    voiceRepliesOn,
    interimText,
    supportsSTT,
    startListening,
    stopListening,
    toggleVoiceReplies,
    speak,
    stopSpeaking,
  };
}

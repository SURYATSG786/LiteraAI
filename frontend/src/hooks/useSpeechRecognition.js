import { useState, useEffect, useRef, useCallback } from 'react';
import { getLangLocale } from '../audio';

export function useSpeechRecognition(lang = 'en') {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognitionClass =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getLangLocale(lang);

    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const res = event.results[i];
        if (res.isFinal) {
          finalStr += res[0].transcript;
        } else {
          interimStr += res[0].transcript;
        }
      }

      if (finalStr) {
        setTranscript((prev) => (prev ? `${prev} ${finalStr}` : finalStr));
      }
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setError(event.error);
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {
        /* noop */
      }
    };
  }, [lang]);

  const startListening = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);

    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.lang = getLangLocale(lang);
      recognitionRef.current.start();
    } catch (err) {
      // If already started or pending
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current?.start(), 100);
      } catch (e) {
        setError(err.message);
      }
    }
  }, [lang]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (err) {
      /* noop */
    }
    setListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    listening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}

export default useSpeechRecognition;

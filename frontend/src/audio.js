// Native Voice Assistant engine — ported 1:1 from LiteraAI's audio.ts
// Scoped to Surya's 6 supported languages: en, hi, ta, te, kn, ml
// Playback chain per chunk:
//   1) Google Translate TTS (direct, real native-accent speech)
//   2) Backend proxy /api/ai/tts (server-side Google TTS + Gemini TTS fallback)
//   3) Browser Web Speech Synthesis, but ONLY if a genuinely native voice
//      for the target language is installed (never lets an English voice
//      mispronounce non-English text)

const LANG_LOCALE = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
};

const LANG_NAMES = {
  en: 'english',
  hi: 'hindi',
  ta: 'tamil',
  te: 'telugu',
  kn: 'kannada',
  ml: 'malayalam',
};

export const getLangLocale = (lang) => LANG_LOCALE[lang] || 'en-IN';

// --- Global "is the voice guide currently speaking" state -----------------
// Lets UI (e.g. Red Bird's mouth) animate in sync with any voice playback,
// no matter which component triggered it.
const speakingListeners = new Set();
let isSpeakingGlobal = false;

const setSpeaking = (value) => {
  if (isSpeakingGlobal === value) return;
  isSpeakingGlobal = value;
  speakingListeners.forEach((cb) => {
    try { cb(value); } catch (e) { /* listener error, ignore */ }
  });
};

export const isSpeaking = () => isSpeakingGlobal;

export const subscribeSpeaking = (cb) => {
  speakingListeners.add(cb);
  return () => speakingListeners.delete(cb);
};

let currentAudioSource = null;
let currentAudioContext = null;
let currentHtml5Audio = null;
let pendingAudioObject = null;
let audioUnlocked = false;

// Global gesture listener to unlock audio on first click/touch anywhere
if (typeof window !== 'undefined') {
  const unlocker = () => {
    audioUnlocked = true;
    if (pendingAudioObject) {
      const audioToPlay = pendingAudioObject;
      pendingAudioObject = null;
      audioToPlay.play().catch(() => {});
    }
  };
  window.addEventListener('pointerdown', unlocker, { capture: true });
  window.addEventListener('click', unlocker, { capture: true });
  window.addEventListener('touchstart', unlocker, { capture: true });
}

export const stopSpeech = (force = false) => {
  if (force) {
    activeSpeakSessionId += 1;
    pendingAudioObject = null;
  }
  if (currentAudioSource) {
    try {
      currentAudioSource.stop();
    } catch (e) { /* already stopped */ }
    currentAudioSource = null;
  }
  if (currentHtml5Audio) {
    try {
      currentHtml5Audio.pause();
      currentHtml5Audio.currentTime = 0;
    } catch (e) { /* noop */ }
    currentHtml5Audio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  setSpeaking(false);
};

const isNativeVoice = (voice, lang) => {
  const vLang = voice.lang.toLowerCase();
  const lCode = lang.toLowerCase();

  if (vLang === lCode) return true;
  if (vLang.startsWith(`${lCode}-`) || vLang.startsWith(`${lCode}_`)) return true;

  const targetName = LANG_NAMES[lang];
  if (targetName) {
    const vName = voice.name.toLowerCase();
    if (vName.includes(targetName)) return true;
  }
  return false;
};

export const speakNativeWebSpeech = (text, lang) => new Promise((resolve) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    resolve(false);
    return;
  }

  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    /* ignore */
  }

  const runSynthesis = (voices) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLocale = getLangLocale(lang);
      utterance.lang = targetLocale;
      utterance.rate = 0.85;
      utterance.pitch = 1.0;

      let selectedVoice = voices.find((v) => (
        v.lang.toLowerCase() === targetLocale.toLowerCase()
        || v.lang.toLowerCase().replace('_', '-') === targetLocale.toLowerCase()
      ));

      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase()));
      }

      if (!selectedVoice) {
        const targetName = LANG_NAMES[lang];
        if (targetName) {
          selectedVoice = voices.find((v) => v.name.toLowerCase().includes(targetName));
        }
      }

      if (selectedVoice) {
        // Prevent using an English voice if the target language is not English
        if (lang !== 'en' && selectedVoice.lang.toLowerCase().startsWith('en')) {
          resolve(false);
          return;
        }
        utterance.voice = selectedVoice;
      } else if (lang !== 'en') {
        // If no native voice pack for this non-English language is installed in browser,
        // fallback to authentic native online TTS proxy (Google Translate native voice)
        resolve(false);
        return;
      }

      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        resolve(true);
      };

      utterance.onend = done;
      utterance.onerror = () => done();

      // Guard timeout in case browser SpeechSynthesis utterance fails to trigger onend
      const duration = Math.max(2000, text.length * 120);
      setTimeout(done, duration);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      resolve(false);
    }
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    setTimeout(() => runSynthesis(voices), 20);
  } else {
    let fired = false;
    const handleVoicesChanged = () => {
      if (fired) return;
      fired = true;
      try {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      } catch (e) {}
      runSynthesis(window.speechSynthesis.getVoices() || []);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    setTimeout(() => {
      if (fired) return;
      fired = true;
      try {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      } catch (e) {}
      runSynthesis(window.speechSynthesis.getVoices() || []);
    }, 200);
  }
});

export const AUTOMATIC_VOICE_LIMIT = 1;
let autoVoiceLimit = AUTOMATIC_VOICE_LIMIT;
let autoVoiceCount = 0;

export const getAutoVoiceLimit = () => autoVoiceLimit;

export const setAutoVoiceLimit = (limit) => {
  autoVoiceLimit = typeof limit === 'number' && limit >= 0 ? limit : 1;
};

export const getAutoVoiceCount = () => autoVoiceCount;

export const resetAutoVoiceCount = () => {
  autoVoiceCount = 0;
};

let activeSpeakSessionId = 0;

const splitTextIntoChunks = (text, maxLength = 150) => {
  if (text.length <= maxLength) return [text];

  const delimiters = /[।|.!?;:\n]/;
  const parts = text.split(delimiters);
  const chunks = [];
  let currentChunk = '';

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (currentChunk.length + trimmed.length + 1 <= maxLength) {
      currentChunk = currentChunk ? `${currentChunk} ${trimmed}` : trimmed;
    } else {
      if (currentChunk) chunks.push(currentChunk);

      if (trimmed.length > maxLength) {
        const subParts = trimmed.split(/[,，、\s]+/);
        let subChunk = '';
        for (const word of subParts) {
          const wTrim = word.trim();
          if (!wTrim) continue;
          if (subChunk.length + wTrim.length + 1 <= maxLength) {
            subChunk = subChunk ? `${subChunk} ${wTrim}` : wTrim;
          } else {
            if (subChunk) chunks.push(subChunk);
            subChunk = wTrim;
          }
        }
        if (subChunk) currentChunk = subChunk;
      } else {
        currentChunk = trimmed;
      }
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  return chunks;
};

/**
 * Speak `input` (string or array of strings) in `lang` using native speech synthesis pipeline.
 * Sequential items (e.g. [birdMessage, questionText]) are spoken one after another.
 * Automatically spoken requests respect the automatic voice limit (default: 1).
 */
export const speakText = (input, lang, forceNativeOnly = false, isAuto = false) => new Promise((resolveOuter) => {
  if (isAuto) {
    if (autoVoiceCount >= autoVoiceLimit) {
      resolveOuter();
      return;
    }
    autoVoiceCount += 1;
  }

  stopSpeech(true);

  const items = (Array.isArray(input) ? input : [input])
    .map((item) => String(item || '').trim())
    .filter((item) => item.length > 0);

  if (items.length === 0) {
    resolveOuter();
    return;
  }

  const targetLang = String(lang || 'en').split('-')[0].split('_')[0].toLowerCase();

  activeSpeakSessionId += 1;
  const sessionId = activeSpeakSessionId;
  setSpeaking(true);

  const resolve = () => {
    if (sessionId === activeSpeakSessionId) setSpeaking(false);
    resolveOuter();
  };

  const playItemIndex = (itemIdx) => {
    if (sessionId !== activeSpeakSessionId || itemIdx >= items.length) {
      resolve();
      return;
    }

    const text = items[itemIdx];

    speakNativeWebSpeech(text, targetLang).then((speechOk) => {
      if (sessionId !== activeSpeakSessionId) {
        resolve();
        return;
      }
      if (speechOk || forceNativeOnly) {
        playItemIndex(itemIdx + 1);
        return;
      }

      // Secondary path: Online Google Translate / Proxy fallbacks
      const chunks = splitTextIntoChunks(text, 150);

      const playChunkIndex = (index) => {
        if (sessionId !== activeSpeakSessionId) {
          resolve();
          return;
        }
        if (index >= chunks.length) {
          playItemIndex(itemIdx + 1);
          return;
        }

      const chunkText = chunks[index];
      let chunkHandled = false;

      const advanceToNext = () => {
        if (sessionId !== activeSpeakSessionId) {
          resolve();
          return;
        }
        if (chunkHandled) return;
        chunkHandled = true;
        playChunkIndex(index + 1);
      };

      const runBackendProxy = () => {
        if (sessionId !== activeSpeakSessionId || chunkHandled) return;

        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('literaai_token') : null;

        fetch('/api/ai/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ text: chunkText, language: targetLang }),
        })
          .then((res) => {
            if (sessionId !== activeSpeakSessionId) throw new Error('Cancelled');
            if (!res.ok) throw new Error('TTS endpoint failed');
            return res.json();
          })
          .then((data) => {
            if (sessionId !== activeSpeakSessionId || chunkHandled) return;
            if (!data.audio) throw new Error('No audio data returned');

            if (data.format === 'mp3') {
              const sAudioUrl = `data:audio/mp3;base64,${data.audio}`;
              const sAudio = new Audio(sAudioUrl);
              currentHtml5Audio = sAudio;
              pendingAudioObject = sAudio;

              let proxyMp3Failed = false;
              const handleProxyMp3Failure = () => {
                if (proxyMp3Failed) return;
                proxyMp3Failed = true;
                if (currentHtml5Audio === sAudio) currentHtml5Audio = null;
                if (pendingAudioObject === sAudio) pendingAudioObject = null;
                advanceToNext();
              };

              sAudio.onended = () => {
                if (proxyMp3Failed) return;
                if (currentHtml5Audio === sAudio) currentHtml5Audio = null;
                if (pendingAudioObject === sAudio) pendingAudioObject = null;
                advanceToNext();
              };
              sAudio.onerror = () => handleProxyMp3Failure();

              const startPlayback = () => {
                sAudio.play()
                  .then(() => {
                    pendingAudioObject = null;
                  })
                  .catch((playErr) => {
                    // Autoplay blocked by browser policy until user gesture
                    // Kept in pendingAudioObject so global gesture unlocker plays it on click!
                  });
              };

              startPlayback();
            } else {
              advanceToNext();
            }
          })
          .catch(() => advanceToNext());
      };

      runBackendProxy();
    };

    playChunkIndex(0);
  });
};

playItemIndex(0);
});

/** Simple word-overlap pronunciation grading, ported from LiteraAI. */
export const gradePronunciation = (original, spoken) => {
  const cleanString = (str) => str
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?।]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const origClean = cleanString(original);
  const spokenClean = cleanString(spoken);

  const origWords = origClean.split(' ').filter(Boolean);
  const spokenWords = spokenClean.split(' ').filter(Boolean);

  if (origWords.length === 0) return { score: 100, words: [] };

  const gradedWords = origWords.map((origW) => {
    const isCorrect = spokenWords.some((spokenW) => (
      spokenW === origW || spokenW.includes(origW) || origW.includes(spokenW)
    ));
    return { text: origW, correct: isCorrect };
  });

  const correctCount = gradedWords.filter((w) => w.correct).length;
  const score = Math.round((correctCount / origWords.length) * 100);

  return { score, words: gradedWords };
};

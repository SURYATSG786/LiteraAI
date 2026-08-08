import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Award,
} from 'lucide-react';
import { PageTitle, ProgressBar } from '../components/ui';
import { GuideBird } from '../components/RedBird';
import { PronunciationFeedback, PracticeSummaryCard } from '../components/VoicePracticeComponents';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { getVoicePracticeSentences } from '../data/voicePracticeSentences';
import { gradePronunciation, speakText, stopSpeech } from '../audio';

export default function VoicePracticePage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const sentences = getVoicePracticeSentences(currentLang);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({});
  const [gradedResult, setGradedResult] = useState(null);

  const {
    listening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition(currentLang);

  const currentSentence = sentences[index] || sentences[0];
  const combinedText = (transcript + (interimTranscript ? ` ${interimTranscript}` : '')).trim();

  useEffect(() => {
    setGradedResult(null);
    resetTranscript();
    stopSpeech();
    if (currentSentence) {
      speakText([t('birdGuideVoicePractice'), currentSentence], currentLang, false, true).catch(() => {});
    }
  }, [index, currentLang, resetTranscript, currentSentence, t]);

  useEffect(() => {
    if (!listening && transcript) {
      const res = gradePronunciation(currentSentence, transcript);
      setGradedResult(res);
      setResults((prev) => ({
        ...prev,
        [index]: res,
      }));

      if (res.score >= 70) {
        speakText(t('correctCheer', "Woohoo! That's correct!"), currentLang).catch(() => {});
      } else if (res.score > 0) {
        speakText(t('tryAgainVoice', 'Not quite, try again!'), currentLang).catch(() => {});
      }
    }
  }, [listening, transcript, currentSentence, currentLang, index, t]);

  const handleListenSample = () => {
    stopSpeech();
    speakText(currentSentence, currentLang).catch(() => {});
  };

  const toggleListen = () => {
    stopSpeech();
    if (listening) {
      stopListening();
    } else {
      setGradedResult(null);
      resetTranscript();
      startListening();
    }
  };

  const handleNext = () => {
    if (index < sentences.length - 1) {
      setIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      setIndex((i) => i - 1);
    }
  };

  const handleResetAll = () => {
    setIndex(0);
    setResults({});
    setGradedResult(null);
    resetTranscript();
  };

  const totalAttempted = Object.keys(results).length;
  const avgScore =
    totalAttempted > 0
      ? Math.round(
          Object.values(results).reduce((acc, r) => acc + (r.score || 0), 0) / totalAttempted
        )
      : 0;

  return (
    <div className="w-full space-y-2">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageTitle
            eyebrow={t('practice', 'Practice')}
            title={t('voicePractice', 'Voice Practice')}
            subtitle={t('voicePracticeSub', 'Master 5 complete native sentences through clear voice practice.')}
          />
        </div>
        <GuideBird
          key={`${index}-${currentLang}`}
          message={t('birdGuideVoicePractice', 'Listen carefully to the native sentence, then tap the mic and speak out loud!')}
          autoSpeak={false}
          size={48}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-12">
        {/* Left main practice card */}
        <div className="md:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentLang}-${index}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card relative rounded-2xl p-3 md:p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-white/55 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#06304f]/70">
                  {index + 1} / {sentences.length}
                </span>

                <button
                  type="button"
                  onClick={handleListenSample}
                  className="btn-ghost flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm"
                  aria-label={t('listenSample', 'Listen sample')}
                >
                  <Volume2 className="h-4 w-4 text-[var(--accent-2)]" />
                  <span>{t('listen', 'Listen Native Voice')}</span>
                </button>
              </div>

              <div className="my-2 rounded-xl bg-[#0b6fb8]/8 p-3 text-center border border-[#06304f]/12">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#06304f]/55 mb-0.5">
                  {t('targetPhrase', 'Say this sentence out loud:')}
                </p>
                <h2 className="display text-lg font-black text-[#06304f] md:text-xl leading-snug">
                  "{currentSentence}"
                </h2>
              </div>

              {!isSupported ? (
                <div className="rounded-2xl bg-amber-500/15 p-2.5 text-center text-xs font-extrabold text-amber-800">
                  {t('micNotSupported', 'Browser speech recognition is not supported in this browser. Please use Chrome or Edge.')}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-1">
                  <motion.button
                    type="button"
                    onClick={toggleListen}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition ${
                      listening
                        ? 'bg-rose-600 shadow-rose-600/50'
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/40'
                    }`}
                    aria-label={listening ? t('stopListening', 'Stop listening') : t('startSpeaking', 'Start speaking')}
                  >
                    {listening ? (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      >
                        <MicOff className="h-6 w-6" />
                      </motion.div>
                    ) : (
                      <Mic className="h-6 w-6" />
                    )}
                  </motion.button>

                  <p className="text-xs font-bold text-[#06304f]/80">
                    {listening
                      ? t('listeningNow', 'Listening... Speak clearly in your native voice')
                      : t('tapMicToSpeak', 'Tap microphone to practice speaking')}
                  </p>

                  {combinedText ? (
                    <div className="w-full rounded-xl bg-[#0b6fb8]/8 p-2.5 text-center border border-[#06304f]/12">
                      <span className="text-xs font-semibold text-[#06304f]/60">{t('spokenText', 'You said:')} </span>
                      <p className="mt-0.5 text-sm font-extrabold text-[#06304f]">"{combinedText}"</p>
                    </div>
                  ) : null}

                  {error ? (
                    <div className="rounded-xl bg-rose-500/12 px-3 py-1.5 text-xs font-bold text-rose-800">
                      {error === 'not-allowed'
                        ? t('micDenied', 'Microphone access was denied. Please allow microphone permissions.')
                        : error}
                    </div>
                  ) : null}

                  {gradedResult ? (
                    <PronunciationFeedback
                      gradedResult={gradedResult}
                      labels={{
                        pronunciationScore: t('pronunciationScore', 'Pronunciation Accuracy'),
                      }}
                    />
                  ) : null}
                </div>
              )}

              {/* Prev / Next Sentence Controls */}
              <div className="mt-4 flex items-center justify-between border-t border-[#06304f]/12 pt-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={index === 0}
                  className="btn-ghost flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                  <span>{t('back', 'Back')}</span>
                </button>

                <div className="flex gap-1.5">
                  {sentences.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIndex(i)}
                      className={`h-2.5 rounded-full transition-all ${
                        i === index
                          ? 'w-7 bg-[var(--accent-2)]'
                          : results[i]
                          ? 'w-2.5 bg-emerald-400'
                          : 'w-2.5 bg-[#06304f]/25'
                      }`}
                      aria-label={`Go to sentence ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={index >= sentences.length - 1}
                  className="btn-primary flex items-center gap-1.5 px-5 py-2 text-sm disabled:opacity-40"
                >
                  <span>{t('continue', 'Next')}</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right summary card */}
        <div className="md:col-span-4 space-y-3">
          <PracticeSummaryCard
            sentences={sentences}
            results={results}
            index={index}
            setIndex={setIndex}
            totalAttempted={totalAttempted}
            avgScore={avgScore}
            handleResetAll={handleResetAll}
            labels={{
              practiceSummary: t('practiceSummary', 'Practice Results'),
              overallScore: t('overallScore', 'Overall Score'),
              completed: t('completed', 'Done'),
              tryAgain: t('tryAgain', 'Reset Practice'),
            }}
          />
        </div>
      </div>
    </div>
  );
}

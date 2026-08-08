import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  PenTool,
  RotateCcw,
  CheckCircle2,
  SkipForward,
  Eye,
  Trophy,
  Sparkles,
  ArrowRight,
  Gem,
  Star,
  Award,
  BookOpen,
  Volume2,
  RefreshCw,
  Check,
  AlertCircle,
  Bug,
  Terminal,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Code
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { PageTitle, ProgressBar } from '../components/ui';
import { GuideBird } from '../components/RedBird';
import { speakText } from '../audio';
import {
  WRITING_SETS,
  TESSERACT_LANG_MAP,
  checkIsDevMode,
  normalizeText,
  cleanScriptText,
  getGraphemes,
  levenshteinDistance,
  preprocessCanvasForOCR,
  evaluateHandwriting
} from '../utils/handwritingEvaluator';

export { WRITING_SETS, TESSERACT_LANG_MAP, checkIsDevMode, normalizeText, getGraphemes, levenshteinDistance, preprocessCanvasForOCR, evaluateHandwriting };

export default function WritingPracticePage() {
  const { t, i18n } = useTranslation();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const activeLang = user?.preferred_language || i18n.language || 'en';
  const safeLang = WRITING_SETS[activeLang] ? activeLang : 'en';
  const writingSet = WRITING_SETS[safeLang];

  // Screen states: 'welcome' | 'challenge' | 'completed'
  const [screen, setScreen] = useState('welcome');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Canvas drawing state
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Verification & feedback states
  const [verifying, setVerifying] = useState(false);
  const [feedback, setFeedback] = useState(null); // { status: 'correct' | 'incorrect', message: '' }
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [totalGemsEarned, setTotalGemsEarned] = useState(0);

  // Debug system state & Dev Mode flag
  const isDevMode = checkIsDevMode();
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebugConsole, setShowDebugConsole] = useState(false);
  const [copiedLogId, setCopiedLogId] = useState(null);

  const currentChallenge = writingSet[currentIndex] || writingSet[0];

  // Canvas setup
  useEffect(() => {
    if (screen === 'challenge' && canvasRef.current) {
      resetCanvas();
    }
  }, [screen, currentIndex]);

  function resetCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw crisp white background for OCR
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines for handwriting guide
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    setHasDrawn(false);
    setFeedback(null);
    setShowGuide(false);
  }

  function getCoordinates(e) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function startDrawing(e) {
    e.preventDefault();
    if (feedback?.status === 'correct') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#1e1b4b'; // Deep purple/black stroke
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
    setHasDrawn(true);
  }

  function draw(e) {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing(e) {
    if (e) e.preventDefault();
    if (isDrawing) {
      setIsDrawing(false);
    }
  }

  // Perform OCR and Normalized text matching with Dev-Mode Debug Payload
  async function handleCheckWriting() {
    if (!canvasRef.current || !hasDrawn || verifying) return;
    setVerifying(true);
    setFeedback(null);

    const canvas = canvasRef.current;
    const { dataUrl, strokeMetrics } = preprocessCanvasForOCR(canvas);

    try {
      const langCode = TESSERACT_LANG_MAP[safeLang] || 'eng';
      let recognizedText = '';
      let engOCRText = '';

      // Run Native OCR
      try {
        const worker = await createWorker(langCode);
        const ret = await worker.recognize(dataUrl);
        recognizedText = ret.data.text || '';
        await worker.terminate();
      } catch (ocrErr) {
        console.warn('Native Tesseract OCR worker fallback:', ocrErr);
      }

      // Run English OCR for stroke/latin fallback if needed
      if (safeLang !== 'en' || !recognizedText) {
        try {
          const engWorker = await createWorker('eng');
          const retEng = await engWorker.recognize(dataUrl);
          engOCRText = retEng.data.text || '';
          await engWorker.terminate();
        } catch (_) {}
      }

      const isSingleLetter = currentIndex === 0 || currentChallenge.target.length === 1;

      const evalResult = evaluateHandwriting({
        recognizedText,
        engOCRText,
        targetWord: currentChallenge.target,
        safeLang,
        strokeMetrics,
        isSingleLetter
      });

      // Construct Debug Log Payload
      const debugPayload = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        challengeId: currentChallenge.id,
        target: currentChallenge.target,
        language: safeLang,
        isSingleLetter,
        strokeMetrics: {
          width: strokeMetrics.width,
          height: strokeMetrics.height,
          aspectRatio: strokeMetrics.aspectRatio ? Number(strokeMetrics.aspectRatio.toFixed(2)) : 0,
          drawnPixels: strokeMetrics.drawnPixels,
          horizontalSpan: strokeMetrics.horizontalSpan ? Number(strokeMetrics.horizontalSpan.toFixed(2)) : 0,
        },
        targetMetrics: {
          normalized: normalizeText(currentChallenge.target),
          cleaned: cleanScriptText(currentChallenge.target),
          graphemes: getGraphemes(cleanScriptText(currentChallenge.target) || normalizeText(currentChallenge.target)),
        },
        ocrOutputs: {
          nativeLangCode: langCode,
          nativeRawText: recognizedText,
          nativeCleanText: cleanScriptText(recognizedText),
          engRawText: engOCRText,
          engCleanText: cleanScriptText(engOCRText),
        },
        evaluation: evalResult,
      };

      // 1. Console Group Logging (Always logged to browser console for developer investigation)
      console.group(`🔍 [OCR DEBUG PIPELINE] Check Answer for "${currentChallenge.target}" (${safeLang.toUpperCase()})`);
      console.log('🎯 Target Info:', debugPayload.targetMetrics);
      console.log('✏️ Stroke Metrics:', debugPayload.strokeMetrics);
      console.log('🤖 OCR Native Output:', { lang: langCode, raw: recognizedText, clean: debugPayload.ocrOutputs.nativeCleanText });
      console.log('🤖 OCR Eng Fallback:', { raw: engOCRText, clean: debugPayload.ocrOutputs.engCleanText });
      console.log('📊 Evaluated Candidates:', evalResult.candidates);
      console.log('🏆 Match Verdict:', evalResult.isMatch ? '✅ PASSED' : '❌ FAILED');
      console.log('💬 Reason:', evalResult.reason);
      console.groupEnd();

      // 2. UI State Debug Logging (Only captured for UI inspector if Dev Mode is active)
      if (isDevMode) {
        setDebugLogs(prev => [debugPayload, ...prev]);
      }

      if (evalResult.isMatch) {
        setFeedback({
          status: 'correct',
          message: t('writingSuccessMsg') || 'Excellent! You wrote the word correctly.',
        });
        const nextXp = totalXpEarned + 10;
        const nextGems = totalGemsEarned + 1;
        setTotalXpEarned(nextXp);
        setTotalGemsEarned(nextGems);

        // Update user XP & Gems
        try {
          const updatedUser = await api.updateMe({
            xp: (user?.xp || 0) + 10,
            gems: (user?.gems || 0) + 1,
          });
          refreshUser(updatedUser.user);
        } catch (_) {}

        confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
      } else {
        setFeedback({
          status: 'incorrect',
          message: t('writingRetryMsg') || 'Almost there! Take another look and try again.',
        });
      }
    } catch (err) {
      console.error('Check writing error:', err);
      setFeedback({
        status: 'incorrect',
        message: t('writingRetryMsg') || 'Almost there! Take another look and try again.',
      });
    } finally {
      setVerifying(false);
    }
  }

  function handleSkip() {
    handleNextWord();
  }

  function handleNextWord() {
    if (currentIndex + 1 < writingSet.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishSession();
    }
  }

  async function finishSession() {
    setScreen('completed');
    const finalBonusXp = 50;
    const finalBonusGems = 5;

    try {
      const updatedUser = await api.updateMe({
        xp: (user?.xp || 0) + finalBonusXp,
        gems: (user?.gems || 0) + finalBonusGems,
      });
      refreshUser(updatedUser.user);
    } catch (_) {}

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
  }

  function playPronunciation() {
    speakText(currentChallenge.target, safeLang);
  }

  function copyLog(log) {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedLogId(log.id);
    setTimeout(() => setCopiedLogId(null), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <PageTitle title={t('writingPractice') || 'Writing Practice'} />
          <p className="text-xs sm:text-sm font-semibold text-[#06304f]/70">
            {t('writingPracticeSub') ||
              'Practice writing important everyday words using handwriting. Complete all five writing challenges to earn XP, Gems, and improve your writing skills.'}
          </p>
        </div>
        <div className="shrink-0">
          <GuideBird
            message={
              screen === 'welcome'
                ? t('birdGuideWriting') || 'Practice writing words step by step!'
                : screen === 'challenge'
                ? `Write "${currentChallenge.target}" on the canvas!`
                : 'Awesome handwriting progress! 🏆'
            }
            mood={screen === 'completed' ? 'cheer' : 'happy'}
            size={52}
          />
        </div>
      </div>

      {/* 1. WELCOME SCREEN */}
      {screen === 'welcome' && (
        <motion.div
          className="glass-card rounded-3xl p-6 sm:p-10 text-center shadow-xl border border-white/60 space-y-6 bg-gradient-to-br from-white/80 via-purple-50/50 to-blue-50/40"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-purple-600/15 text-purple-700 shadow-inner">
            <PenTool size={48} className="text-purple-700" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="display text-2xl sm:text-3xl font-extrabold text-[#06304f]">
              {t('writingPractice') || 'Writing Practice'}
            </h2>
            <p className="text-sm sm:text-base font-medium text-[#06304f]/80 leading-relaxed">
              {t('writingPracticeSub') ||
                'Practice writing important everyday words using handwriting. Complete all five writing challenges to earn XP, Gems, and improve your writing skills.'}
            </p>
          </div>

          {/* Languages overview chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs font-bold text-[#06304f]/60 uppercase tracking-wider">
              Selected Language:
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/10 text-purple-800 font-extrabold text-xs border border-purple-300/40">
              ✨ {safeLang.toUpperCase()} ({writingSet[0]?.target} → {writingSet[writingSet.length - 1]?.target})
            </span>
          </div>

          {/* Session rewards highlight */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto py-2">
            <div className="rounded-2xl bg-white/70 p-3 border border-white/80 flex flex-col items-center">
              <Star className="text-amber-500 mb-1" size={20} />
              <span className="text-xs font-black text-[#06304f]">+50 XP</span>
              <span className="text-[10px] font-bold text-[#06304f]/60">Session Bonus</span>
            </div>
            <div className="rounded-2xl bg-white/70 p-3 border border-white/80 flex flex-col items-center">
              <Gem className="text-blue-500 mb-1" size={20} />
              <span className="text-xs font-black text-[#06304f]">+5 Gems</span>
              <span className="text-[10px] font-bold text-[#06304f]/60">Gems Reward</span>
            </div>
            <div className="rounded-2xl bg-white/70 p-3 border border-white/80 flex flex-col items-center col-span-2 sm:col-span-1">
              <Award className="text-purple-600 mb-1" size={20} />
              <span className="text-xs font-black text-[#06304f]">Badge</span>
              <span className="text-[10px] font-bold text-[#06304f]/60">Writing Beginner</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base font-extrabold flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all"
              onClick={() => {
                setScreen('challenge');
                setCurrentIndex(0);
                setTotalXpEarned(0);
                setTotalGemsEarned(0);
              }}
            >
              <PenTool size={20} />
              <span>{t('startWriting') || 'Start Writing'}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. CHALLENGE SCREEN */}
      {screen === 'challenge' && (
        <motion.div
          className="glass-card rounded-3xl p-5 sm:p-7 shadow-xl border border-white/60 space-y-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentIndex}
        >
          {/* Progress Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#06304f]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-600/15 px-3 py-1 text-purple-800 uppercase tracking-wider font-extrabold">
                <Sparkles size={14} />
                {t('challengeOf', { current: currentIndex + 1, total: writingSet.length }) ||
                  `Challenge ${currentIndex + 1} of 5`}
              </span>
              <span className="text-purple-900 font-black">
                {Math.round(((currentIndex + 1) / writingSet.length) * 100)}%
              </span>
            </div>
            <ProgressBar value={currentIndex + 1} max={writingSet.length} />
          </div>

          {/* Instruction & Target Word Box */}
          <div className="rounded-2xl bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-blue-900/10 p-5 border border-purple-500/20 text-center space-y-3 relative overflow-hidden">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#06304f]/70">
              {t('writeWordBelow') || 'Write the word shown below'}
            </span>

            <div className="flex items-center justify-center gap-4 py-1">
              <span className="text-4xl sm:text-5xl" role="img" aria-label="word illustration">
                {currentChallenge.emoji}
              </span>
              <h3 className="display text-4xl sm:text-6xl font-black text-[#06304f] tracking-wide">
                {currentChallenge.target}
              </h3>
              <button
                type="button"
                className="p-2.5 rounded-full bg-purple-600/10 hover:bg-purple-600/20 text-purple-800 transition"
                onClick={playPronunciation}
                title="Listen word pronunciation"
              >
                <Volume2 size={22} />
              </button>
            </div>

            {currentChallenge.hint && (
              <p className="text-xs font-semibold text-[#06304f]/60">
                Hint: {currentChallenge.hint}
              </p>
            )}
          </div>

          {/* Handwriting Canvas Container */}
          <div className="space-y-3">
            <div className="relative rounded-3xl bg-white border-2 border-purple-300 shadow-inner overflow-hidden flex items-center justify-center touch-none">
              <canvas
                ref={canvasRef}
                width={600}
                height={260}
                className="w-full h-60 sm:h-64 cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />

              {/* Show Target Word overlay helper */}
              {showGuide && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
                  <span className="text-7xl sm:text-9xl font-black text-purple-900 select-none">
                    {currentChallenge.target}
                  </span>
                </div>
              )}

              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400/60 text-xs sm:text-sm font-bold">
                  ✍️ Draw "{currentChallenge.target}" here using your mouse or finger
                </div>
              )}
            </div>

            {/* Feedback Banners */}
            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-2xl p-4 flex items-center justify-between gap-3 border shadow-md ${
                    feedback.status === 'correct'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {feedback.status === 'correct' ? (
                      <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle size={24} className="text-amber-600 shrink-0" />
                    )}
                    <div>
                      <p className="font-extrabold text-sm sm:text-base">
                        {feedback.message}
                      </p>
                      {feedback.status === 'correct' && (
                        <p className="text-xs font-bold text-emerald-700">
                          +10 XP & +1 Gem awarded! 🎉
                        </p>
                      )}
                    </div>
                  </div>

                  {feedback.status === 'incorrect' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        className="btn-ghost py-1.5 px-3 text-xs font-extrabold flex items-center gap-1 text-amber-900"
                        onClick={resetCanvas}
                      >
                        <RefreshCw size={14} /> {t('tryAgain') || 'Try Again'}
                      </button>
                      <button
                        type="button"
                        className="rounded-xl bg-amber-200/60 hover:bg-amber-200 py-1.5 px-3 text-xs font-extrabold text-amber-900 transition flex items-center gap-1"
                        onClick={() => setShowGuide(!showGuide)}
                      >
                        <Eye size={14} /> {t('showTargetWord') || 'Show Target Word'}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Control Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-2xl border border-slate-300 bg-white/80 hover:bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 flex items-center gap-2 shadow-sm transition"
                  onClick={resetCanvas}
                  disabled={verifying}
                >
                  <RotateCcw size={16} />
                  <span>{t('clear') || 'Clear'}</span>
                </button>

                <button
                  type="button"
                  className="rounded-2xl border border-purple-200 bg-purple-50/80 hover:bg-purple-100 px-4 py-2.5 text-xs font-extrabold text-purple-900 flex items-center gap-2 transition"
                  onClick={() => setShowGuide(!showGuide)}
                  disabled={verifying}
                >
                  <Eye size={16} />
                  <span>{showGuide ? 'Hide Target' : t('showTargetWord') || 'Show Target Word'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {/* 🔒 DEV MODE ONLY: OCR Debug Button */}
                {isDevMode && (
                  <button
                    type="button"
                    className="btn-ghost py-2.5 px-4 text-xs font-extrabold text-[#06304f]/70 hover:text-[#06304f] flex items-center gap-1.5"
                    onClick={() => setShowDebugConsole(!showDebugConsole)}
                  >
                    <Bug size={16} className="text-purple-600" />
                    <span>OCR Debug ({debugLogs.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn-ghost py-2.5 px-4 text-xs font-extrabold text-slate-600 flex items-center gap-1.5"
                  onClick={handleSkip}
                  disabled={verifying}
                >
                  <SkipForward size={16} />
                  <span>{t('skip') || 'Skip'}</span>
                </button>

                {feedback?.status === 'correct' ? (
                  <button
                    type="button"
                    className="btn-primary py-2.5 px-6 text-sm font-extrabold flex items-center gap-2 shadow-lg scale-105"
                    onClick={handleNextWord}
                  >
                    <span>{t('nextWord') || 'Next Word'}</span>
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-primary py-2.5 px-6 text-sm font-extrabold flex items-center gap-2 shadow-lg disabled:opacity-50"
                    onClick={handleCheckWriting}
                    disabled={!hasDrawn || verifying}
                  >
                    {verifying ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        <span>{t('checkWriting') || 'Check Writing'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 🔒 DEV MODE ONLY: OCR DEBUG SYSTEM PANEL */}
          {isDevMode && showDebugConsole && (
            <div className="rounded-3xl bg-slate-900 text-slate-100 p-5 shadow-2xl border border-slate-800 space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Terminal size={18} className="text-purple-400" />
                  <span className="font-bold text-sm text-purple-300">
                    OCR Comparison Pipeline Debugger
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-400 font-bold text-[10px]">
                    DEV MODE • {safeLang.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {debugLogs.length > 0 && (
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
                      onClick={() => setDebugLogs([])}
                      title="Clear debug logs"
                    >
                      <Trash2 size={13} />
                      <span>Clear</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
                    onClick={() => setShowDebugConsole(false)}
                  >
                    <ChevronUp size={14} />
                    <span>Hide</span>
                  </button>
                </div>
              </div>

              {debugLogs.length === 0 ? (
                <div className="py-6 text-center text-slate-500 font-sans italic">
                  No OCR evaluation logs recorded yet. Click "Check Writing" to generate complete OCR pipeline inspection.
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {debugLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`rounded-2xl p-4 border space-y-3 ${
                        log.evaluation.isMatch
                          ? 'bg-emerald-950/40 border-emerald-800/60'
                          : 'bg-amber-950/40 border-amber-800/60'
                      }`}
                    >
                      {/* Log Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                              log.evaluation.isMatch
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {log.evaluation.isMatch ? '✅ MATCH PASSED' : '❌ NO MATCH'}
                          </span>
                          <span className="font-extrabold text-slate-200">
                            Target: "{log.target}"
                          </span>
                          <span className="text-slate-400">({log.timestamp})</span>
                        </div>

                        <button
                          type="button"
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-[11px]"
                          onClick={() => copyLog(log)}
                        >
                          <Copy size={12} />
                          <span>{copiedLogId === log.id ? 'Copied JSON!' : 'Copy Payload'}</span>
                        </button>
                      </div>

                      {/* Verdict Reason */}
                      <div className="text-xs text-slate-300 font-sans bg-slate-950/50 p-2 rounded-xl border border-slate-800">
                        <strong className="text-purple-400">Verdict Reason: </strong>
                        {log.evaluation.reason}
                      </div>

                      {/* Inspection Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                        {/* Target & Graphemes */}
                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                          <div className="text-slate-400 font-bold flex items-center gap-1">
                            <Code size={12} className="text-blue-400" /> Target Info
                          </div>
                          <div>Cleaned Target: <span className="text-blue-300 font-bold">{log.targetMetrics.cleaned}</span></div>
                          <div>
                            Target Graphemes ({log.targetMetrics.graphemes.length}):{' '}
                            <span className="text-blue-300">[{log.targetMetrics.graphemes.join(', ')}]</span>
                          </div>
                          <div>Is Single Letter: <span className="text-amber-300">{String(log.isSingleLetter)}</span></div>
                        </div>

                        {/* Stroke Metrics */}
                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                          <div className="text-slate-400 font-bold flex items-center gap-1">
                            <PenTool size={12} className="text-purple-400" /> Canvas Stroke Metrics
                          </div>
                          <div>Bounding Box: {log.strokeMetrics.width}px × {log.strokeMetrics.height}px</div>
                          <div>Aspect Ratio (W/H): {log.strokeMetrics.aspectRatio}</div>
                          <div>Drawn Pixels: {log.strokeMetrics.drawnPixels}</div>
                        </div>
                      </div>

                      {/* OCR Outputs */}
                      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                        <div className="text-slate-400 font-bold">🤖 Raw vs Cleaned OCR Worker Outputs</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="bg-slate-900 p-2 rounded border border-slate-800">
                            <div className="text-purple-400 font-bold">Native Worker ({log.ocrOutputs.nativeLangCode}):</div>
                            <div>Raw: <span className="text-emerald-300">"{log.ocrOutputs.nativeRawText}"</span></div>
                            <div>Cleaned: <span className="text-emerald-400 font-bold">"{log.ocrOutputs.nativeCleanText}"</span></div>
                          </div>
                          <div className="bg-slate-900 p-2 rounded border border-slate-800">
                            <div className="text-blue-400 font-bold">English Worker (eng):</div>
                            <div>Raw: <span className="text-cyan-300">"{log.ocrOutputs.engRawText}"</span></div>
                            <div>Cleaned: <span className="text-cyan-400 font-bold">"{log.ocrOutputs.engCleanText}"</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Candidate Comparisons */}
                      {log.evaluation.candidates && log.evaluation.candidates.length > 0 && (
                        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                          <div className="text-slate-400 font-bold">📊 Candidate Evaluation Matrix</div>
                          <div className="space-y-1">
                            {log.evaluation.candidates.map((cand, i) => (
                              <div key={i} className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 p-1.5 rounded border border-slate-800/60">
                                <div>Candidate #{i + 1}: <span className="text-amber-300 font-bold">"{cand.text}"</span></div>
                                <div className="flex items-center gap-3 text-slate-400 text-[10px]">
                                  <span>Graphemes: [{cand.graphemes.join(', ')}]</span>
                                  <span>Levenshtein Dist: <strong className="text-white">{cand.distance}</strong></span>
                                  <span>Exact: <strong className={cand.exactMatch ? 'text-emerald-400' : 'text-slate-500'}>{String(cand.exactMatch)}</strong></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* 3. COMPLETED SUMMARY SCREEN */}
      {screen === 'completed' && (
        <motion.div
          className="glass-card rounded-3xl p-6 sm:p-10 text-center shadow-xl border border-white/60 space-y-6 bg-gradient-to-br from-white/80 via-purple-50/60 to-emerald-50/40"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-amber-500/15 text-amber-600 shadow-inner">
            <Trophy size={56} className="text-amber-500" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="display text-2xl sm:text-3xl font-black text-[#06304f]">
              {t('writingCompletedTitle') || '🏆 Writing Practice Completed!'}
            </h2>
            <p className="text-sm font-semibold text-[#06304f]/75">
              Fantastic work! You have successfully practiced all 5 handwriting challenges.
            </p>
          </div>

          {/* Reward Badges & Earned Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto py-2">
            <div className="rounded-2xl bg-white/80 p-4 border border-white/90 shadow-sm flex flex-col items-center">
              <Star className="text-amber-500 mb-1" size={24} />
              <span className="text-lg font-black text-[#06304f]">+{totalXpEarned + 50} XP</span>
              <span className="text-xs font-bold text-[#06304f]/60">Total XP Earned</span>
            </div>

            <div className="rounded-2xl bg-white/80 p-4 border border-white/90 shadow-sm flex flex-col items-center">
              <Gem className="text-blue-500 mb-1" size={24} />
              <span className="text-lg font-black text-[#06304f]">+{totalGemsEarned + 5} Gems</span>
              <span className="text-xs font-bold text-[#06304f]/60">Total Gems Earned</span>
            </div>

            <div className="rounded-2xl bg-purple-50 p-4 border border-purple-200/60 shadow-sm flex flex-col items-center">
              <Award className="text-purple-600 mb-1" size={24} />
              <span className="text-xs font-black text-purple-900">
                {t('writingBeginnerBadge') || 'Writing Beginner'}
              </span>
              <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider mt-1">
                Badge Unlocked 🏅
              </span>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              type="button"
              className="btn-primary px-8 py-3.5 text-base font-extrabold flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all"
              onClick={() => navigate('/dashboard')}
            >
              <span>{t('continueLearning') || 'Continue Learning'}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

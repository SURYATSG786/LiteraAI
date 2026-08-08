import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { speakText, stopSpeech } from '../audio';
import { useSpeaking } from '../hooks/useSpeaking';

/** LiteraAI Red Bird — friendly literacy guide mascot */
export function RedBird({ size = 120, mood = 'happy', className = '', speaking: speakingProp }) {
  const autoSpeaking = useSpeaking();
  const speaking = speakingProp !== undefined ? speakingProp : autoSpeaking;
  const brow = mood === 'think' ? -8 : mood === 'cheer' ? -2 : -6;
  const waving = mood === 'wave';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="LiteraAI Red Bird"
    >
      <ellipse cx="100" cy="175" rx="48" ry="10" fill="rgba(0,0,0,0.18)" />
      <circle cx="100" cy="110" r="62" fill="#E53935" />
      <ellipse cx="100" cy="145" rx="38" ry="28" fill="#FFCC80" />
      <ellipse cx="48" cy="115" rx="16" ry="28" fill="#C62828" transform="rotate(-25 48 115)" />
      {waving ? (
        <motion.ellipse
          cx="152"
          cy="115"
          rx="16"
          ry="28"
          fill="#C62828"
          style={{ transformBox: 'fill-box', transformOrigin: '10% 15%' }}
          animate={{ rotate: [25, 95, 55, 95, 25] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : (
        <ellipse cx="152" cy="115" rx="16" ry="28" fill="#C62828" transform="rotate(25 152 115)" />
      )}
      <path d="M88 48 Q100 18 112 48" fill="#C62828" stroke="#B71C1C" strokeWidth="3" />
      <circle cx="78" cy="100" r="22" fill="#fff" />
      <circle cx="122" cy="100" r="22" fill="#fff" />
      <circle cx="82" cy="104" r="10" fill="#FF6F00" />
      <circle cx="126" cy="104" r="10" fill="#FF6F00" />
      <circle cx="84" cy="104" r="4" fill="#111" />
      <circle cx="128" cy="104" r="4" fill="#111" />
      <path d={`M58 ${88 + brow} Q78 ${72 + brow} 92 88`} stroke="#111" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d={`M108 88 Q122 ${72 + brow} 142 ${88 + brow}`} stroke="#111" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* Beak / mouth — flaps open and closed while the voice guide speaks */}
      <path d="M89 119 L100 128 L111 119 Z" fill="#FFD54F" stroke="#F9A825" strokeWidth="2" />
      <motion.ellipse
        cx="100"
        cy="130"
        rx="8"
        ry="2.5"
        fill="#8D2020"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={{ scaleY: speaking ? [0.4, 3.2, 0.4] : 0.4 }}
        transition={{ duration: 0.28, repeat: speaking ? Infinity : 0, ease: 'easeInOut' }}
      />
      <motion.path
        d="M89 141 L100 132 L111 141 Z"
        fill="#FFB300"
        stroke="#F9A825"
        strokeWidth="2"
        style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}
        animate={{ y: speaking ? [0, 8, 0] : 0 }}
        transition={{ duration: 0.28, repeat: speaking ? Infinity : 0, ease: 'easeInOut' }}
      />
      <path d="M78 165 L88 150 L96 165 Z" fill="#FF9800" />
      <path d="M104 165 L112 150 L122 165 Z" fill="#FF9800" />
    </svg>
  );
}

/**
 * In-flow welcome animation for login/register.
 * Never uses a full-screen overlay, so it cannot cover form fields.
 */
export function FlyingBirdGreeting({ message, onDone, compact = false }) {
  return (
    <motion.div
      className={`mb-5 flex items-end gap-3 ${compact ? '' : 'md:mb-6'}`}
      initial={{ opacity: 0, x: -48, y: -8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 90, damping: 14 }}
      onAnimationComplete={() => {
        if (!onDone) return;
        setTimeout(() => onDone(), 2400);
      }}
    >
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, -3, 0, 3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="shrink-0"
      >
        <RedBird size={compact ? 72 : 96} mood="cheer" />
      </motion.div>
      <motion.div
        className="speech-bubble relative max-w-sm flex-1 px-4 py-3 text-sm font-extrabold leading-snug text-[#0b2a12] md:text-base"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.div>
    </motion.div>
  );
}

/** Persistent Duolingo-style guide shown on learning pages */
export function GuideBird({ message, mood = 'happy', size = 48, autoSpeak = true, onSpeechEnd, className = '' }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!message || !autoSpeak) return;
    speakText(message, i18n.language, false, true)
      .then(() => {
        if (onSpeechEnd) onSpeechEnd();
      })
      .catch(() => {
        if (onSpeechEnd) onSpeechEnd();
      });
  }, [message, i18n.language, autoSpeak]);

  const handleSpeak = () => {
    if (!message) return;
    stopSpeech();
    speakText(message, i18n.language)
      .then(() => {
        if (onSpeechEnd) onSpeechEnd();
      })
      .catch(() => {
        if (onSpeechEnd) onSpeechEnd();
      });
  };

  return (
    <div
      className={`guide-bird inline-flex max-w-full cursor-pointer items-center gap-2 ${className}`}
      onClick={handleSpeak}
      title="Click to hear bird guide"
    >
      <div className="speech-bubble relative max-w-xs sm:max-w-sm md:max-w-md px-3 py-1.5 text-xs font-extrabold leading-snug text-[#0b2a12]">
        {message}
      </div>
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="shrink-0"
      >
        <RedBird size={size} mood={mood} />
      </motion.div>
    </div>
  );
}

/**
 * One-shot "welcome back" arrival that fires right after a successful login.
 * Flies in from the bottom, waves, speaks the line in the user's chosen
 * language via native voice, then floats away on its own.
 */
export function LoginWelcomeToast({ message, lang = 'en', onDone, autoDismissMs = 6000 }) {
  const spokenRef = useRef(false);

  useEffect(() => {
    if (!message || spokenRef.current) return;
    spokenRef.current = true;
    speakText(message, lang, false, true).catch(() => {});
    return () => stopSpeech();
  }, [message, lang]);

  useEffect(() => {
    if (!onDone) return undefined;
    const timer = setTimeout(onDone, autoDismissMs);
    return () => clearTimeout(timer);
  }, [onDone, autoDismissMs]);

  function dismiss() {
    stopSpeech();
    onDone?.();
  }

  return (
    <motion.div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-6 z-[70] flex justify-center md:inset-x-auto md:bottom-8 md:right-8 md:justify-end"
      initial={{ opacity: 0, y: 80, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.9, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
    >
      <div className="flex max-w-sm items-end gap-3">
        <motion.button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss greeting"
          className="shrink-0 cursor-pointer border-0 bg-transparent p-0"
          initial={{ rotate: -8 }}
          animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <RedBird size={88} mood="wave" />
        </motion.button>
        <motion.button
          type="button"
          onClick={dismiss}
          className="speech-bubble relative flex-1 cursor-pointer border-0 px-4 py-3 text-left text-sm font-extrabold leading-snug text-[#0b2a12] md:text-base"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 16 }}
        >
          {message}
        </motion.button>
      </div>
    </motion.div>
  );
}

/** Compact brand row with optional one-shot greeting */
export function AuthBirdHeader({ message, showGreeting, onGreetingDone, brand = 'LiteraAI', birdSize = 52 }) {
  return (
    <div className="mb-4">
      <AnimatePresence mode="wait">
        {showGreeting ? (
          <FlyingBirdGreeting key="greet" message={message} onDone={onGreetingDone} compact />
        ) : (
          <motion.div
            key="brand"
            className="mb-2 flex items-center gap-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <RedBird size={birdSize} mood="happy" />
            </motion.div>
            {brand ? (
              <div className="display text-sm font-bold uppercase tracking-[0.18em] text-white/60">{brand}</div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

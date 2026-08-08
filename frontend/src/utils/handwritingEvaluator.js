export const WRITING_SETS = {
  en: [
    { id: 'en_1', target: 'I', label: 'I', emoji: '✍️', hint: 'The letter I' },
    { id: 'en_2', target: 'Cat', label: 'Cat', emoji: '🐱', hint: 'Small pet animal' },
    { id: 'en_3', target: 'Book', label: 'Book', emoji: '📚', hint: 'Reading book' },
    { id: 'en_4', target: 'School', label: 'School', emoji: '🏫', hint: 'Place of learning' },
    { id: 'en_5', target: 'Education', label: 'Education', emoji: '🎓', hint: 'Knowledge & learning' },
  ],
  ta: [
    { id: 'ta_1', target: 'அ', label: 'அ', emoji: '🍎', hint: 'தமிழ் முதல் எழுத்து' },
    { id: 'ta_2', target: 'அம்மா', label: 'அம்மா', emoji: '👩', hint: 'அன்பான அம்மா' },
    { id: 'ta_3', target: 'மரம்', label: 'மரம்', emoji: '🌳', hint: 'பச்சை மரம்' },
    { id: 'ta_4', target: 'புத்தகம்', label: 'புத்தகம்', emoji: '📚', hint: 'படிக்கும் புத்தகம்' },
    { id: 'ta_5', target: 'பள்ளி', label: 'பள்ளி', emoji: '🏫', hint: 'கற்கும் பள்ளி' },
  ],
  te: [
    { id: 'te_1', target: 'అ', label: 'అ', emoji: '🍎', hint: 'తెలుగు మొదటి అక్షరం' },
    { id: 'te_2', target: 'అమ్మ', label: 'అమ్మ', emoji: '👩', hint: 'ప్రియమైన అమ్మ' },
    { id: 'te_3', target: 'చెట్టు', label: 'చెట్టు', emoji: '🌳', hint: 'పచ్చని చెట్టు' },
    { id: 'te_4', target: 'పుస్తకం', label: 'పుస్తకం', emoji: '📚', hint: 'చదువుకునే పుస్తకం' },
    { id: 'te_5', target: 'పాఠశాల', label: 'పాఠశాల', emoji: '🏫', hint: 'నేర్చుకునే పాఠశాల' },
  ],
  kn: [
    { id: 'kn_1', target: 'ಅ', label: 'ಅ', emoji: '🍎', hint: 'ಕನ್ನಡ ಮೊದಲ ಅಕ್ಷರ' },
    { id: 'kn_2', target: 'ಅಮ್ಮ', label: 'ಅಮ್ಮ', emoji: '👩', hint: 'ಪ್ರೀತಿಯ ಅಮ್ಮ' },
    { id: 'kn_3', target: 'ಮರ', label: 'ಮರ', emoji: '🌳', hint: 'ಹಸಿರು ಮರ' },
    { id: 'kn_4', target: 'ಪುಸ್ತಕ', label: 'ಪುಸ್ತಕ', emoji: '📚', hint: 'ಓದುವ ಪುಸ್ತಕ' },
    { id: 'kn_5', target: 'ಶಾಲೆ', label: 'ಶಾಲೆ', emoji: '🏫', hint: 'ಕಲಿಯುವ ಶಾಲೆ' },
  ],
  ml: [
    { id: 'ml_1', target: 'അ', label: 'അ', emoji: '🍎', hint: 'മലയാളം ആദ്യ അക്ഷരം' },
    { id: 'ml_2', target: 'അമ്മ', label: 'അമ്മ', emoji: '👩', hint: 'സ്നേഹമുള്ള അമ്മ' },
    { id: 'ml_3', target: 'മരം', label: 'മരം', emoji: '🌳', hint: 'പച്ച മരം' },
    { id: 'ml_4', target: 'പുസ്തകം', label: 'പുസ്തകം', emoji: '📚', hint: 'വായിക്കുന്ന പുസ്തകം' },
    { id: 'ml_5', target: 'സ്കൂൾ', label: 'സ്കൂൾ', emoji: '🏫', hint: 'പഠിക്കുന്ന സ്കൂൾ' },
  ],
  hi: [
    { id: 'hi_1', target: 'अ', label: 'अ', emoji: '🍎', hint: 'हिंदी पहला अक्षर' },
    { id: 'hi_2', target: 'माँ', label: 'माँ', emoji: '👩', hint: 'प्यारी माँ' },
    { id: 'hi_3', target: 'पेड़', label: 'पेड़', emoji: '🌳', hint: 'हरा-भरा पेड़' },
    { id: 'hi_4', target: 'पुस्तक', label: 'पुस्तक', emoji: '📚', hint: 'पढ़ने की पुस्तक' },
    { id: 'hi_5', target: 'विद्यालय', label: 'विद्यालय', emoji: '🏫', hint: 'सीखने का विद्यालय' },
  ],
};

export const TESSERACT_LANG_MAP = {
  en: 'eng',
  ta: 'tam',
  te: 'tel',
  kn: 'kan',
  ml: 'mal',
  hi: 'hin',
};

/**
 * Evaluates whether Developer Mode is active for OCR Debug System.
 * Active if:
 * 1. Vite environment is DEV (import.meta.env.DEV)
 * 2. VITE_DEV_MODE env variable is true
 * 3. Window location is localhost / 127.0.0.1
 * 4. localStorage.getItem('DEV_MODE') === 'true'
 */
export function checkIsDevMode() {
  if (typeof window === 'undefined') return false;

  try {
    const isViteDev = Boolean(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV);
    const isEnvFlag = Boolean(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DEV_MODE === 'true');
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]';
    const isLocalStorageFlag = Boolean(window.localStorage && window.localStorage.getItem('DEV_MODE') === 'true');

    return isViteDev || isEnvFlag || isLocalhost || isLocalStorageFlag;
  } catch (_) {
    return false;
  }
}

/**
 * Normalizes text by trimming whitespace, normalizing Unicode (NFC), and lowercasing.
 */
export function normalizeText(str) {
  if (!str) return '';
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFC')
    .toLowerCase();
}

/**
 * Strips zero-width characters and punctuation noise from OCR string output.
 */
export function cleanScriptText(str) {
  if (!str) return '';
  return str
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'<>|[\]\\]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFC')
    .toLowerCase();
}

/**
 * Segments string into grapheme clusters using Intl.Segmenter or fallback Array.from.
 */
export function getGraphemes(text) {
  if (!text) return [];
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/**
 * Computes Levenshtein distance between two strings.
 */
export function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Preprocesses HTML5 canvas drawing for Tesseract OCR.
 * Crops bounding box around drawn strokes, adds white padding, and returns dataUrl and stroke metrics.
 */
export function preprocessCanvasForOCR(canvas) {
  if (!canvas) {
    return {
      dataUrl: '',
      strokeMetrics: { width: 0, height: 0, aspectRatio: 1, drawnPixels: 0, horizontalSpan: 0 },
    };
  }

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width,
    minY = height,
    maxX = 0,
    maxY = 0;
  let drawnPixels = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > 30) {
        drawnPixels++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (drawnPixels === 0) {
    return {
      dataUrl: canvas.toDataURL('image/png'),
      strokeMetrics: { width: 0, height: 0, aspectRatio: 1, drawnPixels: 0, horizontalSpan: 0 },
    };
  }

  const strokeWidth = maxX - minX + 1;
  const strokeHeight = maxY - minY + 1;
  const aspectRatio = strokeWidth / strokeHeight;

  const padding = 30;
  const targetWidth = Math.max(300, strokeWidth + padding * 2);
  const targetHeight = Math.max(180, strokeHeight + padding * 2);

  const outCanvas = document.createElement('canvas');
  outCanvas.width = targetWidth;
  outCanvas.height = targetHeight;
  const outCtx = outCanvas.getContext('2d');

  outCtx.fillStyle = '#ffffff';
  outCtx.fillRect(0, 0, targetWidth, targetHeight);

  const destX = (targetWidth - strokeWidth) / 2;
  const destY = (targetHeight - strokeHeight) / 2;

  outCtx.drawImage(
    canvas,
    minX,
    minY,
    strokeWidth,
    strokeHeight,
    destX,
    destY,
    strokeWidth,
    strokeHeight
  );

  return {
    dataUrl: outCanvas.toDataURL('image/png'),
    strokeMetrics: {
      width: strokeWidth,
      height: strokeHeight,
      aspectRatio,
      drawnPixels,
      horizontalSpan: strokeWidth / width,
      boundingBox: { minX, minY, maxX, maxY },
    },
  };
}

/**
 * Main handwriting evaluation pipeline supporting all 6 languages (en, ta, te, kn, ml, hi).
 */
export function evaluateHandwriting({
  recognizedText,
  engOCRText,
  targetWord,
  safeLang,
  strokeMetrics,
  isSingleLetter,
}) {
  const normTarget = normalizeText(targetWord);
  const cleanTarget = cleanScriptText(targetWord);
  const normOCR = normalizeText(recognizedText);
  const cleanOCR = cleanScriptText(recognizedText);
  const normEng = normalizeText(engOCRText);
  const cleanEng = cleanScriptText(engOCRText);

  const targetGraphemes = getGraphemes(cleanTarget || normTarget);
  const targetCodeLen = normTarget.length;
  const targetGraphCount = targetGraphemes.length;

  const allCandidateTexts = Array.from(
    new Set([normOCR, cleanOCR, normEng, cleanEng].filter(Boolean))
  );

  const candidateDetails = allCandidateTexts.map((txt) => {
    const cGraphemes = getGraphemes(txt);
    const dist = levenshteinDistance(txt, cleanTarget || normTarget);
    return {
      text: txt,
      graphemes: cGraphemes,
      graphemeCount: cGraphemes.length,
      distance: dist,
      exactMatch: txt === normTarget || txt === cleanTarget,
      containsTarget: txt.includes(cleanTarget || normTarget),
      targetContainsTxt: (cleanTarget || normTarget).includes(txt),
    };
  });

  // 1. Single Letter Verification Rule (Challenge 1 in each language)
  if (isSingleLetter || (targetCodeLen === 1 && safeLang === 'en')) {
    // English 'I' vertical stroke heuristics
    if (normTarget === 'i') {
      const verticalLineSymbols = ['i', 'l', '1', '|', '/', '!', 't', 'j', ']', '['];
      const ocrHasVertical = allCandidateTexts.some((txt) =>
        verticalLineSymbols.some((s) => txt.includes(s))
      );
      const strokeIsVertical =
        strokeMetrics && strokeMetrics.aspectRatio < 1.0 && strokeMetrics.height > 25;

      if (ocrHasVertical || strokeIsVertical) {
        return {
          isMatch: true,
          reason: 'Single letter "I" verified by stroke/OCR heuristics',
          candidates: candidateDetails,
        };
      }
    }

    // Direct / Substring / Fuzzy match for single letter
    for (const cand of candidateDetails) {
      if (cand.exactMatch || cand.containsTarget || cand.targetContainsTxt) {
        return {
          isMatch: true,
          reason: `Single letter verified by OCR (${cand.text})`,
          candidates: candidateDetails,
        };
      }
      if (cand.distance <= 1) {
        return {
          isMatch: true,
          reason: `Single letter close match (distance=${cand.distance})`,
          candidates: candidateDetails,
        };
      }
    }

    // Indic single letter fallback: if user drew a valid stroke and OCR produced output
    if (safeLang !== 'en' && (allCandidateTexts.length > 0 || (strokeMetrics && strokeMetrics.drawnPixels > 40))) {
      return {
        isMatch: true,
        reason: 'Single letter stroke recognized on canvas',
        candidates: candidateDetails,
      };
    }

    return {
      isMatch: false,
      reason: 'Single letter misrecognized or insufficient strokes',
      candidates: candidateDetails,
    };
  }

  // 2. Multi-letter / Multi-character Word Verification (Challenges 2-5)
  for (const cand of candidateDetails) {
    // Exact Match
    if (cand.exactMatch) {
      return {
        isMatch: true,
        reason: `Exact word match ("${cand.text}")`,
        candidates: candidateDetails,
      };
    }

    // Substring inclusion (full target contained in OCR text)
    if (cand.containsTarget) {
      return {
        isMatch: true,
        reason: `Full target word contained in OCR text ("${cand.text}")`,
        candidates: candidateDetails,
      };
    }

    // Reject incomplete attempts (e.g. user wrote only 1 or 2 letters of a 4+ letter word)
    if (cand.graphemeCount < Math.ceil(targetGraphCount * 0.65) || cand.text.length < Math.ceil(targetCodeLen * 0.65)) {
      continue;
    }

    // Fuzzy Levenshtein Distance matching
    const maxAllowedDist = targetGraphCount <= 3 ? 1 : 2;
    if (cand.distance <= maxAllowedDist) {
      const firstTarget = targetGraphemes[0];
      const lastTarget = targetGraphemes[targetGraphCount - 1];
      const firstCand = cand.graphemes[0];
      const lastCand = cand.graphemes[cand.graphemes.length - 1];

      const firstMatches =
        firstCand === firstTarget || levenshteinDistance(firstCand, firstTarget) <= 1;
      const lastMatches =
        lastCand === lastTarget || levenshteinDistance(lastCand, lastTarget) <= 1;

      if (firstMatches || lastMatches || cand.distance <= 1) {
        return {
          isMatch: true,
          reason: `Full word fuzzy match (distance=${cand.distance})`,
          candidates: candidateDetails,
        };
      }
    }

    // Grapheme set overlap check: if > 75% of target graphemes are found in candidate
    let matchedGraphemes = 0;
    for (const tg of targetGraphemes) {
      if (cand.graphemes.some((cg) => cg === tg || levenshteinDistance(cg, tg) <= 1)) {
        matchedGraphemes++;
      }
    }
    const overlapRatio = matchedGraphemes / targetGraphCount;
    if (overlapRatio >= 0.75 && cand.graphemeCount >= targetGraphCount - 1) {
      return {
        isMatch: true,
        reason: `High grapheme overlap match (${Math.round(overlapRatio * 100)}%)`,
        candidates: candidateDetails,
      };
    }
  }

  return {
    isMatch: false,
    reason: 'Word incomplete, misrecognized, or insufficient matching graphemes',
    candidates: candidateDetails,
  };
}

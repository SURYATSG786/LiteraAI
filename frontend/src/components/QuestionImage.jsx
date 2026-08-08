/** Colorful educational scene cards for question/lesson images */
const SCENES = {
  cow: { bg: '#A5D6A7', emoji: '🐄', label: 'Cow' },
  alphabet: { bg: '#90CAF9', emoji: '🔤', label: 'ABC' },
  sun: { bg: '#FFE082', emoji: '☀️', label: 'Sun' },
  cat: { bg: '#F8BBD0', emoji: '🐱', label: 'Cat' },
  hand: { bg: '#CE93D8', emoji: '✋', label: '5' },
  home: { bg: '#80CBC4', emoji: '🏠', label: 'Home' },
  water: { bg: '#81D4FA', emoji: '💧', label: 'Water' },
  mango: { bg: '#FFCC80', emoji: '🥭', label: 'Mango' },
  bird: { bg: '#80DEEA', emoji: '🐦', label: 'Bird' },
  'letter-b': { bg: '#C5E1A5', emoji: '🅱️', label: 'B' },
  pen: { bg: '#B39DDB', emoji: '✏️', label: 'Pen' },
  elephant: { bg: '#B0BEC5', emoji: '🐘', label: 'Elephant' },
  night: { bg: '#7986CB', emoji: '🌙', label: 'Night' },
  happy: { bg: '#FFF59D', emoji: '😊', label: ':)' },
  fish: { bg: '#4FC3F7', emoji: '🐟', label: 'Fish' },
  walk: { bg: '#AED581', emoji: '🚶', label: 'Go' },
  school: { bg: '#FFAB91', emoji: '🏫', label: 'School' },
  apple: { bg: '#EF9A9A', emoji: '🍎', label: 'Apple' },
  size: { bg: '#A1887F', emoji: '📏', label: 'Size' },
  kids: { bg: '#F48FB1', emoji: '🧒', label: 'Kids' },
  student: { bg: '#9FA8DA', emoji: '📚', label: 'Learn' },
  food: { bg: '#FFCC80', emoji: '🍽️', label: 'Eat' },
  run: { bg: '#81C784', emoji: '🏃', label: 'Run' },
  book: { bg: '#90CAF9', emoji: '📖', label: 'Book' },
  play: { bg: '#FFD54F', emoji: '⚽', label: 'Play' },
  weather: { bg: '#80DEEA', emoji: '🌡️', label: 'Temp' },
  brave: { bg: '#EF9A9A', emoji: '🦁', label: 'Brave' },
  time: { bg: '#B39DDB', emoji: '⏳', label: 'Time' },
  grammar: { bg: '#80CBC4', emoji: '📝', label: 'Grammar' },
  letter: { bg: '#FFE082', emoji: '✉️', label: 'Mail' },
  future: { bg: '#81D4FA', emoji: '🚀', label: 'Future' },
  kind: { bg: '#F8BBD0', emoji: '💝', label: 'Kind' },
  tree: { bg: '#A5D6A7', emoji: '🌳', label: 'Tree' },
  rain: { bg: '#90CAF9', emoji: '🌧️', label: 'Rain' },
  rare: { bg: '#CE93D8', emoji: '💎', label: 'Rare' },
  story: { bg: '#FFCC80', emoji: '📕', label: 'Story' },
  speak: { bg: '#80DEEA', emoji: '🗣️', label: 'Speak' },
  drought: { bg: '#FFCC80', emoji: '🏜️', label: 'Dry' },
  clouds: { bg: '#B0BEC5', emoji: '☁️', label: 'Cloud' },
  success: { bg: '#FFE082', emoji: '🏆', label: 'Win' },
  chat: { bg: '#F8BBD0', emoji: '💬', label: 'Chat' },
  paragraph: { bg: '#9FA8DA', emoji: '¶', label: 'Para' },
  careful: { bg: '#A5D6A7', emoji: '🔍', label: 'Care' },
  metaphor: { bg: '#CE93D8', emoji: '✨', label: 'Meta' },
  contrast: { bg: '#FFAB91', emoji: '⚖️', label: 'Vs' },
  money: { bg: '#FFF59D', emoji: '💰', label: 'Cost' },
  summary: { bg: '#90CAF9', emoji: '🧾', label: 'Sum' },
  ball: { bg: '#EF9A9A', emoji: '⚽', label: 'Ball' },
  dog: { bg: '#A1887F', emoji: '🐶', label: 'Dog' },
  bag: { bg: '#FFCC80', emoji: '👜', label: 'Bag' },
  hat: { bg: '#CE93D8', emoji: '🎩', label: 'Hat' },
  blend: { bg: '#81D4FA', emoji: '🔗', label: 'Blend' },
  words: { bg: '#C5E1A5', emoji: '🔤', label: 'Words' },
  me: { bg: '#F8BBD0', emoji: '🙋', label: 'Me' },
  park: { bg: '#A5D6A7', emoji: '🏞️', label: 'Park' },
  bakery: { bg: '#FFCC80', emoji: '🥖', label: 'Bake' },
  complex: { bg: '#9FA8DA', emoji: '🧩', label: 'Complex' },
  idiom: { bg: '#FFAB91', emoji: '💡', label: 'Idiom' },
  tech: { bg: '#80DEEA', emoji: '📱', label: 'App' },
  vowels: { bg: '#FFE082', emoji: '🅰️', label: 'Vowels' },
  pencil: { bg: '#B39DDB', emoji: '✏️', label: 'Pencil' },
  color: { bg: '#EF9A9A', emoji: '🎨', label: 'Color' },
  period: { bg: '#90CAF9', emoji: '⏹️', label: 'Period' },
  sound: { bg: '#80DEEA', emoji: '🔊', label: 'Sound' },
  calendar: { bg: '#B39DDB', emoji: '📅', label: 'Calendar' },
  music: { bg: '#CE93D8', emoji: '🎵', label: 'Music' },
  family: { bg: '#F8BBD0', emoji: '👨‍👩‍👧', label: 'Family' },
  idea: { bg: '#FFE082', emoji: '💡', label: 'Idea' },
  options: { bg: '#80DEEA', emoji: '🔀', label: 'Options' },
  check: { bg: '#C5E1A5', emoji: '✅', label: 'Check' },
  star: { bg: '#FFF59D', emoji: '⭐', label: 'Star' },
};

export function QuestionImage({ imageKey, className = '' }) {
  const scene = SCENES[imageKey] || SCENES.book;
  return (
    <div
      className={`question-art flex items-center justify-center overflow-hidden rounded-3xl ${className}`}
      style={{ background: `linear-gradient(145deg, ${scene.bg}, #ffffff55)` }}
      aria-hidden
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-6xl drop-shadow-md md:text-7xl">{scene.emoji}</span>
      </div>
    </div>
  );
}

export default QuestionImage;

import { useState } from 'react';

interface FollowUpQuestion {
  id: string;
  question: string;
  options: string[];
}

const UNIVERSAL_QUESTIONS: FollowUpQuestion[] = [
  {
    id: 'gender',
    question: "Shopping for? 👤",
    options: ["Women's fashion 👩", "Men's fashion 👨", "Unisex / Doesn't matter 🌈"],
  },
  {
    id: 'body_type',
    question: "How would you describe your build? 💪",
    options: ["Slim / Lean", "Athletic / Medium", "Broad / Plus-size", "Petite / Short", "Tall / Lanky"],
  },
  {
    id: 'size',
    question: "What's your usual size? 📏",
    options: ["XS", "S", "M", "L", "XL", "XXL", "Not sure — help me pick"],
  },
];

const OCCASION_QUESTIONS: Record<string, FollowUpQuestion[]> = {
  travel: [
    { id: 'destination', question: "Where are you headed? 🗺️", options: ["Beach 🏖️", "Mountains ⛰️", "City trip 🏙️", "Backpacking 🎒"] },
    { id: 'weather', question: "What's the weather like? 🌡️", options: ["Hot & humid 🥵", "Warm & breezy 🌤️", "Cool & pleasant 🍃", "Cold ❄️"] },
    { id: 'for_whom', question: "Who's it for?", options: ["For myself 💁", "For a friend 🎁", "Couple trip 💑"] },
  ],
  party: [
    { id: 'party_type', question: "What kind of party? 🎉", options: ["House party 🏠", "Club night 🪩", "Birthday 🎂", "College fest 🎓", "Date night 🌹"] },
    { id: 'setting', question: "Indoor or outdoor?", options: ["Indoor 🏠", "Outdoor 🌙", "Both / Not sure"] },
    { id: 'comfort', question: "How dressy are you going? 💅", options: ["All out glam ✨", "Stylish but comfy", "Casual cool 😎"] },
  ],
  wedding: [
    { id: 'function', question: "Which function? 💍", options: ["Mehndi 🌿", "Sangeet 💃", "Wedding day 👰", "Reception ✨", "Haldi 🌼"] },
    { id: 'role', question: "Your role?", options: ["Guest 🧑‍🤝‍🧑", "Close family 👨‍👩‍👧", "Bride/Groom 👰", "Best friend 💛"] },
    { id: 'style_pref', question: "Style preference?", options: ["Full traditional 🪷", "Indo-western fusion", "Modern ethnic ✨", "Whatever looks good 😄"] },
  ],
  work: [
    { id: 'workplace', question: "What's the setting? 💼", options: ["Corporate office 🏢", "Startup / casual 👟", "Interview 🎤", "Client meeting 🤝", "WFH but video calls 💻"] },
    { id: 'dress_code', question: "Dress code?", options: ["Formal / Strict 👔", "Smart casual 🧥", "Casual / No restrictions 😎", "Business casual"] },
  ],
  gift: [
    { id: 'recipient', question: "Who is it for? 🎁", options: ["Best friend 👯", "Partner / Crush 💕", "Parent 👨‍👩‍👧", "Sibling 👫", "Colleague 💼"] },
    { id: 'recipient_style', question: "Their style?", options: ["Trendy & bold ✨", "Classic & elegant 🎀", "Sporty & active 🏃", "Minimal & clean 🍃", "Not sure 🤷"] },
    { id: 'recipient_age', question: "Their age group?", options: ["Teen (13-19) 🧑", "Young adult (20-30) 👩", "30s-40s 🧑‍💼", "50+ 👴"] },
  ],
  casual: [
    { id: 'casual_type', question: "What's the plan?", options: ["Daily wear 👕", "Brunch / Coffee date ☕", "Shopping day 🛍️", "College / Campus 📚", "Just chilling at home 🛋️"] },
    { id: 'comfort_level', question: "Comfort vs style?", options: ["100% comfort 🛋️", "Stylish comfort 💅", "Ready to impress 🔥", "Athleisure vibes 🏃"] },
  ],
};

const STYLE_QUESTIONS: FollowUpQuestion[] = [
  {
    id: 'color_pref',
    question: "Any color preference? 🎨",
    options: ["Earthy tones 🤎", "Pastels & soft colors 🌸", "Bold & bright 🔴", "Neutrals (black/white/grey) ⬛", "No preference — surprise me! ✨"],
  },
  {
    id: 'fabric_pref',
    question: "Fabric / material matters? 🧵",
    options: ["Cotton for sure 🌿", "Linen / breathable", "Silk / luxe feel ✨", "Denim / sturdy", "Doesn't matter"],
  },
];

interface Props {
  occasion: string;
  onComplete: (answers: Record<string, string>) => void;
  onSkip: () => void;
}

export default function FollowUpQuestions({ occasion, onComplete, onSkip }: Props) {
  const [savedProfile] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('shopmate_profile');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  const hasProfile = savedProfile.gender && savedProfile.size;

  const bodyQs = hasProfile ? [] : UNIVERSAL_QUESTIONS;
  const occasionQs = OCCASION_QUESTIONS[occasion] || OCCASION_QUESTIONS.casual;
  const styleQs = STYLE_QUESTIONS;
  const allQuestions = [...bodyQs, ...occasionQs, ...styleQs];

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(hasProfile ? { ...savedProfile } : {});

  const handleAnswer = (answer: string) => {
    const q = allQuestions[currentQ];
    const newAnswers = { ...answers, [q.id]: answer };
    setAnswers(newAnswers);

    if (currentQ < allQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      if (!hasProfile) {
        const profile: Record<string, string> = {};
        UNIVERSAL_QUESTIONS.forEach(q => {
          if (newAnswers[q.id]) profile[q.id] = newAnswers[q.id];
        });
        localStorage.setItem('shopmate_profile', JSON.stringify(profile));
      }
      onComplete(newAnswers);
    }
  };

  const question = allQuestions[currentQ];
  const isBodyQ = UNIVERSAL_QUESTIONS.some(q => q.id === question.id);
  const totalSteps = allQuestions.length;

  return (
    <div className="px-5 pt-6 pb-28 animate-slide-up">
      {/* Progress bar */}
      <div className="flex gap-1 mb-6">
        {allQuestions.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-500 ${
              i < currentQ
                ? 'bg-gradient-to-r from-purple to-coral'
                : i === currentQ
                ? 'bg-purple animate-pulse-glow'
                : 'bg-glass-border'
            }`}
          />
        ))}
      </div>

      {/* Profile setup notice */}
      {isBodyQ && currentQ === 0 && !hasProfile && (
        <div className="mb-5 p-4 glass-card border-purple/20 animate-scale-in">
          <p className="text-xs font-semibold text-purple-light">📋 Quick profile setup (one-time only)</p>
          <p className="text-[10px] text-text-tertiary mt-1">Helps us recommend the right fit & size</p>
        </div>
      )}

      {/* AI avatar + question */}
      <div className="flex items-start gap-3 mb-7">
        <div className="w-11 h-11 bg-gradient-to-br from-purple to-coral rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg shadow-purple/30" style={{ fontFamily: "'Space Grotesk'" }}>
          SM
        </div>
        <div className="glass-card p-4 max-w-[80%] rounded-tl-sm">
          <p className="text-[10px] text-text-tertiary font-semibold mb-1 uppercase tracking-wider">ShopMate AI</p>
          <p className="text-[15px] font-semibold text-text leading-snug">{question.question}</p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2.5 mb-7">
        {question.options.map((option, i) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className="w-full p-4 glass-card text-left text-[15px] font-medium text-text-secondary hover:text-text hover:bg-glass-strong hover:border-purple/30 hover:shadow-lg hover:shadow-purple/10 transition-all active:scale-[0.98] animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Skip */}
      <button
        onClick={onSkip}
        className="w-full text-center text-sm text-text-tertiary font-medium hover:text-purple-light transition-colors mb-4"
      >
        Skip remaining and show results →
      </button>

      {/* Progress text */}
      <p className="text-center text-xs text-text-tertiary">
        {currentQ + 1} of {totalSteps} • {isBodyQ ? 'Setting up your profile' : 'Understanding your style'}
      </p>
    </div>
  );
}

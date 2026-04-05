import { useState } from 'react';

interface FollowUpQuestion {
  question: string;
  options: string[];
}

const FOLLOW_UP_MAP: Record<string, FollowUpQuestion[]> = {
  travel: [
    { question: "Where are you headed? 🗺️", options: ["Beach 🏖️", "Mountains ⛰️", "City trip 🏙️", "Backpacking 🎒"] },
    { question: "Who's it for?", options: ["For me 💁", "For a friend 🎁", "Couple trip 💑"] },
  ],
  party: [
    { question: "What kind of party? 🎉", options: ["House party 🏠", "Club night 🪩", "Birthday 🎂", "College fest 🎓"] },
    { question: "Indoor or outdoor?", options: ["Indoor 🏠", "Outdoor 🌙", "Both"] },
  ],
  wedding: [
    { question: "Which function? 💍", options: ["Mehndi 🌿", "Sangeet 💃", "Wedding day 👰", "Reception ✨"] },
    { question: "Your role?", options: ["Guest 🧑‍🤝‍🧑", "Close family 👨‍👩‍👧", "Bride/Groom 👰"] },
  ],
  work: [
    { question: "What's the setting? 💼", options: ["Corporate office 🏢", "Startup/casual 👟", "Interview 🎤", "Client meeting 🤝"] },
    { question: "Dress code?", options: ["Formal 👔", "Smart casual 🧥", "No restrictions 😎"] },
  ],
  gift: [
    { question: "Who is it for? 🎁", options: ["Best friend 👯", "Partner 💕", "Parent 👨‍👩‍👧", "Sibling 👫"] },
    { question: "Their style?", options: ["Trendy ✨", "Classic 🎀", "Sporty 🏃", "Not sure 🤷"] },
  ],
  casual: [
    { question: "What's the occasion?", options: ["Daily wear 👕", "Brunch date ☕", "Shopping day 🛍️", "College 📚"] },
    { question: "Comfort level?", options: ["Super comfy 🛋️", "Stylish comfort 💅", "Ready to impress 🔥"] },
  ],
};

interface Props {
  occasion: string;
  onComplete: (answers: Record<string, string>) => void;
  onSkip: () => void;
}

export default function FollowUpQuestions({ occasion, onComplete, onSkip }: Props) {
  const questions = FOLLOW_UP_MAP[occasion] || FOLLOW_UP_MAP.casual;
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = (answer: string) => {
    const newAnswers = { ...answers, [questions[currentQ].question]: answer };
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const question = questions[currentQ];

  return (
    <div className="px-5 pt-6 pb-28 animate-slide-up">
      {/* Progress */}
      <div className="flex gap-2 mb-6">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              i <= currentQ ? 'bg-coral' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* AI avatar + question */}
      <div className="flex items-start gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-coral to-coral-light rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
          SM
        </div>
        <div className="bg-white border border-border rounded-2xl rounded-tl-sm p-4 shadow-sm">
          <p className="text-sm text-text-secondary font-semibold mb-1">ShopMate AI</p>
          <p className="text-base font-bold text-text">{question.question}</p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {question.options.map(option => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className="w-full p-4 bg-white border-2 border-border rounded-2xl text-left text-[15px] font-semibold text-text hover:border-coral hover:bg-coral-soft hover:text-coral transition-all active:scale-[0.98]"
          >
            {option}
          </button>
        ))}
      </div>

      {/* Skip */}
      <button
        onClick={onSkip}
        className="w-full text-center text-sm text-text-tertiary font-semibold hover:text-coral transition-colors"
      >
        Skip and show results →
      </button>

      {/* Progress text */}
      <p className="text-center text-xs text-text-tertiary mt-4">
        {currentQ + 1} of {questions.length} quick questions • helps us find better matches
      </p>
    </div>
  );
}

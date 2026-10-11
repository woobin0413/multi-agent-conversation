interface Props {
  lunaMood: string | null;
  oakMood: string | null;
  onLunaMoodChange: (mood: string | null) => void;
  onOakMoodChange: (mood: string | null) => void;
  disabled: boolean;
}

const MOODS = [
  { value: 'friendly', label: 'Friendly', emoji: '😊' },
  { value: 'funny', label: 'Funny', emoji: '😂' },
  { value: 'angry', label: 'Angry', emoji: '😡' },
  { value: 'romantic', label: 'Romantic', emoji: '💕' },
  { value: 'sarcastic', label: 'Sarcastic', emoji: '😏' },
  { value: 'philosophical', label: 'Deep', emoji: '🤔' },
  { value: 'dramatic', label: 'Dramatic', emoji: '🎭' },
  { value: 'mysterious', label: 'Mysterious', emoji: '🔮' },
];

function MoodRow({
  label,
  color,
  bgColor,
  currentMood,
  onMoodChange,
  disabled,
}: {
  label: string;
  color: string;
  bgColor: string;
  currentMood: string | null;
  onMoodChange: (mood: string | null) => void;
  disabled: boolean;
}) {
  return (
    <div className="mb-3">
      <p className="text-xs font-bold mb-1.5" style={{ color }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {MOODS.map((m) => {
          const isActive = currentMood === m.value;
          return (
            <button
              key={m.value}
              onClick={() => onMoodChange(isActive ? null : m.value)}
              disabled={disabled}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                  ? 'ring-2 ring-offset-1'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              style={
                isActive
                  ? { backgroundColor: bgColor, color, '--tw-ring-color': color } as React.CSSProperties
                  : undefined
              }
            >
              {m.emoji} {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MoodSelector({ lunaMood, oakMood, onLunaMoodChange, onOakMoodChange, disabled }: Props) {
  return (
    <div className="mb-4 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        Choose each agent's personality
      </p>
      <MoodRow
        label="Luna"
        color="#3C3489"
        bgColor="#EEEDFE"
        currentMood={lunaMood}
        onMoodChange={onLunaMoodChange}
        disabled={disabled}
      />
      <MoodRow
        label="Oak"
        color="#27500A"
        bgColor="#EAF3DE"
        currentMood={oakMood}
        onMoodChange={onOakMoodChange}
        disabled={disabled}
      />
    </div>
  );
}

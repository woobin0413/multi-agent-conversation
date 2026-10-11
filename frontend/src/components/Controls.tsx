interface Props {
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  isPaused: boolean;
  isComplete: boolean;
  hasStarted: boolean;
  status: string;
}

export function Controls({
  onStart,
  onPause,
  onResume,
  onReset,
  isPaused,
  isComplete,
  hasStarted,
  status,
}: Props) {
  return (
    <div className="mb-4">
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={onStart}
          disabled={hasStarted && !isComplete}
          className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#7F77DD' }}
        >
          Begin
        </button>
        <button
          onClick={onPause}
          disabled={isPaused || isComplete || !hasStarted}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Pause
        </button>
        <button
          onClick={onResume}
          disabled={!isPaused || isComplete}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Resume
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-lg text-gray-500 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Reset
        </button>
      </div>
      <p
        key={status}
        className="text-center text-sm italic text-gray-500 dark:text-gray-400 mt-2 animate-fade-in"
      >
        {status}
      </p>
    </div>
  );
}

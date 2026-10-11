interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="mb-4">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${percent}%`, backgroundColor: '#7F77DD' }}
        />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Sentence {current} of {total}
      </p>
    </div>
  );
}

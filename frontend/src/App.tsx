import { useStory } from './hooks/useStory';
import { ProgressBar } from './components/ProgressBar';
import { StoryDisplay } from './components/StoryDisplay';
import { Controls } from './components/Controls';
import { RedirectInput } from './components/RedirectInput';
import { MoodSelector } from './components/MoodSelector';

function App() {
  const {
    displayItems,
    isPaused,
    isComplete,
    currentTurn,
    status,
    lunaMood,
    oakMood,
    hasStarted,
    startStory,
    pauseStory,
    resumeStory,
    resetStory,
    redirectStory,
    setLunaMood,
    setOakMood,
  } = useStory();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-[680px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Conversation Game</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Two AI agents chat for 15 turns — set their mood, then watch (or interrupt)
          </p>
          <div className="flex justify-center gap-3">
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: '#EEEDFE', color: '#3C3489' }}
            >
              <span className="font-bold">Luna</span>
              <span className="opacity-70">Friendly & curious</span>
            </span>
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: '#EAF3DE', color: '#27500A' }}
            >
              <span className="font-bold">Oak</span>
              <span className="opacity-70">Warm & thoughtful</span>
            </span>
          </div>
        </div>

        {/* Mood Selector — always visible, changeable before and during */}
        <MoodSelector
          lunaMood={lunaMood}
          oakMood={oakMood}
          onLunaMoodChange={setLunaMood}
          onOakMoodChange={setOakMood}
          disabled={isComplete}
        />

        {/* Progress */}
        {currentTurn > 0 && (
          <ProgressBar current={currentTurn} total={15} />
        )}

        {/* Conversation */}
        <StoryDisplay displayItems={displayItems} isComplete={isComplete} />

        {/* Controls */}
        <Controls
          onStart={startStory}
          onPause={pauseStory}
          onResume={resumeStory}
          onReset={resetStory}
          isPaused={isPaused}
          isComplete={isComplete}
          hasStarted={hasStarted}
          status={status}
        />

        {/* Redirect */}
        <RedirectInput
          onRedirect={redirectStory}
          disabled={!hasStarted || isComplete}
        />
      </div>
    </div>
  );
}

export default App;

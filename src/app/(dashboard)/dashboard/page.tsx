import PomodoroTimer from "@/components/PomodoroTimer"
import StickyNotesWidget from "@/components/StickyNotesWidget"
import TodoWidget from "@/components/TodoWidget"

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-grow items-start">
      <div className="w-1/3 p-2 bg-purple-100">
          <PomodoroTimer />
        </div>
        <div className="w-1/3 p-2 bg-blue-100">
          <div className="mx-auto p-2 bg-white border border-black rounded-lg shadow-lg text-center">
            <p>navigation to pages</p>
          </div>
        </div>
             
        <div className="w-4/4 p-3 flex justify-end bg-green-100">
          <TodoWidget />
        </div>
      </div>
    
      <div className="flex flex-grow items-start">
      <div className="w-2/3 p-2 bg-pink-100">
          <div className="mx-auto p-6 bg-white border border-black rounded-lg shadow-lg text-center">
            <h1 className="text-3xl font-bold text-gray-800">Welcome to Elva!</h1>
            <p className="m-2 p-2 text-gray-600 border-t border-b">
            Elva is your AI-powered study companion that helps you stay organized and focused. Generate summaries, flashcards, and quizzes, manage tasks with a Pomodoro timer, and keep all your notes in one smart dashboard—built to boost your productivity and learning flow.
            </p>
            <p className="p-2">
              Take a deep breath, drink some water, and get ready to focus!
            </p>
          </div>
        </div>
        <div className="w-1/3 p-3 bg-yellow-100">
          <StickyNotesWidget />
        </div>
      </div>
    </div>
  );
}



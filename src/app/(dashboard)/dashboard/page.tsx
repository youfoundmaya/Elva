"use client"
import PomodoroTimer from "@/components/PomodoroTimer"
import StickyNotesWidget from "@/components/StickyNotesWidget"
import TodoWidget from "@/components/TodoWidget"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function Page() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex">
        <div className="w-2/4 p-2">
          <PomodoroTimer />
        </div>
        <div className="w-2/4 p-2">
          <div className="mx-auto p-2 bg-white border border-black rounded-lg shadow-lg text-center">
            <h1 className="text-xl font-bold text-gray-800 border-b p-2">Quick Navigation</h1>
            <Button
              onClick={() => router.push("./my_notes")}
              className="m-2 border"
              variant="ghost">
              Review your notes!
            </Button>
            <br />

            <Button
              onClick={() => router.push("./summary")}
              className="mb-2"
              variant="outline">
              Create a summary
            </Button>
            <br />
            <Button
            onClick={() => router.push("./flash_cards")}
              className="mb-2"
              variant="outline">
              Create flashcards
            </Button>
            <br />
            <Button
            onClick={() => router.push("./quiz-generator")}
              className="mb-2"
              variant="outline">
              Create MCQs
            </Button>

            <Button
            onClick={() => router.push("./chatbot")}
              className="mb-2 ml-2"
              variant="outline">
              Elva the chatbot
            </Button>
            <br />
            <p className="border-t pb-2"></p>
            <Button
            onClick={() => window.open("https://app.studytogether.com/")}
              className="mb-2"
              variant="default">
              Check out Study Together here!
            </Button>
            <p className="text-sm text-gray-400">Join the discord to join a live study group and further updates!</p>
          </div>
        </div>
        <div className="w-4/4 p-2 flex justify-end">
          <TodoWidget />
        </div>
      </div>

      <div className="flex">
        <div className="w-2/3 p-2">
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
        <div className="w-1/3 p-2">
          <StickyNotesWidget />
        </div>
      </div>
    </div>

  );
}



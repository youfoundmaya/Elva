import PomodoroTimer from "@/components/PomodoroTimer"
import StickyNotesWidget from "@/components/StickyNotesWidget"
import TodoWidget from "@/components/TodoWidget"
import { Card } from "@/components/ui/card"

export default function Page() {
  return (
    <div className="relative flex justify-between p-4">
    {/* LEFT SIDE: Sticky + Pomodoro stacked vertically */}
    <div className="flex flex-col space-y-4">
      <StickyNotesWidget />
      <PomodoroTimer />
    </div>
  
    {/* RIGHT SIDE: Todo in top-right corner */}
    <div className="absolute top-4 right-4">
      <TodoWidget />
    </div>
  </div>
  
  
  )
}

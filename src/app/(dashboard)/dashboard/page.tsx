import StickyNotesWidget from "@/components/StickyNotesWidget"
import TodoWidget from "@/components/TodoWidget"

export default function Page() {
  return (
    <div>
      <StickyNotesWidget />

    <div className="fixed top-4 right-4 z-50">

    <TodoWidget />
  </div>
  </div>
  )
}

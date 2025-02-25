"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchNotes, fetchFlashcards } from "@/app/actions/dashboard_actions";
import removeMarkdown from "remove-markdown";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenTextIcon, NotebookText } from "lucide-react";

const MyNotes = () => {
  const [notes, setNotes] = useState<{ id: string; summary: string }[]>([]);
  const [flashcards, setFlashcards] = useState<
    {
      id: string;
      title: string;
      cards: { question: string; answer: string }[];
    }[]
  >([]);
  const [selectedType, setSelectedType] = useState<
    "summaries" | "flashcards" | "quizzes"
  >("summaries");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function getData() {
      setLoading(true);
      setError(null);
      try {
        if (selectedType === "summaries") {
          const fetchedNotes = await fetchNotes();
          setNotes(fetchedNotes || []);
        } else if (selectedType === "flashcards") {
          const fetchedFlashcards = await fetchFlashcards();
          if (
            Array.isArray(fetchedFlashcards) &&
            fetchedFlashcards.length > 0
          ) {
            setFlashcards(fetchedFlashcards);
          } else {
            console.warn("No flashcards found.");
            setFlashcards([]);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, [selectedType]);

  const cleanText = (markdownText: string) => {
    let text = removeMarkdown(markdownText);
    text = text.replace(/\s*###\s*/g, " ");
    text = text.replace(/\s*##\s*/g, " ");
    text = text.replace(/\s*#\s*/g, " ");
    text = text.replace(/\s*-\s*/g, " ");
    return text.trim();
  };

  const extractHeadingAndContent = (markdownText: string) => {
    const lines = markdownText.split("\n").filter(Boolean);
    const heading = cleanText(lines[0] || "Untitled Note");
    const content = cleanText(lines.slice(1).join(" "));
    return { heading, content };
  };

  const handleNoteClick = (noteId: string, heading: string) => {
    toast.info(`Loading "${heading}"...`);
    router.push(`/my_notes/note?id=${noteId}`);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-center items-center gap-3 mb-6">
        
        <h1 className="text-4xl font-bold text-gray-900">My Notes</h1>
        <NotebookText className="w-10 h-10" />
      </div>

      <Tabs
        defaultValue="summaries"
        value={selectedType}
        onValueChange={(value) =>
          setSelectedType(value as "summaries" | "flashcards" | "quizzes")
        }
        className="mb-6 p-px"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summaries">Summaries</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
        </TabsList>

        {loading ? (
          <p className="flex justify-center items-center h-screen">
            Loading...
          </p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            {/* Summaries Tab */}
            <TabsContent value="summaries">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => {
                  const { heading, content } = extractHeadingAndContent(
                    note.summary
                  );

                  return (
                    <div
                      key={note.id}
                      onClick={() => handleNoteClick(note.id, heading)}
                      className="p-4 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        {heading}
                      </h2>
                      <p className="text-gray-700 text-sm line-clamp-3">
                        {content}
                      </p>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Flashcards Tab */}
            <TabsContent value="flashcards">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flashcards.length > 0 ? (
                  flashcards.map((set) => (
                    <div
                      key={set.id}
                      onClick={() =>
                        router.push(`/my_notes/flashcard?id=${set.id}`)
                      }
                      className="p-4 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <h2 className="text-l font-semibold text-gray-900 text-center">
                        {set.title}
                      </h2>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">
                    No flashcards found.
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Quizzes Tab */}
            <TabsContent value="quizzes">
              <p className="text-gray-500 text-center">
                Quizzes feature coming soon!
              </p>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default MyNotes;

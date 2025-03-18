"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import {
  fetchNotes,
  fetchFlashcards,
  fetchQuizzes,
  fetchQuizQuestions,
  deleteQuiz,
} from "@/app/actions/dashboard_actions";
import removeMarkdown from "remove-markdown";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenTextIcon, NotebookText, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [quiz, setQuiz] = useState<
    {
      id: string;
      title: string;
      topic: string;
      num_questions: number;
      difficulty: string;
    }[]
  >([]);

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
        } else if (selectedType === "quizzes") {
          const fetchedQuizzes = await fetchQuizzes();
          if (Array.isArray(fetchedQuizzes) && fetchedQuizzes.length > 0) {
            setQuiz(fetchedQuizzes);
          } else {
            console.warn("No Quizzes found.");
            setQuiz([]);
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

  async function handleQuizClick(quizId: string) {
    setLoading(true);
    try {
      const data = await fetchQuizQuestions(quizId);
      if (Array.isArray(data)) {
        const formattedQuiz = data.map((q: any) => ({
          question: q.question_text,
          options: {
            A: q.option_a,
            B: q.option_b,
            C: q.option_c,
            D: q.option_d,
          },
          correct_option: q.correct_option,
        }));
        localStorage.setItem("quiz", JSON.stringify(formattedQuiz));
        console.log(formattedQuiz);
      }
      const quizInfo = quiz.find((q) => q.id === quizId);
      if (quizInfo) {
        localStorage.setItem("quizInfo", JSON.stringify(quizInfo));
        console.log(quizInfo);
      }
    } catch (error) {
      console.log("Error fetching quiz:", error);
    } finally {
      setLoading(false);
      toast.success("Local storage is loaded, take your quiz now!");
      router.push("/quiz-generator/quiz-component");
    }
  }

  async function handleQuizDelete(quizId: string) {
    setLoading(true); // Show loading state

    try {
      const { error } = await deleteQuiz(quizId); // Call deletion function
      if (error) {
        toast.error("An error has occured");
        console.log("Error:", error);
      }

      toast.success("Quiz deleted successfully!");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Failed to delete quiz.");
    } finally {
      setLoading(false);
      toast.success("Quiz Deleted!");
      router.push("/my_notes");
    }
  }

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {loading && (
                  <div className="text-center text-lg font-bold">
                    Loading...
                  </div>
                )}

                {quiz.length > 0 ? (
                  quiz.map((quiz) => (
                    <div
                      key={quiz.id}
                      onClick={() => handleQuizClick(quiz.id)}
                      className="p-4 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="flex justify-between items-center px-4 w-full">
                        <div>
                          <h2 className="text-lg font-semibold">
                            {quiz.title}
                          </h2>
                          <p className="text-gray-600">
                            {quiz.topic} - {quiz.difficulty}
                          </p>
                          <p className="text-sm text-gray-500">
                            Total questions: {quiz.num_questions}
                          </p>
                        </div>

                        <div className="bottom-2 right-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={(e) => e.stopPropagation()}
                              >
                                  <Trash2/>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. Do you want to
                                  permanently delete this quiz?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleQuizDelete(quiz.id)}
                                >
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No quizzes found.</p>
                )}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default MyNotes;

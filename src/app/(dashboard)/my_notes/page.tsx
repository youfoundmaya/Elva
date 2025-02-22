"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchNotes, fetchFlashcards } from "@/app/actions/dashboard_actions"; // Fetch flashcards too
import removeMarkdown from "remove-markdown";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";


const MyNotes = () => {
  const [notes, setNotes] = useState<{ id: string; summary: string }[]>([]);
  const [flashcards, setFlashcards] = useState<{ id: string; title: string; cards: { question: string; answer: string }[] }[]>([]);
  const [selectedType, setSelectedType] = useState<"summaries" | "flashcards" | "quizzes">("summaries");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function getData() {
      setLoading(true);
      try {
        if (selectedType === "summaries") {
          const fetchedNotes = await fetchNotes();
          setNotes(fetchedNotes || []);
        } else if (selectedType === "flashcards") {
          const fetchedFlashcards = await fetchFlashcards();
          setFlashcards(Array.isArray(fetchedFlashcards) ? fetchedFlashcards : []); 
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
      <div className="flex gap-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">My Notes</h1>

      {/* Select Dropdown to filter Summaries, Flashcards, Quizzes */}
      <div className="mb-6">
        <Select onValueChange={(value) => setSelectedType(value as "summaries" | "flashcards" | "quizzes")} value={selectedType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summaries">Summaries</SelectItem>
            <SelectItem value="flashcards">Flashcards</SelectItem>
            <SelectItem value="quizzes">Quizzes</SelectItem> {/* Future feature */}
          </SelectContent>
        </Select>
      </div>

      </div>
      {loading ? (
        <p className="flex justify-center items-center h-screen">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : selectedType === "summaries" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => {
            const { heading, content } = extractHeadingAndContent(note.summary);

            return (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note.id, heading)}
                className="p-4 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow cursor-pointer"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{heading}</h2>
                <p className="text-gray-700 text-sm line-clamp-3">{content}</p>
              </div>
            );
          })}
        </div>
      ) : selectedType === "flashcards" ? (
        <div className="flex justify-center">
            {selectedType === "flashcards" ? (
  flashcards.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {flashcards.map((set) => (
        <div key={set.id} className="p-4 border rounded-lg shadow-md bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{set.title}</h2>
          <div className="flex flex-wrap gap-4">
            {set.cards.map((card, index) => (
              <FlipCard key={index} question={card.question} answer={card.answer} />
            ))}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-center">No flashcards found.</p>
  )
) : null}

        </div>
      ) : (
        <p className="text-gray-500 text-center">Quizzes feature coming soon!</p>
      )}
    </div>
  );
};

const FlipCard = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      className="relative w-80 h-48 text-bold cursor-pointer perspective-1000"
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        className={`absolute inset-0 w-full text-bold h-full rounded-lg shadow-lg transition-transform duration-500 ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        <Card className="absolute w-full h-full flex items-center justify-center text-center text-bold p-6 bg-gray-100">
          {flipped ? answer : question}
        </Card>
      </motion.div>
    </motion.div>
  );
};


export default MyNotes;

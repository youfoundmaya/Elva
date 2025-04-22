"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchFlashcards, deleteFlashcard } from "@/app/actions/dashboard_actions";
import { toast } from "sonner";
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
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

// FlipCard component
const FlipCard = ({ question, answer }: { question: string; answer: string }) => {
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

const FlashcardContent = () => {
  const searchParams = useSearchParams();
  const flashcardId = searchParams.get("id");
  const [flashcardSet, setFlashcardSet] = useState<{ title: string; cards: { question: string; answer: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getFlashcardSet() {
      setLoading(true);
      try {
        const allFlashcards = await fetchFlashcards();
        if (!Array.isArray(allFlashcards)) {
          toast.error("Failed to load flashcards.");
          setFlashcardSet(null);
          setLoading(false);
          return;
        }
        const selectedSet = allFlashcards.find((set) => String(set.id) === String(flashcardId));
        setFlashcardSet(selectedSet || null);
      } catch (err) {
        toast.error("Failed to load flashcard set.");
        setFlashcardSet(null);
      } finally {
        setLoading(false);
      }
    }
    if (flashcardId) {
      getFlashcardSet();
    }
  }, [flashcardId]);

  const handleDelete = async () => {
    if (!flashcardId) return;
    try {
      await deleteFlashcard(flashcardId);
      toast.success("Note deleted successfully!");
      router.push("/my_notes");
    } catch (error) {
      toast.error("Failed to delete note.");
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (!flashcardSet) {
    return <p className="text-center text-gray-500">Flashcard set not found.</p>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Do you want to permanently delete this flashcard set?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete Permanently</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">{flashcardSet.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcardSet.cards.map((card, index) => (
          <FlipCard key={index} question={card.question} answer={card.answer} />
        ))}
      </div>
    </>
  );
};

export default FlashcardContent;

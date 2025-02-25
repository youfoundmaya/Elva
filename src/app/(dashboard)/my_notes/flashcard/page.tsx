"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchFlashcards } from "@/app/actions/dashboard_actions";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const FlashcardPage = () => {
  const searchParams = useSearchParams();
  const flashcardId = searchParams.get("id"); // Get flashcard ID from URL
  const [flashcardSet, setFlashcardSet] = useState<{ title: string; cards: { question: string; answer: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); 

  useEffect(() => {
    async function getFlashcardSet() {
        setLoading(true);
        try {
          const allFlashcards = await fetchFlashcards();
      
          // Ensure we have an array before calling `.find()`
          if (!Array.isArray(allFlashcards)) {
            console.error("Unexpected response:", allFlashcards);
            toast.error("Failed to load flashcards.");
            setFlashcardSet(null);
            setLoading(false);
            return;
          }
      
          // Find the selected flashcard set
          const selectedSet = allFlashcards.find((set) => String(set.id) === String(flashcardId));
      
          setFlashcardSet(selectedSet || null);
        } catch (err) {
          console.error("Error fetching flashcards:", err);
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

  return (
    <div className="min-h-screen p-8">
      <Button
        variant="outline"
        className="mb-4 flex justify-start"
        onClick={() => router.back()}
      >
        Back
      </Button>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : flashcardSet ? (
        
        <div>
            
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">{flashcardSet.title}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcardSet.cards.map((card, index) => (
              <FlipCard key={index} question={card.question} answer={card.answer} />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">Flashcard set not found.</p>
      )}
    </div>
  );
};

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

export default FlashcardPage;

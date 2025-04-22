"use client";
import { Suspense } from "react";
import FlashcardContent from "./FlashcardComponent"; 

const FlashcardPage = () => (
  <div className="min-h-screen p-8">
    <Suspense fallback={<p className="text-center text-gray-500">Loading...</p>}>
      <FlashcardContent />
    </Suspense>
  </div>
);

export default FlashcardPage;

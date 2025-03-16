"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card"; // Import ShadCN Card
import { motion } from "framer-motion";
import { getDocument } from "pdfjs-dist";
import { useRouter } from "next/navigation";
import "pdfjs-dist/build/pdf.worker.mjs";
import mammoth from "mammoth";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveFlashcards } from "@/app/actions/dashboard_actions";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookCopy, Library, SquareLibrary } from "lucide-react";

const FlashCards = () => {
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [flashcards, setFlashcards] = useState<
    { question: string; answer: string }[]
  >([]);
  const router = useRouter();
  const [flashcardCount, setFlashcardCount] = useState(40);

  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState("");

  async function generateFlashcards(text: string) {
    setLoading(true);
    setFlashcards([]);

    try {
      const prompt = `Generate exactly ${flashcardCount} high-quality flashcards from the following content. Each flashcard should have a "Question" and a short but precise "Answer". Use a structured JSON format as:
      [
        {"question": "Question 1?", "answer": "Answer 1"},
        {"question": "Question 2?", "answer": "Answer 2"},
        ...
      ].
      Return ONLY the JSON array. Do not include any other text or markdown.
      Content: \n\n${text}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
          }),
        }
      );

      const data = await response.json();

      let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      console.log("Raw AI Output:", rawText);

      // Remove Markdown code block
      rawText = rawText.replace(/^```json\n/, "").replace(/\n```$/, "");

      try {
        const parsedFlashcards = JSON.parse(rawText);
        setFlashcards(parsedFlashcards);
      toast.success("Flashcards generated successfully!");
      } catch (error) {
        console.error("Invalid JSON response:", rawText);
        toast.error("AI response is not valid JSON. Try again.");
      }

      /*  if (parsedFlashcards.length < 40) throw new Error("Insufficient flashcards generated"); */

      
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast.error("Failed to generate flashcards. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (!e.target?.result) return;
      let extractedText = "";
      try {
        if (file.name.endsWith(".docx")) {
          console.log("Processing DOCX file...");
          extractedText = await extractDocxText(file);
        } else if (file.name.endsWith(".pdf")) {
          extractedText = await extractPdfText(e.target.result as ArrayBuffer);
        } else if (file.name.endsWith(".md") || file.name.endsWith(".txt")) {
          extractedText = e.target.result as string;
        } else {
          toast.error("Unsupported File", {
            description: "Please upload a DOCX, MD, TXT, or PDF file.",
          });
          return;
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        toast.error("File Processing Error", {
          description: "Failed to extract text from the file.",
        });
        return;
      }
      setInputText(extractedText.trim());
    };
    if (file.name.endsWith(".md") || file.name.endsWith(".txt")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }

  async function extractDocxText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;

          // ✅ Use Mammoth first (it handles plain text well)
          try {
            const mammothResult = await mammoth.extractRawText({ arrayBuffer });
            if (mammothResult.value.trim()) {
              resolve(mammothResult.value.trim());
              return;
            }
          } catch (mammothError) {
            console.warn("Mammoth failed, falling back to Docxtemplater...");
          }

          // ✅ PizZip with error handling
          let zip;
          try {
            zip = new PizZip(arrayBuffer);
          } catch (zipError) {
            console.error("PizZip error:", zipError);
            reject(
              "Error unzipping DOCX file. It may be corrupted or protected."
            );
            return;
          }

          // ✅ Use Docxtemplater as a fallback
          try {
            const doc = new Docxtemplater(zip, {
              paragraphLoop: true,
              linebreaks: true,
            });
            resolve(doc.getFullText().trim() || "No text found.");
          } catch (docError: any) {
            console.error("Docxtemplater error:", docError);
            reject(
              `Error extracting DOCX text: ${
                docError.message || "Unknown error"
              }`
            );
          }
        } catch (error) {
          reject("Error processing DOCX file.");
        }
      };

      reader.onerror = () => reject("File reading error.");
      reader.readAsArrayBuffer(file);
    });
  }

  async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
    try {
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n";
      }
      return text.trim() || "No text found in PDF.";
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      return "Failed to extract text from PDF.";
    }
  }

  const handleSave = async () => {
    if (flashcards.length === 0) {
      toast.error("No flashcards to save!", {
        description: "Generate flashcards first before saving.",
      });
      return;
    }

    if (!title.trim()) {
      toast.error("Title cannot be empty!");
      return;
    }

    try {
      const result = await saveFlashcards(title.trim(), flashcards);

      if (result?.error) {
        // Explicit check for error existence
        toast.error("Failed to save flashcards", { description: result.error });
      } else {
        toast.success("Flashcards saved successfully!");
        setFlashcards([]);
        setInputText("");
        setShowDialog(false);
        setTitle("");
        router.push(`my_notes`);
      }
    } catch (error) {
      console.error("Error saving flashcards:", error);
      //toast.error("Unexpected error while saving.");
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        Prepare Flashcards
        <SquareLibrary className="w-10 h-10" />
      </h1>

      <p className="text-gray-700 mb-6 text-center max-w-xl">
        Upload a DOCX, MD, TXT, or PDF file to prepare flashcards, or enter a
        topic in the text box.
      </p>
      <br/>
      <p>
        Note: Minimum 20, and maximum 100 flashcards can be generated as of now.
      </p>

      <div className="flex gap-5">
        <input
          type="file"
          accept=".docx,.pdf,.md,.txt"
          onChange={handleFileUpload}
          className="p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Or paste text here..."
          className="w-full p-4 border rounded-lg resize-none shadow-sm focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>
      <div className="flex gap-4 p-4">
        {/* Adds spacing between buttons */}

        {flashcards.length > 0 && (
          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogTrigger asChild>
              <button
                className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
                onClick={() => setShowDialog(true)}
              >
                Add to Notes
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Save Flashcards</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter a title for this flashcard set.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <Input
                type="text"
                placeholder="Enter title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <AlertDialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <FlashcardSelector onChange={(num) => setFlashcardCount(num)} />

        <button
          onClick={() => generateFlashcards(inputText)}
          className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
          disabled={loading || !inputText.trim()}
        >
          {loading ? "Generating Flashcards..." : "Prepare Flashcards"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {flashcards.map((card, index) => (
          <FlipCard key={index} question={card.question} answer={card.answer} />
        ))}
      </div>
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


function FlashcardSelector({ onChange }: { onChange: (num: number) => void }) {
  const [count, setCount] = useState(40); 

  const updateCount = (value: number) => {
    const newCount = Math.max(20, Math.min(100, count + value)); 
    setCount(newCount);
    onChange(newCount);
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => updateCount(-1)}>-</Button>
      <span className="px-4 py-2 border rounded">{count}</span>
      <Button onClick={() => updateCount(1)}>+</Button>
    </div>
  );
}



export default FlashCards;

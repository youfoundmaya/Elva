"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";
import { getDocument } from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";
import mammoth from "mammoth";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { saveNote } from "@/app/actions/dashboard_actions";
import { redirect } from "next/navigation";
import { ArrowDownAZ, SpellCheck } from "lucide-react";

const Summary: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs",
        import.meta.url
      ).toString();
    }
  }, []);

  useEffect(() => {
    if (summary) {
      toast.success(
        "Summary has been generated. Add it to your notes for future reference!"
      );
    }
  }, [summary]);

  async function summarizeText(text: string) {
    setLoading(true);
    setSummary("");

    try {
      const prompt = `Summarize the following text in a structured format with headings, 
      subheadings, bullet points, concise and small mostly 1 or 2 line explanation, 
      including only what is important. Make sure to give the output in markdown. 
      ONLY INCLUDE THE TOPIC HEADING in heading 1, there can be multiple subtopic/subtopics in 
      heading 2 and if more subtopics in heading 3, if there is a list, and list has a header 
      then make the header bold; if italics is used, use it only for some important WORDS only. 
      if italics is used for a topic then make it bold as well.  :\n\n${text}`;

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
      setSummary(
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No summary generated."
      );
    } catch (error) {
      console.error("Error summarizing text:", error);
      setSummary("Error generating summary.");
    } finally {
      setLoading(false);
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

  const handleAddToNotes = async () => {
    if (!summary) return;
    const result = await saveNote(summary);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Note added successfully!");
      redirect("/my_notes");
    }
  };

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSummary("");
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
  return (
    
    <div className="flex flex-col items-center min-h-screen p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-2 p-3">
        Smart Summary
        <ArrowDownAZ className="w-10 h-10" />      
      </h1>
      <p className="text-gray-700 mb-6 text-center max-w-xl">
        Upload a DOCX, MD, TXT, or PDF file to prepare quizzes
        <br />
        Or simply type the topic!
      </p>
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-8 space-y-6">
        {/* File Upload Input */}
        <div className="w-full">
          <input
            type="file"
            accept=".docx,.pdf,.md,.txt"
            onChange={handleFileUpload}
            className="block w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Or paste text here..."
            className="w-full p-4 border rounded-lg resize-none shadow-sm focus:ring-2 focus:ring-blue-500"
            rows={5}
          />
          <div className="flex justify-between">
            <div className="flex justify-start">
              {summary.trim() && (
                <button
                  onClick={handleAddToNotes}
                  className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
                >
                  Add to Notes
                </button>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => summarizeText(inputText)}
                className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
                disabled={loading || !inputText.trim()}
              >
                {loading ? "Summarizing..." : "Summarize"}
              </button>
            </div>
          </div>
        </div>

        {summary && (
          <div className="p-6 border rounded-lg bg-gray-50 shadow-sm">
            <ReactMarkdown
              className="prose prose-lg prose-gray dark:prose-invert"
              remarkPlugins={[remarkGfm]}
            >
              {summary}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;

"use client";

import React, { useState } from "react";
import mammoth from "mammoth";

const Summary: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function summarizeText(text: string) {
    setLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 256,
            },  safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
          }),
        }
      );
  
      const data = await response.json();
      console.log("API Response:", data);
  
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        setSummary(data.candidates[0].content.parts[0].text);
      } else {
        setSummary("No summary generated. Check API response.");
      }
    } catch (error) {
      console.error("Error summarizing text:", error);
      setSummary("Error generating summary.");
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

      const arrayBuffer = e.target.result as ArrayBuffer;
      const result = await mammoth.extractRawText({ arrayBuffer });
      setInputText(result.value || "No text found in DOCX.");
    };

    reader.readAsArrayBuffer(file);
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Summarization</h1>
      <p className="text-gray-700 mb-6 text-center max-w-lg">
        Upload a DOCX file or paste text below to generate a summary.
      </p>

      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6">
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">
            Upload DOCX:
            <input
              type="file"
              accept=".docx"
              onChange={handleFileUpload}
              className="block w-full mt-2 p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>

        <div className="mb-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Or paste text here..."
            className="w-full p-4 border rounded-lg resize-none shadow-sm focus:ring-2 focus:ring-blue-500"
            rows={5}
          />
        </div>

        <div className="mb-4 flex justify-end">
          <button
            onClick={() => summarizeText(inputText)}
            className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
            disabled={loading || !inputText.trim()}
          >
            {loading ? "Summarizing..." : "Summarize"}
          </button>
        </div>

        {summary && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">Summary:</h2>
            <p className="mt-2 text-gray-700">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;

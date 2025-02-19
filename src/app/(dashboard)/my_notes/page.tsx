"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchNotes } from "@/app/actions/dashboard_actions";
import removeMarkdown from "remove-markdown";
import { toast } from "sonner";

const MyNotes = () => {
  const [notes, setNotes] = useState<{ id: string; summary: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function getNotes() {
      try {
        const fetchedNotes = await fetchNotes();
        if (!fetchedNotes || fetchedNotes.length === 0) {
          setError("No notes found.");
        } else {
          setNotes(fetchedNotes);
        }
      } catch (err) {
        console.error("Error fetching notes:", err);
        setError("Failed to load notes. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    getNotes();
  }, []);

  const cleanText = (markdownText: string) => {
    let text = removeMarkdown(markdownText);
    text = text.replace(/\s*###\s*/g, " "); // Remove "###"
    text = text.replace(/\s*##\s*/g, " "); // Remove "##"
    text = text.replace(/\s*#\s*/g, " "); // Remove "#"
    text = text.replace(/\s*-\s*/g, " "); // Remove "- " (bullet points)
    return text.trim();
  };

  const extractHeadingAndContent = (markdownText: string) => {
    const lines = markdownText.split("\n").filter(Boolean); // Remove empty lines
    const heading = cleanText(lines[0] || "Untitled Note"); // Clean heading
    const content = cleanText(lines.slice(1).join(" ")); // Clean content
    return { heading, content };
  };

  const handleNoteClick = (noteId: string, heading: string) => {
    toast.info(`Loading "${heading}"...`);
    router.push(`/my_notes/note?id=${noteId}`);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">My Notes</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => {
            const { heading, content } = extractHeadingAndContent(note.summary);

            return (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note.id, heading)}
                className="p-4 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* ✅ Heading displayed as plain text */}
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {heading}
                </h2>
                
                {/* ✅ Content displayed as plain text */}
                <p className="text-gray-700 text-sm line-clamp-3">
                  {content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyNotes;

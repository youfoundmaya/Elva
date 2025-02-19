"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchNotes } from "@/app/actions/dashboard_actions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const NotePage = () => {
  const searchParams = useSearchParams();
  const noteId = searchParams.get("id");

  const [note, setNote] = useState<{ id: string; summary: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allNotes, setAllNotes] = useState<{ id: string; summary: string }[]>([]);

  useEffect(() => {
    async function getNote() {
      try {
        const fetchedNotes = await fetchNotes();
        console.log("Fetched notes:", fetchedNotes); // Debug log

        if (!fetchedNotes || fetchedNotes.length === 0) {
          setError("No notes available.");
          return;
        }

        setAllNotes(fetchedNotes); // Store all notes for debugging

        // Convert noteId to string since fetched note IDs might be numbers
        const foundNote = fetchedNotes.find((n) => String(n.id) === String(noteId));

        if (!foundNote) {
          setError("Note not found.");
        } else {
          setNote(foundNote);
        }
      } catch (err) {
        console.error("Error fetching note:", err);
        setError("Failed to load note.");
      } finally {
        setLoading(false);
      }
    }

    if (noteId) {
      getNote();
    } else {
      setError("Invalid note ID.");
      setLoading(false);
    }
  }, [noteId]);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Note Details</h1> {/* ✅ Moved Outside Card */}

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="p-6 border rounded-lg shadow-md bg-white">
          <ReactMarkdown className="prose">{note?.summary}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default NotePage;

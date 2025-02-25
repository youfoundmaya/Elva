"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchNotes, deleteNote } from "@/app/actions/dashboard_actions"; // Make sure deleteNote function exists
import ReactMarkdown from "react-markdown";
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
import { toast } from "sonner";

const NotePage = () => {
  const searchParams = useSearchParams();
  const noteId = searchParams.get("id");
  const router = useRouter();

  const [note, setNote] = useState<{ id: string; summary: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getNote() {
      try {
        const fetchedNotes = await fetchNotes();

        if (!fetchedNotes || fetchedNotes.length === 0) {
          setError("No notes available.");
          return;
        }

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

  // Function to delete the note
  const handleDelete = async () => {
    if (!noteId) return;

    try {
      await deleteNote(noteId); // Ensure this function is defined in your actions
      toast.success("Note deleted successfully!");
      router.push("/my_notes"); // Redirect after deletion
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note.");
    }
  };

  return (
    <div className="min-h-screen p-8">
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
                This action cannot be undone. Do you want to permanently delete this note?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete Permanently</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">Note Details</h1>

      {loading ? (
        <p className="flex justify-center items-center h-screen">Loading...</p>
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

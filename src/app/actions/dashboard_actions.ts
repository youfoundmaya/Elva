'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveNote(summary: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "User not authenticated" };

    const { error } = await supabase
        .from("notes")
        .insert([{ user_id: user.id, summary }]);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/my_notes"); // Refresh notes page
    return { success: true };
}

export async function fetchNotes() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("notes")
        .select("id, summary")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return data || [];
}

export async function saveFlashcards(title: string, flashcards: { question: string; answer: string }[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "User not authenticated" };
    if (!title.trim() || flashcards.length === 0) return { error: "Title and flashcards cannot be empty" };

    const { error } = await supabase
        .from("flashcards")
        .insert([
            {
                user_id: user.id,
                title,
                cards: flashcards, // Store flashcards as JSONB
            }
        ]);

    if (error) return { error: error.message };

    revalidatePath("/dashboard"); 
    return { success: true };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveNote(summary: string) {
const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("notes")
    .select("id, summary")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function deleteNote(noteId: string) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId);
  
      if (error) {
        console.error("Error deleting note:", error.message);
        throw new Error("Failed to delete note.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      throw err;
    }
  }

export async function saveFlashcards(
  title: string,
  flashcards: { question: string; answer: string }[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "User not authenticated" };
  if (!title.trim() || flashcards.length === 0)
    return { error: "Title and flashcards cannot be empty" };

  const { error } = await supabase.from("flashcards").insert([
    {
      user_id: user.id,
      title,
      cards: flashcards, // Store flashcards as JSONB
    },
  ]);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function fetchFlashcards() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "User not authenticated" };

  const { data, error } = await supabase
    .from("flashcards")
    .select("id, title, cards")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching flashcards:", error);
    return { error: error.message };
  }

  return data || [];
}

export async function deleteFlashcard(flashcardId : string){
    try {
        const supabase = await createClient();
        const { error } = await supabase
        .from("flashcards")
        .delete()
        .eq("id", flashcardId);
  
      if (error) {
        console.error("Error deleting note:", error.message);
        throw new Error("Failed to delete note.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      throw err;
    }
  }

  type Message = {
    role: "user" | "assistant";
    text: string;
  };
  
  export async function saveChat(chatId: string | null, title: string, messages: Message[]) {
    try {
      const supabase = await createClient();
      const user = await supabase.auth.getUser(); // Get authenticated user
      if (!user.data?.user) {
        throw new Error("User not authenticated");
      }
  
      const messagesJSON = JSON.stringify(messages); // Convert messages array to JSON
  
      if (chatId) {
        // ✅ Update existing chat
        const { error } = await supabase
          .from("chats")
          .update({ messages: messagesJSON }) // Store as JSON
          .eq("id", chatId)
          .eq("user_id", user.data.user.id); // Ensure the user owns this chat
  
        if (error) throw error;
        return { success: true, id: chatId };
      } else {
        // ✅ Create new chat
        const { data, error } = await supabase
          .from("chats")
          .insert([{ title, messages: messagesJSON, user_id: user.data.user.id }]) // Include user_id
          .select()
          .single();
  
        if (error) throw error;
        return { success: true, id: data.id };
      }
    } catch (error) {
      console.error("Error saving chat:", error);
      return { success: false, error: (error as Error).message };
    }
  }
  
  export const fetchChats = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase.from("chats").select("id, title").eq("user_id",user?.id);

    if (error) {
      console.error("Error fetching chats:", error);
      }
    return data || []

  }; 
  
  export async function fetchChatById(chatId: string) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("chats")
        .select("messages")
        .eq("id", chatId)
        .single();
  
      console.log("Fetched Data from Supabase:", data); // Debugging
  
      if (error || !data) {
        console.error("Error fetching chat:", error);
        throw new Error("Failed to fetch chat");
      }
  
      return Array.isArray(data.messages) ? data.messages : JSON.parse(data.messages);
    } catch (error) {
      console.error("Error fetching chat:", error);
      return [];
    }
  }

  export async function deleteChat(chatId: string) {
    const supabase =  await createClient();
  
    const { error } = await supabase.from("chats").delete().eq("id", chatId);
  
    if (error) {
      console.error("Failed to delete chat:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  }
  
  

export async function saveQuiz(title: string, topic: string, difficulty: string, numQuestions: number) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser(); 
  if (!user.data.user) {
    throw new Error("User not authenticated");
  }
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .insert([{ title, topic, difficulty, num_questions: numQuestions, user_id:user.data.user.id }])
    .select()
    .single()
    
  if (error) {
    console.error("Error saving quiz:", error);
    return error;
  }else {
    console.log("Quiz saved:", quiz);
    return quiz
  }
}

export async function saveQuestions(quizId: number, questions: any[]) {
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    console.error("Invalid questions array:", questions);
    throw new Error("No valid questions to save.");
  }

  const formattedQuestions = questions.map((q) => ({
    quiz_id: quizId, // Foreign key from quizzes table
    question_text: q.question, // Mapping from original object
    option_a: q.options.A, // Extract options properly
    option_b: q.options.B,
    option_c: q.options.C,
    option_d: q.options.D,
    correct_option: q.correct_option, // Already formatted
  }));

  console.log("Formatted Questions:", formattedQuestions);

  const supabase = await createClient();
  const { error } = await supabase
    .from("questions")
    .insert(formattedQuestions);

  if (error) {
    console.error("Error saving questions:", error);
    throw new Error("Failed to save questions.");
  }

  console.log("Questions saved successfully!");
}

export const fetchQuizzes = async () => {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  if (!user.data.user) return { error: 'User not authenticated' };

  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('user_id', user.data.user.id);

  if (error) {
    console.error('Error fetching quizzes:', error);
    return { error: error.message };
  }

return data || [];

};

export const fetchQuizQuestions = async (quizId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quizId); 

  if (error) {
    console.error('Error fetching questions:', error);
    return  error ;
  }

  return data ;
};

export const deleteQuiz = async (quizId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", quizId); // Delete where id matches
  return {error}
}
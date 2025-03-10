"use client";
import { useState, useEffect, useId } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquareMore,
  MessageSquarePlus,
  MessageSquareReply,
  MessagesSquare,
  Save,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  saveChat,
  fetchChats,
  fetchChatById,
  deleteChat,
} from "@/app/actions/dashboard_actions";
import { useRef } from "react"; // Import useRef

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [chatTitle, setChatTitle] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [loadingChats, setLoadingChats] = useState(false);
  const [savedChats, setSavedChats] = useState<{ id: string; title: string }[]>(
    []
  ); // State for saved chat titles
  const [hasChats, setHasChats] = useState(false);
  const router = useRouter();
  const toastID = useId();

  async function getChats() {
    setLoadingChats(true);
    console.log("Fetching saved chats...");

    const fetchedChats = await fetchChats();
    console.log("Fetched Chats:", fetchedChats);

    if (Array.isArray(fetchedChats) && fetchedChats.length > 0) {
      setSavedChats(fetchedChats);
      setHasChats(true); // Ensure button appears
    } else {
      setSavedChats([]);
      setHasChats(false);
    }

    setLoadingChats(false);
  }

  useEffect(() => {
    setHasChats(savedChats.length > 0); // Ensure UI updates when chats change
  }, [savedChats]); // Track savedChats updates

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // Trigger when messages change

  useEffect(() => {
    getChats();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", text: input };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const prompt = `Provide a clear and concise response to the following input in at most 5 lines. Do not use bullet points, markdown, or any formatting. Keep it direct and easy to understand. Input:\n\n${input}`;

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

      const aiMessage: Message = {
        role: "assistant",
        text:
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          data?.candidates?.[0]?.parts?.[0]?.text ||
          "I'm not sure how to respond.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message", { id: toastID });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Error generating response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChat = async () => {
    try {
      if (!chatId && !chatTitle.trim()) {
        toast.error("Please enter a title!");
        return;
      }
  
      console.log("Saving chat with ID:", chatId, "and messages:", messages); // Debugging
  
      const result = await saveChat(chatId, chatTitle, messages);
  
      if (result.success) {
        setShowSaveDialog(false);
  
        if (!chatId) {
          console.log("New chat saved with ID:", result.id); // Debugging
          setChatId(result.id);
        }
  
        toast.success("Chat saved successfully!");
      } else {
        console.error("Save error:", result.error); // Debugging
        toast.error(result.error ? String(result.error) : "Failed to save chat.");
      }
    } catch (error) {
      console.error("Error saving chat:", error);
      toast.error("Something went wrong while saving.");
    }
  };
  
  
  
  const handleChatClick = async (id: string) => {
    console.log("Selected Chat ID:", id); // Debugging
    if (!id) {
      toast.error("Invalid chat ID.", { id: toastID });
      return;
    }

    const chatMessages = await fetchChatById(id);

    if (chatMessages?.messages) {
      const parsedMessages: Message[] = JSON.parse(chatMessages.messages);
      setMessages(parsedMessages);
    } else {
      setMessages([]);
    }

    if (chatMessages.length > 0) {
      setMessages(chatMessages);
      setShowChatDialog(false);
      toast.success("Chat restored!", { id: toastID });
    } else {
      toast.error("Length is less than 0", { id: toastID });
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    const result = await deleteChat(chatId);

    if (result.success) {
      toast.success("Chat deleted successfully.", { id: toastID });
      setSavedChats((prevChats) =>
        prevChats.filter((chat) => chat.id !== chatId)
      );
    } else {
      toast.error(`Failed to delete chat: ${result.error}`, { id: toastID });
    }
  };
  const handleNewChat = () => {
    setMessages([]);
    toast.success("Started a new chat!", { id: toastID });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
          Elva
          <MessagesSquare className="w-10 h-10" />
        </h1>
        <div className="flex gap-2">
        {messages.length > 0 && (

          <Button variant="outline" onClick={handleNewChat}>
            <MessageSquarePlus className="mr-2 w-5 h-5" /> New Chat
          </Button>
        )}
          {messages.length > 0 && (
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Save className="mr-2 w-5 h-5" /> Save Chat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Save Conversation</DialogTitle>
                <DialogDescription>
                  Enter a title for this chat session.
                </DialogDescription>

                <Input
                  value={chatTitle}
                  onChange={(e) => setChatTitle(e.target.value)}
                  placeholder="Enter chat title..."
                  className="mt-2"
                />

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveChat} disabled={!chatTitle.trim()}>
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {hasChats && (
            <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setShowChatDialog(true)}
                >
                  <MessageSquareReply className="mr-2 w-5 h-5" /> View saved
                  chats
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Your saved chats</DialogTitle>
                <DialogDescription>
                  Select any chat to continue:
                </DialogDescription>
                <div className="w-full">
                  {loadingChats ? (
                    <p className="text-gray-500 text-center">
                      Loading saved chats...
                    </p>
                  ) : (
                    savedChats.map((chat) => (
                      <ul
                        key={chat.id}
                        className="flex justify-between items-center p-3 border-b"
                      >
                        <Button
                          variant="ghost"
                          onClick={() => handleChatClick(chat.id)}
                          className="cursor-pointer text-md"
                        >
                          {chat.title}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleDeleteChat(chat.id)}
                          className="cursor-pointer p-2 hover:bg-gray-200 rounded-md"
                        >
                          <Trash2 className="text-red-600" />
                        </Button>
                      </ul>
                    ))
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowChatDialog(false)}
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      <Card
        ref={chatContainerRef}
        className="w-full h-[70vh] p-4 overflow-y-auto border"
      >
        <CardContent className="flex flex-col space-y-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">
              Start a conversation with Elva...
            </p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-[75%] ${
                  msg.role === "user"
                    ? "bg-gray-950 self-end text-white"
                    : "bg-white border outline self-start text-black"
                }`}
              >
                {msg.text}
              </div>
            ))
          )}
          {loading && (
            <p className="text-gray-500 flex items-center">
              <MessageSquareMore className="mr-2" /> Thinking...
            </p>
          )}
        </CardContent>
      </Card>

      <div className="w-full flex mt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something..."
          className="flex-grow"
        />
        <Button onClick={sendMessage} disabled={loading} className="ml-2">
          Send
        </Button>
      </div>
    </div>
  );
}

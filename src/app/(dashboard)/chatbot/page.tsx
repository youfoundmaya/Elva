"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquareMore, MessagesSquare, Save } from "lucide-react";
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
import { saveChat } from "@/app/actions/dashboard_actions";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const router = useRouter();

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", text: input };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const prompt = `Provide a clear and concise response to the following input in at most 5 lines. Do not use bullet points, markdown, or any formatting. Keep it direct and easy to understand. Input:\n\n${input}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
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
          "I'm not sure how to respond.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Error generating response." },
      ]);
    } finally {
      setLoading(false);
    }
  };
  const handleSaveChat = async () => {
    const result = await saveChat(messages);
    if (result.success) setShowSaveDialog(false);
    toast.success("This chat has been saved!");
  };

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
          Elva
          <MessagesSquare className="w-10 h-10" />
        </h1>
        {messages.length > 0 && (
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Save className="mr-2 w-5 h-5" /> Save Chat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Save Conversation?</DialogTitle>
              <DialogDescription>
                Do you want to save this chat session to access later?
              </DialogDescription>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveChat}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="w-full h-[70vh] p-4 overflow-y-auto border">
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

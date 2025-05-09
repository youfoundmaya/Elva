"use client";
import { Grid2X2Check, SquareLibrary } from "lucide-react";
import { getDocument } from "pdfjs-dist";
import React, { useEffect, useId, useState } from "react";
import "pdfjs-dist/build/pdf.worker.mjs";
import mammoth from "mammoth";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { saveQuestions, saveQuiz } from "@/app/actions/dashboard_actions";
import { useRouter } from "next/navigation";


const QuizGenerator = () => {
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [quizInfo, setQuizInfo] = useState<{
    title: string;
    topic: string;
    num_questions: number;
    difficulty: string;
  }>({
    title: "",
    topic: "",
    num_questions: 0,
    difficulty: "Beginner",
  });
  const [quiz, setQuiz] = useState<any>(null);
  const [difficulty, setDifficulty] = useState("Beginner");
  const [questionCount, setQuestionCount] = useState(10);

  const toastId = useId();
  const router = useRouter();

  const generateQuizInfo = async (text: string) => {
    const prompt = `
  Generate a structured JSON object containing a quiz title and topic based on the given text.  
  The title should be **concise, engaging, and relevant** to the content.  
  The topic should be **broad enough to categorize the quiz into one of the popular domains**.  
  
  ### **Format:**
  {
    "title": "Generated Quiz Title",
    "topic": "Relevant Quiz Topic",
    "num_questions": 40,
    "difficulty": "Beginner"
  }
  
  ### **Example Input:**
  Text: "Explain the fundamentals of object-oriented programming with examples of encapsulation, inheritance, and polymorphism with difficulty Easy and 40 number of questions."
  
  ### **Expected Output:**
  {
    "title": "Mastering Object-Oriented Programming",
    "topic": "Computer Science",
    "num_questions": 40,
    "difficulty": "Beginner"
  }
  
  ### **Rules:**
  - **Keep the title under 5**.
  - **Topic should be a single phrase, a domain**, no longer than 3 words.
  - **Return ONLY JSON, without formatting like \` or extra text.**
  
  Text:  
  ${text}
  Difficulty: ${difficulty} and
  Number of questions: ${questionCount}
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
          }),
        }
      );

      const data = await response.json();
      let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      rawText = rawText.replace(/```(?:json)?\n?|```/g, "").trim();

      const quizInformation = JSON.parse(rawText);
      if (!quizInformation.title) {
        throw new Error("Invalid Quiz Info");
      }
      setQuizInfo(quizInformation);
      return quizInformation;
    } catch (error) {
      console.error("Quiz Info Generation Error:", error);
      return { title: "", topic: "" };
    }
  };

  const handleGenerateQuizInfo = async () => {
    if (!inputText.trim()) {
      toast.error("Enter some text to generate the quiz info!", { id: toastId });
      return;
    }
    setLoading(true);
    const generatedQuizInfo = await generateQuizInfo(inputText);
    if (!generatedQuizInfo.title) {
      toast.error("Quiz generation failed.", { id: toastId });
      setLoading(false);
      return;
    }
    const generatedQuiz = await generateQuiz(inputText, generatedQuizInfo);
    console.log(generatedQuiz);
    setLoading(false);
  };

  async function generateQuiz(text: string, quizInfo: any) {
    try {
      console.log("Prompting gemini", quizInfo);
      const prompt = `Generate exactly ${quizInfo.num_questions} sophisticated multiple-choice questions from the following content. 

Each question must:
- Target higher-order thinking skills (analysis, evaluation, application) appropriate for ${quizInfo.difficulty} level
- Avoid surface-level recall and focus on conceptual understanding
- Include nuanced distractors that test for common misconceptions
- Be precisely calibrated to ${quizInfo.difficulty} difficulty (Beginner: foundational concepts; Intermediate: application of concepts; Advanced: synthesis and evaluation; Expert: edge cases and specialized knowledge)
- Maintain complete independence from other questions (no sequential dependencies)
- For technical subjects: include practical application scenarios
- For theoretical subjects: test critical analysis of concepts

Structure requirements:
- "question": Clear, precisely worded question that requires thoughtful analysis
- "options": Four distinct choices (A-D) with plausible distractors that reflect common misconceptions
- "correct_option": Single letter (A, B, C, or D) representing the correct answer
- Strictly adhere to the topic "${quizInfo.topic}" and title "${quizInfo.title}"
- Maintain consistent ${quizInfo.difficulty} level across ALL questions

🚨 CRITICAL CONSTRAINTS:
- Generate EXACTLY ${quizInfo.num_questions} questions - no more, no less
- Distribute correct answers evenly among options A, B, C, and D
- Ensure ZERO redundancy between questions
- Return ONLY a valid JSON array with no explanations, comments, or markdown
- Strictly follow the specified format
- Ensure all distractors are plausible but unambiguously incorrect

Return ONLY this JSON structure:
[
  {
    "question": "Precisely worded, challenging question?",
    "options": {
      "A": "Plausible distractor",
      "B": "Correct answer",
      "C": "Plausible distractor",
      "D": "Plausible distractor"
    },
    "correct_option": "B"
  },
  ...
]

Content for question generation:
${text}

---
Answer from Perplexity: pplx.ai/share

          `;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 100000 },
          }),
        }
      );
      const data = await response.json();
      console.log("Raw API Response:", JSON.stringify(data, null, 2)); // Log full response

      let content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      content = content.replace(/```(?:json)?\n?|```/g, "").trim();

      if (!content || content.trim() === "[]") {
        console.error("No quiz generated, API response was empty:", content);
        throw new Error("Quiz generation failed. Please try again.");
      }

      content = content
        .trim()
        .replace(/```(?:json)?\n?|```/g, "")
        .trim();
      try {
        const generatedQuiz = JSON.parse(content);
        if (!Array.isArray(generatedQuiz) || generatedQuiz.length === 0) {
          throw new Error("Invalid quiz data format");
        }
        console.log("Generated Quiz:", generatedQuiz);
        setQuiz(generatedQuiz);
        return generatedQuiz;
      } catch (error) {
        console.error("JSON Parsing Error:", error, "\nResponse was:", content);
      }
    } catch (error) {
      console.log(error);
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
          toast.error("Unsupported File", { id: toastId });
          return;
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        toast.error("File Processing Error", { id: toastId });
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
              `Error extracting DOCX text: ${docError.message || "Unknown error"
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
    if (!quiz) {
      toast.error("No quiz available to save!", { id: toastId });
      return;
    }
    try {
      const savedQuiz = await saveQuiz(
        quizInfo.title,
        quizInfo.topic,
        quizInfo.difficulty,
        quizInfo.num_questions
      );
      if (!savedQuiz) {
        toast.error("Failed to save quiz.", { id: toastId });
        return;
      }
      console.log(savedQuiz.id)
      if (savedQuiz && savedQuiz.id) {
        console.log("Quiz saved with ID:", savedQuiz.id);
        await saveQuestions(savedQuiz.id, quiz);
        toast.success("Quiz and questions saved successfully!", { id: toastId });
      } else {
        toast.error("Failed to save questions.", { id: toastId });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error has occured, try again!", { id: toastId });
    }
  };

  const attemptQuiz = async () => {
    localStorage.setItem("quiz", JSON.stringify(quiz));
    localStorage.setItem("quizInfo", JSON.stringify(quizInfo));
    router.push("/quiz-generator/quiz-component");
  }

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        Quiz Generator
        <Grid2X2Check className="w-10 h-10" />
      </h1>
      <Card>
        <p className="text-gray-700 m-4 text-center max-w-xl">
          This tool generates multiple-choice questions (MCQs) with four options per question — only one of which is correct.
        </p>
      </Card>

      <p className="text-gray-700 m-3 text-center max-w-xl">
        Upload a DOCX, MD, TXT, or PDF file to prepare quizzes
        <br />
        Or simply type the topic!
      </p>

      <p className="text-gray-900 mb-6 text-center max-w-xl">
        Note: Minimum 10, and maximum 40 questions can be generated as of now.
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
          placeholder="Or Enter a topic here!"
          className="w-full p-4 border rounded-lg resize-none shadow-sm focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="flex gap-4 p-4">
        <NumberSelector onChange={(num) => setQuestionCount(num)} />

        <label className="block mb-2 text-gray-700 font-medium">
          Select Difficulty
        </label>
        <Select onValueChange={(val) => setDifficulty(val)} value={difficulty}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
            <SelectItem value="Expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-4 p-4">
        <button
          onClick={handleGenerateQuizInfo}
          className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
          disabled={loading || !inputText.trim()}
        >
          {loading ? "Generating Quiz..." : "Generate Quiz"}
        </button>
      </div>
      <div className="container max-w-xl p-5">
        {quizInfo.title.length > 0 && toast.success("Your quiz will be ready in a few seconds.", { id: toastId }) && (
          <Card className="flex flex-col justify-center max-h-lg">
            <div className="flex justify-between items-center px-4 w-full">
              <div>
                <CardHeader className="text-xl font-bold">
                  {quizInfo.title}
                </CardHeader>
                <CardContent className="text-lg font-normal">
                  {quizInfo.topic}
                </CardContent>
                <CardDescription>
                  <CardContent>
                    Number of questions: {quizInfo.num_questions}
                    <br />
                    Difficulty: {quizInfo.difficulty}
                  </CardContent>
                </CardDescription>
              </div>

              <div className="flex flex-col items-end gap-4">
                <button
                  className="px-6 py-3 bg-black text-white disabled:bg-gray-500 font-semibold rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
                  onClick={attemptQuiz}
                  disabled={!quiz}
                >
                  Attempt Quiz
                </button>
                <button
                  className="px-6 py-3 bg-black text-white disabled:bg-gray-500 font-semibold rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
                  onClick={handleSave}
                  disabled={!quiz}
                >
                  Save Quiz
                </button>
              </div>
            </div>
            <CardFooter className="flex flex-col items-center justify-center">
              You can also save the quiz after attempting it!
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};


function NumberSelector({ onChange }: { onChange: (num: number) => void }) {
  const [count, setCount] = useState("10");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty input or numbers within range
    if (value === "" || (/^\d+$/.test(value) && Number(value) <= 40)) {
      setCount(value);
      if (value !== "") onChange(Number(value)); // Update in real time
    }
  };

  const handleBlur = () => {
    let num = Number(count);
    if (count === "" || num < 10) num = 10;
    if (num > 40) num = 40;

    setCount(num.toString());
    onChange(num);
  };

  const updateCount = (value: number) => {
    const newCount = Math.max(10, Math.min(40, Number(count) + value));
    setCount(newCount.toString());
    onChange(newCount);
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={() => updateCount(-1)}
        className="px-4 py-2 rounded-lg text-lg bg-gray-800 text-white hover:bg-gray-700"
      >
        −
      </Button>

      <input
        type="text"
        value={count}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="w-20 h-10 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <Button
        onClick={() => updateCount(1)}
        className="px-4 py-2 rounded-lg text-lg bg-gray-800 text-white hover:bg-gray-700"
      >
        +
      </Button>
    </div>
  );
}


export default QuizGenerator;

"use client";
import { saveQuestions, saveQuiz } from "@/app/actions/dashboard_actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";


const AttemptQuiz = () => {
  const router = useRouter();
    const [quiz, setQuiz] = useState<any[]|null>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
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
  useEffect(() => {
    const storedQuiz = localStorage.getItem("quiz");
    if (storedQuiz) {
      setQuiz(JSON.parse(storedQuiz));
    } else {
      console.error("Quiz data not found!");
      router.push("/dashboard"); 
    }
    const storedInfo = localStorage.getItem("quizInfo");
    if (storedInfo) {
      setQuizInfo(JSON.parse(storedInfo));
    } else {
      console.error("Quiz Info data not found!");
    }
  }, []);

  if (!quiz || quiz.length === 0)
    return (
      <p className="ex flex-col items-center justify-center h-screen">
        Loading quiz...
      </p>
    );

  const currentQuestion = quiz[currentIndex] || null;

  const handleOptionClick = (key: string) => {
    setSelectedOption(key);
    setIsCorrect(key === currentQuestion.correct_option);
  };

  const handleSave = async () => {
    if (!quiz) {
      toast.error("No quiz available to save!");
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
        toast.error("Failed to save quiz.");
        return;
      }
      console.log(savedQuiz.id);
      if (savedQuiz && savedQuiz.id) {
        console.log("Quiz saved with ID:", savedQuiz.id);
        await saveQuestions(savedQuiz.id, quiz);
        toast.success("Quiz and questions saved successfully!");
      } else {
        toast.error("Failed to save questions.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error;
    }
  };

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>

        <Button variant="outline" onClick={handleSave}>
          Save Quiz
        </Button>
      </div>
      <div className="flex justify-between items-center w-full px-4 mb-6">
        <div className="flex flex-col gap-5">
          <h1 className="text-4xl font-bold">{quizInfo.title}</h1>
          <p className="text-xl font-bold">
            Question: {currentIndex + 1}/{quizInfo.num_questions}
          </p>
        </div>
        <div className="flex flex-col items-end gap-5">
          <h3 className="text-3xl font-bold">{quizInfo.topic}</h3>
          <p className="text-xl font-bold">Difficulty: {quizInfo.difficulty}</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center h-auto p-8">
        <h2 className="text-2xl font-bold mb-6">
          {currentQuestion ? currentQuestion.question : "Loading question..."}
        </h2>

        <div className="w-full max-w-md space-y-4">
          {Object.entries(currentQuestion.options).map(([key, option]) => {
            const isSelected = key === selectedOption;
            const isRight = isSelected && isCorrect;
            const isWrong = isSelected && !isCorrect;

            return (
              <button
                key={key}
                onClick={() => handleOptionClick(key)}
                className={`w-full bg-white-700 p-4 rounded-lg text-left outline

                ${
                  isSelected
                    ? isRight
                      ? "text-bold bg-green-500 text-white hover:bg-green-600 border-green-600"
                      : "text-bold bg-red-500 text-white border-red-600"
                    : "bg-white-700 hover:bg-gray-200 text-bold"
                }`}
              >
                {key}. {option as string}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between w-full max-w-md mt-6">
          <button
            onClick={() => {
              setCurrentIndex((prev) => Math.max(prev - 1, 0));
              setSelectedOption(null);
              setIsCorrect(null);
            }}
            disabled={currentIndex === 0}
            className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-700 disabled:text-white rounded-lg text-bold"
          >
            Previous
          </button>

          <button
            onClick={() => {
              setCurrentIndex((prev) => Math.min(prev + 1, quiz.length - 1));
              setSelectedOption(null);
              setIsCorrect(null);
            }}
            disabled={currentIndex === quiz.length - 1}
            className="px-6 py-2 text-bold text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-white rounded-lg"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttemptQuiz;

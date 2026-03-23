import QuizEngine from "@/components/quiz/QuizEngine";
import questions from "@/data/questions.json";

export const metadata = { title: "Display Quiz — AVAP Martinique" };

export default function QuizDisplayPage() {
  return <QuizEngine view="display" questions={questions} />;
}

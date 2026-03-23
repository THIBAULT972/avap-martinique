import QuizEngine from "@/components/quiz/QuizEngine";
import questions from "@/data/questions.json";

export const metadata = { title: "Quiz — AVAP Martinique" };

export default function QuizPlayerPage() {
  return <QuizEngine view="player" questions={questions} />;
}

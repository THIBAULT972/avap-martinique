import QuizEngine from "@/components/quiz/QuizEngine";
import questions from "@/data/questions.json";

export const metadata = { title: "Admin Quiz — AVAP Martinique" };

export default function QuizAdminPage() {
  return <QuizEngine view="admin" questions={questions} />;
}

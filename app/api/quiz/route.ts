import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import QRCode from "qrcode";
import questionsData from "@/data/questions.json";

interface Question { id: number; cat: string; q: string; os: string[]; a: number; exp: string }
interface Player { session_id: string; name: string; score: number; streak: number; answered: boolean }

const questions: Question[] = questionsData as Question[];
const QUESTION_TIME = 30;

// ── Helper: broadcast event via Supabase table insert ──
async function broadcast(eventType: string, payload: Record<string, unknown>) {
  const supabase = createServerClient();
  await supabase.from("quiz_events").insert({ event_type: eventType, payload });
}

// ── Helper: get game session ───────────────────────
async function getSession() {
  const supabase = createServerClient();
  const { data } = await supabase.from("game_sessions").select("*").eq("id", "main").single();
  return data;
}

async function updateSession(updates: Record<string, unknown>) {
  const supabase = createServerClient();
  await supabase.from("game_sessions").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", "main");
}

// ── Helper: get players ────────────────────────────
async function getPlayers(): Promise<Player[]> {
  const supabase = createServerClient();
  const { data } = await supabase.from("players").select("*");
  return (data || []) as Player[];
}

async function getLeaderboard() {
  const players = await getPlayers();
  return players
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ rank: i + 1, name: p.name, score: p.score, streak: p.streak }));
}

async function getPlayerCount() {
  const supabase = createServerClient();
  const { count } = await supabase.from("players").select("*", { count: "exact", head: true });
  return count || 0;
}

async function getAnswerStats(questionIndex: number) {
  const supabase = createServerClient();
  const { data } = await supabase.from("answers").select("answer_index").eq("question_index", questionIndex);
  const stats = [0, 0, 0, 0];
  (data || []).forEach((a: { answer_index: number }) => {
    if (a.answer_index >= 0 && a.answer_index < 4) stats[a.answer_index]++;
  });
  return stats;
}

async function getAnswerCount(questionIndex: number) {
  const supabase = createServerClient();
  const { count } = await supabase.from("answers").select("*", { count: "exact", head: true }).eq("question_index", questionIndex);
  return count || 0;
}

// ── Reveal logic ───────────────────────────────────
async function doReveal(questionIndex: number) {
  const session = await getSession();
  if (!session || session.phase !== "question") return;

  await updateSession({ phase: "reveal" });

  const q = questions[questionIndex];
  const stats = await getAnswerStats(questionIndex);
  const lb = await getLeaderboard();

  await broadcast("reveal", {
    correctIndex: q.a,
    correctText: q.os[q.a],
    explanation: q.exp,
    stats,
    leaderboard: lb.slice(0, 10),
  });
}

// ── QR Code ────────────────────────────────────────
async function generateQR(): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    return await QRCode.toDataURL(`${siteUrl}/quiz`, { width: 400, margin: 2, color: { dark: "#0f172a", light: "#ffffff" } });
  } catch { return ""; }
}

// ── Timer management ───────────────────────────────
// On Vercel serverless, we can't use setInterval.
// Instead, the timer is managed client-side. The server stores
// question_start_time and clients calculate timeLeft themselves.
// The API also accepts a "tick" action that clients can call
// to trigger reveals when time runs out.

// ── POST Handler ───────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;
  const supabase = createServerClient();

  switch (action) {
    case "getState": {
      const session = await getSession();
      const pc = await getPlayerCount();
      const lb = await getLeaderboard();
      const qr = await generateQR();

      let answeredCount = 0;
      if (session && session.current_question >= 0) {
        answeredCount = await getAnswerCount(session.current_question);
      }

      // Calculate timeLeft from start time
      let timeLeft = QUESTION_TIME;
      if (session && session.phase === "question" && session.question_start_time > 0) {
        const elapsed = (Date.now() - session.question_start_time) / 1000;
        timeLeft = Math.max(0, Math.round(QUESTION_TIME - elapsed));
      }

      return NextResponse.json({
        state: {
          phase: session?.phase || "lobby",
          currentQuestion: session?.current_question ?? -1,
          timeLeft,
          playerCount: pc,
          answeredCount,
        },
        leaderboard: lb,
        qrUrl: qr,
      });
    }

    case "join": {
      const { name, sessionId } = body;
      if (!name || !sessionId) return NextResponse.json({ ok: false, error: "Missing data" });

      await supabase.from("players").upsert({
        session_id: sessionId,
        name: String(name).trim().substring(0, 20),
        score: 0,
        streak: 0,
        answered: false,
      }, { onConflict: "session_id" });

      const pc = await getPlayerCount();
      await broadcast("playercount", { count: pc });
      await broadcast("leaderboard", { leaderboard: await getLeaderboard() });

      return NextResponse.json({ ok: true });
    }

    case "nextQuestion": {
      const session = await getSession();
      const nextIdx = (session?.current_question ?? -1) + 1;

      if (nextIdx >= questions.length) {
        await updateSession({ phase: "finished", current_question: nextIdx });
        await broadcast("gameover", { leaderboard: await getLeaderboard() });
        return NextResponse.json({ ok: true, phase: "finished" });
      }

      // Reset all players' answered status
      await supabase.from("players").update({ answered: false }).neq("session_id", "");
      // Delete old answers for this question
      await supabase.from("answers").delete().eq("question_index", nextIdx);

      const startTime = Date.now();
      await updateSession({
        phase: "question",
        current_question: nextIdx,
        time_left: QUESTION_TIME,
        question_start_time: startTime,
      });

      const q = questions[nextIdx];
      await broadcast("question", {
        index: nextIdx,
        total: questions.length,
        q: q.q,
        os: q.os,
        cat: q.cat,
        timeLeft: QUESTION_TIME,
      });

      return NextResponse.json({ ok: true });
    }

    case "answer": {
      const { sessionId, answerIndex, questionIndex } = body;

      // Check player exists and hasn't answered
      const { data: player } = await supabase.from("players").select("*").eq("session_id", sessionId).single();
      if (!player || player.answered) return NextResponse.json({ ok: false });

      const session = await getSession();
      if (!session || session.phase !== "question" || session.current_question !== questionIndex) {
        return NextResponse.json({ ok: false });
      }

      // Record answer
      await supabase.from("answers").upsert({
        player_session_id: sessionId,
        question_index: questionIndex,
        answer_index: answerIndex,
      }, { onConflict: "player_session_id,question_index" });

      // Calculate score
      const elapsed = (Date.now() - session.question_start_time) / 1000;
      const isCorrect = answerIndex === questions[questionIndex].a;
      let newScore = player.score;
      let newStreak = player.streak;

      if (isCorrect) {
        const speedBonus = Math.max(200, Math.round(1000 * (1 - elapsed / QUESTION_TIME)));
        newStreak++;
        const streakBonus = Math.min(newStreak * 50, 300);
        newScore += speedBonus + streakBonus;
      } else {
        newStreak = 0;
      }

      await supabase.from("players").update({ answered: true, score: newScore, streak: newStreak }).eq("session_id", sessionId);

      // Broadcast progress
      const answered = await getAnswerCount(questionIndex);
      const total = await getPlayerCount();
      await broadcast("progress", { answered, total });

      // Auto-reveal if all answered
      if (answered >= total) {
        setTimeout(() => doReveal(questionIndex), 500);
      }

      return NextResponse.json({ ok: true, correct: isCorrect, newScore });
    }

    case "timerExpired": {
      // Called by the admin/display client when timer reaches 0
      const session = await getSession();
      if (session && session.phase === "question") {
        await doReveal(session.current_question);
      }
      return NextResponse.json({ ok: true });
    }

    case "revealNow": {
      const session = await getSession();
      if (session && session.phase === "question") {
        await doReveal(session.current_question);
      }
      return NextResponse.json({ ok: true });
    }

    case "resetGame": {
      await updateSession({ phase: "lobby", current_question: -1, time_left: QUESTION_TIME, question_start_time: 0 });
      // Supprimer les réponses d'abord (foreign key vers players)
      await supabase.from("answers").delete().gte("id", 0);
      // Supprimer tous les joueurs (ils devront se reconnecter)
      await supabase.from("players").delete().neq("session_id", "");
      // Nettoyer les événements
      await supabase.from("quiz_events").delete().gte("id", 0);

      await broadcast("reset", {});
      await broadcast("playercount", { count: 0 });
      await broadcast("leaderboard", { leaderboard: [] });

      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}

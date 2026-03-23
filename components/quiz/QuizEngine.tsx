"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { createBrowserClient } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────
interface Question { id: number; cat: string; q: string; os: string[]; a: number; exp: string }
interface LeaderboardEntry { rank: number; name: string; score: number; streak: number }
interface QuizState { phase: "lobby" | "question" | "reveal" | "finished"; currentQuestion: number; timeLeft: number; playerCount: number; answeredCount: number }
interface RevealData { correctIndex: number; correctText: string; explanation: string; stats: number[]; leaderboard: LeaderboardEntry[] }
type QuizView = "player" | "admin" | "display";

const QUESTION_TIME = 30;
const LETTERS = ["A", "B", "C", "D"];
const OC = [
  { bg: "bg-orange-500/10", border: "border-orange-500/30", letter: "bg-orange-500/20 text-orange-400", hover: "hover:border-orange-500/50" },
  { bg: "bg-emerald-500/10", border: "border-emerald-500/30", letter: "bg-emerald-500/20 text-emerald-400", hover: "hover:border-emerald-500/50" },
  { bg: "bg-violet-500/10", border: "border-violet-500/30", letter: "bg-violet-500/20 text-violet-400", hover: "hover:border-violet-500/50" },
  { bg: "bg-amber-500/10", border: "border-amber-500/30", letter: "bg-amber-500/20 text-amber-400", hover: "hover:border-amber-500/50" },
];

async function api(action: string, data?: Record<string, unknown>) {
  const res = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...data }) });
  return res.json();
}

// ══════════════════════════════════════════════════════
export default function QuizEngine({ view, questions }: { view: QuizView; questions: Question[] }) {
  const [state, setState] = useState<QuizState>({ phase: "lobby", currentQuestion: -1, timeLeft: QUESTION_TIME, playerCount: 0, answeredCount: 0 });
  const [playerName, setPlayerName] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(-1);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myScore, setMyScore] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [qrUrl, setQrUrl] = useState("");
  const [sessionId] = useState(() => typeof window !== "undefined" ? crypto.randomUUID() : "");

  // ── Supabase Realtime — listen to quiz_events inserts ──
  useEffect(() => {
    const supabase = createBrowserClient();

    const channel = supabase
      .channel("quiz-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "quiz_events" },
        (payload) => {
          const { event_type, payload: data } = payload.new as { event_type: string; payload: Record<string, unknown> };

          switch (event_type) {
            case "question":
              setState(prev => ({ ...prev, phase: "question", currentQuestion: data.index as number, timeLeft: data.timeLeft as number, answeredCount: 0 }));
              setSelectedAnswer(-1); setAnswerLocked(false); setRevealData(null);
              break;
            case "timer":
              setState(prev => ({ ...prev, timeLeft: data.timeLeft as number }));
              break;
            case "progress":
              setState(prev => ({ ...prev, answeredCount: data.answered as number, playerCount: data.total as number }));
              break;
            case "reveal":
              setState(prev => ({ ...prev, phase: "reveal" }));
              setRevealData(data as unknown as RevealData);
              setLeaderboard((data as unknown as RevealData).leaderboard);
              break;
            case "leaderboard":
              setLeaderboard((data as { leaderboard: LeaderboardEntry[] }).leaderboard);
              break;
            case "playercount":
              setState(prev => ({ ...prev, playerCount: data.count as number }));
              break;
            case "gameover":
              setState(prev => ({ ...prev, phase: "finished" }));
              setLeaderboard((data as { leaderboard: LeaderboardEntry[] }).leaderboard);
              break;
            case "reset":
              setState({ phase: "lobby", currentQuestion: -1, timeLeft: QUESTION_TIME, playerCount: 0, answeredCount: 0 });
              setSelectedAnswer(-1); setAnswerLocked(false); setRevealData(null); setMyScore(0); setMyStreak(0);
              break;
          }
        }
      )
      .subscribe();

    // Get initial state
    api("getState").then((d) => {
      if (d.state) setState(prev => ({ ...prev, ...d.state }));
      if (d.leaderboard) setLeaderboard(d.leaderboard);
      if (d.qrUrl) setQrUrl(d.qrUrl);
    });

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Actions ──────────────────────────────────────
  const joinGame = useCallback(async () => {
    if (!playerName.trim()) return;
    const res = await api("join", { name: playerName.trim(), sessionId });
    if (res.ok) setIsJoined(true);
  }, [playerName, sessionId]);

  const submitAnswer = useCallback(async (index: number) => {
    if (answerLocked || selectedAnswer >= 0) return;
    setSelectedAnswer(index); setAnswerLocked(true);
    const res = await api("answer", { sessionId, answerIndex: index, questionIndex: state.currentQuestion });
    if (res) {
      if (res.correct) setMyStreak(s => s + 1); else setMyStreak(0);
      if (res.newScore !== undefined) setMyScore(res.newScore);
    }
  }, [answerLocked, selectedAnswer, sessionId, state.currentQuestion]);

  const nextQuestion = () => api("nextQuestion");
  const revealNow = () => api("revealNow");
  const resetGame = () => { if (window.confirm("Remettre tout à zéro ?")) api("resetGame"); };

  // Confetti
  useEffect(() => {
    if (state.phase !== "finished") return;
    const end = Date.now() + 3000;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#f97316", "#fbbf24", "#fff"] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#f97316", "#fbbf24", "#fff"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [state.phase]);

  const currentQ = state.currentQuestion >= 0 && state.currentQuestion < questions.length ? questions[state.currentQuestion] : null;

  // ══════════════════════════════════════════════════
  // PLAYER VIEW
  // ══════════════════════════════════════════════════
  if (view === "player") {
    if (!isJoined) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
            <div className="font-sora text-3xl font-extrabold mb-1">Quiz <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Martinique</span></div>
            <p className="text-slate-400 text-sm mb-8">Sécurité Routière & Droit</p>
            <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} onKeyDown={e => e.key === "Enter" && joinGame()}
              placeholder="Ton pseudo" maxLength={20} autoComplete="off"
              className="w-full px-5 py-4 rounded-2xl bg-slate-900 border-2 border-slate-700 text-white text-center text-lg font-medium placeholder:text-slate-500 focus:border-orange-500 focus:outline-none transition-colors" />
            <button onClick={joinGame} disabled={!playerName.trim()}
              className="w-full mt-4 px-5 py-4 rounded-2xl text-white font-bold text-lg bg-gradient-to-r from-orange-600 to-orange-500 shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              C&apos;est parti ! 🚀
            </button>
          </motion.div>
        </div>
      );
    }

    if (state.phase === "lobby") {
      return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-5xl mb-4">✅</motion.div>
            <div className="font-sora text-2xl font-bold text-orange-400">{playerName}</div>
            <p className="text-slate-400 mt-2">En attente du lancement...</p>
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-slate-900 rounded-full border border-slate-700">
              <span className="font-sora font-bold text-amber-400">{state.playerCount}</span>
              <span className="text-slate-300 text-sm">joueurs connectés</span>
            </div>
          </motion.div>
        </div>
      );
    }

    if (state.phase === "finished") {
      const myIdx = leaderboard.findIndex(p => p.name === playerName.trim());
      const rank = myIdx >= 0 ? myIdx + 1 : 0;
      const medals = ["🥇", "🥈", "🥉"];
      return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <div className="font-sora text-3xl font-extrabold text-white">Quiz terminé !</div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
              className="mt-4 font-sora text-5xl font-extrabold text-amber-400">
              {rank > 0 && rank <= 3 ? `${medals[rank - 1]} ${rank}${rank === 1 ? "er" : "ème"}` : `${rank}ème`}
            </motion.div>
            <p className="text-slate-400 mt-2">{myScore} points</p>
          </motion.div>
        </div>
      );
    }

    if (state.phase === "reveal" && revealData) {
      const isCorrect = selectedAnswer === revealData.correctIndex;
      const noAnswer = selectedAnswer < 0;
      return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10 }} className="text-6xl mb-3">
              {noAnswer ? "⏰" : isCorrect ? "🎉" : "😬"}
            </motion.div>
            <div className={`font-sora text-2xl font-bold ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
              {noAnswer ? "Trop tard !" : isCorrect ? "Bonne réponse !" : "Raté !"}
            </div>
            {(noAnswer || !isCorrect) && <div className="mt-3 text-emerald-400 font-semibold">✅ {revealData.correctText}</div>}
            <div className="mt-4 p-4 rounded-2xl bg-slate-900 border-l-4 border-amber-400 text-left">
              <p className="text-slate-400 text-sm leading-relaxed">💡 {revealData.explanation}</p>
            </div>
            <div className="mt-4 font-sora text-amber-400 font-semibold">Score total : {myScore} pts</div>
            {myStreak >= 2 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="mt-2 inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 animate-streak-glow">
                🔥 Série de {myStreak} !
              </motion.div>
            )}
          </motion.div>
        </div>
      );
    }

    if (state.phase === "question" && currentQ) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <span className="font-sora text-sm font-semibold text-slate-400">{state.currentQuestion + 1} / {questions.length}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${currentQ.cat === "Route" ? "bg-orange-500/15 text-orange-400" : "bg-violet-500/15 text-violet-400"}`}>{currentQ.cat}</span>
            </div>
            <div className="flex justify-center mb-5">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-sora text-3xl font-extrabold border-[3px] transition-all ${state.timeLeft <= 5 ? "border-red-500 text-red-500 animate-timer-pulse" : "border-orange-500 text-white"} bg-slate-900`}>{state.timeLeft}</div>
            </div>
            <motion.div key={state.currentQuestion} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-700 text-center mb-5">
              <p className="font-semibold text-lg leading-snug text-white">{currentQ.q}</p>
            </motion.div>
            <div className="flex flex-col gap-3">
              {currentQ.os.map((opt, i) => (
                <motion.button key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  onClick={() => submitAnswer(i)} disabled={answerLocked}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left font-semibold transition-all active:scale-[0.97] disabled:cursor-default ${selectedAnswer === i ? "border-amber-400 bg-amber-400/10" : `${OC[i].bg} ${OC[i].border} ${OC[i].hover}`}`}>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-sora font-bold text-sm flex-shrink-0 ${OC[i].letter}`}>{LETTERS[i]}</span>
                  <span className="text-white">{opt}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  // ══════════════════════════════════════════════════
  // ADMIN VIEW
  // ══════════════════════════════════════════════════
  if (view === "admin") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="font-sora text-2xl font-bold">🎛️ Admin <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Quiz</span></h1>
          <div className="flex gap-3 flex-wrap">
            <Badge label="Joueurs" value={state.playerCount} />
            <Badge label="Phase" value={state.phase} />
            <Badge label="Question" value={`${Math.max(0, state.currentQuestion + 1)}/${questions.length}`} />
          </div>
        </div>
        <div className="flex gap-3 mb-6 flex-wrap">
          <button onClick={nextQuestion} disabled={state.phase === "finished"}
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/20 disabled:opacity-40 hover:shadow-orange-500/40 active:scale-95 transition-all">▶ Question suivante</button>
          <button onClick={revealNow} disabled={state.phase !== "question"}
            className="px-6 py-3 rounded-xl font-bold bg-slate-800 text-white border border-slate-600 disabled:opacity-40 hover:bg-slate-700 active:scale-95 transition-all">👁 Révéler</button>
          <button onClick={resetGame}
            className="px-6 py-3 rounded-xl font-bold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 active:scale-95 transition-all">🔄 Reset</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700">
            <h3 className="font-sora text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Question en cours</h3>
            {currentQ ? (
              <>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${currentQ.cat === "Route" ? "bg-orange-500/15 text-orange-400" : "bg-violet-500/15 text-violet-400"}`}>{currentQ.cat}</span>
                <p className="mt-3 text-lg font-semibold text-white">{currentQ.q}</p>
                {state.phase === "question" && (
                  <>
                    <div className={`text-center font-sora text-4xl font-extrabold mt-4 ${state.timeLeft <= 5 ? "text-red-500" : "text-white"}`}>{state.timeLeft}</div>
                    <p className="text-center text-sm text-slate-400 mt-1">{state.answeredCount} réponses</p>
                  </>
                )}
                <div className="mt-4 space-y-2">
                  {currentQ.os.map((opt, i) => (
                    <div key={i} className={`px-4 py-2 rounded-xl text-sm border ${revealData && i === revealData.correctIndex ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold" : "border-slate-700 bg-slate-800 text-slate-300"}`}>
                      {LETTERS[i]}. {opt}
                    </div>
                  ))}
                </div>
                {revealData && <p className="mt-4 text-sm text-slate-400 italic">💡 {revealData.explanation}</p>}
              </>
            ) : (
              <p className="text-slate-500 text-center py-8">Appuyez sur &quot;Question suivante&quot; pour démarrer</p>
            )}
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700">
            <h3 className="font-sora text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Classement</h3>
            <LBList entries={leaderboard.slice(0, 10)} />
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  // DISPLAY VIEW
  // ══════════════════════════════════════════════════
  if (view === "display") {
    if (state.phase === "lobby") {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gradient-mesh">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="font-sora text-6xl font-extrabold bg-gradient-to-r from-orange-400 via-white to-amber-400 bg-clip-text text-transparent mb-2">Quiz Martinique</h1>
            <p className="text-xl text-slate-400 mb-10">Sécurité Routière & Droit — Scannez pour jouer !</p>
            {qrUrl && <div className="bg-white rounded-3xl p-6 inline-block shadow-2xl mb-6"><img src={qrUrl} alt="QR Code" className="w-64 h-64" /></div>}
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="font-sora text-7xl font-extrabold text-amber-400 mt-6">{state.playerCount}</motion.div>
            <p className="text-slate-400 text-lg mt-1">joueurs connectés</p>
          </motion.div>
        </div>
      );
    }

    if (state.phase === "finished") {
      return (
        <div className="min-h-screen flex items-center justify-center gradient-mesh">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full max-w-2xl px-6">
            <div className="text-7xl mb-4">🏆</div>
            <h1 className="font-sora text-5xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">Bravo à tous !</h1>
            <p className="text-slate-400 text-lg mb-8">{leaderboard.length} joueurs — {leaderboard[0]?.name ?? "?"} remporte la victoire !</p>
            <LBList entries={leaderboard.slice(0, 10)} large />
          </motion.div>
        </div>
      );
    }

    if (state.phase === "reveal" && revealData) {
      const total = revealData.stats.reduce((a, b) => a + b, 0) || 1;
      const bc = ["bg-orange-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500"];
      return (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-5xl">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex-1 p-8 rounded-3xl bg-slate-900/80 border-2 border-emerald-500/30">
                <p className="text-emerald-400 font-bold text-sm uppercase tracking-wider mb-2">✅ Bonne réponse</p>
                <p className="font-sora text-3xl font-bold text-white">{revealData.correctText}</p>
                <p className="mt-4 text-slate-400 leading-relaxed border-t border-slate-700 pt-4">💡 {revealData.explanation}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="w-full md:w-72 p-6 rounded-3xl bg-slate-900/80 border border-slate-700">
                <p className="font-sora text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Répartition</p>
                {revealData.stats.map((count, i) => {
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{LETTERS[i]}</span><span>{count} ({pct}%)</span></div>
                      <div className="h-5 rounded-lg bg-slate-800 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: i * 0.1 }} className={`h-full rounded-lg ${bc[i]}`} />
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </div>
            <h3 className="font-sora text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">🏆 Top 5</h3>
            <LBList entries={revealData.leaderboard.slice(0, 5)} large />
          </div>
        </div>
      );
    }

    if (state.phase === "question" && currentQ) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <span className="font-sora text-lg font-semibold text-slate-400">Question {state.currentQuestion + 1} / {questions.length}</span>
              <span className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${currentQ.cat === "Route" ? "bg-orange-500/15 text-orange-400 border border-orange-500/30" : "bg-violet-500/15 text-violet-400 border border-violet-500/30"}`}>{currentQ.cat}</span>
            </div>
            <div className="flex justify-center mb-8">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center font-sora text-5xl font-extrabold border-4 transition-all ${state.timeLeft <= 5 ? "border-red-500 text-red-500 animate-timer-pulse" : "border-orange-500 text-white"} bg-slate-900`}>{state.timeLeft}</div>
            </div>
            <motion.div key={state.currentQuestion} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="text-center p-8 rounded-3xl bg-slate-900/80 border border-slate-700 mb-8">
              <p className="font-sora text-3xl md:text-4xl font-bold text-white leading-snug">{currentQ.q}</p>
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              {currentQ.os.map((opt, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-5 p-6 rounded-2xl border-2 ${OC[i].bg} ${OC[i].border}`}>
                  <span className={`w-11 h-11 rounded-xl flex items-center justify-center font-sora font-extrabold text-lg ${OC[i].letter}`}>{LETTERS[i]}</span>
                  <span className="text-xl font-semibold text-white">{opt}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-slate-400 mt-6">{state.answeredCount} / {state.playerCount} ont répondu</p>
          </div>
        </div>
      );
    }
  }

  return null;
}

// ── Shared Components ──────────────────────────────
function Badge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-4 py-1.5 rounded-full bg-slate-800 border border-slate-600 text-sm">
      <span className="text-slate-400">{label} : </span>
      <span className="font-sora font-bold text-amber-400">{value}</span>
    </div>
  );
}

function LBList({ entries, large = false }: { entries: LeaderboardEntry[]; large?: boolean }) {
  const medals = ["🥇", "🥈", "🥉"];
  if (!entries.length) return <p className="text-slate-500 text-center py-8 text-sm">En attente de joueurs...</p>;
  return (
    <div className="flex flex-col gap-2">
      {entries.map((p, i) => (
        <motion.div key={`${p.name}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
          className={`flex items-center gap-4 ${large ? "p-4" : "p-3"} rounded-2xl border ${i === 0 ? "bg-amber-400/[0.06] border-amber-400/30" : i === 1 ? "bg-slate-400/[0.04] border-slate-400/20" : i === 2 ? "bg-orange-700/[0.06] border-orange-700/20" : "bg-slate-800 border-slate-700"}`}>
          <span className={`font-sora font-extrabold ${large ? "text-xl w-9" : "text-base w-7"} text-center`}>{i < 3 ? medals[i] : i + 1}</span>
          <span className={`flex-1 font-semibold text-white ${large ? "text-lg" : "text-sm"}`}>{p.name}</span>
          <span className={`font-sora font-bold text-amber-400 ${large ? "text-lg" : "text-sm"}`}>{p.score} pts</span>
          {p.streak >= 2 && <span className="text-xs text-orange-400">🔥{p.streak}</span>}
        </motion.div>
      ))}
    </div>
  );
}

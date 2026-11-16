"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTeam } from "../layout";
import { IconPlus, IconX, IconChevronDown, IconSend, IconChartBar } from "@tabler/icons-react";

function CreateSurveyModal({ teamId, userId, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([{ question: "", type: "text", options: [] }]);
  const [loading, setLoading] = useState(false);
  const [newOption, setNewOption] = useState({});

  function addQuestion() {
    setQuestions(qs => [...qs, { question: "", type: "text", options: [] }]);
  }

  function updateQuestion(i, field, value) {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  }

  function addOption(i) {
    const opt = (newOption[i] || "").trim();
    if (!opt) return;
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, options: [...(q.options || []), opt] } : q));
    setNewOption(o => ({ ...o, [i]: "" }));
  }

  function removeOption(qi, oi) {
    setQuestions(qs => qs.map((q, idx) => idx === qi ? { ...q, options: q.options.filter((_, i) => i !== oi) } : q));
  }

  async function handleCreate() {
    setLoading(true);
    const { data: survey } = await supabase.from("pro_surveys")
      .insert({ team_id: teamId, title, created_by: userId })
      .select().single();
    await supabase.from("pro_survey_questions").insert(
      questions.map((q, i) => ({ survey_id: survey.id, question: q.question, type: q.type, options: q.options.length ? q.options : null, sort_order: i }))
    );
    onCreate(survey);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg px-5 pt-6 pb-10 flex flex-col gap-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Create survey</h3>
          <button onClick={onClose}><IconX size={20} className="text-gray-400" /></button>
        </div>
        <input placeholder="Survey title *" value={title} onChange={e => setTitle(e.target.value)}
          className="border rounded-xl px-4 py-3 text-sm outline-none" style={{ borderColor: "#e5e5e5" }} />

        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide -mb-2">Questions</p>
        {questions.map((q, i) => (
          <div key={i} className="border rounded-2xl p-4 flex flex-col gap-3" style={{ borderColor: "#e5e5e5" }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 w-5">Q{i + 1}</span>
              <input placeholder="Question text" value={q.question} onChange={e => updateQuestion(i, "question", e.target.value)}
                className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none" style={{ borderColor: "#e5e5e5" }} />
              {questions.length > 1 && (
                <button onClick={() => setQuestions(qs => qs.filter((_, idx) => idx !== i))}><IconX size={16} className="text-gray-400" /></button>
              )}
            </div>
            <div className="flex gap-2">
              {["text", "single", "multi"].map(t => (
                <button key={t} onClick={() => updateQuestion(i, "type", t)}
                  className="flex-1 py-1.5 rounded-full text-xs font-medium capitalize"
                  style={{ backgroundColor: q.type === t ? "#0161f0" : "#f0f0f0", color: q.type === t ? "#fff" : "#888" }}>
                  {t === "single" ? "Single choice" : t === "multi" ? "Multi choice" : "Open text"}
                </button>
              ))}
            </div>
            {(q.type === "single" || q.type === "multi") && (
              <div className="flex flex-col gap-1.5">
                {q.options?.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 flex-1 px-3 py-1.5 bg-gray-50 rounded-xl">{opt}</span>
                    <button onClick={() => removeOption(i, oi)}><IconX size={12} className="text-gray-400" /></button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input placeholder="Add option…" value={newOption[i] || ""} onChange={e => setNewOption(o => ({ ...o, [i]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addOption(i)}
                    className="flex-1 border rounded-xl px-3 py-1.5 text-xs outline-none" style={{ borderColor: "#e5e5e5" }} />
                  <button onClick={() => addOption(i)} className="text-xs font-semibold px-3 py-1.5 rounded-xl" style={{ backgroundColor: "#eff6ff", color: "#0161f0" }}>Add</button>
                </div>
              </div>
            )}
          </div>
        ))}
        <button onClick={addQuestion} className="flex items-center gap-2 text-sm font-medium self-start" style={{ color: "#0161f0" }}>
          <IconPlus size={14} /> Add question
        </button>

        <button onClick={handleCreate} disabled={!title || questions.some(q => !q.question) || loading}
          className="w-full py-3 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: !title || loading ? "#ccc" : "#0161f0" }}>
          {loading ? "Creating…" : "Create survey"}
        </button>
      </div>
    </div>
  );
}

function SurveyResponseModal({ survey, teamId, memberId, onClose, onSubmit }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("pro_survey_questions").select("*").eq("survey_id", survey.id).order("sort_order").then(({ data }) => {
      setQuestions(data || []);
      setLoading(false);
    });
  }, [survey.id]);

  async function handleSubmit() {
    setSubmitting(true);
    await supabase.from("pro_survey_responses").insert({ survey_id: survey.id, member_id: memberId, answers });
    onSubmit();
    onClose();
  }

  function toggleMulti(qId, opt) {
    setAnswers(a => {
      const current = a[qId] || [];
      return { ...a, [qId]: current.includes(opt) ? current.filter(x => x !== opt) : [...current, opt] };
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg px-5 pt-6 pb-10 flex flex-col gap-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{survey.title}</h3>
          <button onClick={onClose}><IconX size={20} className="text-gray-400" /></button>
        </div>
        {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0161f0", borderTopColor: "transparent" }} /></div> : (
          questions.map((q, i) => (
            <div key={q.id} className="flex flex-col gap-2">
              <p className="text-sm font-medium text-gray-900">{i + 1}. {q.question}</p>
              {q.type === "text" && (
                <textarea value={answers[q.id] || ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} rows={3}
                  className="border rounded-xl px-4 py-2.5 text-sm outline-none resize-none" style={{ borderColor: "#e5e5e5" }} placeholder="Your answer…" />
              )}
              {q.type === "single" && (
                <div className="flex flex-col gap-1.5">
                  {(q.options || []).map(opt => (
                    <button key={opt} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                      className="px-4 py-2.5 rounded-xl text-sm text-left border"
                      style={{ backgroundColor: answers[q.id] === opt ? "#eff6ff" : "#fff", borderColor: answers[q.id] === opt ? "#0161f0" : "#e5e5e5", color: answers[q.id] === opt ? "#0161f0" : "#333" }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {q.type === "multi" && (
                <div className="flex flex-wrap gap-2">
                  {(q.options || []).map(opt => {
                    const selected = (answers[q.id] || []).includes(opt);
                    return (
                      <button key={opt} onClick={() => toggleMulti(q.id, opt)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium border"
                        style={{ backgroundColor: selected ? "#0161f0" : "#fff", color: selected ? "#fff" : "#555", borderColor: selected ? "#0161f0" : "#e5e5e5" }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-3 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: submitting ? "#ccc" : "#0161f0" }}>
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </div>
    </div>
  );
}

function ResultsModal({ survey, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("pro_survey_questions").select("*").eq("survey_id", survey.id).order("sort_order"),
      supabase.from("pro_survey_responses").select("*").eq("survey_id", survey.id),
    ]).then(([{ data: qs }, { data: rs }]) => {
      setQuestions(qs || []);
      setResponses(rs || []);
      setLoading(false);
    });
  }, [survey.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg px-5 pt-6 pb-10 flex flex-col gap-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{survey.title}</h3>
            <p className="text-xs text-gray-400">{responses.length} response{responses.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose}><IconX size={20} className="text-gray-400" /></button>
        </div>
        {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0161f0", borderTopColor: "transparent" }} /></div> : (
          questions.map((q, i) => {
            const allAnswers = responses.map(r => r.answers?.[q.id]).filter(Boolean);
            return (
              <div key={q.id} className="flex flex-col gap-2">
                <p className="text-sm font-medium text-gray-900">{i + 1}. {q.question}</p>
                {q.type === "text" ? (
                  <div className="flex flex-col gap-1.5">
                    {allAnswers.map((a, j) => (
                      <p key={j} className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2.5">"{a}"</p>
                    ))}
                    {allAnswers.length === 0 && <p className="text-xs text-gray-400">No answers yet</p>}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {(q.options || []).map(opt => {
                      const count = allAnswers.flat().filter(a => a === opt).length;
                      const pct = responses.length ? Math.round(count / responses.length * 100) : 0;
                      return (
                        <div key={opt} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>{opt}</span>
                            <span className="font-semibold">{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: "#0161f0" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function SurveysPage() {
  const { id } = useParams();
  const { member } = useTeam();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [responding, setResponding] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [userId, setUserId] = useState(null);
  const [memberId, setMemberId] = useState(null);
  const [responded, setResponded] = useState(new Set());

  const isManager = member.role === "owner" || member.role === "manager";

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);

      const { data: m } = await supabase.from("pro_team_members").select("id").eq("team_id", id).eq("user_id", user.id).single();
      setMemberId(m?.id);

      const { data: sv } = await supabase.from("pro_surveys").select("*").eq("team_id", id).order("created_at", { ascending: false });
      setSurveys(sv || []);

      if (m?.id) {
        const { data: rs } = await supabase.from("pro_survey_responses").select("survey_id").eq("member_id", m.id);
        setResponded(new Set((rs || []).map(r => r.survey_id)));
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSend(surveyId) {
    const { data } = await supabase.from("pro_surveys").update({ sent_at: new Date().toISOString() }).eq("id", surveyId).select().single();
    setSurveys(ss => ss.map(s => s.id === surveyId ? data : s));

    await fetch("/api/pro/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: id, surveyId }),
    });
  }

  async function handleDelete(surveyId) {
    if (!confirm("Delete this survey?")) return;
    await supabase.from("pro_surveys").delete().eq("id", surveyId);
    setSurveys(ss => ss.filter(s => s.id !== surveyId));
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl">
      {showCreate && <CreateSurveyModal teamId={id} userId={userId} onClose={() => setShowCreate(false)} onCreate={s => setSurveys(ss => [s, ...ss])} />}
      {responding && <SurveyResponseModal survey={responding} teamId={id} memberId={memberId} onClose={() => setResponding(null)} onSubmit={() => setResponded(r => new Set([...r, responding.id]))} />}
      {viewing && <ResultsModal survey={viewing} onClose={() => setViewing(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ color: "#02123e" }}>Surveys</h1>
        {isManager && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: "#0161f0" }}>
            <IconPlus size={16} /> Create
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0161f0", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {surveys.map(survey => {
            const hasResponded = responded.has(survey.id);
            return (
              <div key={survey.id} className="bg-white rounded-xl p-4 border" style={{ borderColor: "#e5e5e5" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{survey.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {survey.sent_at ? `Sent ${new Date(survey.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "Draft"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isManager && !survey.sent_at && (
                      <button onClick={() => handleSend(survey.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: "#0161f0" }}>
                        <IconSend size={12} /> Send
                      </button>
                    )}
                    <button onClick={() => setViewing(survey)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                      style={{ borderColor: "#e5e5e5", color: "#555" }}>
                      <IconChartBar size={12} /> Results
                    </button>
                    {!isManager && survey.sent_at && !hasResponded && (
                      <button onClick={() => setResponding(survey)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: "#39e75f", color: "#02123e" }}>
                        Respond
                      </button>
                    )}
                    {hasResponded && (
                      <span className="text-xs text-gray-400 font-medium">✓ Responded</span>
                    )}
                  </div>
                </div>
                {isManager && (
                  <button onClick={() => handleDelete(survey.id)} className="text-xs font-medium mt-3" style={{ color: "#ef4444" }}>Delete</button>
                )}
              </div>
            );
          })}
          {surveys.length === 0 && <p className="text-sm text-gray-400 text-center py-12">No surveys yet</p>}
        </div>
      )}
    </div>
  );
}

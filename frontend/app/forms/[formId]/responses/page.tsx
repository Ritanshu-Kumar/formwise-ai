"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type FormField = {
  id: number;
  label: string;
  type: string;
  required: boolean;
  options: string[];
};

type FormData = {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  published: boolean;
};

type ResponseData = {
  id: string;
  form_id: string;
  answers: Record<string, string | boolean>;
  submitted_at: string;
};

type AIAnalysis = {
  summary: string;
  sentiment: string;
  themes: string[];
  key_insights: string[];
  suggested_actions: string[];
};

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();

  const formId = params.formId as string;

  const [form, setForm] = useState<FormData | null>(null);
  const [responses, setResponses] = useState<ResponseData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [aiAnalysis, setAiAnalysis] =
    useState<AIAnalysis | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  /*
   * --------------------------------------------------
   * LOAD DATA
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!formId) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          formResponse,
          responsesResponse,
        ] = await Promise.all([
          fetch(
            `${API_BASE_URL}/api/forms/${formId}`
          ),
          fetch(
            `${API_BASE_URL}/api/forms/${formId}/responses`
          ),
        ]);

        const formData =
          await formResponse.json();

        const responsesData =
          await responsesResponse.json();

        if (!formResponse.ok) {
          throw new Error(
            typeof formData.detail === "string"
              ? formData.detail
              : "Failed to load form."
          );
        }

        if (!responsesResponse.ok) {
          throw new Error(
            typeof responsesData.detail === "string"
              ? responsesData.detail
              : "Failed to load responses."
          );
        }

        setForm(formData);

        setResponses(
          Array.isArray(responsesData)
            ? responsesData
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load analytics:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [formId]);

  /*
   * --------------------------------------------------
   * AI ANALYSIS
   * --------------------------------------------------
   */

  const analyzeResponses = async () => {
    if (responses.length === 0) {
      return;
    }

    try {
      setAnalyzing(true);
      setAnalysisError("");

      const response = await fetch(
        `${API_BASE_URL}/api/forms/${formId}/analyze`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Failed to analyze responses."
        );
      }

      setAiAnalysis(data);
    } catch (error) {
      console.error(
        "AI analysis error:",
        error
      );

      setAnalysisError(
        error instanceof Error
          ? error.message
          : "Unable to analyze responses."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  /*
   * --------------------------------------------------
   * HELPERS
   * --------------------------------------------------
   */

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const getFieldLabel = (fieldId: string) => {
    const field = form?.fields?.find(
      (item) =>
        String(item.id) === String(fieldId)
    );

    return field?.label || `Field ${fieldId}`;
  };

  const formatAnswer = (
    answer: string | boolean
  ) => {
    if (typeof answer === "boolean") {
      return answer ? "Yes" : "No";
    }

    return answer || "No answer";
  };

  /*
   * --------------------------------------------------
   * STATISTICS
   * --------------------------------------------------
   */

  const latestResponse = useMemo(() => {
    if (responses.length === 0) {
      return null;
    }

    return [...responses].sort(
      (a, b) =>
        new Date(b.submitted_at).getTime() -
        new Date(a.submitted_at).getTime()
    )[0];
  }, [responses]);

  const fieldResponseCount = useMemo(() => {
    const counts: Record<string, number> = {};

    responses.forEach((response) => {
      Object.entries(response.answers).forEach(
        ([fieldId, answer]) => {
          if (
            answer !== "" &&
            answer !== undefined &&
            answer !== null
          ) {
            counts[fieldId] =
              (counts[fieldId] || 0) + 1;
          }
        }
      );
    });

    return counts;
  }, [responses]);

  /*
   * --------------------------------------------------
   * LOADING
   * --------------------------------------------------
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">
            Loading analytics...
          </p>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------
   * ERROR
   * --------------------------------------------------
   */

  if (error || !form) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-xl rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl">
            !
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Unable to load analytics
          </h1>

          <p className="mt-3 text-slate-500">
            {error || "Form not found."}
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-7 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Back to My Forms
          </button>

        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------
   * MAIN
   * --------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-5 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back
          </button>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

            <div>
              <p className="text-sm font-semibold text-slate-400">
                FormWise AI
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
                {form.title}
              </h1>

              <p className="mt-2 max-w-2xl text-slate-500">
                {form.description ||
                  "Response analytics and AI-powered insights."}
              </p>
            </div>

            <div className="flex gap-3">

              <button
                onClick={() =>
                  router.push(`/form/${formId}`)
                }
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Open Form
              </button>

              <button
                onClick={analyzeResponses}
                disabled={
                  analyzing ||
                  responses.length === 0
                }
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {analyzing
                  ? "Analyzing..."
                  : "✦ Analyze with AI"}
              </button>

            </div>

          </div>
        </div>

        {/* STAT CARDS */}

        <section className="grid gap-4 md:grid-cols-3">

          <StatCard
            label="Total Responses"
            value={responses.length}
            description="Submissions collected"
            icon="◉"
          />

          <StatCard
            label="Form Fields"
            value={form.fields.length}
            description="Questions in this form"
            icon="▦"
          />

          <StatCard
            label="Latest Response"
            value={
              latestResponse
                ? new Date(
                    latestResponse.submitted_at
                  ).toLocaleDateString()
                : "—"
            }
            description={
              latestResponse
                ? formatDate(
                    latestResponse.submitted_at
                  )
                : "No submissions yet"
            }
            icon="◷"
          />

        </section>

        {/* AI ERROR */}

        {analysisError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            <strong>AI analysis failed:</strong>{" "}
            {analysisError}
          </div>
        )}

        {/* AI INSIGHTS */}

        {aiAnalysis && (
          <section className="mt-6 rounded-2xl bg-white p-7 shadow-sm">

            <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-center md:justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  FormWise AI
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Response Insights
                </h2>
              </div>

              <SentimentBadge
                sentiment={aiAnalysis.sentiment}
              />

            </div>

            {/* SUMMARY */}

            <div className="mt-6 rounded-xl bg-slate-50 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                AI Summary
              </p>

              <p className="mt-3 text-base leading-7 text-slate-700">
                {aiAnalysis.summary ||
                  "No summary available."}
              </p>
            </div>

            {/* THEMES */}

            <div className="mt-7">
              <h3 className="text-lg font-bold text-slate-900">
                Common Themes
              </h3>

              {aiAnalysis.themes?.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {aiAnalysis.themes.map(
                    (theme, index) => (
                      <span
                        key={`${theme}-${index}`}
                        className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
                      >
                        {theme}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">
                  No recurring themes identified.
                </p>
              )}
            </div>

            {/* INSIGHTS */}

            <div className="mt-8">
              <h3 className="text-lg font-bold text-slate-900">
                Key Insights
              </h3>

              {aiAnalysis.key_insights?.length >
              0 ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {aiAnalysis.key_insights.map(
                    (insight, index) => (
                      <div
                        key={`${insight}-${index}`}
                        className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
                      >
                        <div className="flex gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                            {index + 1}
                          </span>

                          <p className="text-sm leading-6 text-slate-600">
                            {insight}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">
                  No key insights identified.
                </p>
              )}
            </div>

            {/* ACTIONS */}

            <div className="mt-8">
              <h3 className="text-lg font-bold text-slate-900">
                Suggested Actions
              </h3>

              {aiAnalysis.suggested_actions?.length >
              0 ? (
                <div className="mt-4 space-y-3">
                  {aiAnalysis.suggested_actions.map(
                    (action, index) => (
                      <div
                        key={`${action}-${index}`}
                        className="rounded-xl border border-emerald-100 bg-emerald-50 p-5"
                      >
                        <p className="text-sm leading-6 text-emerald-800">
                          <span className="font-bold">
                            {index + 1}.
                          </span>{" "}
                          {action}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">
                  No suggested actions available.
                </p>
              )}
            </div>

          </section>
        )}

        {/* RESPONSE OVERVIEW */}

        <section className="mt-6 rounded-2xl bg-white p-7 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Data
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Response Overview
              </h2>
            </div>

            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
              {responses.length}{" "}
              {responses.length === 1
                ? "response"
                : "responses"}
            </span>
          </div>

          {responses.length === 0 ? (
            <div className="mt-8 rounded-xl bg-slate-50 p-10 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                📭
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                No responses yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Share your public form to start
                collecting feedback.
              </p>

              <button
                onClick={() =>
                  router.push(`/form/${formId}`)
                }
                className="mt-6 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Open Public Form
              </button>

            </div>
          ) : (
            <div className="mt-7 space-y-4">

              {responses.map(
                (response, index) => (
                  <div
                    key={response.id}
                    className="rounded-xl border border-slate-100 p-5 transition hover:border-slate-200 hover:shadow-sm"
                  >

                    <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">

                      <div>
                        <p className="font-semibold text-slate-900">
                          Response #
                          {responses.length -
                            index}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(
                            response.submitted_at
                          )}
                        </p>
                      </div>

                      <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        Submitted
                      </span>

                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">

                      {Object.entries(
                        response.answers
                      ).map(
                        ([fieldId, answer]) => (
                          <div
                            key={fieldId}
                            className="rounded-xl bg-slate-50 p-4"
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              {getFieldLabel(
                                fieldId
                              )}
                            </p>

                            <p className="mt-2 break-words text-sm leading-6 text-slate-800">
                              {formatAnswer(
                                answer
                              )}
                            </p>
                          </div>
                        )
                      )}

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* FIELD RESPONSE COVERAGE */}

        {responses.length > 0 && (
          <section className="mt-6 rounded-2xl bg-white p-7 shadow-sm">

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Completion
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Field Response Coverage
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Percentage of submissions containing
                an answer for each field.
              </p>
            </div>

            <div className="mt-7 space-y-5">

              {form.fields.map((field) => {
                const answered =
                  fieldResponseCount[
                    String(field.id)
                  ] || 0;

                const percentage = Math.round(
                  (answered /
                    responses.length) *
                    100
                );

                return (
                  <div key={field.id}>

                    <div className="mb-2 flex items-center justify-between gap-4">

                      <p className="min-w-0 truncate text-sm font-medium text-slate-700">
                        {field.label}
                      </p>

                      <p className="shrink-0 text-sm font-semibold text-slate-500">
                        {percentage}%
                      </p>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      {answered} of{" "}
                      {responses.length} responses
                    </p>

                  </div>
                );
              })}

            </div>

          </section>
        )}

        <footer className="py-10 text-center text-xs text-slate-400">
          FormWise AI — Smarter Forms. Instant
          Insights.
        </footer>

      </div>
    </main>
  );
}

/*
 * --------------------------------------------------
 * STAT CARD
 * --------------------------------------------------
 */

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-lg text-slate-600">
          {icon}
        </div>

      </div>

    </div>
  );
}

/*
 * --------------------------------------------------
 * SENTIMENT BADGE
 * --------------------------------------------------
 */

function SentimentBadge({
  sentiment,
}: {
  sentiment: string;
}) {
  const normalized =
    sentiment?.toLowerCase() || "unknown";

  let className =
    "bg-slate-100 text-slate-700";

  if (normalized === "positive") {
    className =
      "bg-emerald-100 text-emerald-700";
  } else if (normalized === "negative") {
    className =
      "bg-red-100 text-red-700";
  } else if (normalized === "mixed") {
    className =
      "bg-amber-100 text-amber-700";
  }

  const label =
    normalized.charAt(0).toUpperCase() +
    normalized.slice(1);

  return (
    <div
      className={`rounded-full px-4 py-2 text-sm font-semibold ${className}`}
    >
      {label} Sentiment
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
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
  sentiment:
    | "positive"
    | "neutral"
    | "negative"
    | "mixed"
    | string;
  themes: string[];
  key_insights: string[];
  suggested_actions: string[];
};

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();

  const formId = params.formId as string;

  const [form, setForm] =
    useState<FormData | null>(null);

  const [responses, setResponses] =
    useState<ResponseData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [aiAnalysis, setAiAnalysis] =
    useState<AIAnalysis | null>(null);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [analysisError, setAnalysisError] =
    useState("");

  /*
   * --------------------------------------------------
   * LOAD FORM + RESPONSES
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
            typeof responsesData.detail ===
              "string"
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
          "Failed to load responses:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load responses."
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

  const getFieldLabel = (
    fieldId: string
  ) => {
    const field = form?.fields?.find(
      (item) =>
        String(item.id) === String(fieldId)
    );

    return (
      field?.label ||
      `Field ${fieldId}`
    );
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
   * LOADING
   * --------------------------------------------------
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">
            Loading responses...
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

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">

        <div className="mx-auto max-w-4xl">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

            <h1 className="text-lg font-semibold text-red-700">
              Unable to load responses
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

          </div>

        </div>

      </main>
    );
  }

  /*
   * --------------------------------------------------
   * MAIN PAGE
   * --------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">

      <div className="mx-auto max-w-5xl">

        {/* ================= HEADER ================= */}

        <div className="mb-8">

          <button
            onClick={() => router.back()}
            className="mb-5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            ← Back
          </button>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="text-sm font-semibold text-slate-400">
                FormWise AI
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {form?.title || "Responses"}
              </h1>

              <p className="mt-2 text-slate-500">
                View and analyze responses submitted to
                this form.
              </p>

            </div>

            <div className="flex items-center gap-3">

              {/* Response count */}

              <div className="rounded-xl bg-white px-5 py-4 shadow-sm">

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Total Responses
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {responses.length}
                </p>

              </div>

              {/* AI button */}

              <button
                onClick={analyzeResponses}
                disabled={
                  analyzing ||
                  responses.length === 0
                }
                className="rounded-xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {analyzing
                  ? "Analyzing..."
                  : "✦ Analyze with AI"}
              </button>

            </div>

          </div>

        </div>

        {/* ================= AI ERROR ================= */}

        {analysisError && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {analysisError}
          </div>
        )}

        {/* ================= AI ANALYSIS ================= */}

        {aiAnalysis && (
          <section className="mb-8 rounded-2xl bg-white p-7 shadow-sm">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="text-sm font-semibold text-slate-400">
                  FORMWISE AI
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Response Insights
                </h2>

              </div>

              <div
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  aiAnalysis.sentiment ===
                  "positive"
                    ? "bg-emerald-100 text-emerald-700"
                    : aiAnalysis.sentiment ===
                        "negative"
                      ? "bg-red-100 text-red-700"
                      : aiAnalysis.sentiment ===
                          "mixed"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-700"
                }`}
              >
                {aiAnalysis.sentiment
                  ? aiAnalysis.sentiment
                      .charAt(0)
                      .toUpperCase() +
                    aiAnalysis.sentiment.slice(
                      1
                    )
                  : "Unknown"}{" "}
                Sentiment
              </div>

            </div>

            {/* Summary */}

            <div className="mt-7 rounded-xl bg-slate-50 p-5">

              <h3 className="font-semibold text-slate-900">
                Summary
              </h3>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                {aiAnalysis.summary ||
                  "No summary available."}
              </p>

            </div>

            {/* Themes */}

            <div className="mt-6">

              <h3 className="font-semibold text-slate-900">
                Common Themes
              </h3>

              {aiAnalysis.themes.length >
              0 ? (
                <div className="mt-3 flex flex-wrap gap-2">

                  {aiAnalysis.themes.map(
                    (theme, index) => (
                      <span
                        key={`${theme}-${index}`}
                        className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700"
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

            {/* Key Insights */}

            <div className="mt-7">

              <h3 className="font-semibold text-slate-900">
                Key Insights
              </h3>

              {aiAnalysis.key_insights
                .length > 0 ? (
                <div className="mt-3 space-y-3">

                  {aiAnalysis.key_insights.map(
                    (insight, index) => (
                      <div
                        key={`${insight}-${index}`}
                        className="flex gap-3 rounded-xl border border-slate-100 p-4"
                      >

                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                          {index + 1}
                        </span>

                        <p className="text-sm leading-6 text-slate-600">
                          {insight}
                        </p>

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

            {/* Suggested Actions */}

            <div className="mt-7">

              <h3 className="font-semibold text-slate-900">
                Suggested Actions
              </h3>

              {aiAnalysis
                .suggested_actions.length >
              0 ? (
                <div className="mt-3 space-y-3">

                  {aiAnalysis.suggested_actions.map(
                    (action, index) => (
                      <div
                        key={`${action}-${index}`}
                        className="rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800"
                      >
                        <span className="font-semibold">
                          Action {index + 1}:
                        </span>{" "}
                        {action}
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

        {/* ================= EMPTY STATE ================= */}

        {responses.length === 0 ? (

          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
              📭
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              No responses yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Once someone submits this form,
              their response will appear here.
            </p>

            <button
              onClick={() =>
                router.push(
                  `/form/${formId}`
                )
              }
              className="mt-6 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open Public Form
            </button>

          </div>

        ) : (

          /* ================= RESPONSES ================= */

          <div className="space-y-5">

            {responses.map(
              (response, index) => (

                <div
                  key={response.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >

                  {/* Response header */}

                  <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">

                    <div>

                      <p className="text-sm font-semibold text-slate-900">
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

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                      Submitted
                    </span>

                  </div>

                  {/* Answers */}

                  <div className="mt-5 space-y-4">

                    {Object.entries(
                      response.answers
                    ).map(
                      (
                        [
                          fieldId,
                          answer,
                        ]
                      ) => (

                        <div
                          key={fieldId}
                          className="rounded-xl bg-slate-50 p-4"
                        >

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            {getFieldLabel(
                              fieldId
                            )}
                          </p>

                          <p className="mt-2 text-sm text-slate-800">
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

      </div>

    </main>
  );
}
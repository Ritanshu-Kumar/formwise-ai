"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type FormData = {
  id: string;
  title: string;
  description: string;
  fields: unknown[];
  published: boolean;
  created_at?: string;
  updated_at?: string;
};

export default function HomePage() {
  const router = useRouter();

  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadForms = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/forms`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load forms."
        );
      }

      setForms(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error("Failed to load forms:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load forms."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  const formatDate = (date?: string) => {
    if (!date) {
      return "Recently created";
    }

    return new Date(date).toLocaleDateString();
  };

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">

      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-sm font-semibold text-slate-400">
              FormWise AI
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
              My Forms
            </h1>

            <p className="mt-2 text-slate-500">
              Create forms, collect responses, and turn
              feedback into AI-powered insights.
            </p>

          </div>

          <button
            onClick={() => router.push("/forms/new")}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            + Create Form
          </button>

        </header>

        {/* Error */}

        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}

        {loading && (
          <div className="mt-10 flex justify-center">

            <div className="text-center">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

              <p className="mt-4 text-sm text-slate-500">
                Loading your forms...
              </p>

            </div>

          </div>
        )}

        {/* Empty state */}

        {!loading &&
          !error &&
          forms.length === 0 && (
            <div className="mt-10 rounded-2xl bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
                📝
              </div>

              <h2 className="mt-5 text-xl font-semibold text-slate-900">
                Create your first form
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Build a form, publish it, collect responses,
                and let FormWise AI analyze the results.
              </p>

              <button
                onClick={() =>
                  router.push("/forms/new")
                }
                className="mt-6 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create Form
              </button>

            </div>
          )}

        {/* Forms */}

        {!loading &&
          !error &&
          forms.length > 0 && (
            <div className="mt-10 grid gap-5 md:grid-cols-2">

              {forms.map((form) => (

                <div
                  key={form.id}
                  className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
                >

                  {/* Form header */}

                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">

                      <h2 className="truncate text-xl font-bold text-slate-900">
                        {form.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {form.description ||
                          "No description provided."}
                      </p>

                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        form.published
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {form.published
                        ? "Published"
                        : "Draft"}
                    </span>

                  </div>

                  {/* Metadata */}

                  <div className="mt-5 flex items-center gap-5 text-xs text-slate-400">

                    <span>
                      {form.fields?.length || 0}{" "}
                      fields
                    </span>

                    <span>
                      Created{" "}
                      {formatDate(form.created_at)}
                    </span>

                  </div>

                  {/* Actions */}

                  <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">

                    <button
                      onClick={() =>
                        router.push(
                          `/forms/${form.id}/edit`
                        )
                      }
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        router.push(
                          `/forms/${form.id}/responses`
                        )
                      }
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Responses
                    </button>

                    <button
                      onClick={() =>
                        router.push(
                          `/form/${form.id}`
                        )
                      }
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Open Form
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}

        {/* Footer */}

        <p className="mt-10 text-center text-xs text-slate-400">
          Powered by FormWise AI
        </p>

      </div>

    </main>
  );
}
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

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

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
          typeof data.detail === "string"
            ? data.detail
            : "Failed to load forms."
        );
      }

      setForms(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Failed to load forms:",
        error
      );

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

  const deleteForm = async (
    form: FormData
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${form.title}"?\n\nThis will permanently delete the form and all of its responses.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(form.id);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/forms/${form.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        let data: {
          detail?: string;
        } = {};

        try {
          data = await response.json();
        } catch {
          // Empty 204 or non-JSON response.
        }

        throw new Error(
          data.detail ||
            "Failed to delete form."
        );
      }

      setForms((current) =>
        current.filter(
          (item) => item.id !== form.id
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete form:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete form."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return "Recently";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const publishedCount = forms.filter(
    (form) => form.published
  ).length;

  const draftCount = forms.filter(
    (form) => !form.published
  ).length;

  const totalFields = forms.reduce(
    (total, form) =>
      total + (form.fields?.length || 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* ================= HEADER ================= */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/")}
            className="text-left"
          >
            <p className="text-sm font-bold tracking-wide text-slate-400">
              FORMWISE AI
            </p>

            <h1 className="mt-1 text-xl font-bold tracking-tight">
              Form Builder
            </h1>
          </button>

          <button
            onClick={() =>
              router.push("/forms/new")
            }
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            + Create Form
          </button>

        </div>

      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* ================= HERO ================= */}

        <section>

          <p className="text-sm font-semibold text-slate-400">
            WORKSPACE
          </p>

          <h2 className="mt-2 text-4xl font-bold tracking-tight">
            My Forms
          </h2>

          <p className="mt-3 max-w-2xl text-slate-500">
            Create forms, collect responses, and
            turn feedback into AI-powered insights.
          </p>

        </section>

        {/* ================= STATS ================= */}

        {!loading && !error && (
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              label="Total Forms"
              value={forms.length}
              description="Forms in your workspace"
            />

            <StatCard
              label="Published"
              value={publishedCount}
              description="Forms currently live"
            />

            <StatCard
              label="Drafts"
              value={draftCount}
              description="Forms still being built"
            />

            <StatCard
              label="Fields"
              value={totalFields}
              description="Across all forms"
            />

          </section>
        )}

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">

            <p className="font-semibold">
              Something went wrong
            </p>

            <p className="mt-1">
              {error}
            </p>

            <button
              onClick={loadForms}
              className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
            >
              Try Again
            </button>

          </div>
        )}

        {/* ================= LOADING ================= */}

        {loading && (
          <div className="mt-16 flex justify-center">

            <div className="text-center">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

              <p className="mt-4 text-sm text-slate-500">
                Loading your forms...
              </p>

            </div>

          </div>
        )}

        {/* ================= EMPTY STATE ================= */}

        {!loading &&
          !error &&
          forms.length === 0 && (

            <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                +
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                Create your first form
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                Build a form, publish it, collect
                responses, and let FormWise AI analyze
                the results.
              </p>

              <button
                onClick={() =>
                  router.push("/forms/new")
                }
                className="mt-7 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create Form
              </button>

            </section>
          )}

        {/* ================= FORMS ================= */}

        {!loading &&
          !error &&
          forms.length > 0 && (

            <section className="mt-10">

              <div className="mb-5 flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-bold">
                    Your Forms
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage and analyze your forms.
                  </p>
                </div>

                <button
                  onClick={loadForms}
                  disabled={loading}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Refresh
                </button>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {forms.map((form) => (

                  <FormCard
                    key={form.id}
                    form={form}
                    deleting={
                      deletingId === form.id
                    }
                    formatDate={formatDate}
                    onEdit={() =>
                      router.push(
                        `/forms/${form.id}/edit`
                      )
                    }
                    onResponses={() =>
                      router.push(
                        `/forms/${form.id}/responses`
                      )
                    }
                    onOpen={() =>
                      router.push(
                        `/form/${form.id}`
                      )
                    }
                    onDelete={() =>
                      deleteForm(form)
                    }
                  />

                ))}

              </div>

            </section>
          )}

        {/* ================= AI VALUE PROP ================= */}

        {!loading &&
          !error &&
          forms.length > 0 && (

            <section className="mt-12 overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-sm">

              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                <div>

                  <p className="text-sm font-semibold tracking-wide text-slate-400">
                    FORMWISE AI
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Turn responses into insights.
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    Collect customer feedback and use
                    AI to identify sentiment, common
                    themes, key insights, and actionable
                    recommendations.
                  </p>

                </div>

                <button
                  onClick={() => {
                    const publishedForm =
                      forms.find(
                        (form) => form.published
                      );

                    if (publishedForm) {
                      router.push(
                        `/forms/${publishedForm.id}/responses`
                      );
                    }
                  }}
                  disabled={
                    !forms.some(
                      (form) => form.published
                    )
                  }
                  className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  View AI Insights
                </button>

              </div>

            </section>
          )}

        {/* ================= FOOTER ================= */}

        <footer className="py-10 text-center">

          <p className="text-xs text-slate-400">
            FormWise AI — Smarter Forms. Instant
            Insights.
          </p>

        </footer>

      </div>

    </main>
  );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-sm font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}


/* =====================================================
   FORM CARD
===================================================== */

function FormCard({
  form,
  deleting,
  formatDate,
  onEdit,
  onResponses,
  onOpen,
  onDelete,
}: {
  form: FormData;
  deleting: boolean;
  formatDate: (date?: string) => string;
  onEdit: () => void;
  onResponses: () => void;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      {/* HEADER */}

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <h3 className="truncate text-xl font-bold text-slate-900">
            {form.title || "Untitled Form"}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
            {form.description ||
              "No description provided."}
          </p>

        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            form.published
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {form.published
            ? "Published"
            : "Draft"}
        </span>

      </div>

      {/* METADATA */}

      <div className="mt-6 flex items-center gap-5 border-t border-slate-100 pt-5 text-xs text-slate-400">

        <span>
          {form.fields?.length || 0} fields
        </span>

        <span>
          Created {formatDate(form.created_at)}
        </span>

      </div>

      {/* ACTIONS */}

      <div className="mt-5 flex flex-wrap gap-2">

        <button
          onClick={onEdit}
          disabled={deleting}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Edit
        </button>

        <button
          onClick={onResponses}
          disabled={deleting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Responses
        </button>

        {form.published && (
          <button
            onClick={onOpen}
            disabled={deleting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Open Form
          </button>
        )}

        <button
          onClick={onDelete}
          disabled={deleting}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting
            ? "Deleting..."
            : "Delete"}
        </button>

      </div>

    </article>
  );
}
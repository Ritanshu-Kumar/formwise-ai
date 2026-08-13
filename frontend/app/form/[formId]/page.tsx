"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FormField } from "@/types/form";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type FormData = {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  published: boolean;
};

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [answers, setAnswers] = useState<
    Record<string, string | boolean>
  >({});

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load the form from the FastAPI backend
  useEffect(() => {
    const loadForm = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(
          `${API_BASE_URL}/api/forms/${formId}`
        );

        const data = await response.json();

        if (!response.ok) {
          const detail =
            typeof data.detail === "string"
              ? data.detail
              : Array.isArray(data.detail)
                ? data.detail
                    .map((item: { msg?: string }) => item.msg || "Invalid request")
                    .join(", ")
                : "Failed to load form.";

          throw new Error(detail);
        }

        setForm(data);
      } catch (error) {
        console.error("Form loading error:", error);

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load this form."
        );
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      loadForm();
    }
  }, [formId]);

  const updateAnswer = (
    fieldId: number,
    value: string | boolean
  ) => {
    setAnswers((current) => ({
      ...current,
      [fieldId]: value,
    }));
  };

  const submitForm = async () => {
    if (!form) {
      return;
    }

    setError("");

    // Validate required fields
    for (const field of form.fields) {
      if (!field.required) {
        continue;
      }

      const answer = answers[field.id];

      if (
        answer === undefined ||
        answer === "" ||
        answer === false
      ) {
        setError(`Please complete "${field.label}".`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/forms/${formId}/responses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to submit response."
        );
      }

      console.log(
        "Response stored successfully:",
        data
      );

      setSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting your response."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">
            Loading form...
          </p>
        </div>
      </main>
    );
  }

  // Error loading form
  if (!form) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-xl rounded-2xl bg-white p-10 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl">
            !
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Form unavailable
          </h1>

          <p className="mt-3 text-slate-500">
            {loadError || "This form could not be loaded."}
          </p>
        </div>
      </main>
    );
  }

  // Submission success
  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-xl rounded-2xl bg-white p-10 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Thank you!
          </h1>

          <p className="mt-3 text-slate-500">
            Your response has been successfully submitted.
          </p>

          <button
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
              setError("");
            }}
            className="mt-7 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Submit another response
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12">
      <div className="mx-auto max-w-3xl">

        {/* Header */}

        <div className="mb-8">
          <p className="text-sm font-semibold text-slate-400">
            FormWise AI
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            {form.title}
          </h1>

          <p className="mt-3 text-lg leading-8 text-slate-500">
            {form.description}
          </p>
        </div>

        {/* Form */}

        <div className="rounded-2xl bg-white p-7 shadow-sm md:p-10">
          <div className="space-y-8">

            {form.fields.map((field) => (
              <PublicField
                key={field.id}
                field={field}
                value={answers[field.id]}
                onChange={(value) =>
                  updateAnswer(field.id, value)
                }
              />
            ))}

          </div>

          {error && (
            <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={submitForm}
            disabled={submitting}
            className="mt-9 w-full rounded-lg bg-slate-900 px-6 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Submitting..."
              : "Submit Response"}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Powered by FormWise AI
        </p>

      </div>
    </main>
  );
}

function PublicField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string | boolean | undefined;
  onChange: (value: string | boolean) => void;
}) {
  return (
    <div>
      <label className="mb-3 block font-medium text-slate-700">
        {field.label}

        {field.required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {field.type === "text" && (
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
          placeholder="Type your answer..."
        />
      )}

      {field.type === "email" && (
        <input
          type="email"
          value={(value as string) || ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
          placeholder="you@example.com"
        />
      )}

      {field.type === "textarea" && (
        <textarea
          rows={5}
          value={(value as string) || ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
          placeholder="Write your answer..."
        />
      )}

      {field.type === "dropdown" && (
        <select
          value={(value as string) || ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none"
        >
          <option value="">
            Select an option
          </option>

          {field.options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      )}

      {field.type === "checkbox" && (
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) =>
              onChange(event.target.checked)
            }
            className="h-5 w-5"
          />

          <span className="text-slate-600">
            {field.options[0] || "I agree"}
          </span>
        </label>
      )}
    </div>
  );
}
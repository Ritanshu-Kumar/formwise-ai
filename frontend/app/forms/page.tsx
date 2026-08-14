"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type FormData = {
  id: string;
  title: string;
  description: string;
  fields: unknown[];
  published: boolean;
};

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();

  const formId = params.formId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!formId) {
      return;
    }

    const loadForm = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/forms/${formId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof data.detail === "string"
              ? data.detail
              : "Failed to load form."
          );
        }

        const form = data as FormData;

        /*
         * Send the existing form to the builder.
         *
         * The builder will load the form using
         * the formId query parameter.
         */
        router.replace(
          `/forms/new?formId=${form.id}`
        );
      } catch (error) {
        console.error(
          "Failed to load form:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load form."
        );

        setLoading(false);
      }
    };

    loadForm();
  }, [formId, router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">

        <div className="w-full max-w-xl rounded-2xl bg-white p-10 text-center shadow-lg">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl">
            !
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Unable to load form
          </h1>

          <p className="mt-3 text-slate-500">
            {error}
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-7 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to My Forms
          </button>

        </div>

      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">

      <div className="text-center">

        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

        <p className="mt-4 text-sm text-slate-500">
          Loading form builder...
        </p>

      </div>

    </main>
  );
}
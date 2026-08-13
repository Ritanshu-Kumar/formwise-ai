"use client";

import { useState } from "react";

type FieldType =
  | "text"
  | "email"
  | "checkbox"
  | "dropdown"
  | "textarea";

type FormField = {
  id: number;
  type: FieldType;
  label: string;
  required: boolean;
  options: string[];
};

type FormResponse = {
  [fieldId: number]: string | boolean;
};

const fieldDefinitions: {
  type: FieldType;
  label: string;
}[] = [
  { type: "text", label: "Text Input" },
  { type: "email", label: "Email Field" },
  { type: "checkbox", label: "Checkbox" },
  { type: "dropdown", label: "Dropdown" },
  { type: "textarea", label: "Textarea" },
];

const createField = (
  type: FieldType,
  index: number
): FormField => {
  const definition = fieldDefinitions.find(
    (field) => field.type === type
  );

  return {
    id: Date.now() + Math.random(),
    type,
    label: `${definition?.label ?? "Field"} ${index + 1}`,
    required: false,
    options:
      type === "dropdown" || type === "checkbox"
        ? ["Option 1", "Option 2", "Option 3"]
        : [],
  };
};

export default function Home() {
  const [formTitle, setFormTitle] = useState("Customer Feedback");
  const [formDescription, setFormDescription] = useState(
    "We would love to hear your feedback."
  );

  const [fields, setFields] = useState<FormField[]>([
    {
      id: 1,
      type: "text",
      label: "What is your name?",
      required: true,
      options: [],
    },
    {
      id: 2,
      type: "email",
      label: "What is your email?",
      required: false,
      options: [],
    },
    {
      id: 3,
      type: "dropdown",
      label: "How would you rate your experience?",
      required: true,
      options: ["Excellent", "Good", "Average", "Poor"],
    },
    {
      id: 4,
      type: "textarea",
      label: "Tell us more",
      required: false,
      options: [],
    },
  ]);

  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(
    1
  );

  const [responses, setResponses] = useState<FormResponse[]>([]);

  const [currentResponse, setCurrentResponse] =
    useState<FormResponse>({});

  const [submitted, setSubmitted] = useState(false);

  const [published, setPublished] = useState(false);

  const [draggedType, setDraggedType] =
    useState<FieldType | null>(null);

  const selectedField = fields.find(
    (field) => field.id === selectedFieldId
  );

  /* ---------------- ADD FIELD ---------------- */

  const addField = (type: FieldType) => {
    const newField = createField(type, fields.length);

    setFields((current) => [...current, newField]);
    setSelectedFieldId(newField.id);
  };

  /* ---------------- DELETE FIELD ---------------- */

  const removeField = (id: number) => {
    setFields((current) =>
      current.filter((field) => field.id !== id)
    );

    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
  };

  /* ---------------- UPDATE FIELD ---------------- */

  const updateField = (
    id: number,
    updates: Partial<FormField>
  ) => {
    setFields((current) =>
      current.map((field) =>
        field.id === id
          ? { ...field, ...updates }
          : field
      )
    );
  };

  /* ---------------- OPTIONS ---------------- */

  const updateOption = (
    fieldId: number,
    optionIndex: number,
    value: string
  ) => {
    setFields((current) =>
      current.map((field) => {
        if (field.id !== fieldId) return field;

        const options = [...field.options];
        options[optionIndex] = value;

        return {
          ...field,
          options,
        };
      })
    );
  };

  const addOption = (fieldId: number) => {
    setFields((current) =>
      current.map((field) => {
        if (field.id !== fieldId) return field;

        return {
          ...field,
          options: [
            ...field.options,
            `Option ${field.options.length + 1}`,
          ],
        };
      })
    );
  };

  const removeOption = (
    fieldId: number,
    optionIndex: number
  ) => {
    setFields((current) =>
      current.map((field) => {
        if (field.id !== fieldId) return field;

        return {
          ...field,
          options: field.options.filter(
            (_, index) => index !== optionIndex
          ),
        };
      })
    );
  };

  /* ---------------- REORDER ---------------- */

  const moveField = (
    fieldId: number,
    direction: "up" | "down"
  ) => {
    setFields((current) => {
      const index = current.findIndex(
        (field) => field.id === fieldId
      );

      if (index === -1) return current;

      const newIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        newIndex < 0 ||
        newIndex >= current.length
      ) {
        return current;
      }

      const updated = [...current];

      [updated[index], updated[newIndex]] = [
        updated[newIndex],
        updated[index],
      ];

      return updated;
    });
  };

  /* ---------------- RESPONSES ---------------- */

  const updateResponse = (
    fieldId: number,
    value: string | boolean
  ) => {
    setCurrentResponse((current) => ({
      ...current,
      [fieldId]: value,
    }));
  };

  const submitResponse = () => {
    setResponses((current) => [
      ...current,
      currentResponse,
    ]);

    setCurrentResponse({});
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
    }, 2500);
  };

  /* ---------------- DRAG & DROP ---------------- */

  const handleDragStart = (type: FieldType) => {
    setDraggedType(type);
  };

  const handleDrop = () => {
    if (draggedType) {
      addField(draggedType);
    }

    setDraggedType(null);
  };

  /* ---------------- PUBLISH ---------------- */

  const publishForm = () => {
    setPublished(true);
  };

  /* ---------------- FIELD RENDERER ---------------- */

  const renderFieldInput = (field: FormField) => {
    const value = currentResponse[field.id];

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={(value as string) || ""}
            onChange={(event) =>
              updateResponse(
                field.id,
                event.target.value
              )
            }
            placeholder="Type here..."
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-slate-400"
          />
        );

      case "email":
        return (
          <input
            type="email"
            value={(value as string) || ""}
            onChange={(event) =>
              updateResponse(
                field.id,
                event.target.value
              )
            }
            placeholder="email@example.com"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-slate-400"
          />
        );

      case "textarea":
        return (
          <textarea
            value={(value as string) || ""}
            onChange={(event) =>
              updateResponse(
                field.id,
                event.target.value
              )
            }
            placeholder="Write your response..."
            rows={4}
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-slate-400"
          />
        );

      case "dropdown":
        return (
          <select
            value={(value as string) || ""}
            onChange={(event) =>
              updateResponse(
                field.id,
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none"
          >
            <option value="">Select...</option>

            {field.options.map((option, index) => (
              <option
                key={`${field.id}-${index}`}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <label className="flex items-center gap-3 text-slate-600">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(event) =>
                updateResponse(
                  field.id,
                  event.target.checked
                )
              }
              className="h-5 w-5 rounded border-slate-300"
            />

            <span>
              {field.options[0] || "I agree"}
            </span>
          </label>
        );
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#111827]">

      {/* ================= HEADER ================= */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold tracking-tight">
            FormWise <span className="text-slate-500">AI</span>
          </h1>

          <div className="flex items-center gap-3">

            <span className="hidden text-sm text-slate-400 md:block">
              {responses.length} response
              {responses.length !== 1 ? "s" : ""}
            </span>

            <button
              onClick={publishForm}
              className={`rounded-lg px-5 py-3 text-sm font-semibold text-white transition ${
                published
                  ? "bg-emerald-600"
                  : "bg-[#101426] hover:bg-[#1b2338]"
              }`}
            >
              {published ? "Published ✓" : "Publish Form"}
            </button>

          </div>
        </div>
      </header>

      {/* ================= BUILDER HEADER ================= */}

      <section className="border-b border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-[1500px]">

          <input
            value={formTitle}
            onChange={(event) =>
              setFormTitle(event.target.value)
            }
            className="w-full bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-slate-300"
          />

          <textarea
            value={formDescription}
            onChange={(event) =>
              setFormDescription(event.target.value)
            }
            rows={2}
            className="mt-3 w-full max-w-3xl resize-none bg-transparent text-lg text-slate-500 outline-none"
          />

        </div>
      </section>

      {/* ================= BUILDER ================= */}

      <section className="px-5 py-10 md:px-8 lg:px-12">

        <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[280px_1fr_320px]">

          {/* ================= ELEMENTS ================= */}

          <aside>

            <h2 className="mb-5 text-lg font-bold">
              Form Elements
            </h2>

            <div className="space-y-3">

              {fieldDefinitions.map((field) => (
                <button
                  key={field.type}
                  draggable
                  onDragStart={() =>
                    handleDragStart(field.type)
                  }
                  onClick={() =>
                    addField(field.type)
                  }
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="font-medium">
                    {field.label}
                  </span>

                  <span className="text-2xl text-slate-400">
                    ›
                  </span>
                </button>
              ))}

            </div>

            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-5 text-center">
              <p className="text-sm font-medium text-slate-500">
                Drag fields into the preview
              </p>

              <p className="mt-1 text-xs text-slate-400">
                or click to add
              </p>
            </div>

          </aside>

          {/* ================= LIVE PREVIEW ================= */}

          <section
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={handleDrop}
            className={`rounded-2xl bg-[#eef2f6] p-7 md:p-10 ${
              draggedType
                ? "ring-2 ring-slate-300"
                : ""
            }`}
          >

            <div className="mb-8">

              <h2 className="text-2xl font-bold">
                Live Preview
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Your form updates as you build it.
              </p>

            </div>

            <div className="rounded-xl bg-white p-7 shadow-sm md:p-9">

              <h3 className="text-2xl font-bold">
                {formTitle}
              </h3>

              <p className="mt-2 text-slate-500">
                {formDescription}
              </p>

              <div className="mt-9 space-y-7">

                {fields.map((field, index) => (

                  <div
                    key={field.id}
                    onClick={() =>
                      setSelectedFieldId(field.id)
                    }
                    className={`group relative rounded-lg p-3 transition ${
                      selectedFieldId === field.id
                        ? "bg-slate-50 ring-1 ring-slate-200"
                        : "hover:bg-slate-50"
                    }`}
                  >

                    <div className="mb-3 flex items-center justify-between">

                      <label className="font-medium text-slate-600">

                        {field.label}

                        {field.required && (
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        )}

                      </label>

                      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">

                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            moveField(field.id, "up");
                          }}
                          disabled={index === 0}
                          className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-200 disabled:opacity-20"
                        >
                          ↑
                        </button>

                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            moveField(field.id, "down");
                          }}
                          disabled={
                            index === fields.length - 1
                          }
                          className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-200 disabled:opacity-20"
                        >
                          ↓
                        </button>

                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            removeField(field.id);
                          }}
                          className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-50"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                    {renderFieldInput(field)}

                  </div>

                ))}

              </div>

              <div className="mt-9 flex justify-end">

                <button
                  onClick={submitResponse}
                  className="rounded-lg bg-[#101426] px-7 py-3.5 font-semibold text-white transition hover:bg-[#1b2338]"
                >
                  Submit Response
                </button>

              </div>

            </div>

            {submitted && (

              <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
                Response submitted successfully.
              </div>

            )}

          </section>

          {/* ================= FIELD SETTINGS ================= */}

          <aside className="rounded-2xl border border-slate-200 bg-white p-6">

            <h2 className="text-lg font-bold">
              Field Settings
            </h2>

            {!selectedField ? (

              <div className="mt-10 text-center">

                <p className="text-sm text-slate-400">
                  Select a field from the preview
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Its configuration will appear here.
                </p>

              </div>

            ) : (

              <div className="mt-7 space-y-6">

                {/* LABEL */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Field label
                  </label>

                  <input
                    value={selectedField.label}
                    onChange={(event) =>
                      updateField(
                        selectedField.id,
                        {
                          label: event.target.value,
                        }
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                  />

                </div>

                {/* TYPE */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Field type
                  </label>

                  <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    {fieldDefinitions.find(
                      (field) =>
                        field.type ===
                        selectedField.type
                    )?.label}
                  </div>

                </div>

                {/* REQUIRED */}

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-4 py-3">

                  <div>

                    <p className="text-sm font-medium">
                      Required field
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      User must answer this field
                    </p>

                  </div>

                  <input
                    type="checkbox"
                    checked={
                      selectedField.required
                    }
                    onChange={(event) =>
                      updateField(
                        selectedField.id,
                        {
                          required:
                            event.target.checked,
                        }
                      )
                    }
                    className="h-5 w-5"
                  />

                </label>

                {/* OPTIONS */}

                {(selectedField.type ===
                  "dropdown" ||
                  selectedField.type ===
                    "checkbox") && (

                  <div>

                    <div className="mb-3 flex items-center justify-between">

                      <label className="text-sm font-medium">
                        Options
                      </label>

                      <button
                        onClick={() =>
                          addOption(
                            selectedField.id
                          )
                        }
                        className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                      >
                        + Add
                      </button>

                    </div>

                    <div className="space-y-2">

                      {selectedField.options.map(
                        (option, index) => (

                          <div
                            key={index}
                            className="flex gap-2"
                          >

                            <input
                              value={option}
                              onChange={(event) =>
                                updateOption(
                                  selectedField.id,
                                  index,
                                  event.target.value
                                )
                              }
                              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                            />

                            <button
                              onClick={() =>
                                removeOption(
                                  selectedField.id,
                                  index
                                )
                              }
                              className="px-2 text-sm text-red-400 hover:text-red-600"
                            >
                              ×
                            </button>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

                {/* DELETE */}

                <button
                  onClick={() =>
                    removeField(
                      selectedField.id
                    )
                  }
                  className="w-full rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
                >
                  Delete Field
                </button>

              </div>

            )}

          </aside>

        </div>

      </section>

      {/* ================= AI SECTION ================= */}

      <section className="px-6 pb-24 md:px-10">

        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-[0_15px_45px_rgba(15,23,42,0.08)]">

          <div className="flex items-center gap-5">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
              💡
            </div>

            <div>

              <h2 className="text-2xl font-bold">
                AI Summary of Responses
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Top feedback trends & insights
              </p>

            </div>

          </div>

          <div className="mt-8 rounded-xl bg-slate-50 p-8">

            {responses.length === 0 ? (

              <p className="text-center text-slate-400">
                Submit responses to see real-time AI insights here.
              </p>

            ) : (

              <div>

                <p className="text-lg font-semibold">
                  {responses.length} response
                  {responses.length !== 1
                    ? "s"
                    : ""}{" "}
                  collected
                </p>

                <p className="mt-2 text-slate-500">
                  AI analysis will identify sentiment,
                  common topics, and important feedback
                  patterns.
                </p>

              </div>

            )}

          </div>

        </div>

      </section>

      {/* ================= FEATURES ================= */}

      <section className="px-6 pb-24">

        <div className="mx-auto grid max-w-[1500px] gap-6 md:grid-cols-2 lg:grid-cols-3">

          <FeatureCard
            icon="✦"
            title="Drag-and-drop form builder"
            description="Build custom forms in seconds. Add, reorder, and configure fields with an intuitive drag-and-drop interface."
          />

          <FeatureCard
            icon="✧"
            title="AI summary of responses"
            description="Generate automated summaries and identify important patterns across submitted responses."
          />

          <FeatureCard
            icon="⌁"
            title="Real-time response tagging"
            description="Automatically categorize incoming feedback to make large response sets easier to understand."
          />

          <FeatureCard
            icon="▥"
            title="Embed & analytics dashboard"
            description="Share forms and monitor response activity through a centralized analytics experience."
          />

          <FeatureCard
            icon="↗"
            title="Insights dashboard with trends"
            description="Visualize response trends and turn raw feedback into actionable insights."
          />

          <FeatureCard
            icon="◎"
            title="AI-powered feedback"
            description="Use language models to transform unstructured feedback into structured information."
          />

        </div>

      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        FormWise AI — Smarter Forms. Instant Insights.
      </footer>

    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-7 shadow-[0_12px_35px_rgba(15,23,42,0.07)] transition hover:-translate-y-1">

      <div className="flex items-start gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
          {icon}
        </div>

        <div>

          <h3 className="text-xl font-bold">
            {title}
          </h3>

          <p className="mt-3 leading-7 text-slate-500">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}
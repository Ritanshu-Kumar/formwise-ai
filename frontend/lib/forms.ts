import { FormDefinition } from "@/types/forms";

export const demoForm: FormDefinition = {
  id: "customer-feedback",

  title: "Customer Feedback",

  description:
    "We would love to hear about your experience.",

  published: true,

  fields: [
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
      required: true,
      options: [],
    },

    {
      id: 3,
      type: "dropdown",
      label: "How would you rate your experience?",
      required: true,
      options: [
        "Excellent",
        "Good",
        "Average",
        "Poor",
      ],
    },

    {
      id: 4,
      type: "textarea",
      label: "Tell us more about your experience.",
      required: false,
      options: [],
    },
  ],
};
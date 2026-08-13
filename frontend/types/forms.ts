export type FieldType =
  | "text"
  | "email"
  | "checkbox"
  | "dropdown"
  | "textarea";

export type FormField = {
  id: number;
  type: FieldType;
  label: string;
  required: boolean;
  options: string[];
};

export type FormDefinition = {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  published: boolean;
};

export type FormResponse = {
  id: string;
  formId: string;
  submittedAt: string;
  answers: Record<string, string | boolean>;
};
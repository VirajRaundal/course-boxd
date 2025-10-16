export type CourseFormState = {
  errors?: Record<string, string>;
  message?: string;
  redirectTo?: string;
};

export type CourseDeleteState = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
};

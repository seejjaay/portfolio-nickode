/* Contact form rules, shared by the form (instant feedback) and the API route (the
   check that counts). */
export type ContactFields = { name: string; email: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactFields, string>>;

export const LIMITS = { name: 100, email: 254, message: 2000, messageMin: 10 };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(f: ContactFields): ContactErrors {
  const errors: ContactErrors = {};
  const name = f.name.trim();
  const email = f.email.trim();
  const message = f.message.trim();
  if (!name) errors.name = "Please tell me your name.";
  else if (name.length > LIMITS.name) errors.name = `Keep it under ${LIMITS.name} characters.`;
  if (!email) errors.email = "Please add your email so I can reply.";
  else if (!EMAIL.test(email) || email.length > LIMITS.email) errors.email = "That email address does not look right.";
  if (!message) errors.message = "Write a short message about your project.";
  else if (message.length < LIMITS.messageMin) errors.message = "A little more detail, please (at least 10 characters).";
  else if (message.length > LIMITS.message) errors.message = `Keep it under ${LIMITS.message} characters.`;
  return errors;
}

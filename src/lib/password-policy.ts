/** Client-side mirror of the API PasswordPolicy (the API enforces it). */
export function passwordProblems(password: string, username: string): string[] {
  const problems: string[] = [];
  if (password.length < 12) problems.push("at least 12 characters");
  if (!/[A-Z]/.test(password)) problems.push("an uppercase letter");
  if (!/[a-z]/.test(password)) problems.push("a lowercase letter");
  if (!/\d/.test(password)) problems.push("a number");
  if (!/[^A-Za-z0-9]/.test(password)) problems.push("a symbol");
  if (username && password.toLowerCase().includes(username.toLowerCase())) problems.push("must not contain the username");
  return problems;
}

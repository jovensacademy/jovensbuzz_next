"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./password.module.css";

/**
 * Password field with an eye button on the right that toggles visibility. Only the input type
 * changes, so the typed value, focus and form state are preserved. Accepts every <input> prop
 * (including a ref from react-hook-form's register).
 */
export function PasswordInput({ className = "input", ...props }: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <span className={styles.wrap}>
      <input {...props} className={`${className} ${styles.input}`} type={visible ? "text" : "password"} />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        aria-controls={props.id}
        title={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
      </button>
    </span>
  );
}

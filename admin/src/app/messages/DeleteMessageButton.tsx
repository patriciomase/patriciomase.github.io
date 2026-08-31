"use client";

import { useTransition } from "react";
import { deleteMessage } from "./actions";

export function DeleteMessageButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="delete-btn"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this message?")) return;
        startTransition(() => deleteMessage(id));
      }}
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";

export function Typewriter({ text }: { text: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= text.length) return;
    const t = setTimeout(() => setI((p) => p + 1), 25);
    return () => clearTimeout(t);
  }, [i, text.length]);
  return <p style={{ fontSize: "1.15rem", lineHeight: 1.6 }}>{text.slice(0, i)}</p>;
}

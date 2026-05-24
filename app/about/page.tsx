"use client";

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-lg py-4xl">
      <h1
        className="mb-xl text-4xl font-bold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        About
      </h1>
      <p style={{ color: "var(--text-secondary)" }}>
        More about this site and its creator.
      </p>
    </div>
  );
}

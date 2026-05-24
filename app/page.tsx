"use client";

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center mt-[calc(-1*var(--header-height))]">
      <h1
        className="text-6xl font-medium tracking-tight md:text-7xl lg:text-8xl"
        style={{ color: 'var(--text-primary)' }}
      >
        Sephire Lab
      </h1>
    </div>
  );
}

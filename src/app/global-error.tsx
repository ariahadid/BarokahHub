"use client";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Terjadi kesalahan</h2>
          <button onClick={() => reset()}>Coba lagi</button>
        </div>
      </body>
    </html>
  );
}

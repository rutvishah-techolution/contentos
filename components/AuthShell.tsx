export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-6 inline-flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-fg" />
            <span className="text-[15px] font-semibold tracking-tight text-fg">
              ContentOS
            </span>
          </div>
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight">
            Content that survives
            <br />a CFO&rsquo;s scrutiny.
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-pretty text-[15px] leading-relaxed text-muted">
            The autonomous B2B content engine — research, fact-check, storyline,
            draft. Every claim sourced and verified.
          </p>
        </div>
        <div className="card">{children}</div>
      </div>
    </div>
  );
}

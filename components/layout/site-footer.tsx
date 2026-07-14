export function SiteFooter() {
  return (
    <footer
      className="w-full"
      style={{
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-primary)'
      }}
    >
      <div className="mx-auto max-w-wide px-lg py-xl">
        <div className="flex flex-col items-center justify-between gap-md md:flex-row">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            © 2026 Sephire Lab. Built with Next.js.
          </p>
          <div className="flex gap-lg">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              GitHub
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

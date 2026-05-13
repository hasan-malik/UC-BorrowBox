export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-[calc(100vh-44px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Sheet card */}
        <div className="bg-white rounded-sheet shadow-sheet px-6 pt-7 pb-6">
          <div className="mb-6">
            <h1 className="text-title-2 text-ink-900">{title}</h1>
            {subtitle && (
              <p className="text-subhead text-ink-500 mt-1">{subtitle}</p>
            )}
          </div>
          {children}
        </div>

        {/* Footer link below card */}
        {footer && (
          <p className="text-center text-subhead text-ink-500 mt-4">{footer}</p>
        )}
      </div>
    </div>
  );
}

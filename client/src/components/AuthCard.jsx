export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="-my-8 min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-2">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-ink-200 rounded-ios p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
          <div className="mb-6">
            <h1 className="text-[22px] font-semibold tracking-tight text-ink-900 leading-tight">
              {title}
            </h1>
            {subtitle && <p className="text-ink-500 mt-1 text-[14px]">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && (
          <p className="text-center text-ink-500 text-[14px] mt-5">{footer}</p>
        )}
      </div>
    </div>
  );
}

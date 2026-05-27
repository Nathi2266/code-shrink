import { useRef, useState } from 'react';
import { Copy, Trash2, CheckCircle } from 'lucide-react';

export default function CodeEditor({
  title,
  value,
  onChange,
  readOnly = false,
  placeholder,
  lineCount,
  charCount,
}) {
  const textareaRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures so the editor still works normally.
    }
  };

  const handleClear = () => {
    if (readOnly || !onChange) return;
    onChange('');
    textareaRef.current?.focus();
  };

  return (
    <section className="flex h-full w-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!value}
            aria-label="Copy code"
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={readOnly || !value}
            aria-label="Clear code"
          >
            <Trash2 size={16} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          className="min-h-56 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
        />
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
        <span>{lineCount ?? 0} lines</span>
        <span>{charCount ?? 0} characters</span>
      </div>
    </section>
  );
}

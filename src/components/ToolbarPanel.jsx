import { useState } from 'react';
import { Zap, Languages, Settings2, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go',
  'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'HTML', 'CSS', 'SQL', 'Bash'
];

export default function ToolbarPanel({ options, onChange }) {
  const [activeTab, setActiveTab] = useState('shorten');

  const tabs = [
    { id: 'shorten', label: '[ SHORTEN ]', icon: Zap },
    { id: 'convert', label: '[ CONVERT ]', icon: Languages },
    { id: 'format', label: '[ FORMAT ]', icon: Settings2 },
  ];

  return (
    <div className="terminal-panel rounded">
      {/* Tab bar */}
      <div className="terminal-header flex">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono tracking-wider border-r border-neon-dark transition-all
              ${activeTab === tab.id
                ? 'text-neon bg-neon-dark/40 neon-glow-sm'
                : 'text-neon-dim hover:text-neon'
              }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* SHORTEN tab */}
        {activeTab === 'shorten' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'removeComments', label: 'Strip Comments' },
              { key: 'removeBlank', label: 'Remove Blank Lines' },
              { key: 'removeUnused', label: 'Remove Unused Imports' },
              { key: 'minify', label: 'Minify Output' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-2 cursor-pointer group">
                <div
                  onClick={() => onChange({ ...options, [opt.key]: !options[opt.key] })}
                  className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-all cursor-pointer
                    ${options[opt.key]
                      ? 'border-neon bg-neon/20 text-neon'
                      : 'border-neon-dark text-transparent'
                    }`}
                >
                  {options[opt.key] && <span className="text-neon text-xs font-bold">✓</span>}
                </div>
                <span className={`text-xs font-mono ${options[opt.key] ? 'text-neon' : 'text-neon-dim'}`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* CONVERT tab */}
        {activeTab === 'convert' && (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className="block text-neon-dim text-xs mb-1">FROM</label>
              <select
                value={options.fromLang}
                onChange={e => onChange({ ...options, fromLang: e.target.value })}
                className="terminal-select w-full px-3 py-2 rounded text-xs"
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <span className="text-neon text-lg font-mono neon-text">→</span>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-neon-dim text-xs mb-1">TO</label>
              <select
                value={options.toLang}
                onChange={e => onChange({ ...options, toLang: e.target.value })}
                className="terminal-select w-full px-3 py-2 rounded text-xs"
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-neon-dim text-xs mb-1">SOURCE LANG</label>
              <select
                value={options.language}
                onChange={e => onChange({ ...options, language: e.target.value, fromLang: e.target.value })}
                className="terminal-select w-full px-3 py-2 rounded text-xs"
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* FORMAT tab */}
        {activeTab === 'format' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-neon-dim text-xs mb-1.5">INDENTATION</label>
              <select
                value={options.formatting?.indentation || '2spaces'}
                onChange={e => onChange({ ...options, formatting: { ...options.formatting, indentation: e.target.value } })}
                className="terminal-select w-full px-3 py-2 rounded text-xs"
              >
                <option value="2spaces">2 Spaces</option>
                <option value="4spaces">4 Spaces</option>
                <option value="tabs">Tabs</option>
              </select>
            </div>
            <div>
              <label className="block text-neon-dim text-xs mb-1.5">LINE ENDINGS</label>
              <select
                value={options.formatting?.lineEnding || 'lf'}
                onChange={e => onChange({ ...options, formatting: { ...options.formatting, lineEnding: e.target.value } })}
                className="terminal-select w-full px-3 py-2 rounded text-xs"
              >
                <option value="lf">LF (Unix)</option>
                <option value="crlf">CRLF (Windows)</option>
              </select>
            </div>
            <div>
              <label className="block text-neon-dim text-xs mb-1.5">OUTPUT STYLE</label>
              <select
                value={options.formatting?.style || 'compact'}
                onChange={e => onChange({ ...options, formatting: { ...options.formatting, style: e.target.value } })}
                className="terminal-select w-full px-3 py-2 rounded text-xs"
              >
                <option value="compact">Compact</option>
                <option value="readable">Readable</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

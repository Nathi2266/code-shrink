import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Key, Trash2, CheckCircle } from 'lucide-react';

const API_KEY_STORAGE = 'mcs_openai_api_key';

export default function SettingsModal({ open, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem(API_KEY_STORAGE) || '';
      setApiKey(stored);
      setSaved(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE, apiKey.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setApiKey('');
    localStorage.removeItem(API_KEY_STORAGE);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative terminal-panel rounded w-full max-w-md z-10 font-mono">
        {/* Header */}
        <div className="terminal-header px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-neon" />
            <span className="text-neon text-sm tracking-widest uppercase neon-glow-sm">SETTINGS</span>
          </div>
          <button onClick={onClose} className="text-neon-dim hover:text-neon transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* API Key section */}
          <div>
            <label className="block text-neon-dim text-xs tracking-wider mb-2 uppercase">
              OpenAI API Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="terminal-input w-full px-3 py-2 text-xs rounded pr-9"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neon-dim hover:text-neon"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button onClick={handleClear} className="neon-btn-secondary px-3 py-2 rounded text-xs" title="Clear key">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-neon-dim text-xs mt-2 leading-relaxed" style={{ color: 'rgba(0,255,65,0.4)' }}>
              Your key is stored only in your browser's localStorage. It is never sent to any server other than OpenAI directly.
            </p>
          </div>

          {/* Info */}
          <div className="border border-neon-dark rounded p-3 text-xs" style={{ background: 'rgba(0,255,65,0.03)' }}>
            <p className="text-neon-dim mb-1">Required for AI Language Conversion</p>
            <p style={{ color: 'rgba(0,255,65,0.4)' }}>
              Get your key at: <span className="text-neon">platform.openai.com/api-keys</span>
            </p>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="neon-btn w-full py-2.5 text-sm rounded flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                SAVED!
              </>
            ) : (
              'SAVE_KEY()'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export { API_KEY_STORAGE };

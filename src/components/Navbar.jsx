import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Terminal, Menu, X } from 'lucide-react';

export default function Navbar({ onSettingsOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-neon-dim bg-black/90 backdrop-blur-sm sticky top-0 z-50"
         style={{ boxShadow: '0 0 20px rgba(0,255,65,0.15)' }}>
      <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Terminal className="w-5 h-5 text-neon" style={{ filter: 'drop-shadow(0 0 6px #00FF41)' }} />
          <span className="font-mono text-base font-semibold tracking-wider neon-text">
            MY_CODE_<span className="text-neon-dim">SHORTENER</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <span className="text-neon-dim font-mono text-xs tracking-widest">[ FRONTEND · CLIENT-SIDE · PRIVATE ]</span>
          <button
            onClick={onSettingsOpen}
            className="neon-btn-secondary flex items-center gap-2 px-4 py-1.5 text-xs font-mono rounded"
          >
            <Settings className="w-3.5 h-3.5" />
            SETTINGS
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-neon" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-neon-dim bg-black px-4 py-3 flex flex-col gap-3">
          <button
            onClick={() => { onSettingsOpen(); setMenuOpen(false); }}
            className="neon-btn-secondary flex items-center gap-2 px-4 py-2 text-xs font-mono w-full justify-center"
          >
            <Settings className="w-3.5 h-3.5" />
            SETTINGS / API KEY
          </button>
        </div>
      )}
    </nav>
  );
}

import { Link } from 'react-router-dom';
import MatrixRain from '../components/MatrixRain';

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono relative overflow-hidden">
      <MatrixRain />

      {/* Scanline overlay already in CSS */}

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Glitch 404 */}
        <div
          className="glitch-text"
          data-text="404"
          style={{
            fontSize: 'clamp(80px, 25vw, 200px)',
            fontWeight: '900',
            color: '#00FF41',
            textShadow: '0 0 20px #00FF41, 0 0 40px #00FF41, 0 0 80px #00FF41',
            lineHeight: 1,
            letterSpacing: '-0.05em',
            fontFamily: 'Fira Code, monospace',
          }}
        >
          404
        </div>

        {/* Scanline on number */}
        <div
          style={{
            position: 'relative',
            marginTop: '-30px',
            width: 'clamp(200px, 50vw, 400px)',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #00FF41, transparent)',
            boxShadow: '0 0 15px #00FF41',
          }}
        />

        <h1
          className="mt-8 text-2xl md:text-3xl tracking-[0.3em] uppercase"
          style={{ color: '#00cc33', textShadow: '0 0 10px #00cc33', fontFamily: 'Fira Code, monospace' }}
        >
          Page Not Found
        </h1>

        <p
          className="mt-4 text-sm md:text-base max-w-xs leading-relaxed"
          style={{ color: '#00cc33', fontFamily: 'Fira Code, monospace', textShadow: '0 0 5px #00cc33' }}
        >
          The page &quot;&quot; could not be found in this application.
        </p>

        <Link
          to="/"
          className="mt-10 inline-flex items-center gap-2 px-10 py-3 text-sm tracking-widest uppercase"
          style={{
            color: '#00FF41',
            border: '1px solid #00FF41',
            boxShadow: '0 0 15px rgba(0,255,65,0.4), inset 0 0 15px rgba(0,255,65,0.05)',
            fontFamily: 'Fira Code, monospace',
            clipPath: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(0,255,65,0.1)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,65,0.7), inset 0 0 20px rgba(0,255,65,0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(0,255,65,0.4), inset 0 0 15px rgba(0,255,65,0.05)';
          }}
        >
          Go Home &gt;
        </Link>
      </div>
    </div>
  );
}

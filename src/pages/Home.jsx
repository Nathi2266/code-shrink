import { useState, useCallback } from 'react';
import { Zap, Download, FileArchive, Languages, AlertTriangle, RefreshCw } from 'lucide-react';
import MatrixRain from '../components/MatrixRain';
import Navbar from '../components/Navbar';
import SettingsModal from '../components/SettingsModal';
import CodeEditor from '../components/CodeEditor';
import ToolbarPanel from '../components/ToolbarPanel';
import StatsBar from '../components/StatsBar';
import ProgressBar from '../components/ProgressBar';
import { shortenCode, calcStats } from '../lib/codeShortener';
import { convertLanguage, getApiKey } from '../lib/aiConverter';
import { downloadAsText, downloadAsZip } from '../lib/downloader';

const DEFAULT_OPTIONS = {
  language: 'JavaScript',
  fromLang: 'JavaScript',
  toLang: 'Python',
  removeComments: true,
  removeBlank: true,
  removeUnused: true,
  minify: false,
  formatting: {
    indentation: '2spaces',
    lineEnding: 'lf',
    style: 'compact',
  },
};

const SAMPLE_CODE = `// Sample JavaScript code — paste your own here
import React, { useState, useEffect, useCallback } from 'react';
import { something } from 'unused-lib';

// This is a helper function
function calculateTotal(items) {
  // Loop through items
  let total = 0;

  for (let i = 0; i < items.length; i++) {
    // Add each item price
    total = total + items[i].price;
  }

  return total;
}

/* 
  Main component
  Renders a list of products
*/
const ProductList = ({ products }) => {
  const [count, setCount] = useState(0);

  // Effect to log count
  useEffect(() => {
    console.log('Count changed:', count);
  }, [count]);

  return (
    <div className="product-list">
      {products.map((product) => {
        return (
          <div key={product.id}>
            <h2>{product.name}</h2>
            <p>{product.price}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;`;

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inputCode, setInputCode] = useState(SAMPLE_CODE);
  const [outputCode, setOutputCode] = useState('');
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('shorten'); // 'shorten' | 'convert'

  const handleShorten = useCallback(async () => {
    if (!inputCode.trim()) return;
    setIsProcessing(true);
    setError('');
    setMode('shorten');
    setProgress(0);

    const result = await shortenCode(
      inputCode,
      {
        language: options.language,
        removeComments: options.removeComments,
        removeBlank: options.removeBlank,
        removeUnused: options.removeUnused,
        minify: options.minify,
        formatting: options.formatting,
      },
      (p, label) => {
        setProgress(p);
        setProgressLabel(label);
      }
    );

    setOutputCode(result.code);
    setStats(calcStats(inputCode, result.code));
    setIsProcessing(false);
    setProgress(100);
  }, [inputCode, options]);

  const handleConvert = useCallback(async () => {
    if (!inputCode.trim()) return;

    const apiKey = getApiKey();
    if (!apiKey) {
      setError('NO_API_KEY: Please add your OpenAI API key in Settings first.');
      setSettingsOpen(true);
      return;
    }

    setIsConverting(true);
    setError('');
    setMode('convert');
    setOutputCode('');
    setProgress(0);

    try {
      setProgressLabel(`Converting ${options.fromLang} → ${options.toLang}...`);
      setProgress(10);

      const result = await convertLanguage({
        code: inputCode,
        fromLang: options.fromLang,
        toLang: options.toLang,
        onChunk: (partial) => {
          setOutputCode(partial);
          setProgress(prev => Math.min(prev + 1, 90));
        },
      });

      setOutputCode(result);
      setStats(calcStats(inputCode, result));
      setProgress(100);
    } catch (err) {
      if (err.message === 'NO_API_KEY' || err.message === 'INVALID_API_KEY') {
        setError('Invalid or missing API key. Please check your OpenAI API key in Settings.');
        setSettingsOpen(true);
      } else if (err.message === 'RATE_LIMIT') {
        setError('OpenAI rate limit reached. Please wait and try again.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsConverting(false);
    }
  }, [inputCode, options]);

  const activeOutput = outputCode;
  const isWorking = isProcessing || isConverting;

  const getOutputFilename = () => {
    const ext = options.toLang?.toLowerCase() === 'python' ? 'py'
      : options.toLang?.toLowerCase() === 'typescript' ? 'ts'
      : options.toLang?.toLowerCase() === 'java' ? 'java'
      : options.toLang?.toLowerCase() === 'css' ? 'css'
      : options.toLang?.toLowerCase() === 'html' ? 'html'
      : 'txt';
    return `shortened_code.${ext}`;
  };

  return (
    <div className="min-h-screen bg-black font-mono relative">
      <MatrixRain />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <Navbar onSettingsOpen={() => setSettingsOpen(true)} />

      {/* Hero */}
      <div className="text-center py-8 px-4">
        <h1 className="text-3xl md:text-5xl font-bold neon-text tracking-widest uppercase mb-2">
          MY_CODE_SHORTENER
        </h1>
        <p className="text-neon-dim text-sm md:text-base font-mono tracking-wide">
          &gt; Client-side code compression &amp; AI language conversion — zero data transmitted
        </p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <span className="stat-badge px-2 py-1 text-xs">🔒 PRIVATE</span>
          <span className="stat-badge px-2 py-1 text-xs">⚡ CLIENT-SIDE</span>
          <span className="stat-badge px-2 py-1 text-xs">🤖 AI POWERED</span>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 pb-10 space-y-4">
        {/* Toolbar */}
        <ToolbarPanel options={options} onChange={setOptions} />

        {/* Action buttons row */}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={handleShorten}
            disabled={isWorking || !inputCode.trim()}
            className="neon-btn px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            SHORTEN_CODE()
          </button>

          <button
            onClick={handleConvert}
            disabled={isWorking || !inputCode.trim()}
            className="neon-btn-secondary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed border rounded"
          >
            {isConverting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Languages className="w-4 h-4" />
            )}
            AI_CONVERT()
          </button>

          <div className="flex-1" />

          {/* Download buttons */}
          {activeOutput && (
            <>
              <button
                onClick={() => downloadAsText(activeOutput, getOutputFilename())}
                className="neon-btn-secondary px-4 py-2 text-xs flex items-center gap-2 border rounded"
              >
                <Download className="w-3.5 h-3.5" />
                .TXT
              </button>
              <button
                onClick={() => downloadAsZip(activeOutput, getOutputFilename())}
                className="neon-btn-secondary px-4 py-2 text-xs flex items-center gap-2 border rounded"
              >
                <FileArchive className="w-3.5 h-3.5" />
                .ZIP
              </button>
            </>
          )}
        </div>

        {/* Progress bar */}
        {isWorking && (
          <ProgressBar progress={progress} label={progressLabel} />
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2 rounded text-xs font-mono"
               style={{ background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,50,50,0.4)', color: '#ff6666' }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button
              onClick={() => setSettingsOpen(true)}
              className="ml-auto underline hover:no-underline"
            >
              Open Settings
            </button>
          </div>
        )}

        {/* Stats */}
        {stats && !isWorking && (
          <StatsBar stats={stats} />
        )}

        {/* Editor panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: '500px' }}>
          <CodeEditor
            title="INPUT.CODE"
            value={inputCode}
            onChange={setInputCode}
            placeholder={'// Paste your code here...\n// Supports JS, TS, Python, Java, C++, CSS, HTML and more\n// Max: 10,000+ lines — all processing is client-side'}
          />
          <CodeEditor
            title={mode === 'convert' ? `OUTPUT.${options.toLang?.toUpperCase()}` : 'OUTPUT.SHORTENED'}
            value={activeOutput}
            onChange={setOutputCode}
            readOnly={false}
            placeholder={'// Output will appear here after processing...\n// Click SHORTEN_CODE() or AI_CONVERT() to begin'}
          />
        </div>

        {/* Footer note */}
        <div className="text-center py-4">
          <p className="text-xs font-mono" style={{ color: 'rgba(0,255,65,0.25)' }}>
            ▓▒░ All processing happens in your browser. Your code never leaves your device. ░▒▓
          </p>
        </div>
      </div>
    </div>
  );
}

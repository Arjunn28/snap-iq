import { useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function Logo() {
  return (
    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="12" height="15" rx="1.5" stroke="white" strokeWidth="1.4"/>
        <line x1="5" y1="7.5" x2="11" y2="7.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="5" y1="10.5" x2="11" y2="10.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="5" y1="13.5" x2="8.5" y2="13.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="16.5" cy="15.5" r="4" fill="#1d4ed8" stroke="white" strokeWidth="1.2"/>
        <circle cx="16.5" cy="15.5" r="2" stroke="white" strokeWidth="1.1"/>
        <line x1="19.3" y1="18.3" x2="20.8" y2="19.8" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">About this project</p>
      <p className="text-sm text-gray-600 leading-relaxed mb-3">
        SnapIQ turns photos of business documents into clean, structured data. Upload a receipt or invoice and the vision AI reads it, extracts every line item, and returns JSON ready to plug into any workflow.
      </p>
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
          <p className="text-xs font-medium text-gray-700">Vision LLM</p>
          <p className="text-xs text-gray-400 mt-0.5">Reads images</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
          <p className="text-xs font-medium text-gray-700">FastAPI</p>
          <p className="text-xs text-gray-400 mt-0.5">Backend API</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
          <p className="text-xs font-medium text-gray-700">React</p>
          <p className="text-xs text-gray-400 mt-0.5">Frontend</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
    setShowJson(false);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Analysis failed");
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setShowJson(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-10 px-4">
        <div className="max-w-xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Logo />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">SnapIQ</h1>
              <p className="text-xs text-gray-500">Business document to structured data</p>
            </div>
          </div>

          {/* About */}
          <AboutSection />

          {/* Upload zone */}
          {!file && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById("file-input").click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white hover:bg-gray-50"
              }`}
            >
              <svg className="mx-auto mb-3 text-gray-300" width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="2" width="13" height="17" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                <line x1="6" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="6" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="6" y1="13" x2="9" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="18" cy="17" r="4.5" fill="white" stroke="currentColor" strokeWidth="1.3"/>
                <circle cx="18" cy="17" r="2.2" stroke="currentColor" strokeWidth="1.1"/>
                <line x1="21" y1="20" x2="22.5" y2="21.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <p className="text-sm text-gray-600 font-medium">Drop a receipt or invoice here</p>
              <p className="text-xs text-gray-400 mt-1">JPG · PNG · WEBP or click to browse</p>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          )}

          {/* Preview + actions */}
          {file && !loading && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 items-start">
              <img src={preview} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-gray-100" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-400 mb-3">{(file.size / 1024).toFixed(1)} KB</p>
                <div className="flex gap-2">
                  <button
                    onClick={analyze}
                    className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Analyze
                  </button>
                  <button
                    onClick={reset}
                    className="px-4 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <div className="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p className="text-sm text-gray-500">Reading document with Vision AI...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-gray-100 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Vendor</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{result.vendor || "N/A"}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Date</p>
                  <p className="text-sm font-medium text-gray-900">{result.date || "N/A"}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                  <p className="text-xs text-indigo-500 uppercase tracking-wide mb-1">Total</p>
                  <p className="text-base font-semibold text-indigo-700">
                    {result.currency} {Number(result.total).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Line items</p>
                {result.line_items?.length > 0 ? (
                  <>
                    {result.line_items.map((item, i) => (
                      <div key={i} className="flex justify-between py-2 border-b border-gray-50 text-sm last:border-0">
                        <span className="text-gray-700">{item.description}</span>
                        <span className="text-gray-500 tabular-nums">
                          {result.currency} {Number(item.amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {result.tax != null && (
                      <div className="flex justify-between py-2 border-b border-gray-50 text-sm text-gray-400">
                        <span>Tax</span>
                        <span className="tabular-nums">{result.currency} {Number(result.tax).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 text-sm font-semibold">
                      <span>Total</span>
                      <span className="text-indigo-700 tabular-nums">
                        {result.currency} {Number(result.total).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">No line items detected</p>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Summary</p>
                <p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p>
              </div>

              <div>
                <button
                  onClick={() => setShowJson(!showJson)}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  {showJson ? "Hide" : "Show"} raw JSON
                </button>
                {showJson && (
                  <pre className="mt-2 bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs text-gray-500 overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-gray-400">Built by Arjun · 2026</p>
      </footer>
    </div>
  );
}

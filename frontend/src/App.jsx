import { useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            S
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">SnapIQ</h1>
            <p className="text-xs text-gray-500">Business document → structured data</p>
          </div>
        </div>

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
            <div className="text-4xl mb-3">📄</div>
            <p className="text-sm text-gray-600 font-medium">Drop a receipt or invoice here</p>
            <p className="text-xs text-gray-400 mt-1">JPG · PNG · WEBP — or click to browse</p>
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
            <p className="text-sm text-gray-500">Reading document with Claude Vision...</p>
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

            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Vendor</p>
                <p className="text-sm font-medium text-gray-900 truncate">{result.vendor || "—"}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Date</p>
                <p className="text-sm font-medium text-gray-900">{result.date || "—"}</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                <p className="text-xs text-indigo-500 uppercase tracking-wide mb-1">Total</p>
                <p className="text-base font-semibold text-indigo-700">
                  {result.currency} {Number(result.total).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Line items */}
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Line items</p>
              <div className="space-y-0">
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
            </div>

            {/* Summary */}
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Summary</p>
              <p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p>
            </div>

            {/* Raw JSON toggle */}
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
  );
}

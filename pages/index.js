import { useState } from 'react';

export default function Home() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fff8f7] flex items-center justify-center">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-xl border border-red-100">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-red-700 tracking-tight">Japanese Invoice OCR Extractor</h1>
        <form onSubmit={handleUpload} className="flex flex-col gap-6">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-red-300 rounded-xl cursor-pointer bg-red-50 hover:bg-red-100 transition">
            <span className="text-red-600 font-medium mb-2">Select PDF files</span>
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={e => setFiles(e.target.files)}
              className="hidden"
            />
            <span className="text-sm text-gray-500">{files.length ? `${files.length} file(s) selected` : 'No file selected'}</span>
          </label>
          <button
            type="submit"
            disabled={!files.length || loading}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow transition disabled:opacity-50 text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Upload and Extract'}
          </button>
        </form>
        {result && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-3 text-red-600">Extracted Data</h2>
            <pre className="bg-red-50 border border-red-100 rounded-xl p-5 text-base overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
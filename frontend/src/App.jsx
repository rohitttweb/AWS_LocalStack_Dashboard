import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000";

function App() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);

  const handleUpload = async () => {
    if (!file) return alert("Select a file first");

    const formData = new FormData();
    formData.append("file", file);

    await axios.post(`${API_BASE}/upload`, formData);
    alert("File uploaded!");
    fetchFiles();
  };

  const fetchFiles = async () => {
    const res = await axios.get(`${API_BASE}/files`);
    console.log(res.data);
    setFiles(res.data);
  };

  const downloadFile = async (filename) => {
    const res = await axios.get(`${API_BASE}/download/${filename}`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">🗂 LocalStack S3 Uploader</h1>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
      >
        Upload
      </button>

      <h2 className="mt-6 text-lg font-semibold">📄 Files in Bucket</h2>
      <ul>
        {files.map((file) => (
          <li key={file.filename} className="flex justify-between items-center mb-3 bg-gray-100 p-3 rounded shadow">
            <div>
              <p className="font-semibold text-gray-800">{file.filename}</p>
              <p className="text-sm text-gray-600">Size: {(file.size / 1024).toFixed(2)} KB</p>
              <p className="text-sm text-gray-500">Uploaded: {new Date(file.date).toLocaleString()}</p>
            </div>
            <button
              onClick={() => downloadFile(file.filename)}
              className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded"
            >
              Download
            </button>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default App;

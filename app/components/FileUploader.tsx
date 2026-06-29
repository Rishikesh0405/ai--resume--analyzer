import React, { useRef, useState } from "react";

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  selectedFile,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        onFileSelect(file);
      } else {
        alert("Only PDF files are supported!");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
      className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[300px] w-full ${
        isDragActive
          ? "border-indigo-500 bg-indigo-500/5 scale-[0.99]"
          : selectedFile
          ? "border-emerald-500/50 bg-emerald-500/5"
          : "border-[var(--border)] bg-[var(--bg-secondary)] hover:border-indigo-500/50 hover:bg-slate-800/20"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
      />

      {!selectedFile ? (
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center border border-[var(--border)] text-3xl group-hover:scale-110 transition duration-300">
            📄
          </div>
          <div>
            <p className="text-base font-bold text-white">
              Drag & drop your resume PDF
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              or click to browse from files
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 text-[10px] font-semibold text-[var(--text-muted)] border border-[var(--border)]">
            PDF ONLY • MAX 10MB
          </div>
        </div>
      ) : (
        <div className="space-y-4 w-full px-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-3xl select-none">
            ✓
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-white truncate max-w-full">
              {selectedFile.name}
            </p>
            <p className="text-xs text-[var(--text-secondary)] font-mono">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition"
          >
            ❌ Remove Resume
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;

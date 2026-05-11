import { useRef, useState, useCallback } from 'react';

interface Props {
  label: string;
  maxSizeMB?: number;
  accept?: string;
  onChange: (file: File | null) => void;
  error?: string;
  existingFileName?: string;
}

export default function FileUploadInput({ label, maxSizeMB = 2, accept = '.pdf', onChange, error, existingFileName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(existingFileName ?? null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validate = useCallback((file: File): string | null => {
    if (accept === '.pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return 'Faili lazima iwe PDF tu.';
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Faili ni kubwa mno. Ukubwa wa juu: ${maxSizeMB}MB.`;
    }
    return null;
  }, [accept, maxSizeMB]);

  const handleFile = useCallback((file: File) => {
    const err = validate(file);
    if (err) { setLocalError(err); onChange(null); return; }
    setLocalError(null);
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(0) + ' KB');
    onChange(file);
  }, [validate, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setFileName(null);
    setFileSize(null);
    setLocalError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayError = error || localError;
  const hasFile = !!fileName;

  return (
    <div className="w-full">
      <label className="label">{label}</label>

      {!hasFile ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`
            relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl cursor-pointer
            transition-all duration-200 min-h-[120px]
            ${dragOver
              ? 'border-2 border-primary bg-primary-light scale-[1.02]'
              : displayError
                ? 'border-2 border-dashed border-danger bg-danger-light/30'
                : 'border-2 border-dashed border-primary/40 bg-surface hover:border-primary hover:bg-primary-light/30'
            }
          `}
        >
          {/* PDF icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl
            ${displayError ? 'bg-danger-light' : 'bg-primary-light'}`}>
            📄
          </div>
          <div className="text-center">
            <p className={`text-sm font-medium font-body ${displayError ? 'text-danger' : 'text-primary'}`}>
              Buruta hapa au <span className="underline">bonyeza kupakia</span>
            </p>
            <p className="text-xs text-text-muted mt-1 font-body">
              {accept.toUpperCase()} pekee • Ukubwa wa juu: {maxSizeMB}MB
            </p>
          </div>
          <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-light border border-primary/20">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white text-sm flex-shrink-0">
            PDF
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate font-body">{fileName}</p>
            {fileSize && <p className="text-xs text-text-muted font-body">{fileSize}</p>}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="w-7 h-7 rounded-full bg-danger-light text-danger flex items-center justify-center text-xs hover:bg-danger hover:text-white transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {displayError && (
        <p className="text-xs text-danger mt-1.5 flex items-center gap-1 font-body">
          <span>⚠</span> {displayError}
        </p>
      )}
    </div>
  );
}

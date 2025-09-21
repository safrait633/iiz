import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './FileDropZone.css';
import { detectCodeKind } from '../utils/detectCodeKind';

export default function FileDropZone({ onContentReady, disabled }) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const inputRef = useRef(null);

  const readTextFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });

  const handleFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Ограничимся текстовыми типами
    if (file.type && !file.type.startsWith('text/') && !/json|xml|javascript|.+/.test(file.type)) {
  setFileInfo({ name: file.name, error: t('onlyTextFiles') || 'Поддерживаются только текстовые файлы кода' });
      return;
    }

    try {
      const content = await readTextFile(file);
      const kind = detectCodeKind(content, file.name);
      setFileInfo({ name: file.name, size: file.size, kind: kind.kind });
      onContentReady?.({ content, fileName: file.name, kind });
    } catch (e) {
  setFileInfo({ name: file.name, error: `${t('fileReadError') || 'Ошибка чтения файла'}: ${e.message}` });
    }
  }, [onContentReady]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [disabled, handleFiles]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  }, [disabled]);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);
  }, [disabled]);

  const onClickSelect = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div 
      className={"dropzone " + (isDragging ? 'dragging' : '') + (disabled ? ' disabled' : '')}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onClickSelect}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".html,.htm,.css,.js,.mjs,.cjs,.ts,.tsx,.jsx,.json,.xml,.yml,.yaml,.md,.py,.java,.cs,.cpp,.c,.php,.rb,.sh,.txt"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />

      <div className="dz-content">
  <div className="dz-title">{t('dropTitle')}</div>
  <div className="dz-subtitle">{t('dropSubtitle')}</div>
        {fileInfo && (
          <div className="dz-fileinfo">
            {fileInfo.error ? (
              <span className="dz-error">{fileInfo.error}</span>
            ) : (
              <span>{fileInfo.name} • {fileInfo.kind}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

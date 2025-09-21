import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './HTMLAnalyzer.css';

const HTMLAnalyzer = ({ onAnalyze, isLoading }) => {
  const [htmlCode, setHtmlCode] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (htmlCode.trim()) {
      onAnalyze(htmlCode);
    }
  };

  const handleClear = () => {
    setHtmlCode('');
  };

  return (
    <div className="html-analyzer">
      <h2>{t('analyzerTitle')}</h2>
      <form onSubmit={handleSubmit} className="analyzer-form">
        <div className="textarea-container">
          <label htmlFor="html-input">{t('inputLabel')}</label>
          <textarea
            id="html-input"
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            placeholder={t('placeholderHtml')}
            rows={15}
            cols={80}
            disabled={isLoading}
          />
        </div>
        <div className="button-group">
          <button 
            type="submit" 
            disabled={!htmlCode.trim() || isLoading}
            className="analyze-btn"
          >
            {isLoading ? t('loading') : t('analyze')}
          </button>
          <button 
            type="button" 
            onClick={handleClear}
            disabled={isLoading}
            className="clear-btn"
          >
            {t('clear')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HTMLAnalyzer;
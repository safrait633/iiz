import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ResultViewer.css';
import { detectCodeKind, suggestFileName } from '../utils/detectCodeKind';

const ResultViewer = ({ result, isLoading, error, role }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const { t } = useTranslation();

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Можно добавить уведомление о копировании
  };

  const downloadText = (text, filename, mime = 'text/plain') => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    if (!result) return;
    const content = result.response || JSON.stringify(result, null, 2);
    const kindInfo = detectCodeKind(content, '');
    const ext = kindInfo.ext || 'txt';
    const mime = kindInfo.mime || 'text/plain;charset=utf-8';
    const fname = suggestFileName('ai-analysis', role || result.role, ext);
    downloadText(content, fname, mime);
  };

  const handleDownloadJSON = () => {
    if (!result) return;
    const json = JSON.stringify(result, null, 2);
    const fname = suggestFileName('ai-analysis', role || result.role, 'json');
    downloadText(json, fname, 'application/json');
  };

  if (isLoading) {
    return (
      <div className="result-viewer loading">
        <div className="loading-spinner"></div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-viewer error">
        <h3>{t('errorTitle')}</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!result) return null;

  if (result.role || result.response) {
    return (
      <div className="result-viewer">
        <div className="role-header">
          <h3>{(role || result.role) === 'doctor' ? t('doctorTitle') : (role || result.role) === 'logistician' ? t('logisticianTitle') : t('seniorTitle')}</h3>
          {result.timestamp && <span className="timestamp">{new Date(result.timestamp).toLocaleString()}</span>}
        </div>

        <div className="response-content">
          <div className="response-text">
            <pre>{result.response || JSON.stringify(result, null, 2)}</pre>
          </div>

          <div className="response-actions">
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText(result.response || JSON.stringify(result, null, 2))}>{t('copy')}</button>
            <button className="copy-btn" onClick={handleDownload}>{t('downloadTxt')}</button>
            <button className="copy-btn" onClick={handleDownloadJSON}>{t('downloadJson')}</button>
          </div>
        </div>
      </div>
    );
  }

  const renderForms = (forms) => {
    if (!forms || forms.length === 0) {
      return <p className="no-data">{t('formsNotFound') || 'Формы не найдены'}</p>;
    }

    return forms.map((form, index) => (
      <div key={index} className="form-item">
        <h4>{t('formLabel', { id: form.id || `${index + 1}` }) || `Форма: ${form.id || `Форма ${index + 1}`}`}</h4>
        {form.elements && form.elements.map((element, elemIndex) => (
          <div key={elemIndex} className="element-item">
            <div className="element-header">
              <span className="element-type">{element.type}</span>
              <code className="element-selector">{element.selector}</code>
            </div>
            <p className="element-behavior">{element.behavior}</p>
            {element.interactions && element.interactions.length > 0 && (
              <div className="interactions">
                <h6>{t('interactions') || 'Взаимодействия:'}</h6>
                {element.interactions.map((interaction, intIndex) => (
                  <div key={intIndex} className="interaction">
                    <strong>{interaction.event}</strong> → {interaction.target}: {interaction.action}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    ));
  };

  const renderInteractiveElements = (elements) => {
    if (!elements || elements.length === 0) {
      return <p className="no-data">{t('interactiveNotFound') || 'Интерактивные элементы не найдены'}</p>;
    }

    return elements.map((element, index) => (
      <div key={index} className="interactive-element">
        <div className="element-header">
          <span className="element-type">{element.type}</span>
          <code className="element-selector">{element.selector}</code>
        </div>
        <p className="element-behavior">{element.behavior}</p>
        {element.events && (
          <div className="events">
            <strong>{t('events') || 'События:'}</strong> {element.events.join(', ')}
          </div>
        )}
      </div>
    ));
  };

  const renderSuggestedScripts = (scripts) => {
    if (!scripts || scripts.length === 0) {
      return <p className="no-data">{t('scriptsEmpty') || 'Предложенные скрипты отсутствуют'}</p>;
    }

    return scripts.map((script, index) => (
      <div key={index} className="script-item">
        <div className="script-header">
          <h5>{script.purpose}</h5>
          <button 
            className="copy-btn"
            onClick={() => copyToClipboard(script.code)}
            title={t('copyCode') || 'Копировать код'}
          >
            {t('copy')}
          </button>
        </div>
        <p className="script-description">{script.description}</p>
        <pre className="script-code">
          <code>{script.code}</code>
        </pre>
      </div>
    ));
  };

  const renderRecommendations = (recommendations) => {
    if (!recommendations || recommendations.length === 0) {
      return <p className="no-data">{t('recommendationsEmpty') || 'Рекомендации отсутствуют'}</p>;
    }

    return (
      <ul className="recommendations-list">
        {recommendations.map((recommendation, index) => (
          <li key={index}>{recommendation}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="result-viewer">
      <div className="tabs">
        <div className="tab active">
          {t('analyze')}
        </div>
      </div>

      <div className="tab-content">
        <div className="analysis-content">
          <div className="section">
            <div 
              className="section-header"
              onClick={() => toggleSection('forms')}
            >
              <h3>{t('forms') || 'Формы'}</h3>
              <span className="toggle-icon">
                {expandedSections.forms ? '▼' : '▶'}
              </span>
            </div>
            {(expandedSections.forms !== false) && (
              <div className="section-content">
                {renderForms(result.analysis?.forms)}
              </div>
            )}
          </div>

          <div className="section">
            <div 
              className="section-header"
              onClick={() => toggleSection('interactive')}
            >
              <h3>{t('interactiveElements') || 'Интерактивные элементы'}</h3>
              <span className="toggle-icon">
                {expandedSections.interactive ? '▼' : '▶'}
              </span>
            </div>
            {(expandedSections.interactive !== false) && (
              <div className="section-content">
                {renderInteractiveElements(result.analysis?.interactive_elements)}
              </div>
            )}
          </div>

          <div className="section">
            <div 
              className="section-header"
              onClick={() => toggleSection('scripts')}
            >
              <h3>{t('suggestedScripts') || 'Предложенные скрипты'}</h3>
              <span className="toggle-icon">
                {expandedSections.scripts ? '▼' : '▶'}
              </span>
            </div>
            {(expandedSections.scripts !== false) && (
              <div className="section-content">
                {renderSuggestedScripts(result.analysis?.suggested_scripts)}
              </div>
            )}
          </div>

          <div className="section">
            <div 
              className="section-header"
              onClick={() => toggleSection('recommendations')}
            >
              <h3>{t('recommendations') || 'Рекомендации'}</h3>
              <span className="toggle-icon">
                {expandedSections.recommendations ? '▼' : '▶'}
              </span>
            </div>
            {(expandedSections.recommendations !== false) && (
              <div className="section-content">
                {renderRecommendations(result.recommendations)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultViewer;
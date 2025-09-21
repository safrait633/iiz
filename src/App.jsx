import React, { useState, useEffect } from 'react';
import HTMLAnalyzer from './components/HTMLAnalyzer';
import ResultViewer from './components/ResultViewer';
import FileDropZone from './components/FileDropZone';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';
import Login from './components/Login';
import { analyzeHTML, mockAnalyzeHTML } from './services/aiService';
import { detectCodeKind } from './utils/detectCodeKind';
import './App.css';

function App() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    try { setAuthed(localStorage.getItem('session') === 'ok'); } catch {}
  }, []);
  const { t } = useTranslation();
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('cee8a29087f44ed5baf9eebd59b981fb.cpnfhGuYHz14CrtZ');
  const [useMockData, setUseMockData] = useState(false);
  const [currentStep, setCurrentStep] = useState('doctor'); // doctor -> logistician -> senior_programmer
  const [workflow, setWorkflow] = useState([]);
  const [currentHtmlCode, setCurrentHtmlCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [detected, setDetected] = useState(null);
  const [lastFile, setLastFile] = useState(null);

  const handleDropReady = ({ content, fileName, kind }) => {
    setDetected(kind);
    setLastFile({ name: fileName, kind: kind.kind });
    // Если это не HTML, все равно можно отправить — эксперт поймет контекст
    handleAnalyze(content);
  };

  const handleAnalyze = async (htmlCode) => {
    setCurrentHtmlCode(htmlCode);
    setIsLoading(true);
    setError(null);
    setCurrentStep('doctor');
    setWorkflow([]);
    
    try {
      let result;
      if (useMockData) {
        result = await mockAnalyzeHTML(htmlCode);
      } else {
        if (!apiKey.trim()) {
          throw new Error('Введите API ключ для использования ИИ анализа');
        }
        result = await analyzeHTML(htmlCode, apiKey, 'doctor');
      }
      
      const newWorkflow = [{
        step: 'doctor',
        result: result,
        timestamp: new Date().toISOString()
      }];
      
      setWorkflow(newWorkflow);
      setAnalysisResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (currentStep === 'doctor') {
      // Принимаем анализ врача, отправляем логисту
      setCurrentStep('logistician');
      setIsLoading(true);
      
      try {
        const previousResponse = workflow[workflow.length - 1].result.response || workflow[workflow.length - 1].result;
        const result = await analyzeHTML(currentHtmlCode, apiKey, 'logistician', typeof previousResponse === 'string' ? previousResponse : JSON.stringify(previousResponse));
        
        const newWorkflow = [...workflow, {
          step: 'logistician',
          result: result,
          timestamp: new Date().toISOString()
        }];
        
        setWorkflow(newWorkflow);
        setAnalysisResult(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 'logistician') {
      // Принимаем план логиста, отправляем senior программисту
      setCurrentStep('senior_programmer');
      setIsLoading(true);
      
      try {
        const previousResponse = workflow[workflow.length - 1].result.response || workflow[workflow.length - 1].result;
        const result = await analyzeHTML(currentHtmlCode, apiKey, 'senior_programmer', typeof previousResponse === 'string' ? previousResponse : JSON.stringify(previousResponse));
        
        const newWorkflow = [...workflow, {
          step: 'senior_programmer',
          result: result,
          timestamp: new Date().toISOString()
        }];
        
        setWorkflow(newWorkflow);
        setAnalysisResult(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Финальное принятие
      alert('Workflow завершен! Все этапы пройдены успешно.');
    }
  };

  const handleRevision = async () => {
    if (!feedback.trim()) {
      alert('Введите комментарии для доработки');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const previousResponse = workflow[workflow.length - 1].result.response || workflow[workflow.length - 1].result;
      const fullPrompt = `КОММЕНТАРИИ ДЛЯ ДОРАБОТКИ: ${feedback}\n\nПРЕДЫДУЩИЙ ОТВЕТ:\n${typeof previousResponse === 'string' ? previousResponse : JSON.stringify(previousResponse)}`;
      
      const result = await analyzeHTML(currentHtmlCode, apiKey, currentStep, fullPrompt);
      
      const newWorkflow = [...workflow, {
        step: `${currentStep}_revision`,
        result: result,
        timestamp: new Date().toISOString(),
        feedback: feedback
      }];
      
      setWorkflow(newWorkflow);
      setAnalysisResult(result);
      setFeedback('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearResults = () => {
    setAnalysisResult(null);
    setError(null);
    setWorkflow([]);
    setCurrentStep('doctor');
    setFeedback('');
  };

  const getStepTitle = (step) => {
    switch(step) {
      case 'doctor': return 'Анализ врача-эксперта';
      case 'logistician': return 'Архитектор систем';
      case 'senior_programmer': return 'Senior Developer';
      default: return step;
    }
  };

  const getNextStepText = () => {
    switch(currentStep) {
      case 'doctor': return 'Отправить логисту';
      case 'logistician': return 'Отправить Senior Developer';
      case 'senior_programmer': return 'Завершить workflow';
      default: return 'Принять';
    }
  };

  if (!authed) {
    return <Login onSuccess={() => setAuthed(true)} />;
  }

  const logout = () => { try { localStorage.removeItem('session'); } catch {}; setAuthed(false); };

  return (
    <div className="app">
      <header className="app-header">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
          <div>
            <h1>{t('appTitle')}</h1>
            <p>{t('appSubtitle')}</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <LanguageSwitcher />
            <button onClick={logout} className="clear-results-btn">{t('logout')}</button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Status Panel */}
        <div className="status-panel glass" style={{marginBottom:16,padding:16}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:16,alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
              <div><strong>{t('status')}:</strong> {isLoading ? t('loading') : 'OK'}</div>
              <div><strong>{t('role')}:</strong> {currentStep}</div>
              <div><strong>{t('lastUpdate')}:</strong> {workflow.length ? new Date(workflow[workflow.length-1].timestamp).toLocaleTimeString() : '-'}</div>
              <div><strong>{t('apiStatus')}:</strong> {apiKey?.trim() ? t('configured') : t('notConfigured')}</div>
              {lastFile && <div><strong>{t('file')}:</strong> {lastFile.name} ({lastFile.kind})</div>}
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="clear-results-btn" onClick={handleClearResults}>{t('clear')}</button>
              {analysisResult && <button className="accept-btn" onClick={()=>handleAccept()}>{getNextStepText()}</button>}
            </div>
          </div>
        </div>
        <div className="settings-panel">
          <div className="mode-toggle">
            <label>
              <input
                type="checkbox"
                checked={useMockData}
                onChange={(e) => setUseMockData(e.target.checked)}
              />
              {t('useMock')}
            </label>
          </div>
          
          {!useMockData && (
            <div className="api-key-input">
              <label>
                {t('apiKey')}
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t('apiKey')}
                />
              </label>
            </div>
          )}
        </div>

        <FileDropZone onContentReady={handleDropReady} disabled={isLoading} />

        {workflow.length > 0 && (
          <div className="workflow-progress">
            <h3>{t('progressTitle')}</h3>
            <div className="workflow-steps">
              {workflow.map((item, index) => (
                <div key={index} className={`workflow-step ${item.step.includes('revision') ? 'revision' : ''}`}>
                  <span className="step-number">{index + 1}</span>
                  <span className="step-title">{getStepTitle(item.step.replace('_revision', ''))}</span>
                  {item.step.includes('revision') && <span className="revision-badge">{t('toRevision')}</span>}
                  <span className="step-time">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <HTMLAnalyzer onAnalyze={handleAnalyze} isLoading={isLoading} />
        
        {(analysisResult || isLoading || error) && (
          <div className="results-section">
            <div className="results-header">
              <h2>{getStepTitle(currentStep)}</h2>
              {analysisResult && (
                <div className="workflow-controls">
                  <button onClick={handleAccept} className="accept-btn" disabled={isLoading}>
                    {getNextStepText()}
                  </button>
                  {currentStep !== 'senior_programmer' && (
                    <button onClick={() => setFeedback('')} className="revise-btn" disabled={isLoading}>
                      {t('toRevision')}
                    </button>
                  )}
                  <button onClick={handleClearResults} className="clear-results-btn">
                    {t('clear')}
                  </button>
                </div>
              )}
            </div>
            
            {!isLoading && analysisResult && currentStep !== 'senior_programmer' && (
              <div className="feedback-section">
                <label>
                  Комментарии для доработки:
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Введите ваши комментарии и требования для доработки..."
                    rows={3}
                  />
                </label>
                {feedback.trim() && (
                  <button onClick={handleRevision} className="send-revision-btn" disabled={isLoading}>
                    Отправить на доработку
                  </button>
                )}
              </div>
            )}
            
            <ResultViewer 
              result={analysisResult} 
              isLoading={isLoading} 
              error={error}
              role={currentStep}
            />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Медицинский анализ кода через экспертную цепочку ИИ</p>
      </footer>
    </div>
  );
}

export default App;

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const change = (lng) => {
    i18n.changeLanguage(lng);
    try { localStorage.setItem('lang', lng); } catch {}
  };
  return (
    <div className="lang-switcher" role="group" aria-label="Language switcher">
      <button onClick={() => change('ru')}>RU</button>
      <button onClick={() => change('en')}>EN</button>
      <button onClick={() => change('es')}>ES</button>
    </div>
  );
}

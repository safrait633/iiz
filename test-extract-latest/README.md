# HTML ИИ Анализатор

React приложение для анализа HTML кода через ИИ API с получением переработанного результата в JSON формате.

## Возможности

- 📝 Загрузка HTML кода через удобный интерфейс
- 🤖 Анализ логики поведения форм и интерактивных элементов
- 📊 Получение структурированного JSON результата
- 🎯 Предложения по улучшению кода
- 💡 Генерация JavaScript скриптов для форм
- 🔧 Тестовый режим с мок-данными

## Технологический стек

- **React** - библиотека для создания пользовательского интерфейса
- **Vite** - современный инструмент сборки
- **CSS Modules** - для стилизации компонентов
- **Fetch API** - для HTTP запросов к ИИ API

## Структура проекта

```
src/
├── components/
│   ├── HTMLAnalyzer.jsx     # Компонент для ввода HTML
│   ├── HTMLAnalyzer.css
│   ├── ResultViewer.jsx     # Компонент отображения результатов
│   └── ResultViewer.css
├── services/
│   └── aiService.js         # Сервис для работы с ИИ API
├── App.jsx                  # Главный компонент
├── App.css
├── index.css
└── main.jsx
```

## Установка и запуск

1. Клонировать репозиторий
2. Установить зависимости:
   ```bash
   npm install
   ```
3. Запустить приложение:
   ```bash
   npm run dev
   ```

## Использование

### Тестовый режим
По умолчанию приложение работает в тестовом режиме с мок-данными. Это позволяет протестировать функциональность без реального API ключа.

### Реальный ИИ анализ
1. Отключите опцию "Использовать тестовые данные"
2. Введите ваш OpenAI API ключ
3. Вставьте HTML код в текстовое поле
4. Нажмите "Анализировать"

## Формат результата

Приложение возвращает JSON с детальным анализом:

```json
{
  "analysis": {
    "forms": [...],
    "interactive_elements": [...],
    "suggested_scripts": [...]
  },
  "recommendations": [...]
}
```

## Возможности анализа

- ✅ Определение типов элементов форм
- ✅ Анализ событий и взаимодействий
- ✅ Генерация CSS селекторов
- ✅ Предложение JavaScript кода
- ✅ Рекомендации по улучшению UX
- ✅ Анализ доступности (ARIA)

## Команды разработки

- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка для продакшена
- `npm run preview` - предварительный просмотр сборки

## Конфигурация API

Для использования реального ИИ анализа:

1. Получите API ключ от OpenAI
2. В файле `src/services/aiService.js` настройте:
   - `AI_API_URL` - URL вашего API endpoint
   - Модель и параметры запроса

## Лицензия

MIT+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# doctorkadyrbekova.kz — Frontend

React-сайт доктора Кадырбековой. Написан под ТЗ заказчика.

## Стек
- React 18 + Vite
- CSS Modules (per-component .css файлы)
- Без сторонних UI-библиотек (всё кастомное)

## Запуск

```bash
npm install
npm run dev
```

Открыть: http://localhost:5173

## Сборка

```bash
npm run build
```

## Структура

```
src/
├── App.jsx                 # Корневой компонент, роутинг по секциям
├── index.css               # Глобальные стили, CSS-переменные, кнопки
├── main.jsx                # Точка входа
├── api.js                  # 🔌 Слой интеграции с бэкендом (ЗДЕСЬ АПИШКИ)
└── components/
    ├── Navbar.jsx / .css
    ├── Hero.jsx / .css
    ├── About.jsx / .css
    ├── Services.jsx / .css
    ├── Courses.jsx / .css
    ├── Blog.jsx / .css
    ├── Reviews.jsx / .css
    ├── Contacts.jsx / .css
    └── Footer.jsx / .css
```

## 🔌 Подключение API (для тиммейта)

Все эндпоинты описаны в `src/api.js`. Когда будут готовы апишки:

1. Создать `.env` в корне:
```
VITE_API_URL=https://your-backend-url.kz
```

2. В нужных компонентах заменить заглушку `// TODO: replace with real API call` на:
```js
import { createAppointment } from "../api";

// В Contacts.jsx handleSubmit:
await createAppointment(form);
```

### Ожидаемые эндпоинты

| Метод | URL | Описание |
|-------|-----|----------|
| POST | /api/appointments | Запись на консультацию |
| GET  | /api/courses | Список курсов |
| POST | /api/course-applications | Заявка на курс |
| GET  | /api/posts | Статьи блога |
| GET  | /api/reviews | Отзывы |

## 📸 Фото доктора

Положить фотографии в `public/assets/`:
- `doctor.jpg` — главная страница (Hero)
- `doctor-about.jpg` — раздел О докторе

В компонентах раскомментировать строки с `<img>` и удалить `__placeholder`.

## Дизайн

Цветовая схема: тёплый sage green + muted rose
Шрифты: Cormorant Garamond (заголовки) + Jost (текст)
Мобайл-фёрст: все секции адаптивны от 320px

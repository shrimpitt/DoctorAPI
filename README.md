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

---

## 💳 Mock/Demo система оплаты

> Все платежи — тестовые. Реальные деньги не списываются.

### Как работает

1. Пользователь оформляет заказ на `/checkout`
2. Сразу после создания заказа открывается **PaymentModal** (Stripe/Kaspi-стиль)
3. Пользователь вводит тестовые данные карты
4. Frontend валидирует данные, затем:
   - `POST /api/payments/initiate` — создаёт payment session (orderId → sessionId)
   - Симулирует задержку банка ~1.8 секунды
   - `POST /api/payments/confirm` — подтверждает или отклоняет платёж
5. Статус заказа обновляется до `paid` / `failed`
6. Пользователь видит экран успеха или ошибки

Если закрыть модал без оплаты — заказ остаётся с `paymentStatus: unpaid`.  
На странице заказа `/order/:id` всегда доступна кнопка **"Оплатить заказ"**.

### Тестовые номера карт

| Номер карты           | Результат          |
|-----------------------|--------------------|
| `4242 4242 4242 4242` | ✅ Успешная оплата |
| `4111 1111 1111 1111` | ✅ Успешная оплата |
| `5555 5555 5555 4444` | ✅ Успешная оплата |
| `4000 0000 0000 0002` | ❌ Отказ банка     |
| Любая другая + CVV `000` | ❌ Отказ банка |

Срок действия и CVV — любые валидные (месяц не истёк, CVV 3 цифры).

### Доступные статусы заказа

| Статус            | Описание                              |
|-------------------|---------------------------------------|
| `pending`         | Заказ создан, ожидает оплаты          |
| `awaiting_payment`| Инициирован платёж, ожидаем подтверждение |
| `paid`            | Оплачен успешно                       |
| `failed`          | Платёж отклонён                       |
| `cancelled`       | Отменён                               |

### Backend endpoints (Mock Payment API)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `POST` | `/api/payments/initiate` | Создать payment session |
| `POST` | `/api/payments/confirm` | Подтвердить / отклонить (mock) |
| `GET`  | `/api/payments/{orderId}/status` | Получить статус платежа |

#### POST /api/payments/initiate
```json
{ "orderId": 42, "paymentMethod": "card", "cardNetwork": "visa", "cardLastFour": "4242" }
```
Response: `{ orderId, paymentSessionId, status, amount, currency }`

#### POST /api/payments/confirm
```json
{ "orderId": 42, "paymentSessionId": "abc...", "mockSuccess": true, "cardLastFour": "4242", "cardNetwork": "visa" }
```
Response (success): `{ success: true, transactionId, status: "paid", paidAt, mockTransactionData }`
Response (fail):    `{ success: false, status: "failed", message }`

#### GET /api/payments/{orderId}/status
Response: `{ orderId, orderNumber, status, paymentStatus, paymentMethod, paidAt }`

### Файловая структура платёжной системы

```
src/
├── services/
│   └── paymentService.js          # Утилиты: валидация, форматирование, детекция сети карты
├── components/payment/
│   ├── PaymentModal.jsx            # Компонент платёжной формы
│   └── PaymentModal.css            # Stripe-стиль стили
├── pages/
│   ├── CheckoutPage.jsx            # Открывает PaymentModal после создания заказа
│   └── OrderPage.jsx               # Показывает статус + кнопку "Оплатить"
└── api.js                          # initiatePayment(), confirmPayment(), getPaymentStatus()

DoctorAPI/
├── Controllers/PaymentsController.cs   # /api/payments/* endpoints
└── DTOs/
    ├── InitiatePaymentDto.cs
    └── ConfirmPaymentDto.cs
```

### Подключение реальных провайдеров

Все точки интеграции помечены комментариями `// TODO` в коде.

**Stripe:**
```js
// paymentService.js — заменить confirmPayment() вызов на:
const { paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: cardElement }
});
```

**Kaspi Pay:**
```csharp
// PaymentsController.cs — Initiate(): вместо генерации sessionId вызвать:
var kaspiResponse = await _kaspiClient.CreatePayment(order.TotalAmount, "KZT");
```

**CloudPayments:**
```js
// PaymentModal.jsx — заменить form на виджет:
const widget = new cp.CloudPayments();
widget.charge({ publicId: "pk_xxx", amount: totalAmount, currency: "KZT" }, onSuccess, onFail);
```

**PayPal** (уже частично реализован в `OrdersController.cs`):
```
POST /api/orders/{id}/payment/paypal/create-order
POST /api/orders/{id}/payment/paypal/capture
```

> Для production оплаты необходимы: зарегистрированная компания, договор с провайдером, Production API ключи, настройка SSL и PCI DSS compliance.

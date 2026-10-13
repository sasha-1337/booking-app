# 🏢 Conference Room Booking System

> Сучасна повнофункціональна система для пошуку, динамічного розрахунку вартості та бронювання конференц-залів із захистом від колізій і підтримкою адміністративного керування.

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-EF%20Core%209-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest%20Passed-449C44?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Security-Strict%20Env%20Isolation-green)](#-безпека-та-конфігурація)

---

## 📌 Зміст
- [Огляд проєкту](#-огляд-проєкту)
- [Архітектура та можливості](#-архітектура-та-можливості)
  - [Ціноутворення та часові тарифи](#-динамічне-ціноутворення)
  - [Управління бронюваннями та колізіями](#-захист-від-подвійного-бронювання)
  - [Автоматичне очищення (Background Service)](#-фоновий-сервіс-очищення)
- [Технологічний стек](#-технологічний-стек)
- [Безпека та конфіденційність даних](#-безпека-та-конфігурація)
- [Структура репозиторію](#-структура-репозиторію)
- [Швидкий старт](#-швидкий-старт)
  - [Вимоги](#вимоги)
  - [Запуск Backend (.NET 10 + PostgreSQL)](#1-налаштування-та-запуск-backend)
  - [Запуск Frontend (React + Vite)](#2-налаштування-та-запуск-frontend)
- [REST API специфікація](#-rest-api-специфікація)
- [Тестування](#-тестування)
- [Ліцензія та автор](#-ліцензія)

---

## 🌟 Огляд проєкту

**Conference Room Booking System** вирішує проблему бронювання конференц-просторів для бізнесу, усуваючи конфлікти розкладу («double booking») та надаючи прозорий миттєвий підрахунок вартості оренди з урахуванням погодинних інтервалів, пікових навантажень і додаткових послуг (Wi-Fi, проєктор, звукове обладнання).

### Ключові можливості:
- 🔍 **Каталог залів із фільтрацією**: вибір дати, часу початку й завершення, мінімальної місткості, сортування за ціною, назвою чи місткістю.
- ⚡ **Динамічний білінг у реальному часі**: автоматичний перерахунок ціни при виборі послуг або зміні тривалості без затримок інтерфейсу.
- 🛡️ **Гарантія відсутності овербукінгу**: транзакції на рівні `IsolationLevel.Serializable` та тимчасове холдування слоту на 15 хвилин.
- ⏳ **Фонова очистка прострочених холдів**: автоматичний фоновий воркер для звільнення неоплачених або непідтверджених слотів.
- 🛠️ **Адміністративна панель**: створення, редагування параметрів, управління доступними сервісами та м'яке видалення (Soft Delete) залів.
- 🌓 **Сучасний UI/UX**: адаптивна панель деталей (Sheet/Drawer), підтримка світлої та темної тем, повна доступність (ARIA / Radix UI).
- 🔄 **Режим Mock / Standalone**: можливість запуску клієнта через Mock Service Worker (MSW) без попереднього підняття бази даних.

---

## 🏗️ Архітектура та можливості

```text
               ┌────────────────────────────────────────────────────────┐
               │              Frontend (React 18 + Vite)                │
               │  • TanStack Query     • Radix UI / Tailwind CSS        │
               │  • Zod Validation     • Real-time Pricing Engine       │
               └─────────────────┬──────────────────────┬───────────────┘
                                 │                      │
           VITE_USE_MOCKS=false  │                      │ VITE_USE_MOCKS=true
                                 ▼                      ▼
               ┌──────────────────────────────┐   ┌───────────────────────┐
               │    ASP.NET Core REST API     │   │ Mock Service Worker   │
               │  • PricingCalculator         │   │ (In-Browser Emulation)│
               │  • BookingService            │   └───────────────────────┘
               │  • RoomManagementService     │
               │  • ExpiredBookingCleanup     │
               └──────────────┬───────────────┘
                              ▼
               ┌──────────────────────────────┐
               │     PostgreSQL Database      │
               │  (Entity Framework Core 9)   │
               └──────────────────────────────┘
```

### 💰 Динамічне ціноутворення
Розрахунок вартості реалізований як на сервері (`PricingCalculator.cs`), так і на клієнті (`pricing.ts`), що забезпечує миттєвий відгук інтерфейсу:

$$\text{Загальна вартість} = \sum (\text{Години інтервалу} \times \text{Базова ставка} \times \text{Коефіцієнт}) + \sum (\text{Ціни послуг})$$

Тарифна сітка:
- **06:00 – 09:00**: Знижка 10% (коефіцієнт `0.90`)
- **09:00 – 12:00**: Базова ставка (коефіцієнт `1.00`)
- **12:00 – 14:00**: Піковий час, націнка 15% (коефіцієнт `1.15`)
- **14:00 – 18:00**: Базова ставка (коефіцієнт `1.00`)
- **18:00 – 23:00**: Вечірня знижка 20% (коефіцієнт `0.80`)

### 🔒 Захист від подвійного бронювання
- Створення бронювання виконується всередині транзакції `IsolationLevel.Serializable`.
- При успішному резервуванні створюється статус `Pending` з таймером холда `HoldExpiresAtUtc = Now + 15 min`.
- Якщо інший користувач намагається забронювати пересічний слот, система повертає `409 Conflict` (відповідно до стандарту RFC 7807).

### ⏱️ Фоновий сервіс очищення
Сервіс `ExpiredBookingCleanupService` працює як .NET `BackgroundService` з інтервалом 1 хвилина:
- Автоматично переводить `Pending` бронювання, час холда яких вичерпано, у статус `Expired`.
- Слот знову стає доступним для інших користувачів без ручного втручання.

---

## 💻 Технологічний стек

### Backend
- **Платформа**: .NET 10.0 (C# 13)
- **Фреймворк**: ASP.NET Core Web API
- **ORM**: Entity Framework Core 9.0 (Code-First)
- **База даних**: PostgreSQL (через `Npgsql.EntityFrameworkCore.PostgreSQL`)
- **Документація**: Microsoft.AspNetCore.OpenApi / Swagger

### Frontend
- **Фреймворк**: React 18.3, TypeScript 5.7
- **Збирач**: Vite 5
- **Стилізація**: Tailwind CSS, CSS Custom Properties (Theme Switcher)
- **UI-компоненти**: Radix UI Primitives, Lucide Icons, Sonner (Toasts)
- **Управління станом і запитами**: TanStack Query (React Query v5)
- **Форми та валідація**: React Hook Form + Zod
- **API-мокінг**: Mock Service Worker (MSW v2)
- **Тестування**: Vitest, React Testing Library, JSDOM

---

## 🔐 Безпека та конфігурація

Проєкт побудовано з суворим дотриманням політики **Zero Secrets in Source Control**:

1. **Ізоляція секретів**:
   - Файли `.env`, `.env.local`, `.env.production` та робочі конфігурації баз даних додані до `.gitignore` і **ніколи не пушаться у відкритий репозиторій**.
   - Для розробників надаються безпечні шаблони: [`frontend/.env.example`](file:///c:/Users/Admin/Desktop/BookingApp/frontend/.env.example) та [`appsettings.example.json`](file:///c:/Users/Admin/Desktop/BookingApp/appsettings.example.json).

2. **Підключення до бази даних**:
   - Для локальної розробки використовується тестовий рядок збірки.
   - Для Production використовуйте змінні середовища ОС або Secret Manager:
     ```bash
     export ConnectionStrings__DefaultConnection="Host=db.host;Port=5432;Database=BookingDb;Username=myuser;Password=MY_SECRET_PASSWORD"
     ```
   - Або інструмент .NET User Secrets:
     ```bash
     dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=...;Database=...;Username=...;Password=..."
     ```

3. **Валідація вхідних даних**:
   - Всі DTO перевіряються на коректність діапазонів часу, мінімальної місткості та цінових обмежень.
   - Захист від від'ємних часових інтервалів та бронювань у минулому часі.

---

## 📁 Структура репозиторію

```text
BookingApp/
├── Controllers/                 # REST API контролери
│   ├── BookingsController.cs    # Створення, розрахунок та підтвердження бронювань
│   └── RoomsController.cs       # Каталог, фільтрація залів та CRUD
├── Data/                        # Контекст бази даних
│   └── AppDbContext.cs          # EF Core моделі, конфігурація зв'язків та Seed
├── DTOs/                        # Data Transfer Objects
├── Models/                      # Сутності доменної моделі
│   ├── Booking.cs
│   ├── ConferenceRoom.cs
│   ├── Service.cs
│   └── BookingStatus.cs
├── Services/                    # Бізнес-логіка застосунку
│   ├── BookingService.cs        # Логіка бронювань та транзакції
│   ├── PricingCalculator.cs     # Погодинний калькулятор цін
│   ├── RoomManagementService.cs # Управління залами
│   └── ExpiredBookingCleanupService.cs # Фоновий воркер тайм-аутів
├── appsettings.json             # Базова конфігурація бекенду
├── appsettings.example.json     # Безпечний шаблон конфігурації
├── BookingApp.csproj            # Проєкт .NET 10
├── frontend/                    # Клієнтський застосунок SPA
│   ├── src/
│   │   ├── api/                 # Типізовані клієнти API
│   │   ├── components/          # Компоненти інтерфейсу (UI, Layout, Theme)
│   │   ├── features/            # Модулі залів, бронювань та адмінки
│   │   ├── lib/                 # Утиліти та клієнтський калькулятор цін
│   │   ├── mocks/               # MSW mock сервіс та тестові дані
│   │   └── pages/               # Сторінки застосунку
│   ├── .env.example             # Шаблон змінних середовища фронтенду
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── .gitignore                   # Надійне ігнорування бінарників, секретів та кешів
└── README.md                    # Документація проєкту
```

---

## 🚀 Швидкий старт

### Вимоги
- **.NET SDK**: `10.0+`
- **Node.js**: `18.0+` (рекомендовано LTS)
- **PostgreSQL**: `15+` (або запущений Docker контейнер)

---

### 1. Налаштування та запуск Backend

1. **Клонуйте репозиторій**:
   ```bash
   git clone https://github.com/sasha-1337/booking-app.git
   cd booking-app
   ```

2. **Запустіть PostgreSQL (опціонально через Docker)**:
   ```bash
   docker run --name booking-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=BookingDb -p 5432:5432 -d postgres:16-alpine
   ```

3. **Перевірте налаштування підключення**:
   Створіть свій `appsettings.Development.json` на основі `appsettings.example.json` або встановіть змінну середовища:
   ```bash
   # За замовчуванням у local dev використовується:
   # Host=localhost;Port=5432;Database=BookingDb;Username=postgres;Password=postgres
   ```

4. **Запустіть бекенд**:
   ```bash
   dotnet run
   ```
   API буде доступний за адресою: `http://localhost:5046` (або `https://localhost:7119`).

---

### 2. Налаштування та запуск Frontend

1. **Перейдіть у каталог фронтенду**:
   ```bash
   cd frontend
   ```

2. **Встановіть залежності**:
   ```bash
   npm install
   ```

3. **Створіть файл `.env` із шаблону**:
   ```bash
   cp .env.example .env.development
   ```
   *Параметри за замовчуванням:*
   - `VITE_USE_MOCKS=true` — запуск із автономним імітаційним бекендом MSW (ідеально для швидкого ознайомлення та презентацій).
   - `VITE_USE_MOCKS=false` — пряма робота зі справжнім ASP.NET Core бекендом.

4. **Запустіть dev-сервер**:
   ```bash
   npm run dev
   ```
   Відкрийте браузер: [http://localhost:5173/](http://localhost:5173/).

---

## 📡 REST API специфікація

| Метод | Ендпоінт | Опис | Параметри / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/rooms` | Отримати всі зали | — |
| `GET` | `/api/rooms/available` | Пошук доступних залів на проміжок часу | `startTime`, `endTime`, `minCapacity` |
| `GET` | `/api/rooms/{id}` | Деталі залу за ID | `id` (GUID) |
| `POST` | `/api/rooms` | Створити новий зал (Admin) | `{ name, capacity, baseHourlyRate, serviceIds }` |
| `PUT` | `/api/rooms/{id}` | Оновити зал | `{ name, capacity, baseHourlyRate, serviceIds }` |
| `DELETE` | `/api/rooms/{id}` | Видалити зал (Soft delete) | `id` (GUID) |
| `POST` | `/api/bookings/calculate-quote` | Розрахувати вартість бронювання | `{ roomId, startTimeUtc, endTimeUtc, serviceIds }` |
| `POST` | `/api/bookings` | Створити бронювання (Hold 15 хв) | `{ roomId, startTimeUtc, endTimeUtc, serviceIds }` |
| `POST` | `/api/bookings/{id}/confirm` | Підтвердити бронювання | `id` (GUID) |
| `GET` | `/api/bookings/{id}` | Отримати деталі бронювання | `id` (GUID) |

*Формат помилок*: Усі помилки повертаються згідно зі стандартом **RFC 7807 (ProblemDetails)** із полями `title`, `detail`, `status` та детальним переліком валідаційних зауважень.

---

## 🧪 Тестування

### Запуск тестів фронтенду (Vitest)
```bash
cd frontend
npm test
```
Покриття охоплює:
- Чистий розрахунок ціни `calculateTotal` та крайові випадки (ранкові знижки, вечірні знижки, пікові години).
- Форму вибору фільтрів та валідацію послідовності часу (`startTime < endTime`).
- Відображення карток залів та доступність елементів керування.
- Інтерактивну бічну панель оформлення бронювання (Drawer/Sheet).
- Відображення списку зарезервованих залів і сторінку адміністрування.

---

## 📄 Ліцензія

Цей проєкт поширюється під ліцензією [MIT](LICENSE).
Розроблено [sasha-1337](https://github.com/sasha-1337).

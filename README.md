# ⚙️ Backend --- Магазин разнообразной техники

## 📌 Описание

Бэкенд-часть учебного fullstack-проекта **«Магазин разнообразной
техники»**.\
Реализован на **Express + GraphQL Yoga** с использованием **Prisma ORM**
и **PostgreSQL**.\
Обеспечивает авторизацию пользователей, работу с товарами, категориями,
корзиной и отзывами.

## ✨ Функционал

-   👤 Регистрация и авторизация пользователей (**JWT**)
-   📦 CRUD для товаров и категорий
-   ⭐ Добавление и управление отзывами
-   🛒 Корзина пользователя
-   📑 Атрибуты и характеристики товаров
-   📊 Пагинация и фильтрация
-   🔐 Middleware для приватных запросов

## 🛠️ Технологии

-   **TypeScript 5.8**\
-   **Express 4.21**\
-   **GraphQL Yoga 5**\
-   **Prisma ORM**\
-   **PostgreSQL**\
-   **jsonwebtoken + bcryptjs**\
-   **Joi** (валидация)\
-   **dotenv, CORS**

## 📦 Установка и запуск

⚠️ Для работы необходима база данных **PostgreSQL**.

``` bash
# Клонируем репозиторий backend
git clone https://github.com/DieDice13/DiplomProjectV2-backend

# Переходим в папку
cd DiplomProjectV2-backend

# Устанавливаем зависимости
npm install
# или
pnpm install

# Настраиваем переменные окружения
cp .env.example .env

# Применяем миграции
npx prisma migrate dev

# Заполняем тестовыми данными
npm run seed

# Запускаем сервер
npm run dev
```

## 🔧 Переменные окружения

Файл `.env` должен содержать:

``` env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your_secret_key"
PORT=4000
```

## 🗂 Структура проекта

    ├── prisma/          # схема и миграции базы данных
    ├── data/            # сиды (категории, товары, изображения)
    ├── validation/      # схемы Joi
    ├── server.js        # точка входа
    ├── auth.js          # логика авторизации
    └── package.json

## 📡 Примеры запросов

### 🔑 Регистрация

``` graphql
mutation {
  register(
    name: "Test User"
    email: "test@example.com"
    password: "123456"
  ) {
    token
    user {
      id
      name
      email
    }
  }
}
```

### 🔑 Авторизация

``` graphql
mutation {
  login(email: "test@example.com", password: "123456") {
    token
    user {
      id
      name
      email
    }
  }
}
```

### 👤 Текущий пользователь

``` graphql
query {
  me {
    id
    name
    email
  }
}
```

### 📦 Получение списка товаров

``` graphql
query {
  products(page: 1, pageSize: 10, categoryId: 2) {
    id
    name
    price
    category {
      id
      name
    }
  }
}
```

### ⭐ Добавление отзыва

``` graphql
mutation {
  addReview(
    productId: 1
    rating: 5
    comment: "Отличный товар!"
  ) {
    id
    rating
    comment
    user {
      name
    }
  }
}
```

### 🛒 Работа с корзиной

``` graphql
mutation {
  addToCart(productId: 1, quantity: 2) {
    id
    quantity
    product {
      name
      price
    }
  }
}
```

## 🔮 Планы по развитию

-   🛠 Админ-панель для управления товарами и пользователями\
-   📦 Интеграция с сервисами доставки\
-   💳 Подключение онлайн-оплаты\
-   📊 Расширенные отчёты и аналитика

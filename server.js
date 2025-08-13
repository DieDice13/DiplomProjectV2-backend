import { PrismaClient } from "@prisma/client";
import { createYoga } from "graphql-yoga";
import { createServer } from "node:http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLJSON } from "graphql-type-json";
import bcrypt from "bcryptjs";
import { signToken, getUserId } from "./auth.js";
import { GraphQLError } from "graphql";
import { registerSchema, loginSchema } from "./validation/userSchemas.js";

const prisma = new PrismaClient();

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);

// GraphQL-схема
const typeDefs = /* GraphQL */ `
  scalar JSON

  type Category {
    id: Int!
    name: String!
  }

  type Product {
    id: Int!
    name: String!
    description: String
    price: Float!
    discount: Int
    image: String
    category: Category!
    reviews: [Review!]!
  }

  enum SortOption {
    PRICE_ASC
    PRICE_DESC
    NAME_ASC
    NAME_DESC
  }

  type ProductList {
    items: [Product!]!
    totalCount: Int!
  }

  type ProductWithFeatures {
    id: Int!
    name: String!
    description: String
    price: Float!
    discount: Int
    image: String
    category: Category!
    features: JSON!
  }

  type AttributeValue {
    value: String!
    count: Int!
  }

  type AttributeWithValues {
    key: String!
    label: String!
    type: String!
    values: [AttributeValue!]!
  }

  type User {
    id: String!
    name: String!
    email: String!
    createdAt: String!
    reviews: [Review!]!
  }

  type Review {
    id: String!
    rating: Int!
    comment: String!
    createdAt: String!
    user: User!
    product: Product!
  }

  type Favorite {
    id: String!
    product: Product!
  }

  type CartItem {
    id: String!
    product: Product!
    quantity: Int!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    products(
      category: String!
      page: Int!
      limit: Int!
      filters: JSON
      sort: SortOption
    ): ProductList

    attributes(category: String!): [AttributeWithValues!]!
    product(id: Int!): ProductWithFeatures
    reviewsByProduct(productId: Int!): [Review!]!
    myReviews: [Review!]!
    me: User

    favorites: [Product!]!
    cart: [CartItem!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    addReview(productId: Int!, rating: Int!, comment: String!): Review!

    addToFavorites(productId: Int!): Product!
    removeFromFavorites(productId: Int!): Boolean!

    addToCart(productId: Int!, quantity: Int): CartItem!
    removeFromCart(productId: Int!): Boolean!
    updateCartItem(productId: Int!, quantity: Int!): CartItem!
  }
`;

// Резолверы
const resolvers = {
  JSON: GraphQLJSON,

  Mutation: {
    register: async (_, args, { prisma }) => {
      // Валидация
      const { error } = registerSchema.validate(args);
      if (error) {
        throw new GraphQLError(
          "Ошибка валидации: " + error.details[0].message,
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      const normalizedEmail = args.email.toLowerCase();

      try {
        const hashedPassword = await bcrypt.hash(args.password, SALT_ROUNDS);

        const user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            password: hashedPassword,
            name: args.name,
          },
        });

        const token = signToken(user.id);

        return {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
          },
        };
      } catch (error) {
        // 💥 Правильная проверка на уникальный email
        if (error.code === "P2002") {
          throw new GraphQLError("Почта уже используется", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        console.error("❌ Ошибка при регистрации:", error);
        throw new GraphQLError("Внутренняя ошибка сервера.", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    login: async (_, args, { prisma }) => {
      const { error } = loginSchema.validate(args);
      if (error) {
        throw new GraphQLError(
          "Ошибка валидации: " + error.details[0].message,
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      const normalizedEmail = args.email.toLowerCase();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      const isPasswordValid =
        user && (await bcrypt.compare(args.password, user.password));

      if (!user || !isPasswordValid) {
        throw new GraphQLError("Неверный email или пароль", {
          extensions: { code: "INVALID_CREDENTIALS" },
        });
      }

      const token = signToken(user.id);

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      };
    },

    addReview: async (_, { productId, rating, comment }, { req, prisma }) => {
      const userId = getUserId(req);
      if (!userId) throw new Error("Требуется авторизация");

      return prisma.review.create({
        data: {
          rating,
          comment,
          productId,
          userId,
        },
        include: {
          user: true,
          product: true,
        },
      });
    },

    addToFavorites: async (_, { productId }, { req, prisma }) => {
      const userId = getUserId(req);
      if (!userId) throw new GraphQLError("Требуется авторизация");

      const favorite = await prisma.favorite.upsert({
        where: {
          userId_productId: { userId, productId },
        },
        update: {},
        create: { userId, productId },
        include: {
          product: {
            include: {
              category: true, // добавляем category, чтобы не было null
            },
          },
        },
      });

      return favorite.product; // Важно: вернуть product, а не favorite
    },

    removeFromFavorites: async (_, { productId }, { req, prisma }) => {
      const userId = getUserId(req);
      if (!userId) throw new GraphQLError("Требуется авторизация");

      await prisma.favorite.deleteMany({
        where: { userId, productId },
      });

      return true;
    },

    addToCart: async (_, { productId, quantity = 1 }, { req, prisma }) => {
      const userId = getUserId(req);
      console.log(
        "📦 addToCart userId:",
        userId,
        "productId:",
        productId,
        "quantity:",
        quantity
      );

      if (!userId) throw new GraphQLError("Требуется авторизация");

      return prisma.cartItem.upsert({
        where: {
          userId_productId: { userId, productId },
        },
        update: {
          quantity: { increment: quantity },
        },
        create: {
          userId,
          productId,
          quantity,
        },
        include: {
          product: {
            include: { category: true },
          },
        },
      });
    },

    removeFromCart: async (_, { productId }, { req, prisma }) => {
      const userId = getUserId(req);
      if (!userId) throw new GraphQLError("Требуется авторизация");

      await prisma.cartItem.deleteMany({
        where: { userId, productId },
      });

      return true;
    },

    updateCartItem: async (_, { productId, quantity }, { req, prisma }) => {
      const userId = getUserId(req);
      if (!userId) throw new GraphQLError("Требуется авторизация");

      return prisma.cartItem.update({
        where: {
          userId_productId: { userId, productId },
        },
        data: { quantity },
        include: {
          product: {
            include: { category: true },
          },
        },
      });
    },
  },

  Query: {
    // Получение списка продуктов с фильтрами, сортировкой и пагинацией
    products: async (_, { category, filters = {}, sort, page, limit }) => {
      // console.log("=== 🔍 ВХОДНЫЕ ПАРАМЕТРЫ ===");
      // console.log("Категория:", category);
      // console.log("Фильтры:", filters);
      // console.log("Сортировка:", sort);
      // console.log("Страница:", page, "Лимит:", limit);

      const categoryEntity = await prisma.category.findUnique({
        where: { name: category },
      });

      if (!categoryEntity) {
        console.warn("❗ Категория не найдена");
        return { items: [], totalCount: 0 };
      }

      const filterConditions = Object.entries(filters).map(([key, values]) => ({
        attributes: {
          some: {
            attribute: { name: key },
            value: { in: values },
          },
        },
      }));

      const whereProducts = {
        categoryId: categoryEntity.id,
        ...(filterConditions.length > 0 && { AND: filterConditions }),
      };

      const orderBy = (() => {
        switch (sort) {
          case "PRICE_ASC":
            return { price: "asc" };
          case "PRICE_DESC":
            return { price: "desc" };
          case "NAME_ASC":
            return { name: "asc" };
          case "NAME_DESC":
            return { name: "desc" };
          default:
            return undefined;
        }
      })();

      const [items, totalCount] = await Promise.all([
        prisma.product.findMany({
          where: whereProducts,
          include: { category: true },
          orderBy,
          skip: page * limit,
          take: limit,
        }),
        prisma.product.count({
          where: whereProducts,
        }),
      ]);

      // console.log(`=== 📊 Найдено продуктов: ${totalCount} ===`);

      return {
        items,
        totalCount,
      };
    },

    // Получение атрибутов с их значениями для фильтрации
    attributes: async (_, { category }) => {
      const categoryEntity = await prisma.category.findUnique({
        where: { name: category },
      });

      if (!categoryEntity) return [];

      const attributes = await prisma.attribute.findMany({
        where: { categoryId: categoryEntity.id },
      });

      const result = await Promise.all(
        attributes.map(async (attr) => {
          // Получаем все значения и количество с учётом категории
          const values = await prisma.productAttribute.groupBy({
            by: ["value"],
            where: {
              attributeId: attr.id,
              product: {
                categoryId: categoryEntity.id, // ← фильтрация по категории
              },
            },
            _count: {
              _all: true,
            },
          });

          return {
            key: attr.name,
            label: attr.label,
            type: attr.type,
            values: values.map((v) => ({
              value: v.value,
              count: v._count._all,
            })),
          };
        })
      );

      return result;
    },

    // Получение продукта с его атрибутами
    product: async (_, { id }) => {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!product) throw new Error("Продукт не найден");

      const attributes = await prisma.productAttribute.findMany({
        where: { productId: product.id },
        include: { attribute: true },
      });

      const features = attributes.reduce((acc, item) => {
        acc[item.attribute.name] = item.value;
        return acc;
      }, {});

      return {
        ...product,
        features,
      };
    },

    reviewsByProduct: (_, { productId }) => {
      return prisma.review.findMany({
        where: { productId },
        include: { user: true, product: true },
      });
    },

    myReviews: async (_, __, { req }) => {
      const userId = getUserId(req);
      if (!userId) throw new Error("Требуется авторизация");

      return prisma.review.findMany({
        where: { userId },
        include: { product: true, user: true },
      });
    },

    me: async (_, __, { req, prisma }) => {
      const userId = getUserId(req);
      console.log("🧠 Расшифрованный userId:", userId);

      if (!userId) throw new GraphQLError("Пользователь не авторизован");

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      console.log("👤 Найденный пользователь:", user);

      return user;
    },

    favorites: async (_, __, { req, prisma }) => {
      console.log("Auth header:", req.headers.authorization);

      const userId = getUserId(req);
      console.log("Запрос избранного от пользователя:", userId);

      if (!userId) throw new GraphQLError("Требуется авторизация");

      const favorites = await prisma.favorite.findMany({
        where: { userId },
        include: { product: { include: { category: true } } },
      });

      return favorites.map((fav) => fav.product);
    },

    cart: async (_, __, { req, prisma }) => {
      const userId = getUserId(req);
      if (!userId) throw new GraphQLError("Требуется авторизация");

      const items = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: { include: { category: true } } },
      });

      console.log(JSON.stringify(items, null, 2));
      return items;
    },
  },
};

// Сборка схемы
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Создание сервера Yoga
const yoga = createYoga({
  graphqlEndpoint: "/graphql",
  graphiql: true,
  schema,
  context: ({ request }) => ({
    req: request,
    prisma, // ← вот это обязательно!
  }),
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log("🚀 GraphQL сервер запущен на http://localhost:4000/graphql");
});

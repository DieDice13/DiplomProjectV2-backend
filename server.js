import { PrismaClient } from "@prisma/client";
import { createYoga } from "graphql-yoga";
import { createServer } from "node:http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLJSON } from "graphql-type-json";

const prisma = new PrismaClient();

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
    category: Category! # ← теперь возвращаем объект
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

  type Query {
    products(
      category: String!
      page: Int!
      limit: Int!
      filters: JSON
      sort: SortOption
    ): ProductList

    attributes(category: String!): [AttributeWithValues!]!
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
`;

// Резолверы
const resolvers = {
  JSON: GraphQLJSON,

  Query: {
    // Получение списка продуктов с фильтрами, сортировкой и пагинацией
    products: async (_, { category, filters = {}, sort, page, limit }) => {
      console.log("=== 🔍 ВХОДНЫЕ ПАРАМЕТРЫ ===");
      console.log("Категория:", category);
      console.log("Фильтры:", filters);
      console.log("Сортировка:", sort);
      console.log("Страница:", page, "Лимит:", limit);

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
        AND: filterConditions,
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

      console.log(`=== 📊 Найдено продуктов: ${totalCount} ===`);

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
  },
};

// Сборка схемы
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Создание сервера Yoga
const yoga = createYoga({
  graphqlEndpoint: "/graphql",
  graphiql: true,
  schema,
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log("🚀 GraphQL сервер запущен на http://localhost:4000/graphql");
});

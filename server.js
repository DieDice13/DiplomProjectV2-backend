const { createServer } = require("@graphql-yoga/node");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Описание схемы
const typeDefs = /* GraphQL */ `
  type Product {
    id: Int!
    name: String!
    description: String!
    price: Float!
    discount: Int
    image: String!
    category: String!
    createdAt: String!
  }

  type Query {
    products: [Product!]!
    product(id: Int!): Product
  }
`;

// Реализация логики для запросов
const resolvers = {
  Query: {
    products: () => prisma.product.findMany(),
    product: (_, { id }) => prisma.product.findUnique({ where: { id } }),
  },
};

const server = createServer({
  schema: {
    typeDefs,
    resolvers,
  },
});

server.start(() => {
  console.log("🚀 GraphQL сервер запущен на http://localhost:4000");
});

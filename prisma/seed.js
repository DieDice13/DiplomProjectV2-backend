const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "Galaxy S24",
        description: "Флагман Samsung с мощной камерой",
        price: 499999,
        discount: 10,
        image:
          "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813266/xr_achnpl.webp",
        category: "smartphone",
      },
      {
        name: "iPhone 15",
        description: "Новый iPhone от Apple",
        price: 599999,
        image:
          "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813266/sga12_32gb_sjrgpn.webp",
        category: "smartphone",
      },
      {
        name: "iPhone 15",
        description: "Новый iPhone от Apple",
        price: 599999,
        image:
          "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813266/xm10t_8_128gb_e5vr9y.webp",
        category: "smartphone",
      },
    ],
  });

  console.log("✅ Данные загружены");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

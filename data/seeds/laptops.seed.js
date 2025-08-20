import prisma from "../client.js";
import { laptops } from "../../data/attributes/laptops.js";
import { getImage } from "../../data/images.js";
import { getRandomFromArray, getRandomInt } from "../../data/utils/random.js";

export async function seedLaptops() {
  // 1️⃣ Найти категорию или создать
  let category = await prisma.category.findFirst({
    where: { name: "laptops" },
  });
  if (!category) {
    category = await prisma.category.create({
      data: { name: "laptops" },
    });
  }

  // 2️⃣ Создать атрибуты и сохранить их id
  const attributeMap = {};
  for (const attr of laptops.attrs) {
    let existingAttr = await prisma.attribute.findFirst({
      where: { name: attr.name, categoryId: category.id },
    });
    if (!existingAttr) {
      existingAttr = await prisma.attribute.create({
        data: {
          name: attr.name,
          label: attr.label,
          type: attr.type,
          categoryId: category.id,
        },
      });
    }
    attributeMap[attr.name] = existingAttr.id;
  }

  // 3️⃣ Создаем продукты
  for (let i = 0; i < 50; i++) {
    const price = getRandomInt(20000, 150000);
    const discount = getRandomInt(0, 30);
    const finalPrice = Math.round(price * (1 - discount / 100));

    const product = await prisma.product.create({
      data: {
        name: `Ноутбук Модель ${i + 1}`,
        categoryId: category.id,
        description: "Описание заглушка",
        price,
        discount,
        finalPrice,
        image: getImage("laptops", i),
      },
    });

    // 4️⃣ Создаем productAttribute для каждого атрибута
    for (const attr of laptops.attrs) {
      await prisma.productAttribute.create({
        data: {
          productId: product.id,
          attributeId: attributeMap[attr.name],
          value: getRandomFromArray(attr.values),
        },
      });
    }
  }

  console.log("✅ Ноутбуки успешно сидированы!");
}

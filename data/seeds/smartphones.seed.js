import prisma from "../client.js";
import { smartphones } from "../../data/attributes/smartphones.js";
import { getImage } from "../../data/images.js";
import { getRandomFromArray, getRandomInt } from "../../data/utils/random.js";

export async function seedSmartphones() {
  // 1️⃣ Найти категорию или создать, если не существует
  let category = await prisma.category.findFirst({
    where: { name: "smartphones" },
  });
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: "smartphones",
      },
    });
  }

  // 2️⃣ Создаем атрибуты для категории заранее и сохраняем их id
  const attributeMap = {};
  for (const attr of smartphones.attrs) {
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
    const price = getRandomInt(5000, 50000);
    const discount = getRandomInt(0, 30);
    const finalPrice = Math.round(price * (1 - discount / 100));

    const product = await prisma.product.create({
      data: {
        name: `Смартфон Модель ${i + 1}`,
        categoryId: category.id,
        description: "Описание заглушка",
        price,
        discount,
        finalPrice,
        image: getImage("smartphones", i),
      },
    });

    // 4️⃣ Создаем productAttribute для каждого атрибута
    for (const attr of smartphones.attrs) {
      await prisma.productAttribute.create({
        data: {
          productId: product.id,
          attributeId: attributeMap[attr.name],
          value: getRandomFromArray(attr.values),
        },
      });
    }
  }

  console.log("✅ Смартфоны успешно сидированы!");
}

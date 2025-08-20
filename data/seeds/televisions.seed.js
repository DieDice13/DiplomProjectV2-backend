import prisma from "../client.js";
import { televisions } from "../../data/attributes/televisions.js";
import { getImage } from "../../data/images.js";
import { getRandomFromArray, getRandomInt } from "../../data/utils/random.js";

export async function seedTelevisions() {
  // 1️⃣ Найти категорию или создать
  let category = await prisma.category.findFirst({
    where: { name: "televisions" },
  });
  if (!category) {
    category = await prisma.category.create({
      data: { name: "televisions" },
    });
  }

  // 2️⃣ Создать атрибуты заранее и сохранить их id
  const attributeMap = {};
  for (const attr of televisions.attrs) {
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
    const price = getRandomInt(10000, 120000);
    const discount = getRandomInt(0, 30);
    const finalPrice = Math.round(price * (1 - discount / 100));

    const product = await prisma.product.create({
      data: {
        name: `Телевизор Модель ${i + 1}`,
        categoryId: category.id,
        description: "Описание заглушка",
        price,
        discount,
        finalPrice,
        image: getImage("televisions", i),
      },
    });

    // 4️⃣ Создаем productAttribute для каждого атрибута
    for (const attr of televisions.attrs) {
      await prisma.productAttribute.create({
        data: {
          productId: product.id,
          attributeId: attributeMap[attr.name],
          value: getRandomFromArray(attr.values || ["—"]),
        },
      });
    }
  }

  console.log("✅ Телевизоры успешно сидированы!");
}

import prisma from "../client.js";
import { kitchen_appliances } from "../attributes/kitchen_appliances.js";
import { getImage } from "../images.js";
import { getRandomFromArray, getRandomInt } from "../utils/random.js";

export async function seedKitchenAppliances() {
  // 1️⃣ Найти категорию или создать
  let category = await prisma.category.findFirst({
    where: { name: "kitchen_appliances" },
  });
  if (!category) {
    category = await prisma.category.create({
      data: { name: "kitchen_appliances" },
    });
  }

  // 2️⃣ Создаем атрибуты заранее и сохраняем их id
  const attributeMap = {};
  for (const attr of kitchen_appliances.attrs) {
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
    const price = getRandomInt(1500, 25000);
    const discount = getRandomInt(0, 30);
    const finalPrice = Math.round(price * (1 - discount / 100));

    const product = await prisma.product.create({
      data: {
        name: `Кухонная техника Модель ${i + 1}`,
        categoryId: category.id,
        description: "Описание заглушка",
        price,
        discount,
        finalPrice,
        image: getImage("kitchenAppliances", i),
      },
    });

    // 4️⃣ Создаем productAttribute для каждого атрибута
    for (const attr of kitchen_appliances.attrs) {
      let value;
      if (attr.values && attr.values.length > 0) {
        value = getRandomFromArray(attr.values);
      } else {
        if (attr.type === "number") value = String(getRandomInt(1, 100));
        else if (attr.type === "text") value = "Тестовое значение";
        else value = "—";
      }

      await prisma.productAttribute.create({
        data: {
          productId: product.id,
          attributeId: attributeMap[attr.name],
          value,
        },
      });
    }
  }

  console.log("✅ Кухонная техника успешно сидирована!");
}

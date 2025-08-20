import prisma from "../client.js";
import { video_equipments } from "../../data/attributes/video_equipments.js";
import { getImage } from "../../data/images.js";
import { getRandomFromArray, getRandomInt } from "../../data/utils/random.js";

export async function seedVideoEquipments() {
  // 1️⃣ Найти категорию или создать
  let category = await prisma.category.findFirst({
    where: { name: "video_equipments" },
  });
  if (!category) {
    category = await prisma.category.create({
      data: { name: "video_equipments" },
    });
  }

  // 2️⃣ Создать атрибуты заранее и сохранить их id
  const attributeMap = {};
  for (const attr of video_equipments.attrs) {
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
    const price = getRandomInt(3000, 80000);
    const discount = getRandomInt(0, 30);
    const finalPrice = Math.round(price * (1 - discount / 100));

    const product = await prisma.product.create({
      data: {
        name: `Видеотехника Модель ${i + 1}`,
        categoryId: category.id,
        description: "Описание заглушка",
        price,
        discount,
        finalPrice,
        image: getImage("videoEquipments", i),
      },
    });

    // 4️⃣ Создаем productAttribute для каждого атрибута
    for (const attr of video_equipments.attrs) {
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

  console.log("✅ Видеотехника успешно сидирована!");
}

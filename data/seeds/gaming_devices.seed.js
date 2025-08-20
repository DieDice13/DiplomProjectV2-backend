import prisma from "../client.js";
import { gaming_devices } from "../../data/attributes/gaming_devices.js";
import { getImage } from "../../data/images.js";
import { getRandomFromArray, getRandomInt } from "../../data/utils/random.js";

export async function seedGamingDevices() {
  // 1️⃣ Найти категорию или создать
  let category = await prisma.category.findFirst({
    where: { name: "gaming_devices" },
  });
  if (!category) {
    category = await prisma.category.create({
      data: { name: "gaming_devices" },
    });
  }

  // 2️⃣ Создать атрибуты base_attrs заранее
  const attributeMap = {};
  for (const attr of gaming_devices.base_attrs) {
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
    const subtypeAttr = gaming_devices.base_attrs.find(
      (a) => a.name === "subtype"
    );
    const subtype = getRandomFromArray(subtypeAttr.values);

    const price = getRandomInt(1000, 100000);
    const discount = getRandomInt(0, 30);
    const finalPrice = Math.round(price * (1 - discount / 100));

    const product = await prisma.product.create({
      data: {
        name: `${subtype} Модель ${i + 1}`,
        categoryId: category.id,
        description: "Описание заглушка",
        price,
        discount,
        finalPrice,
        image: getImage("gamingDevices", i),
      },
    });

    // 4️⃣ Base attributes
    for (const attr of gaming_devices.base_attrs) {
      const value =
        attr.name === "subtype"
          ? subtype
          : String(getRandomFromArray(attr.values));
      await prisma.productAttribute.create({
        data: {
          productId: product.id,
          attributeId: attributeMap[attr.name],
          value,
        },
      });
    }

    // 5️⃣ Subtype-specific attributes
    const subtypeAttributes = gaming_devices.subtype_attrs[subtype] || [];
    for (const attr of subtypeAttributes) {
      const attrId = await getAttributeId(attr, category.id);
      await prisma.productAttribute.create({
        data: {
          productId: product.id,
          attributeId: attrId,
          value: generateValue(attr),
        },
      });
    }
  }

  console.log("✅ Игровые устройства успешно сидированы!");
}

// Вспомогательные функции
async function getAttributeId(attr, categoryId) {
  let existing = await prisma.attribute.findFirst({
    where: { name: attr.name, categoryId },
  });
  if (!existing) {
    existing = await prisma.attribute.create({
      data: {
        name: attr.name,
        label: attr.label,
        type: attr.type,
        categoryId,
      },
    });
  }
  return existing.id;
}

function generateValue(attr) {
  if (attr.type === "select") return String(getRandomFromArray(attr.values));
  if (attr.type === "number") {
    const ranges = {
      screen_size: [5, 9],
      battery_life: [2, 10],
      fov: [80, 140],
      buttons_count: [2, 20],
      keys_count: [50, 120],
      length: [20, 100],
      width: [20, 50],
      thickness: [2, 10],
      dpi: [800, 16000],
      cable_length: [1, 3],
      min_freq: [20, 200],
      max_freq: [10000, 40000],
    };
    const [min, max] = ranges[attr.name] || [1, 100];
    return String(getRandomInt(min, max)); // ✅ приводим к строке
  }
  if (attr.type === "text") return "Питание от USB";
  return "";
}

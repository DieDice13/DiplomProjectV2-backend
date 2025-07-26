import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "smartphones" },
    { name: "laptops" },
    { name: "tablets" },
  ];

  // Очистка
  await prisma.productAttribute.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Категории
  const categoryMap = {};
  for (const c of categories) {
    const created = await prisma.category.create({ data: c });
    categoryMap[c.name] = { id: created.id };
  }

  // Атрибуты
  const attributesData = [
    {
      name: "ram",
      label: "Оперативная память",
      type: "select",
      category: "smartphones",
      values: ["3", "4", "6", "8", "12"], // добавлено "3"
    },
    {
      name: "brand",
      label: "Бренд",
      type: "select",
      category: "smartphones",
      values: ["Apple", "Samsung", "Xiaomi", "Honor", "Huawei", "Vivo"], // добавлены все недостающие бренды
    },
  ];

  const attributeMap = {};
  for (const attr of attributesData) {
    const created = await prisma.attribute.create({
      data: {
        name: attr.name,
        label: attr.label,
        type: attr.type,
        categoryId: categoryMap[attr.category].id,
      },
    });
    attributeMap[attr.name] = created.id;
  }

  // Тестовые продукты
  const products = [
    //Смартфоны
    {
      name: "Vivo 11y",
      price: 599999,
      discount: 15,
      image:
        "https://res.cloudinary.com/dj4fo86df/image/upload/v1752848455/vivo_y11_voyqvu.webp",
      category: "smartphones",
      description: "Флагман Apple с отличной камерой",
      attributes: { ram: "6", brand: "Apple" },
    },
    {
      name: "Samsung Galaxy S24",
      price: 499999,
      discount: 10,
      image:
        "https://res.cloudinary.com/dj4fo86df/image/upload/v1752848455/huawei_p30_pro_uoydop.webp",
      category: "smartphones",
      description: "Современный смартфон Samsung с 12 ГБ RAM",
      attributes: { ram: "12", brand: "Samsung" },
    },
    {
      name: "Xiaomi 13 Pro",
      price: 389999,
      discount: 0,
      image:
        "https://res.cloudinary.com/dj4fo86df/image/upload/v1752848455/honor_30_fjm3cw.webp",
      category: "smartphones",
      description: "Мощный смартфон Xiaomi без скидки",
      attributes: { ram: "12", brand: "Xiaomi" },
    },
    {
      name: "Honor 30s",
      price: 329999,
      discount: 5,
      image:
        "https://res.cloudinary.com/dj4fo86df/image/upload/v1752848455/honor_30s_vgiak0.webp",
      category: "smartphones",
      description: "Honor 30s с улучшенной камерой и дизайном",
      attributes: { ram: "8", brand: "Honor" },
    },
    {
      name: "Xiaomi Redmi 9C",
      price: 159999,
      discount: 10,
      image:
        "https://res.cloudinary.com/dj4fo86df/image/upload/v1752848454/xiaomi_redmi_9c_drlc9k.webp",
      category: "smartphones",
      description: "Бюджетный смартфон Xiaomi для повседневных задач",
      attributes: { ram: "4", brand: "Xiaomi" },
    },
    {
      name: "Honor 10i",
      price: 179999,
      discount: 0,
      image:
        "https://res.cloudinary.com/dj4fo86df/image/upload/v1752848454/honor_10i_oa14dk.webp",
      category: "smartphones",
      description: "Honor 10i с тройной камерой и ярким дисплеем",
      attributes: { ram: "6", brand: "Honor" },
    },
    {
      name: "Honor 30 Pro",
      price: 429999,
      discount: 20,
      image:
        "https://res.cloudinary.com/dj4fo86df/image/upload/v1752848454/honor_30_pro_c0nl9f.webp",
      category: "smartphones",
      description: "Флагман Honor с отличной производительностью",
      attributes: { ram: "12", brand: "Honor" },
    },
    {
      name: "iPhone XR",
      price: 299999,
      discount: 5,
      image:
        "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813266/xr_achnpl.webp",
      category: "smartphones",
      description: "Классический iPhone с мощным процессором",
      attributes: { ram: "3", brand: "Apple" },
    },
    {
      name: "Samsung Galaxy A12 32GB",
      price: 149999,
      discount: 0,
      image:
        "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813266/sga12_32gb_sjrgpn.webp",
      category: "smartphones",
      description: "Доступный смартфон Samsung для базовых задач",
      attributes: { ram: "3", brand: "Samsung" },
    },
    {
      name: "iPhone XR 9A",
      price: 319999,
      discount: 7,
      image:
        "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813266/xr9a_l2gtpe.webp",
      category: "smartphones",
      description: "Модифицированный XR с улучшенной батареей",
      attributes: { ram: "3", brand: "Apple" },
    },
    {
      name: "iPhone XR 9",
      price: 309999,
      discount: 0,
      image:
        "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813266/xr9_mfefs8.webp",
      category: "smartphones",
      description: "Надежный и проверенный iPhone XR",
      attributes: { ram: "3", brand: "Apple" },
    },
    {
      name: "Xiaomi Mi 10T 8/128GB",
      price: 349999,
      discount: 12,
      image:
        "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813266/xm10t_8_128gb_e5vr9y.webp",
      category: "smartphones",
      description: "Производительный смартфон Xiaomi с 8 ГБ ОЗУ",
      attributes: { ram: "8", brand: "Xiaomi" },
    },
    {
      name: "Samsung Galaxy A31",
      price: 199999,
      discount: 8,
      image:
        "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813265/sga31_qnhc7t.webp",
      category: "smartphones",
      description: "Надежный смартфон с хорошей автономностью",
      attributes: { ram: "4", brand: "Samsung" },
    },
    {
      name: "Huawei Nova 9A",
      price: 259999,
      discount: 0,
      image:
        "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813265/sh9a_evf8ab.webp",
      category: "smartphones",
      description: "Huawei с привлекательным дизайном и производительностью",
      attributes: { ram: "6", brand: "Huawei" },
    },
    {
      name: "Samsung Galaxy S21 256GB",
      price: 479999,
      discount: 10,
      image:
        "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813265/sgs21_256gb_iiul8u.webp",
      category: "smartphones",
      description: "Флагман Samsung с 256 ГБ памяти",
      attributes: { ram: "12", brand: "Samsung" },
    },
    {
      name: "Samsung Galaxy S21 128GB",
      price: 459999,
      discount: 15,
      image:
        "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813265/sgs21_128gb_cs3zgp.webp",
      category: "smartphones",
      description: "Мощный смартфон Samsung с меньшим объемом памяти",
      attributes: { ram: "8", brand: "Samsung" },
    },

    // Ноутбуки
    {
      name: "MacBook Air M2",
      price: 799999,
      discount: 5,
      image: "macbookairm2.png",
      category: "laptops",
      description: "Тонкий и лёгкий ноутбук Apple с чипом M2",
      attributes: { ram: "8", brand: "Apple" },
    },

    // Планшеты
    {
      name: "Samsung Galaxy Tab S8",
      price: 299999,
      discount: 20,
      image: "tab-s8.png",
      category: "tablets",
      description: "Флагманский планшет Samsung",
      attributes: { ram: "6", brand: "Samsung" },
    },
  ];

  for (const p of products) {
    const discountValue = p.discount ? (p.discount / 100) * p.price : 0;
    const finalPrice = p.price - discountValue;

    const product = await prisma.product.create({
      data: {
        name: p.name,
        description: p.description || null,
        price: p.price,
        discount: p.discount,
        finalPrice,
        image: p.image,
        categoryId: categoryMap[p.category].id,
      },
    });

    for (const [attrName, value] of Object.entries(p.attributes)) {
      await prisma.productAttribute.create({
        data: {
          productId: product.id,
          attributeId: attributeMap[attrName],
          value,
        },
      });
    }
  }

  console.log("✅ Seed успешно завершён.");
}

main()
  .catch((e) => {
    console.error("❌ Ошибка при сидировании:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

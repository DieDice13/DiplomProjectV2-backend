import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Заглушка для всех товаров, кроме смартфонов
const placeholderImage =
  "https://res.cloudinary.com/demo/image/upload/v1699999999/placeholder-image.jpg"; // Заменить на свою

// Пример изображений смартфонов (укажи свои реальные)
const smartphoneImages = [
  "https://res.cloudinary.com/dj4fo86df/image/upload/v1752848455/vivo_y11_voyqvu.webp",
  "https://res.cloudinary.com/dj4fo86df/image/upload/v1752848455/huawei_p30_pro_uoydop.webp",
  "https://res.cloudinary.com/dj4fo86df/image/upload/v1752848455/honor_30_fjm3cw.webp",
  "https://res.cloudinary.com/dj4fo86df/image/upload/v1752848455/honor_30s_vgiak0.webp",
  "https://res.cloudinary.com/dj4fo86df/image/upload/v1752848454/xiaomi_redmi_9c_drlc9k.webp",
  "https://res.cloudinary.com/dj4fo86df/image/upload/v1752848454/honor_10i_oa14dk.webp",
  "https://res.cloudinary.com/dj4fo86df/image/upload/v1752848454/honor_30_pro_c0nl9f.webp",
  "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813266/xr_achnpl.webp",
  "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813266/sga12_32gb_sjrgpn.webp",
  "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813266/xr9a_l2gtpe.webp",
  "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813266/xr9_mfefs8.webp",
  "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813266/xm10t_8_128gb_e5vr9y.webp",
  "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813265/sga31_qnhc7t.webp",
  "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813265/sh9a_evf8ab.webp",
  "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813265/sgs21_256gb_iiul8u.webp",
  "https://res.cloudinary.com/dj4fo86df/image/upload/v1751813265/sgs21_128gb_cs3zgp.webp",
];

// Возвращает изображение для смартфона по индексу
function getSmartphoneImage(index) {
  return smartphoneImages[index % smartphoneImages.length];
}

// Генератор случайных товаров
function generateProducts(count, category, attributeValues, getImage) {
  const products = [];
  for (let i = 0; i < count; i++) {
    const price = getRandomInt(50000, 500000); // цены от 50к до 500к
    const discount = Math.random() < 0.5 ? getRandomInt(5, 30) : 0;

    const attributes = {};
    for (const key in attributeValues) {
      const values = attributeValues[key];
      attributes[key] = getRandomFromArray(values);
    }

    products.push({
      name: `${capitalize(category)} Model ${i + 1}`,
      description: `Уникальный представитель линейки ${category}. Модель ${
        i + 1
      } сочетает в себе передовые технологии, высокую надёжность и современный дизайн. Отлично подходит для ежедневного использования как в быту, так и для профессиональных задач. Эта модель обеспечивает оптимальный баланс между производительностью и ценой, делая её отличным выбором в своей категории.`,
      price,
      discount,
      image: getImage(i),
      category,
      attributes,
    });
  }
  return products;
}

// Вспомогательные утилиты
function getRandomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function main() {
  // 1) Определяем категории
  const categories = [
    { name: "smartphones" },
    { name: "laptops" },
    { name: "tablets" },
    { name: "accessories" },
    { name: "wearables" },
  ];

  // 2) Очищаем существующие данные
  await prisma.productAttribute.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 3) Создаем категории и сохраняем их id
  const categoryMap = {};
  for (const c of categories) {
    const created = await prisma.category.create({ data: c });
    categoryMap[c.name] = created.id;
  }

  // 4) Настраиваем атрибуты для каждой категории
  const attributesData = [
    {
      category: "smartphones",
      attrs: [
        {
          name: "ram",
          label: "Оперативная память",
          type: "select",
          values: ["3", "4", "6", "8", "12", "16"],
        },
        {
          name: "storage",
          label: "Постоянная память",
          type: "select",
          values: ["64", "128", "256", "512", "1024"],
        },
        {
          name: "brand",
          label: "Бренд",
          type: "select",
          values: ["Apple", "Samsung", "Xiaomi", "Honor", "Huawei", "Vivo"],
        },
        {
          name: "color",
          label: "Цвет корпуса",
          type: "select",
          values: ["Black", "White", "Blue", "Red", "Green", "Gold"],
        },
        {
          name: "os",
          label: "Операционная система",
          type: "select",
          values: ["iOS", "Android"],
        },
        {
          name: "camera",
          label: "Камера (МП)",
          type: "select",
          values: ["12", "24", "48", "64", "108"],
        },
        {
          name: "battery",
          label: "Ёмкость батареи (мА·ч)",
          type: "select",
          values: ["3000", "4000", "5000", "6000", "7000"],
        },
      ],
    },
    {
      category: "laptops",
      attrs: [
        {
          name: "ram",
          label: "Оперативная память",
          type: "select",
          values: ["8", "16", "32", "64"],
        },
        {
          name: "storage",
          label: "Накопитель (GB)",
          type: "select",
          values: ["256", "512", "1024", "2048"],
        },
        {
          name: "brand",
          label: "Бренд",
          type: "select",
          values: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer"],
        },
        {
          name: "screenSize",
          label: "Диагональ экрана (дюймы)",
          type: "select",
          values: ["13", "14", "15", "17"],
        },
        {
          name: "cpu",
          label: "Процессор",
          type: "select",
          values: ["i5", "i7", "i9", "Ryzen 5", "Ryzen 7", "Ryzen 9"],
        },
        {
          name: "gpu",
          label: "Видеокарта",
          type: "select",
          values: [
            "Integrated",
            "GTX 1650",
            "RTX 3060",
            "RTX 3070",
            "RTX 3080",
          ],
        },
        {
          name: "weight",
          label: "Вес (кг)",
          type: "select",
          values: ["1.2", "1.5", "1.8", "2.2", "2.5"],
        },
      ],
    },
    {
      category: "tablets",
      attrs: [
        {
          name: "ram",
          label: "Оперативная память",
          type: "select",
          values: ["3", "4", "6", "8", "12"],
        },
        {
          name: "storage",
          label: "Накопитель (GB)",
          type: "select",
          values: ["32", "64", "128", "256", "512"],
        },
        {
          name: "brand",
          label: "Бренд",
          type: "select",
          values: ["Apple", "Samsung", "Huawei", "Lenovo"],
        },
        {
          name: "batteryCapacity",
          label: "Ёмкость батареи (мА·ч)",
          type: "select",
          values: ["4000", "6000", "8000", "10000"],
        },
        {
          name: "screenResolution",
          label: "Разрешение экрана",
          type: "select",
          values: ["1920x1080", "2560x1600", "2732x2048"],
        },
        {
          name: "stylusSupport",
          label: "Поддержка стилуса",
          type: "select",
          values: ["Yes", "No"],
        },
      ],
    },
    {
      category: "accessories",
      attrs: [
        {
          name: "type",
          label: "Тип аксессуара",
          type: "select",
          values: ["Чехол", "Зарядка", "Кабель", "Наушники", "Стекло"],
        },
        {
          name: "compatibility",
          label: "Совместимость",
          type: "select",
          values: ["iOS", "Android", "Universal"],
        },
        {
          name: "material",
          label: "Материал",
          type: "select",
          values: ["Plastic", "Silicone", "Metal", "Glass"],
        },
        {
          name: "color",
          label: "Цвет",
          type: "select",
          values: ["Black", "White", "Red", "Blue", "Transparent"],
        },
        {
          name: "warranty",
          label: "Гарантия (мес.)",
          type: "select",
          values: ["6", "12", "18", "24"],
        },
      ],
    },
    {
      category: "wearables",
      attrs: [
        {
          name: "brand",
          label: "Бренд",
          type: "select",
          values: ["Apple", "Samsung", "Xiaomi", "Fitbit"],
        },
        {
          name: "waterproofRating",
          label: "Влагозащита",
          type: "select",
          values: ["None", "IP67", "IP68"],
        },
        {
          name: "batteryLife",
          label: "Автономность (ч)",
          type: "select",
          values: ["12", "24", "48", "72"],
        },
        {
          name: "strapMaterial",
          label: "Материал ремешка",
          type: "select",
          values: ["Silicone", "Leather", "Metal"],
        },
        {
          name: "color",
          label: "Цвет",
          type: "select",
          values: ["Black", "White", "Rose Gold", "Silver"],
        },
      ],
    },
  ];

  // 5) Создаем атрибуты в БД и сохраняем их id
  const attributeMap = {};
  for (const block of attributesData) {
    for (const a of block.attrs) {
      const created = await prisma.attribute.create({
        data: {
          name: a.name,
          label: a.label,
          type: a.type,
          categoryId: categoryMap[block.category],
        },
      });
      attributeMap[`${block.category}-${a.name}`] = created.id;
    }
  }

  // 6) Генерируем и вставляем товары
  const allProducts = [
    ...generateProducts(
      30,
      "smartphones",
      attributesData[0].attrs.reduce((o, a) => {
        o[a.name] = a.values;
        return o;
      }, {}),
      (i) => getSmartphoneImage(i)
    ),
    ...generateProducts(
      30,
      "laptops",
      attributesData[1].attrs.reduce((o, a) => {
        o[a.name] = a.values;
        return o;
      }, {}),
      () => placeholderImage
    ),
    ...generateProducts(
      30,
      "tablets",
      attributesData[2].attrs.reduce((o, a) => {
        o[a.name] = a.values;
        return o;
      }, {}),
      () => placeholderImage
    ),
    ...generateProducts(
      30,
      "accessories",
      attributesData[3].attrs.reduce((o, a) => {
        o[a.name] = a.values;
        return o;
      }, {}),
      () => placeholderImage
    ),
    ...generateProducts(
      30,
      "wearables",
      attributesData[4].attrs.reduce((o, a) => {
        o[a.name] = a.values;
        return o;
      }, {}),
      () => placeholderImage
    ),
  ];

  for (const p of allProducts) {
    const discountValue = p.discount ? (p.discount / 100) * p.price : 0;
    const finalPrice = p.price - discountValue;

    const product = await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        discount: p.discount,
        finalPrice,
        image: p.image,
        categoryId: categoryMap[p.category],
      },
    });

    // создаем запись в связующей таблице productAttribute
    for (const [attrName, value] of Object.entries(p.attributes)) {
      const key = `${p.category}-${attrName}`;
      await prisma.productAttribute.create({
        data: {
          productId: product.id,
          attributeId: attributeMap[key],
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

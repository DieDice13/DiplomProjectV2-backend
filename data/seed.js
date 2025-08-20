import { seedSmartphones } from "./seeds/smartphones.seed.js";
import { seedLaptops } from "./seeds/laptops.seed.js";
import { seedMicrowaves } from "./seeds/microwaves.seed.js";
import { seedGamingDevices } from "./seeds/gaming_devices.seed.js";
import { seedTelevisions } from "./seeds/televisions.seed.js";
import { seedVideoEquipments } from "./seeds/video_equipments.seed.js";
import { seedKitchenAppliances } from "./seeds/kitchen_appliances.seed.js";

const seeds = [
  seedSmartphones,
  seedLaptops,
  seedMicrowaves,
  seedGamingDevices,
  seedTelevisions,
  seedVideoEquipments,
  seedKitchenAppliances,
];

async function main() {
  for (const seed of seeds) {
    await seed();
  }
}

main()
  .then(() => {
    console.log("✅ Сидинг завершен");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Ошибка при сидинге:", err);
    process.exit(1);
  });

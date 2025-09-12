import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create sample devices
  const devices = [
    {
      deviceId: "DEV001",
      name: "Main Power Monitor",
      location: "Building A - Floor 1",
    },
    {
      deviceId: "DEV002",
      name: "Backup Generator Monitor",
      location: "Building A - Basement",
    },
    {
      deviceId: "DEV003",
      name: "Server Room Monitor",
      location: "Building B - Floor 2",
    },
  ];

  for (const deviceData of devices) {
    const device = await prisma.device.upsert({
      where: { deviceId: deviceData.deviceId },
      update: {},
      create: {
        ...deviceData,
        status: "active",
        lastSeen: new Date(),
      },
    });

    console.log(`✅ Created device: ${device.name}`);

    // Generate sample voltage logs for each device
    const now = new Date();
    const logs = [];

    // Generate logs for the last 24 hours
    for (let i = 0; i < 288; i++) {
      // 5-minute intervals = 288 logs per day
      const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
      const baseVoltage = 220 + Math.random() * 20; // 220-240V range
      const isHigh = Math.random() < 0.05; // 5% chance of high voltage
      const voltage = isHigh
        ? baseVoltage + 30 + Math.random() * 20
        : baseVoltage;

      logs.push({
        deviceId: device.deviceId,
        voltage: Math.round(voltage * 10) / 10,
        isHigh,
        timestamp,
      });
    }

    // Insert logs in batches
    for (let i = 0; i < logs.length; i += 50) {
      const batch = logs.slice(i, i + 50);
      await prisma.voltageLog.createMany({
        data: batch,
      });
    }

    console.log(`✅ Created ${logs.length} voltage logs for ${device.name}`);
  }

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

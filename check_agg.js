const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");

const env = fs.readFileSync(".env.local", "utf-8");
const uriMatch = env.match(/MONGODB_URI=(.*)/);
if (!uriMatch) {
  console.error("No MONGODB_URI found in .env.local");
  process.exit(1);
}
const MONGODB_URI = uriMatch[1].trim();

async function run() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("mutabaahdailies");
    const stats = await collection.aggregate([
      {
        $group: {
          _id: null,
          ziyadahCount: { $sum: { $cond: [$ziyadah.hasSetoran, 1, 0] } },
          murojaahCount: { $sum: { $cond: [$murojaahPartner.isCompleted, 1, 0] } }
        }
      }
    ]).toArray();
    console.log("Global stats:", JSON.stringify(stats));
  } finally {
    await client.close();
  }
}
run();

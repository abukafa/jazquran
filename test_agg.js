require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { MutabaahDaily } = require('./src/models/MutabaahDaily');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const stats = await MutabaahDaily.aggregate([
    {
      $group: {
        _id: null,
        ziyadahCount: { $sum: { $cond: [$ziyadah.hasSetoran, 1, 0] } },
        murojaahCount: { $sum: { $cond: [$murojaahPartner.isCompleted, 1, 0] } }
      }
    }
  ]);
  console.log('Global stats:', JSON.stringify(stats));
  process.exit(0);
}
run();

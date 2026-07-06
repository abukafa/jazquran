const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://hikamabukafa:Pg3Fpf6DgcKRg9Fs@cluster0.yawygwh.mongodb.net/myquran?retryWrites=true&w=majority';

const getStartOfDayUTC = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};
const getLastNDays = (n) => {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date('2026-07-06T17:25:59+07:00'); // match user time
    d.setDate(d.getDate() - i);
    dates.push(getStartOfDayUTC(d));
  }
  return dates;
};

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('myquran');
    const coll = db.collection('mutabaahdailies');
    const sevenDays = getLastNDays(7);
    
    // Check for Guru
    const gurus = await coll.distinct('guruId');
    for (let guruId of gurus) {
      if(!guruId) continue;
      const stats = await coll.aggregate([
        { $match: { guruId: guruId, tanggal: { $gte: sevenDays[0] } } },
        { $group: {
            _id: null,
            z: { $sum: { $cond: [{ $or: ["$ziyadah.hasSetoran", "$ziyadah.talaqqiTakrir", "$ziyadah.binNadzorComplete"] }, 1, 0] } },
            m: { $sum: { $cond: ["$murojaahPartner.isCompleted", 1, 0] } }
        }}
      ]).toArray();
      console.log(Guru :, stats);
    }
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://hikamabukafa:Pg3Fpf6DgcKRg9Fs@cluster0.yawygwh.mongodb.net/myquran?retryWrites=true&w=majority';
async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('myquran');
    
    const stats = await db.collection('mutabaahdailies').aggregate([
      { $match: { guruId: new (require('mongodb')).ObjectId("6a47f233bec392fa7df0a6fa") } },
      { $group: {
            _id: null,
            z: { $sum: { $cond: [{ $or: ["$ziyadah.hasSetoran", "$ziyadah.talaqqiTakrir", "$ziyadah.binNadzorComplete"] }, 1, 0] } },
            m: { $sum: { $cond: ["$murojaahPartner.isCompleted", 1, 0] } }
        }}
    ]).toArray();
    console.log("Updated Stats for Guru:", stats);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

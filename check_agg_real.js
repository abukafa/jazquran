const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://hikamabukafa:Pg3Fpf6DgcKRg9Fs@cluster0.yawygwh.mongodb.net/myquran?retryWrites=true&w=majority';
async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('myquran');
    const coll = db.collection('mutabaahdailies');
    
    const stats = await coll.aggregate([
      {
        $group: {
          _id: null,
          ziyadahCount: {
            $sum: {
              $cond: [
                { $or: ["$ziyadah.hasSetoran", "$ziyadah.talaqqiTakrir", "$ziyadah.binNadzorComplete"] },
                1, 0
              ]
            }
          },
          murojaahCount: { $sum: { $cond: ["$murojaahPartner.isCompleted", 1, 0] } }
        }
      }
    ]).toArray();
    console.log("Stats with OR:", stats);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

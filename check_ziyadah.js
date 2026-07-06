const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://hikamabukafa:Pg3Fpf6DgcKRg9Fs@cluster0.yawygwh.mongodb.net/myquran?retryWrites=true&w=majority';
async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('myquran');
    const coll = db.collection('mutabaahdailies');
    
    const setoran = await coll.countDocuments({ "ziyadah.hasSetoran": true });
    const talaqqi = await coll.countDocuments({ "ziyadah.talaqqiTakrir": true });
    const binnadzor = await coll.countDocuments({ "ziyadah.binNadzorComplete": true });
    
    console.log("Setoran:", setoran);
    console.log("Talaqqi:", talaqqi);
    console.log("BinNadzor:", binnadzor);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

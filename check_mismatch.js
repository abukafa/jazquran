const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://hikamabukafa:Pg3Fpf6DgcKRg9Fs@cluster0.yawygwh.mongodb.net/myquran?retryWrites=true&w=majority';
async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('myquran');
    
    // Get all halaqah IDs
    const halaqahs = await db.collection('halaqahs').find().toArray();
    const halaqahIds = halaqahs.map(h => h._id.toString());
    
    // Find mutabaah where guruId is actually a halaqahId
    const coll = db.collection('mutabaahdailies');
    let count = 0;
    const all = await coll.find().toArray();
    for (const doc of all) {
      if (halaqahIds.includes(doc.guruId.toString())) {
        console.log("Found mismatch! Mutabaah:", doc._id, "has guruId =", doc.guruId, "which is a Halaqah ID");
        count++;
      }
    }
    console.log("Total mismatches:", count);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

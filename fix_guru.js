const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://hikamabukafa:Pg3Fpf6DgcKRg9Fs@cluster0.yawygwh.mongodb.net/myquran?retryWrites=true&w=majority';
async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('myquran');
    
    // Get all halaqah IDs mapped to their guruId
    const halaqahs = await db.collection('halaqahs').find().toArray();
    const halaqahMap = {};
    halaqahs.forEach(h => {
      halaqahMap[h._id.toString()] = h.guruId;
    });
    
    // Find mutabaah where guruId is actually a halaqahId
    const coll = db.collection('mutabaahdailies');
    let count = 0;
    const all = await coll.find().toArray();
    for (const doc of all) {
      const gIdStr = doc.guruId.toString();
      if (halaqahMap[gIdStr]) {
        console.log("Fixing Mutabaah:", doc._id, "Changing guruId from", gIdStr, "to", halaqahMap[gIdStr]);
        await coll.updateOne(
          { _id: doc._id },
          { $set: { guruId: halaqahMap[gIdStr] } }
        );
        count++;
      }
    }
    console.log("Total fixed:", count);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

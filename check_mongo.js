const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://hikamabukafa:Pg3Fpf6DgcKRg9Fs@cluster0.yawygwh.mongodb.net/myquran?retryWrites=true&w=majority';
async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('myquran');
    const coll = db.collection('mutabaahdailies');
    const docs = await coll.find({ 'murojaahPartner.isCompleted': true }).sort({ tanggal: -1 }).limit(10).toArray();
    console.log(JSON.stringify(docs, null, 2));
  } finally {
    await client.close();
  }
}
run().catch(console.dir);


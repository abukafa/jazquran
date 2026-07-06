const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://hikamabukafa:Pg3Fpf6DgcKRg9Fs@cluster0.yawygwh.mongodb.net/myquran?retryWrites=true&w=majority';
async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('myquran');
    const coll = db.collection('mutabaahdailies');
    
    const docs = await coll.find({ guruId: new (require('mongodb')).ObjectId("6a47f233bec392fa7df0a6fa") }).toArray();
    console.log(JSON.stringify(docs, null, 2));
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

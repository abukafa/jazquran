const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://hikamabukafa:Pg3Fpf6DgcKRg9Fs@cluster0.yawygwh.mongodb.net/myquran?retryWrites=true&w=majority';
async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('myquran');
    
    const docs = await db.collection('mutabaahdailies').find({ 
      guruId: new (require('mongodb')).ObjectId("6a47f233bec392fa7df0a6fa"),
      "ziyadah.hasSetoran": true
    }).toArray();
    
    console.log("Docs with setoran:", docs.length);
    docs.forEach(d => {
      console.log(Ziyadah for :, d.ziyadah);
    });
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

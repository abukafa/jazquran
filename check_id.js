const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://hikamabukafa:Pg3Fpf6DgcKRg9Fs@cluster0.yawygwh.mongodb.net/myquran?retryWrites=true&w=majority';
async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('myquran');
    
    const user = await db.collection('users').findOne({ _id: new (require('mongodb')).ObjectId("6a4a4106492f4a84dee2e7e4") });
    const halaqah = await db.collection('halaqahs').findOne({ _id: new (require('mongodb')).ObjectId("6a4a4106492f4a84dee2e7e4") });
    
    console.log("User:", user);
    console.log("Halaqah:", halaqah);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

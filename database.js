const { MongoClient } = require("mongodb");

let client = undefined;
let database = undefined;

async function connectToDb(host, db_name) {
  const uri = `mongodb://${host}/test?retryWrites=true&w=majority`;

  client = new MongoClient(uri);
  await client.connect();

  database = client.db(db_name);
}

async function insertMultipleData(data) {
  const options = { ordered: true };

  const collections = Object.keys(data);
  for await (const key of collections){
    const value = data[key];

    // First drop the collection to avoid data duplication
    const colls = await database.listCollections().toArray();
    if (colls.map((c) => c.name).includes(key)) {
      await database.collection(key).drop();
    }

    // Then, add all data
    const collection = database.collection(key);
    const result = await collection.insertMany(value, options);

    console.log(`[${key}] ${result.insertedCount} documents inserted`);
  }
}

module.exports = {
  connect: async function (host, db_name) {
    await connectToDb(host, db_name);
  },

  insertMultiple: async function (data) {
    await insertMultipleData(data);
  },

  disconnect: async function () {
    await client.close();
  },
};

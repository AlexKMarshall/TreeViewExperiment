const { MongoClient } = require("mongodb");
const pwd = encodeURIComponent("6g2RiWiFF@3Fcqa");
const uri = `mongodb+srv://tbs_admin:${pwd}@cluster0.ci7wt.mongodb.net/treeviewDB?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const data = require("./data4L2N.json");

// client.connect((err) => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

async function run() {
  try {
    await client.connect();
    const database = client.db("treeviewDB");
    const treview = database.collection("treeview");

    const result = await treview.insertOne(data);

    // const result = await treview.insertOne(bigDoc);
    console.log(result);
    // const movies = database.collection("movies");
    // // Query for a movie that has the title 'Back to the Future'
    // const query = { title: "Back to the Future" };
    // const movie = await movies.findOne(query);
    // console.log(movie);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

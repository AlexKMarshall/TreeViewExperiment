// @ts-nocheck
// Import the dependency.
import { MongoClient } from "mongodb";

const pwd = encodeURIComponent(process.env.DB_PWD as string);
const user = encodeURIComponent(process.env.DB_USER as string);
const uri = `mongodb+srv://${user}:${pwd}@cluster0.ci7wt.mongodb.net/treeviewDB?retryWrites=true&w=majority`;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};
let client;
export let clientPromise: any;
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (hot module replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

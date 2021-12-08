// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { MongoClient } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pwd = encodeURIComponent(process.env.DB_PWD as string);
  const user = encodeURIComponent(process.env.DB_USER as string);
  const uri = `mongodb+srv://${user}:${pwd}@cluster0.ci7wt.mongodb.net/treeviewDB?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, {
    // @ts-ignore
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  const database = client.db("treeviewDB");
  const treeview = database.collection("treeview");

  const tree = await treeview.findOne({
    id: "e8f9c4e1-f7ea-4b0f-9765-14e71f7e7895",
  });

  res.status(200).json(tree);
}

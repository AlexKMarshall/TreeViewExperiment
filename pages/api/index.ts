// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { MongoClient } from "mongodb";

export const treeId = "1450e54e-e324-4361-8fb3-9bcc236ac9c3";

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
    id: treeId,
  });

  res.status(200).json(tree);
}

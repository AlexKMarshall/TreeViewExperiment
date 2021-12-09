// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { MongoClient } from "mongodb";
import { Tree } from "../../types";
import { removeNodes } from "../../utils";
import { treeId } from ".";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.body;

  const idsToDelete = Array.isArray(id) ? id : [id];

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

  const query = {
    id: treeId,
  };

  const oldTree = (await treeview.findOne(query)) as unknown as Tree;

  const newTree = removeNodes(oldTree, ...idsToDelete);

  const result = await treeview.replaceOne(query, newTree);

  res.status(200).json(result);
}

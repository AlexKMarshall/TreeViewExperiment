// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { removeNodes, updateLeaf } from "../../utils";

import { NewTree } from "../../types";
import { clientPromise } from "../../mongodb-client";
import { treeId } from ".";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, ...updatedFields } = req.body;

  const client = await clientPromise;
  const database = client.db("treeviewDB");
  const treeview = database.collection("treeview");

  const query = {
    id: treeId,
  };

  const oldTree = (await treeview.findOne(query)) as unknown as NewTree;

  const newTree = updateLeaf(oldTree, id, updatedFields);

  const result = (await treeview.replaceOne(
    query,
    newTree
  )) as unknown as NewTree;

  res.status(200).json({ message: `leaf updated` });
}

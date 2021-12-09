// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { Tree } from "../../types";
import { clientPromise } from "../../mongodb-client";
import { removeNodes } from "../../utils";
import { treeId } from ".";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.body;

  const idsToDelete = Array.isArray(id) ? id : [id];

  const client = await clientPromise;
  const database = client.db("treeviewDB");
  const treeview = database.collection("treeview");

  const query = {
    id: treeId,
  };

  const oldTree = (await treeview.findOne(query)) as unknown as Tree;

  const newTree = removeNodes(oldTree, ...idsToDelete);

  const result = (await treeview.replaceOne(query, newTree)) as unknown as Tree;

  res
    .status(200)
    .json({ message: `nodes deleted: $${idsToDelete.join(", ")}` });
}

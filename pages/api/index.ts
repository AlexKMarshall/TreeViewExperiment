import { NewTree, Tree } from "../../types";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { appendCountToTree } from "../../utils";
import { clientPromise } from "../../mongodb-client";

export const treeId = "3280f3b4-69df-4a79-9117-f7b0c4bf2857";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = await clientPromise;
  const database = client.db("treeviewDB");
  const treeview = database.collection("treeview");

  const tree = (await treeview.findOne({
    id: treeId,
  })) as unknown as NewTree;

  const enrichedTree = appendCountToTree(tree);

  res.status(200).json(enrichedTree);
}

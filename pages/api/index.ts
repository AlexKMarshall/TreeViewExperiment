// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { Tree } from "../../types";
import { appendCountToTree } from "../../utils";
import { clientPromise } from "../../mongodb-client";

export const treeId = "1450e54e-e324-4361-8fb3-9bcc236ac9c3";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = await clientPromise;
  const database = client.db("treeviewDB");
  const treeview = database.collection("treeview");

  const tree = (await treeview.findOne({
    id: treeId,
  })) as unknown as Tree;

  const enrichedTree = appendCountToTree(tree);

  res.status(200).json(enrichedTree);
}

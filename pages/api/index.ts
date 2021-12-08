// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import data from "../../data2L1000N.json";

type Tree<T> = {
  id: string;
  children: Tree<T>[];
} & T;

type DataLabel = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tree<DataLabel>>
) {
  res.status(200).json(data);
}

export type Tree<T extends Record<string, unknown> = Record<string, never>> = {
  id: string;
  name: string;
  children: Tree<T>[];
} & T;

export type TreeWithCount = Tree<{ count: number }>;

export type Leaf = {
  type: "leaf";
  id: string;
  name: string;
  isTraining: boolean;
  secondaryInformation: string;
};

export type NewTree<T extends Record<string, unknown> = Record<string, never>> =
  {
    type: "tree";
    id: string;
    name: string;
    color: string;
    children: Array<NewTree<T> | Leaf>;
  } & T;

export type NewTreeWithCount = NewTree<{ count: number }>;

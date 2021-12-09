export type Tree<T extends Record<string, unknown> = Record<string, never>> = {
  id: string;
  name: string;
  children: Tree<T>[];
} & T;

export type TreeWithCount = Tree<{ count: number }>;

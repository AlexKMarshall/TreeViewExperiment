import { Leaf, NewTree, NewTreeWithCount, Tree, TreeWithCount } from "./types";

export function removeNodes(tree: NewTree, ...idsToRemove: string[]): NewTree {
  // @ts-ignore
  return {
    ...tree,
    children: tree.children
      .filter((child) => !idsToRemove.includes(child.id))
      .map((child) =>
        child.type === "tree" ? removeNodes(child, ...idsToRemove) : child
      ),
  };
}

export function countNodes(tree: NewTree): number {
  let result = 0;

  for (let child of tree.children) {
    if (child.type === "leaf") {
      result += 1;
    } else {
      result += countNodes(child);
    }
  }

  return result;
}

export function appendCountToTree(tree: NewTree): NewTreeWithCount {
  return {
    ...tree,
    children: tree.children.map((child) =>
      child.type === "tree" ? appendCountToTree(child) : child
    ),
    count: countNodes(tree),
  };
}
export function updateLeaf(
  tree: NewTree,
  leafId: string,
  updatedFields: Partial<Leaf>
): NewTree {
  // @ts-ignore
  return {
    ...tree,
    children: tree.children.map((child) => {
      if (child.type === "tree") {
        return updateLeaf(child, leafId, updatedFields);
      }
      if (child.id === leafId) {
        return { ...child, ...updatedFields };
      }
      return child;
    }),
  };
}

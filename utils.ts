import { NewTree, NewTreeWithCount, Tree, TreeWithCount } from "./types";

export function removeNodes<T extends Record<string, unknown>>(
  tree: Tree,
  ...idsToRemove: string[]
): Tree<T> {
  // recursion in typescript is a pain
  // @ts-ignore
  return {
    ...tree,
    children: tree.children
      .filter((child) => !idsToRemove.includes(child.id))
      .map((child) => removeNodes(child, ...idsToRemove)),
  };
}

export function countNodes(tree: Tree): number {
  let nodeCount = 0;

  // recursively add on the count of the children
  tree.children.forEach((child) => {
    nodeCount += countNodes(child);
  });
  // add the children nodes themselves
  return nodeCount + tree.children.length;
}

export function appendCountToTree(tree: Tree): TreeWithCount {
  return {
    ...tree,
    children: tree.children.map((child) => appendCountToTree(child)),
    count: countNodes(tree),
  };
}

export function newRemoveNodes(
  tree: NewTree,
  ...idsToRemove: string[]
): NewTree {
  // @ts-ignore
  return {
    ...tree,
    children: tree.children
      .filter((child) => !idsToRemove.includes(child.id))
      .map((child) =>
        child.type === "tree" ? newRemoveNodes(child, ...idsToRemove) : child
      ),
  };
}

export function newCountNodes(tree: NewTree): number {
  let result = 0;

  for (let child of tree.children) {
    if (child.type === "leaf") {
      result += 1;
    } else {
      result += newCountNodes(child);
    }
  }

  return result;
}

export function newAppendCountToTree(tree: NewTree): NewTreeWithCount {
  return {
    ...tree,
    children: tree.children.map((child) =>
      child.type === "tree" ? newAppendCountToTree(child) : child
    ),
    count: newCountNodes(tree),
  };
}

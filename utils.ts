import { Tree, TreeWithCount } from "./types";

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

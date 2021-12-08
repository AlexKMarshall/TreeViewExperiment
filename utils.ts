import { Tree } from "./types";

export function removeNodes(tree: Tree, ...idsToRemove: string[]): Tree {
  return {
    ...tree,
    children: tree.children
      .filter((child) => !idsToRemove.includes(child.id))
      .map((child) => removeNodes(child, ...idsToRemove)),
  };
}

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { TreeWithCount } from "../../types";

function updateNodeSelectStatus(
  tree: TreeWithCount,
  initialSelected: SelectedState,
  id: string,
  status: "checked" | "unchecked"
): SelectedState {
  const selected = { ...initialSelected };

  function selectTree(tree: TreeWithCount) {
    // when setting the status of a parent, we recursively set the same status on its children
    selected[tree.id] = status;
    tree.children.forEach((child) => {
      selectTree(child);
    });
  }

  function traverse(tree: TreeWithCount) {
    // traverse the tree recursively looking for the id we're updating
    if (tree.id === id) {
      // if we've found it select the whole subtree
      selectTree(tree);
    } else {
      // otherwise look through the children
      tree.children.forEach((child) => {
        traverse(child);
      });

      // now we've potentially updated the children, set the parent's status
      // all children checked -> parent is checked
      // all children unchecked  -> parent is unchecked
      // some children checked or indeterminate -> parent is indeterminate
      const childStatuses = tree.children.map((child) => selected[child.id]);
      if (tree.children.length > 0) {
        if (childStatuses.every((status) => status === "checked")) {
          selected[tree.id] = "checked";
        } else if (
          childStatuses.some(
            (status) => status === "checked" || status === "indeterminate"
          )
        ) {
          selected[tree.id] = "indeterminate";
        } else {
          selected[tree.id] = "unchecked";
        }
      }
    }
  }

  traverse(tree);

  return selected;
}

function getSelectedBranchNodes(
  tree: TreeWithCount,
  selected: SelectedState
): string[] {
  let selectedIds: string[] = [];

  function traverse(tree: TreeWithCount) {
    const isTreeSelected = selected[tree.id] === "checked";
    if (isTreeSelected) {
      selectedIds.push(tree.id);
    } else {
      tree.children.forEach((child) => traverse(child));
    }
  }

  traverse(tree);

  return selectedIds;
}

type SelectedState = {
  [id: string]: "checked" | "unchecked" | "indeterminate";
};

type TreeContextType = {
  selected: SelectedState;
  selectNode: (id: string, status: "checked" | "unchecked") => void;
  selectedBranchNodes: string[];
};

const TreeContext = createContext<TreeContextType | undefined>(undefined);

export function useTree() {
  const context = useContext(TreeContext);
  if (!context) throw new Error("useTree must be used within a Tree provider");
  return context;
}

export function TreeProvider({
  data,
  children,
}: {
  data: TreeWithCount;
  children: ReactNode;
}): JSX.Element {
  const [selected, setSelected] = useState<SelectedState>({});
  const selectNode = useCallback(
    (id: string, status: "checked" | "unchecked") => {
      setSelected((oldSelected) =>
        updateNodeSelectStatus(data, { ...oldSelected }, id, status)
      );
    },
    [data]
  );
  const selectedBranchNodes = useMemo(
    () => getSelectedBranchNodes(data, selected),
    [data, selected]
  );

  const contextValue = { selected, selectNode, selectedBranchNodes };

  return (
    <TreeContext.Provider value={contextValue}>{children}</TreeContext.Provider>
  );
}

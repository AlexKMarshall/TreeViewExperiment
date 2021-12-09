import { Leaf, NewTreeWithCount } from "../../types";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

function updateNodeSelectStatus(
  tree: NewTreeWithCount,
  initialSelected: SelectedState,
  id: string,
  status: "checked" | "unchecked"
): SelectedState {
  const selected = { ...initialSelected };

  function selectNode(node: NewTreeWithCount | Leaf) {
    selected[node.id] = status;
    // when setting the status of a parent, we recursively set the same status on its children
    if (node.type === "tree") {
      node.children.forEach((child) => {
        selectNode(child);
      });
    }
  }

  function traverse(node: NewTreeWithCount | Leaf) {
    // traverse the tree recursively looking for the id we're updating
    if (node.id === id) {
      // if we've found it select the whole subtree
      selectNode(node);
    } else if (node.type === "tree") {
      // otherwise look through the children
      node.children.forEach((child) => {
        traverse(child);
      });

      // now we've potentially updated the children, set the parent's status
      // all children checked -> parent is checked
      // all children unchecked  -> parent is unchecked
      // some children checked or indeterminate -> parent is indeterminate
      const childStatuses = node.children.map((child) => selected[child.id]);
      if (node.children.length > 0) {
        if (childStatuses.every((status) => status === "checked")) {
          selected[node.id] = "checked";
        } else if (
          childStatuses.some(
            (status) => status === "checked" || status === "indeterminate"
          )
        ) {
          selected[node.id] = "indeterminate";
        } else {
          selected[node.id] = "unchecked";
        }
      }
    }
    // else if it's a leaf and not the one we're looking for, do nothing
  }

  traverse(tree);

  return selected;
}

function getSelectedBranchNodes(
  tree: NewTreeWithCount,
  selected: SelectedState
): string[] {
  let selectedIds: string[] = [];

  function traverse(node: NewTreeWithCount | Leaf) {
    const isTreeSelected = selected[node.id] === "checked";
    if (isTreeSelected) {
      selectedIds.push(node.id);
    } else if (node.type === "tree") {
      node.children.forEach((child) => {
        traverse(child);
      });
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
  data: NewTreeWithCount;
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

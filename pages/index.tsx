import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import Head from "next/head";
import { removeNodes } from "../utils";

type Tree<T extends Record<string, unknown> = Record<string, never>> = {
  id: string;
  name: string;
  children: Tree<T>[];
} & T;

function updateNodeSelectStatus(
  tree: Tree,
  initialSelected: SelectedState,
  id: string,
  status: "checked" | "unchecked"
): SelectedState {
  const selected = { ...initialSelected };

  function selectTree(tree: Tree) {
    // when setting the status of a parent, we recursively set the same status on its children
    selected[tree.id] = status;
    tree.children.forEach((child) => {
      selectTree(child);
    });
  }

  function traverse(tree: Tree) {
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

function getRootSelectedNodes(tree: Tree, selected: SelectedState): string[] {
  let selectedIds: string[] = [];

  function traverse(tree: Tree) {
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

type TreeContext = {
  selected: SelectedState;
  selectNode: (id: string, status: "checked" | "unchecked") => void;
  rootSelectedNodes: string[];
};
const TreeContext = createContext<TreeContext | undefined>(undefined);
function useTree() {
  const context = useContext(TreeContext);
  if (!context) throw new Error("useTree must be used within a Tree provider");
  return context;
}

function TreeProvider({
  data,
  children,
}: {
  data: Tree;
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
  const rootSelectedNodes = useMemo(
    () => getRootSelectedNodes(data, selected),
    [data, selected]
  );

  const contextValue = { selected, selectNode, rootSelectedNodes };

  return (
    <TreeContext.Provider value={contextValue}>{children}</TreeContext.Provider>
  );
}

function Home() {
  const query = useQuery("tags", async () => {
    try {
      const res = await fetch("/api");
      const data = (await res.json()) as Tree;
      return data;
    } catch (error) {
      throw error;
    }
  });

  return (
    <>
      <Head>
        <title>Tree View</title>
        <meta name="description" content="Tree view experiment" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Tree View</h1>

        {query.isLoading ? <div>Loading...</div> : null}
        {query.isSuccess ? (
          <TreeProvider data={query.data}>
            <BulkActions />
            <ul
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <ListItem item={query.data} />
            </ul>
          </TreeProvider>
        ) : null}
      </main>
    </>
  );
}

export default Home;

function BulkActions(): JSX.Element {
  const { rootSelectedNodes } = useTree();

  const queryClient = useQueryClient();

  const bulkDeleteMutation = useMutation(
    (id: string[]) => {
      return fetch("/api/delete", {
        body: JSON.stringify({ id }),
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
      });
    },
    {
      onMutate: async (ids) => {
        await queryClient.cancelQueries("tags");
        const existingData = queryClient.getQueryData("tags") as Tree;

        const updatedData = removeNodes(existingData, ...ids);
        queryClient.setQueryData("tags", updatedData);

        return { existingData };
      },
      onError: (err, id, context) => {
        queryClient.setQueryData("tags", (context as any).existingData);
      },
      onSettled: () => {
        queryClient.invalidateQueries("tags");
      },
    }
  );

  return rootSelectedNodes.length > 0 ? (
    <div>
      <button onClick={() => bulkDeleteMutation.mutate(rootSelectedNodes)}>
        Delete Selected
      </button>
    </div>
  ) : (
    <></>
  );
}

type ListItemProps = {
  item: Tree;
};
function ListItem({ item }: ListItemProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleIsExpanded = () => setIsExpanded((v) => !v);
  const hasChildren = item.children.length > 0;
  const { selected, selectNode } = useTree();
  const status = selected[item.id] ?? "unchecked";

  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    (id: string) => {
      return fetch("/api/delete", {
        body: JSON.stringify({ id }),
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
      });
    },
    {
      onMutate: async (id) => {
        await queryClient.cancelQueries("tags");
        const existingData = queryClient.getQueryData("tags") as Tree;

        const updatedData = removeNodes(existingData, id);
        queryClient.setQueryData("tags", updatedData);

        return { existingData };
      },
      onError: (err, id, context) => {
        queryClient.setQueryData("tags", (context as any).existingData);
      },
      onSettled: () => {
        queryClient.invalidateQueries("tags");
      },
    }
  );

  return (
    <li>
      <div style={{ display: "flex", paddingRight: "4rem" }}>
        <label>
          <Checkbox
            status={status}
            onChange={(newStatus) => {
              selectNode(item.id, newStatus);
            }}
          />
          {item.name}
        </label>
        {hasChildren ? ` (${item.children.length})` : null}
        {hasChildren ? (
          <button onClick={toggleIsExpanded}>{isExpanded ? "-" : "+"}</button>
        ) : null}
        <button
          onClick={() => deleteMutation.mutate(item.id)}
          style={{ marginLeft: "auto" }}
        >
          Delete
        </button>
      </div>
      {hasChildren && isExpanded ? (
        <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {item.children.map((child) => (
            <ListItem key={child.id} item={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

type CheckboxProps = {
  status?: "checked" | "unchecked" | "indeterminate";
  onChange: (status: "checked" | "unchecked") => void;
};
function Checkbox({ status, onChange }: CheckboxProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = status === "indeterminate";
      inputRef.current.checked = status === "checked";
    }
  }, [status]);

  return (
    <input
      ref={inputRef}
      type="checkbox"
      onChange={() => {
        const newStatus = status === "checked" ? "unchecked" : "checked";
        onChange(newStatus);
      }}
    />
  );
}

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import type { GetServerSideProps } from "next";
import Head from "next/head";
import myData from "../data1L10N.json";
import { useQuery } from "react-query";

type Tree<T extends Record<string, unknown> = Record<string, never>> = {
  id: string;
  name: string;
  children: Tree<T>[];
} & T;

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      data: myData,
    },
  };
};

function updateStatusNew(
  tree: Tree,
  selected: SelectedState,
  id: string,
  status: "checked" | "unchecked"
): SelectedState {
  function selectTree(tree: Tree) {
    selected[tree.id] = status;
    tree.children.forEach((child) => {
      selectTree(child);
    });
  }

  function traverse(tree: Tree) {
    if (tree.id === id) {
      selectTree(tree);
    } else {
      tree.children.forEach((child) => {
        traverse(child);
      });
    }
  }

  traverse(tree);

  return selected;
}

type SelectedState = {
  [id: string]: "checked" | "unchecked";
};

type TreeContext = {
  selected: SelectedState;
  selectNode: (id: string, status: "checked" | "unchecked") => void;
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
        updateStatusNew(data, { ...oldSelected }, id, status)
      );
    },
    [data]
  );

  const contextValue = { selected, selectNode };

  return (
    <TreeContext.Provider value={contextValue}>{children}</TreeContext.Provider>
  );
}

function Home() {
  const query = useQuery("tags", async () => {
    const res = await fetch("/api");
    return (await res.json()) as Tree;
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
            <ul>
              <ListItem item={query.data} />
            </ul>
          </TreeProvider>
        ) : null}
      </main>
    </>
  );
}

export default Home;

type ListItemProps = {
  item: Tree;
};
function ListItem(props: ListItemProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleIsExpanded = () => setIsExpanded((v) => !v);
  const hasChildren = props.item.children.length > 0;
  const { selected, selectNode } = useTree();
  const status = selected[props.item.id] ?? "unchecked";

  return (
    <li>
      {props.item.name}
      {hasChildren ? (
        <button onClick={toggleIsExpanded}>{isExpanded ? "-" : "+"}</button>
      ) : null}
      <input
        type="checkbox"
        checked={status === "checked"}
        onChange={() => {
          const newStatus = status === "checked" ? "unchecked" : "checked";
          selectNode(props.item.id, newStatus);
        }}
      />
      {hasChildren && isExpanded ? (
        <ul>
          {props.item.children.map((child) => (
            <ListItem key={child.id} item={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

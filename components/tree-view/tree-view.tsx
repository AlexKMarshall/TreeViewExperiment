import { Leaf, NewTree, NewTreeWithCount } from "../../types";
import React, { useState } from "react";
import { TreeProvider, useTree } from "./context";
import { newAppendCountToTree, newRemoveNodes } from "../../utils";
import { useMutation, useQueryClient } from "react-query";

import { Checkbox } from "../checkbox";
import styles from "./table.module.css";

type Props = {
  data: NewTreeWithCount;
};
export function TreeTable({ data }: Props): JSX.Element {
  return (
    <TreeProvider data={data}>
      <BulkActions />
      <table style={{ width: "100%" }} className={styles.table}>
        <thead style={{ textAlign: "left" }}>
          <tr>
            <th>Selected?</th>
            <th>Expand/Collapse</th>
            <th>Name</th>
            <th>ML Training?</th>
            <th>Secondary Information</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <TreeRow data={data} />
        </tbody>
      </table>
    </TreeProvider>
  );
}

function TreeRow({
  data: { id, name, children, count, color },
}: Props): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleIsExpanded = () => setIsExpanded((v) => !v);
  const hasChildren = children.length > 0;
  const { selected, selectNode } = useTree();
  const status = selected[id] ?? "unchecked";

  const queryClient = useQueryClient();

  // ideally this gets defined outside the component
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
        const existingData = queryClient.getQueryData("tags") as NewTree;

        const updatedData = newAppendCountToTree(
          newRemoveNodes(existingData, id)
        );

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
    <>
      <tr style={{ backgroundColor: `#${color}` }}>
        <td>
          <Checkbox
            status={status}
            onChange={(newStatus) => {
              selectNode(id, newStatus);
            }}
          />
        </td>
        <td>
          {hasChildren ? (
            <button onClick={toggleIsExpanded}>{isExpanded ? "-" : "+"}</button>
          ) : null}
        </td>
        <td>
          {name}
          {count > 0 ? ` (${count})` : null}
        </td>
        <td>{null}</td>
        <td>{null}</td>
        <td>
          <button onClick={() => deleteMutation.mutate(id)}>Delete</button>
        </td>
      </tr>
      {hasChildren && isExpanded
        ? children.map((child) =>
            child.type === "tree" ? (
              <TreeRow key={child.id} data={child} />
            ) : (
              <LeafRow key={child.id} data={child} />
            )
          )
        : null}
    </>
  );
}

type LeafProps = {
  data: Leaf;
};

function LeafRow({
  data: { id, name, isTraining, secondaryInformation },
}: LeafProps): JSX.Element {
  const { selected, selectNode } = useTree();
  const status = selected[id] ?? "unchecked";

  const queryClient = useQueryClient();

  // ideally this gets defined outside the component
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
        const existingData = queryClient.getQueryData("tags") as NewTree;

        const updatedData = newAppendCountToTree(
          newRemoveNodes(existingData, id)
        );

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
    <tr className={styles.leafRow}>
      <td>
        <Checkbox
          status={status}
          onChange={(newStatus) => {
            selectNode(id, newStatus);
          }}
        />
      </td>
      <td>{null}</td>
      <td>{name}</td>
      <td>{isTraining ? "Yes" : null}</td>
      <td>{secondaryInformation}</td>
      <td>
        <button onClick={() => deleteMutation.mutate(id)}>Delete</button>
      </td>
    </tr>
  );
}

function BulkActions(): JSX.Element {
  const { selectedBranchNodes } = useTree();

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
        const existingData = queryClient.getQueryData("tags") as NewTree;

        const updatedData = newRemoveNodes(existingData, ...ids);
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

  const isDisabled = selectedBranchNodes.length === 0;

  return (
    <div>
      <button
        onClick={() => bulkDeleteMutation.mutate(selectedBranchNodes)}
        disabled={isDisabled}
      >
        Delete Selected
      </button>
    </div>
  );
}

import React, { useState } from "react";
import { TreeProvider, useTree } from "./context";
import { useMutation, useQueryClient } from "react-query";

import { Checkbox } from "../checkbox";
import { Tree } from "../../types";
import { removeNodes } from "../../utils";

type Props = {
  data: Tree;
};
export function TreeView({ data }: Props): JSX.Element {
  return (
    <TreeProvider data={data}>
      <BulkActions />
      <table style={{ width: "100%" }}>
        <thead style={{ textAlign: "left" }}>
          <tr>
            <th>Selected?</th>
            <th>Expand/Collapse</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody></tbody>

        {/* <ul
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
        > */}
        <InnerTree data={data} />
        {/* </ul> */}
      </table>
    </TreeProvider>
  );
}

function InnerTree({ data: { id, name, children } }: Props): JSX.Element {
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
    <>
      <tr>
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
          {hasChildren ? ` (${children.length})` : null}
        </td>
        <td>
          <button
            onClick={() => deleteMutation.mutate(id)}
            // style={{ marginLeft: "auto" }}
          >
            Delete
          </button>
        </td>
      </tr>
      {hasChildren && isExpanded
        ? children.map((child) => <InnerTree key={child.id} data={child} />)
        : null}
    </>
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

  return selectedBranchNodes.length > 0 ? (
    <div>
      <button onClick={() => bulkDeleteMutation.mutate(selectedBranchNodes)}>
        Delete Selected
      </button>
    </div>
  ) : (
    <></>
  );
}

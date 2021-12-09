import "@reach/dialog/styles.css";

import { Leaf, NewTree } from "../../types";
import { appendCountToTree, removeNodes, updateLeaf } from "../../utils";
import { useMutation, useQueryClient } from "react-query";

export function useDeleteNode() {
  const queryClient = useQueryClient();
  return useMutation(
    (id: string | string[]) => {
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
        const idsToRemove = Array.isArray(id) ? id : [id];

        const updatedData = appendCountToTree(
          removeNodes(existingData, ...idsToRemove)
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
}

export function useUpdateLeaf(id: string) {
  const queryClient = useQueryClient();
  return useMutation(
    (updatedFields: Pick<Leaf, "name" | "secondaryInformation">) => {
      return fetch("/api/update-leaf", {
        body: JSON.stringify({ id, ...updatedFields }),
        method: "put",
        headers: {
          "content-type": "application/json",
        },
      });
    },
    {
      onMutate: async (updatedFields) => {
        await queryClient.cancelQueries("tags");
        const existingData = queryClient.getQueryData("tags") as NewTree;

        const updatedData = updateLeaf(existingData, id, updatedFields);

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
}

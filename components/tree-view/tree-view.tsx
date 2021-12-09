import "@reach/dialog/styles.css";

import { Leaf, NewTree, NewTreeWithCount } from "../../types";
import React, { useState } from "react";
import { TreeProvider, useTree } from "./context";
import { useDeleteNode, useUpdateLeaf } from "./mutations";
import { useMutation, useQueryClient } from "react-query";

import { Checkbox } from "../checkbox";
import { Dialog } from "@reach/dialog";
import { removeNodes } from "../../utils";
import styles from "./table.module.css";

type Props = {
  data: NewTreeWithCount;
};
export function TreeTable({ data }: Props): JSX.Element {
  return (
    <TreeProvider data={data}>
      <BulkActions />
      <table className={styles.table}>
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

  const deleteMutation = useDeleteNode();

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
  const [showForm, setShowForm] = useState(false);
  const openForm = () => setShowForm(true);
  const closeForm = () => setShowForm(false);

  const deleteMutation = useDeleteNode();

  const [formData, setFormData] = useState({ name, secondaryInformation });
  const updateField = (fieldName: keyof typeof formData, value: string) =>
    setFormData((oldData) => ({ ...oldData, [fieldName]: value }));

  const updateMutation = useUpdateLeaf(id);

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
        <button onClick={openForm}>Edit</button>
        <button onClick={() => deleteMutation.mutate(id)}>Delete</button>
      </td>
      {showForm ? (
        <Dialog onDismiss={closeForm} className={styles.dialog}>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate(formData);
              closeForm();
            }}
          >
            <label className={styles.formField}>
              Name:{" "}
              <input
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </label>
            <label className={styles.formField}>
              Secondary Information:{" "}
              <input
                value={formData.secondaryInformation}
                onChange={(e) =>
                  updateField("secondaryInformation", e.target.value)
                }
              />
            </label>
            <button type="submit">Update</button>
            <button type="button" onClick={closeForm}>
              Cancel
            </button>
          </form>
        </Dialog>
      ) : null}
    </tr>
  );
}

function BulkActions(): JSX.Element {
  const { selectedBranchNodes } = useTree();

  const deleteMutation = useDeleteNode();

  const isDisabled = selectedBranchNodes.length === 0;

  return (
    <div>
      <button
        onClick={() => deleteMutation.mutate(selectedBranchNodes)}
        disabled={isDisabled}
      >
        Delete Selected
      </button>
    </div>
  );
}

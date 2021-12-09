import { useEffect, useRef } from "react";

type Props = {
  status?: "checked" | "unchecked" | "indeterminate";
  onChange: (status: "checked" | "unchecked") => void;
};
export function Checkbox({ status, onChange }: Props): JSX.Element {
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

import React from "react";
import { useEffect, useRef } from "react";

interface Props {
  value: string;
  placeHolder: string;
  onChange: (event: { target: { value: string } }) => void;
}

function Prompt({ value, onChange, placeHolder }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current.addEventListener("blur", () => {
      ref.current!.focus();
    });
  });

  return (
    <input
      className="input-prompt"
      onChange={onChange}
      value={value}
      placeholder={placeHolder}
      autoFocus
      ref={ref}
    />
  );
}

export default Prompt;

import React from "react";
import { useEffect, useRef } from "react";
import { useSpotlightify } from "../../hooks/useSpotlightify";
import { getActiveCommandItem } from "../../utils";
interface Props {
  value: string;
  placeHolder: string;
  onChange: (event: { target: { value: string } }) => void;
}

function Prompt({ value, onChange, placeHolder }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const {
    state: { commandStack },
  } = useSpotlightify();
  const activeCommand = getActiveCommandItem(commandStack);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current.addEventListener("blur", () => {
      ref.current?.focus();
    });
  });

  return (
    <input
      className="input-prompt"
      onChange={onChange}
      value={value}
      placeholder={activeCommand ? placeHolder : "Spotlightify Search"}
      autoFocus
      ref={ref}
    />
  );
}

export default Prompt;

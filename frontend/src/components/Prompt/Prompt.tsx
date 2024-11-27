import React from "react";
import { useEffect, useRef } from "react";
import { EventsOn } from "../../../wailsjs/runtime/runtime";

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
  }, [ref]);

  useEffect(() => {
    const cancel = EventsOn("focus_window", () => {
      ref.current!.focus();
      console.log("focus_window");
    });
    return () => cancel();
  }, []);

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

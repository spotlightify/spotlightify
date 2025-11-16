import React, { useMemo } from "react";
import { useSpotlightify } from "../hooks/useSpotlightify";

function CommandTitle() {
  const {
    state: { commandStack: commandHistory },
  } = useSpotlightify();

  const commandTitles = useMemo(() => {
    return commandHistory.map((command, index) => {
      // Use shorthandTitle for all commands except the last one (nth)
      const isLastCommand = index === commandHistory.length - 1;
      return isLastCommand
        ? command.command.title
        : command.command.shorthandTitle;
    });
  }, [commandHistory]);

  if (commandTitles.length === 0) {
    return null;
  }

  return (
    <div
      className={`text-sm rounded px-1 py-1 border-2 cursor-default overflow-hidden whitespace-nowrap text-ellipsis max-w-[40%] ${"border-[#1db954] text-[#1db954]"}`}
      dir="rtl"
    >
      <span dir="ltr">{commandTitles.join(" → ")}</span>
    </div>
  );
}

export default CommandTitle;

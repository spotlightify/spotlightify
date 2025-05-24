import React, { useMemo } from "react";
import { useSpotlightify } from "../hooks/useSpotlightify";

function CommandTitle() {
  const {
    state: { commandStack: commandHistory },
  } = useSpotlightify();

  const commandTitles = useMemo(() => {
    return commandHistory.map((command) => command.command.title);
  }, [commandHistory]);

  if (commandTitles.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-1 h-full">
      <div
        className={`text-sm rounded px-1 py-1 border-2 cursor-default ${"border-[#1db954] text-[#1db954]"}`}
      >
        {commandTitles.join(" → ")}
      </div>
    </div>
  );
}

export default CommandTitle;

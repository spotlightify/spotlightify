import React from "react";

interface CommandTitleProps {
  commandTitles: string[];
  errorOccurred: boolean;
}

function CommandTitle({ commandTitles, errorOccurred }: CommandTitleProps) {
  if (commandTitles.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-1 h-full">
      <div
        className={`text-sm rounded px-1 py-1 border-2 cursor-default ${
          errorOccurred
            ? "border-[#e62525] text-[#e62525]"
            : "border-[#1db954] text-[#1db954]"
        }`}
      >
        {commandTitles.join(" → ")}
      </div>
    </div>
  );
}

export default CommandTitle;

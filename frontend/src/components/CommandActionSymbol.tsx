import React from "react";

interface CommandActionSymbolProps {
  type: "action" | "command";
}

function CommandActionSymbol({ type }: CommandActionSymbolProps) {
  const symbol = type === "action" ? "Action" : "Command";

  return (
    <div className="flex h-full items-center">
      <div
        className={`text-sm rounded px-1.5 py-0.5 border-2 cursor-default font-medium border-gray-500 text-gray-500`}
      >
        {symbol}
      </div>
    </div>
  );
}

export default CommandActionSymbol;

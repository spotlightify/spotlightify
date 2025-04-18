import { useMutation } from "@tanstack/react-query";
import { WindowSetSize } from "../../wailsjs/runtime/runtime";

function useSetWindowSize() {
  const { mutate: setWindowSize } = useMutation({
    mutationFn: (size: { width: number; height: number }) => {
      return WindowSetSize(size.width, size.height);
    },
  });

  return { setWindowSize };
}

export default useSetWindowSize;

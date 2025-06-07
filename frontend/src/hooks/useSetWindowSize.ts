import {useMutation} from "@tanstack/react-query";
import {WindowSetSize} from "../../wailsjs/runtime";

function useSetWindowSize() {
  const {mutate: setWindowSize} = useMutation({
    mutationFn: async (size: { width: number; height: number }) => {
      return await WindowSetSize(size.width, size.height);
    },
  });

  return {setWindowSize};
}

export default useSetWindowSize;

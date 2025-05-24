import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSpotlightify } from "./useSpotlightify";
import { SuggestionAction } from "../types/command";

function useAction() {
  const { actions: stateActions } = useSpotlightify();
  const mutation = useMutation({
    mutationFn: (action: SuggestionAction) => {
      return action(stateActions);
    },
  });
  const queryClient = useQueryClient();

  return {
    handleAction: (action: SuggestionAction) => {
      mutation.mutate(action, {
        onSuccess: async () => {
          try {
            await queryClient.invalidateQueries({
              queryKey: ["suggestions"],
            });
          } catch (error) {
            console.error("Error invalidating queries:", error);
          }
        },
      });
    },
  };
}

export default useAction;

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  SpotlightifyContext,
  SpotlightifyProvider,
} from "./SpotlightifyContext";
import { Command, SuggestionList } from "../types/command";
import { render } from "../test/test-utils";
import React from "react";

describe("SpotlightifyContext", () => {
  const createMockCommand = (id: string, onCancel?: () => void): Command => ({
    id,
    title: `Command ${id}`,
    shorthandTitle: `Cmd ${id}`,
    debounceMS: 0,
    keyword: id,
    getSuggestions: vi.fn().mockResolvedValue({ items: [] }),
    getPlaceholderSuggestion: vi.fn().mockResolvedValue({
      title: "Placeholder",
      description: "Description",
      icon: "icon",
      id: "placeholder",
    }),
    onCancel,
  });

  const createMockSuggestionList = (): SuggestionList => ({
    items: [
      {
        id: "1",
        title: "Suggestion 1",
        description: "Description 1",
        icon: "icon1",
      },
      {
        id: "2",
        title: "Suggestion 2",
        description: "Description 2",
        icon: "icon2",
      },
    ],
  });

  describe("Reducer Actions", () => {
    describe("SET_PROMPT_INPUT", () => {
      it("should update prompt input correctly", () => {
        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.setPromptInput("test input");
        });

        expect(result.current?.state.promptInput).toBe("test input");
      });
    });

    describe("POP_COMMAND", () => {
      it("should remove last command and restore previous prompt input", () => {
        const onCancel1 = vi.fn();
        const onCancel2 = vi.fn();
        const command1 = createMockCommand("cmd1", onCancel1);
        const command2 = createMockCommand("cmd2", onCancel2);

        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.setPromptInput("input1");
          result.current?.actions.pushCommand(command1);
          result.current?.actions.setPromptInput("input2");
          result.current?.actions.pushCommand(command2);
        });

        expect(result.current?.state.commandStack.length).toBe(2);
        // After pushing command2, input2 was saved to command1's options
        expect(result.current?.state.commandStack[0].options?.promptInput).toBe(
          "input2"
        );

        act(() => {
          result.current?.actions.popCommand();
        });

        expect(result.current?.state.commandStack.length).toBe(1);
        expect(result.current?.state.promptInput).toBe("input2");
        expect(onCancel2).toHaveBeenCalledTimes(1);
        expect(onCancel1).not.toHaveBeenCalled();
      });

      it("should not restore prompt input when restorePromptInput is false", () => {
        const command1 = createMockCommand("cmd1");
        const command2 = createMockCommand("cmd2");

        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.pushCommand(command1);
          result.current?.actions.setPromptInput("current input");
          result.current?.actions.pushCommand(command2);
        });

        // After pushing command2, promptInput is cleared to ''
        expect(result.current?.state.promptInput).toBe("");

        act(() => {
          result.current?.actions.popCommand({ restorePromptInput: false });
        });

        // When restorePromptInput is false, it keeps current promptInput which is ''
        expect(result.current?.state.promptInput).toBe("");
      });

      it("should handle empty stack gracefully", () => {
        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.popCommand();
        });

        expect(result.current?.state.commandStack.length).toBe(0);
      });

      it("should restore placeholder text from previous command", () => {
        const command1 = createMockCommand("cmd1");
        const command2 = createMockCommand("cmd2");

        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.pushCommand(command1, {
            placeholderText: "Placeholder 1",
          });
          result.current?.actions.pushCommand(command2, {
            placeholderText: "Placeholder 2",
          });
        });

        act(() => {
          result.current?.actions.popCommand();
        });

        expect(result.current?.state.placeholderText).toBe("Placeholder 1");
      });
    });

    describe("PUSH_COMMAND", () => {
      it("should add command to stack and clear prompt input", () => {
        const command = createMockCommand("cmd1");

        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.setPromptInput("test input");
          result.current?.actions.pushCommand(command);
        });

        expect(result.current?.state.commandStack.length).toBe(1);
        expect(result.current?.state.commandStack[0].command.id).toBe("cmd1");
        expect(result.current?.state.promptInput).toBe("");
      });

      it("should save previous prompt input when pushing second command", () => {
        const command1 = createMockCommand("cmd1");
        const command2 = createMockCommand("cmd2");

        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.setPromptInput("input1");
          result.current?.actions.pushCommand(command1);
          result.current?.actions.setPromptInput("input2");
          result.current?.actions.pushCommand(command2);
        });

        // The reducer saves the current promptInput (input2) to the previous command's options
        expect(result.current?.state.commandStack[0].options?.promptInput).toBe(
          "input2"
        );
      });

      it("should set placeholder text from options", () => {
        const command = createMockCommand("cmd1");

        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.pushCommand(command, {
            placeholderText: "Custom placeholder",
          });
        });

        expect(result.current?.state.placeholderText).toBe(
          "Custom placeholder"
        );
      });
    });

    describe("SET_ACTIVE_COMMAND", () => {
      it("should behave like PUSH_COMMAND", () => {
        const command = createMockCommand("cmd1");

        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.setPromptInput("test input");
          result.current?.actions.setActiveCommand(command);
        });

        expect(result.current?.state.commandStack.length).toBe(1);
        expect(result.current?.state.promptInput).toBe("");
      });
    });

    describe("REPLACE_ACTIVE_COMMAND", () => {
      it("should replace active command when stack has items", () => {
        const command1 = createMockCommand("cmd1");
        const command2 = createMockCommand("cmd2");

        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.pushCommand(command1);
          result.current?.actions.replaceActiveCommand(command2);
        });

        expect(result.current?.state.commandStack.length).toBe(1);
        expect(result.current?.state.commandStack[0].command.id).toBe("cmd2");
      });

      it("should push new command when stack is empty", () => {
        const command = createMockCommand("cmd1");

        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.replaceActiveCommand(command, {
            placeholderText: "New placeholder",
          });
        });

        expect(result.current?.state.commandStack.length).toBe(1);
        expect(result.current?.state.commandStack[0].command.id).toBe("cmd1");
        expect(result.current?.state.placeholderText).toBe("New placeholder");
        expect(result.current?.state.promptInput).toBe("");
      });
    });

    describe("CLEAR_COMMANDS", () => {
      it("should clear all commands and call onCancel on each", () => {
        const onCancel1 = vi.fn();
        const onCancel2 = vi.fn();
        const command1 = createMockCommand("cmd1", onCancel1);
        const command2 = createMockCommand("cmd2", onCancel2);

        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.pushCommand(command1);
          result.current?.actions.pushCommand(command2);
        });

        act(() => {
          result.current?.actions.clearCommands();
        });

        expect(result.current?.state.commandStack.length).toBe(0);
        expect(onCancel1).toHaveBeenCalledTimes(1);
        expect(onCancel2).toHaveBeenCalledTimes(1);
      });

      it("should handle empty stack gracefully", () => {
        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.clearCommands();
        });

        expect(result.current?.state.commandStack.length).toBe(0);
      });
    });

    describe("SET_SUGGESTION_LIST", () => {
      it("should update suggestions correctly", () => {
        const suggestions = createMockSuggestionList();

        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.setSuggestionList(suggestions);
        });

        expect(result.current?.state.suggestions.items.length).toBe(2);
        expect(result.current?.state.suggestions.items[0].id).toBe("1");
      });
    });

    describe("SET_PLACEHOLDER_TEXT", () => {
      it("should update placeholder text correctly", () => {
        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.setPlaceholderText("New placeholder");
        });

        expect(result.current?.state.placeholderText).toBe("New placeholder");
      });
    });

    describe("RESET_PROMPT", () => {
      it("should reset all state and call onCancel on all commands", () => {
        const onCancel1 = vi.fn();
        const onCancel2 = vi.fn();
        const command1 = createMockCommand("cmd1", onCancel1);
        const command2 = createMockCommand("cmd2", onCancel2);
        const suggestions = createMockSuggestionList();

        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.setPromptInput("test input");
          result.current?.actions.pushCommand(command1);
          result.current?.actions.pushCommand(command2);
          result.current?.actions.setSuggestionList(suggestions);
          result.current?.actions.setPlaceholderText("Custom placeholder");
        });

        act(() => {
          result.current?.actions.resetPrompt();
        });

        expect(result.current?.state.promptInput).toBe("");
        expect(result.current?.state.commandStack.length).toBe(0);
        expect(result.current?.state.placeholderText).toBe(
          "Spotlightify Search"
        );
        expect(result.current?.state.suggestions.items.length).toBe(0);
        expect(onCancel1).toHaveBeenCalledTimes(1);
        expect(onCancel2).toHaveBeenCalledTimes(1);
      });
    });

    describe("SET_CURRENT_COMMAND_PARAMETERS", () => {
      it("should update parameters for active command", () => {
        const command = createMockCommand("cmd1");

        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.pushCommand(command);
          result.current?.actions.setCurrentCommandParameters({
            param1: "value1",
            param2: "value2",
          });
        });

        const activeCommand =
          result.current?.state.commandStack[
            result.current?.state.commandStack.length - 1
          ];
        expect(activeCommand?.options?.parameters).toEqual({
          param1: "value1",
          param2: "value2",
        });
      });

      it("should preserve existing options when updating parameters", () => {
        const command = createMockCommand("cmd1");

        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.pushCommand(command, {
            placeholderText: "Existing placeholder",
            keepPromptOpen: true,
          });
          result.current?.actions.setCurrentCommandParameters({
            param1: "value1",
          });
        });

        const activeCommand =
          result.current?.state.commandStack[
            result.current?.state.commandStack.length - 1
          ];
        expect(activeCommand?.options?.placeholderText).toBe(
          "Existing placeholder"
        );
        expect(activeCommand?.options?.keepPromptOpen).toBe(true);
        expect(activeCommand?.options?.parameters).toEqual({
          param1: "value1",
        });
      });

      it("should be no-op when no active command", () => {
        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        const initialState = result.current?.state;

        act(() => {
          result.current?.actions.setCurrentCommandParameters({
            param1: "value1",
          });
        });

        expect(result.current?.state).toEqual(initialState);
      });
    });

    describe("BATCH_ACTIONS", () => {
      it("should execute multiple actions sequentially", () => {
        const command = createMockCommand("cmd1");
        const suggestions = createMockSuggestionList();

        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.batchActions([
            { type: "SET_PROMPT_INPUT", payload: "test input" },
            {
              type: "PUSH_COMMAND",
              payload: { command },
            },
            { type: "SET_SUGGESTION_LIST", payload: suggestions },
          ]);
        });

        expect(result.current?.state.promptInput).toBe("");
        expect(result.current?.state.commandStack.length).toBe(1);
        expect(result.current?.state.suggestions.items.length).toBe(2);
      });
    });

    describe("REFRESH_SUGGESTIONS", () => {
      it("should create new command stack array to force re-render", () => {
        const command = createMockCommand("cmd1");

        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.pushCommand(command);
        });

        const previousStack = result.current?.state.commandStack;

        act(() => {
          result.current?.actions.refreshSuggestions();
        });

        expect(result.current?.state.commandStack).not.toBe(previousStack);
        expect(result.current?.state.commandStack.length).toBe(1);
      });
    });

    describe("SET_DEVELOPER_OPTIONS", () => {
      it("should update developer options correctly", () => {
        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.setDeveloperOptions({
            disableHide: true,
            disableBlur: true,
          });
        });

        expect(result.current?.state.developerOptions.disableHide).toBe(true);
        expect(result.current?.state.developerOptions.disableBlur).toBe(true);
      });

      it("should update individual developer options", () => {
        const { result } = renderHook(
          () => {
            const context = React.useContext(SpotlightifyContext);
            return context;
          },
          {
            wrapper: SpotlightifyProvider,
          }
        );

        act(() => {
          result.current?.actions.setDeveloperOptions({
            disableHide: true,
            disableBlur: false,
          });
        });

        expect(result.current?.state.developerOptions.disableHide).toBe(true);
        expect(result.current?.state.developerOptions.disableBlur).toBe(false);
      });
    });
  });

  describe("Context Integration", () => {
    it("should render children correctly", () => {
      const TestComponent = () => {
        const context = React.useContext(SpotlightifyContext);
        return (
          <div>{context ? "Context Available" : "Context Not Available"}</div>
        );
      };

      const { getByText } = render(<TestComponent />);
      expect(getByText("Context Available")).toBeInTheDocument();
    });

    it("should provide initial state correctly", () => {
      const { result } = renderHook(
        () => {
          const context = React.useContext(SpotlightifyContext);
          return context;
        },
        {
          wrapper: SpotlightifyProvider,
        }
      );

      expect(result.current?.state.promptInput).toBe("");
      expect(result.current?.state.commandStack.length).toBe(0);
      expect(result.current?.state.suggestions.items.length).toBe(0);
      expect(result.current?.state.placeholderText).toBe("Spotlightify Search");
      expect(result.current?.state.developerOptions.disableHide).toBe(false);
      expect(result.current?.state.developerOptions.disableBlur).toBe(false);
    });

    it("should provide actions object", () => {
      const { result } = renderHook(
        () => {
          const context = React.useContext(SpotlightifyContext);
          return context;
        },
        {
          wrapper: SpotlightifyProvider,
        }
      );

      expect(result.current?.actions).toBeDefined();
      expect(typeof result.current?.actions.setPromptInput).toBe("function");
      expect(typeof result.current?.actions.pushCommand).toBe("function");
      expect(typeof result.current?.actions.popCommand).toBe("function");
      expect(typeof result.current?.actions.clearCommands).toBe("function");
      expect(typeof result.current?.actions.resetPrompt).toBe("function");
    });

    it("should maintain action references across renders", () => {
      const { result, rerender } = renderHook(
        () => {
          const context = React.useContext(SpotlightifyContext);
          return context;
        },
        {
          wrapper: SpotlightifyProvider,
        }
      );

      const firstRenderActions = result.current?.actions;

      act(() => {
        result.current?.actions.setPromptInput("test");
      });

      rerender();

      expect(result.current?.actions).toBe(firstRenderActions);
    });

    it("should handle multiple state updates correctly", () => {
      const command1 = createMockCommand("cmd1");
      const command2 = createMockCommand("cmd2");
      const suggestions = createMockSuggestionList();

      const { result } = renderHook(
        () => {
          const context = React.useContext(SpotlightifyContext);
          return context;
        },
        {
          wrapper: SpotlightifyProvider,
        }
      );

      act(() => {
        result.current?.actions.setPromptInput("input1");
        result.current?.actions.pushCommand(command1);
        result.current?.actions.setPromptInput("input2");
        result.current?.actions.pushCommand(command2);
        result.current?.actions.setSuggestionList(suggestions);
        result.current?.actions.setPlaceholderText("Final placeholder");
      });

      expect(result.current?.state.commandStack.length).toBe(2);
      expect(result.current?.state.suggestions.items.length).toBe(2);
      expect(result.current?.state.placeholderText).toBe("Final placeholder");
    });
  });
});

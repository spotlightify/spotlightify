import BaseCommand from "./baseCommand";
import { Suggestion, SuggestionList } from "../../types/command";
import { Hide } from "../../../wailsjs/runtime";
import Icon from "../../types/icons";
import { Seek } from "../../../wailsjs/go/backend/Backend";
import { HandleGenericError } from "./utils";

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;

function validateMinuteOrSecond(
  time: number,
  type: "minutes" | "seconds"
): string {
  if (isNaN(time) || time > 60 || time < 0) {
    return `Invalid ${type}, must be between 0 and 60`;
  }
  return "";
}

function processTime(time: string): number {
  const timeParts = time.split(":").reverse(); // Reverse so ss:mm:hh is in this order
  let totalMS = 0;
  if (timeParts.length === 0 || timeParts.length > 3) {
    throw "Invalid time";
  }

  if (timeParts.length >= 1) {
    const secondsPart = Number(timeParts[0]);
    const secondsValidation = validateMinuteOrSecond(secondsPart, "seconds");
    if (secondsValidation !== "") {
      throw secondsValidation;
    }
    totalMS += secondsPart * second;
  }

  if (timeParts.length >= 2) {
    const minutesPart = Number(timeParts[1]);
    const minutesValidation = validateMinuteOrSecond(minutesPart, "minutes");
    if (minutesValidation !== "") {
      throw minutesValidation;
    }
    totalMS += minutesPart * minute;
  }

  if (timeParts.length === 3) {
    const hoursPart = Number(timeParts[2]);
    if (isNaN(hoursPart)) {
      throw "Invalid hours";
    }
    totalMS += hoursPart * hour;
  }

  return totalMS;
}

class GotoCommand extends BaseCommand {
  constructor() {
    super("goto", "Go To", "goto", 1, "goto <location>", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Go To",
      description: "Go to a specific time in the track",
      icon: Icon.GoArrow,
      id: this.id,
      action: async (actions) => {
        actions.batchActions([
          {
            type: "SET_PLACEHOLDER_TEXT",
            payload: "Enter a time stamp e.g. 50, 2:13, 1:10:00",
          },
          { type: "SET_ACTIVE_COMMAND", payload: { command: this } },
          { type: "SET_PROMPT_INPUT", payload: "" },
        ]);
        return Promise.resolve();
      },
    };
  }

  getSuggestions(
    input: string,
    _parameters: Record<string, string>
  ): Promise<SuggestionList> {
    const location = input.trim();
    let timeMS = 0;
    try {
      timeMS = processTime(location);
    } catch (e) {
      return Promise.resolve({
        items: [
          {
            title: "Invalid time",
            description: String(e),
            icon: Icon.Error,
            id: "invalid-time",
          },
        ],
      });
    }

    return Promise.resolve({
      items: [
        {
          title: "Go To",
          description: "Go to timestamp at " + location,
          icon: Icon.GoArrow,
          id: this.id,
          action: async (actions) => {
            Hide();
            actions.resetPrompt();
            try {
              Seek(timeMS);
            } catch (e) {
              HandleGenericError("Go To", e, actions.setSuggestionList);
            }
            return Promise.resolve();
          },
        },
      ],
    });
  }
}

export default GotoCommand;

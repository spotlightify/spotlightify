import BaseCommand from "./baseCommand";
import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import Icon from "../../types/icons";
import { Seek } from "../../../wailsjs/go/backend/Backend";
import { executePlaybackAction } from "./utils";

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

class SeekCommand extends BaseCommand {
  constructor() {
    super("seek", "Seek", "seek", 1, "seek", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Seek",
      description: "Seek to a specific time in the track",
      icon: Icon.GoArrow,
      id: this.id,
      type: "command",
      action: async (actions) => {
        actions.setActiveCommand(this, {
          placeholderText: "Enter a time stamp e.g. 50, 2:13, 1:10:00",
        });
        return Promise.resolve();
      },
    };
  }

  async getSuggestions({ input }: SuggestionsParams): Promise<SuggestionList> {
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
          title: "Seek",
          description: "Seek to timestamp at " + location,
          icon: Icon.GoArrow,
          id: this.id,
          action: async (actions) => {
            await executePlaybackAction({
              playbackAction: () => Seek(timeMS),
              opName: "Seek",
              actions,
              enableDeviceErrorRetry: true,
            });
            return Promise.resolve();
          },
        },
      ],
    });
  }
}

export default SeekCommand;

import {Command} from "../types/command";

export class CommandRegistry {
  private commands: Command[] = [];

  register(command: Command): void {
    this.commands.push(command);
  }

  searchByKeyword(input: string): Command[] {
    if (!input) {
      return [];
    }

    const filteredCommands = Array.from(this.commands.values()).filter(
      (command) => {
        return command.keyword.startsWith(input);
      }
    );
    return filteredCommands.sort((a, b) => a.keyword.localeCompare(b.keyword));
  }

  getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }
}

# Documentation
General documentation of how user input is processed and used to display a lists of suggestions. Lets start
with describing what **commands** and **suggestions** are.

## Commands

Commands are used to process user inputted text and return a list of suggestions.
This works by comparing the text within the prompt to the prefix of a command (commands are stored in `command_list: list`
within the `CommandHandler` class, `spotlight/handler.py`).
When a command's `prefix` matches the text within the prompt, the command can control what suggestions are displayed through the `get_suggestions(parameter: str) -> List[Suggestions]` method.

The base class is found within `spotlight/commands/command.py`. Classes that inherit from this `Command` class are also
found within the `commands/` directory.

The `Command` base class includes the following variables and method:
 - `title: str` The title of the command.
 - `description: str` A description of the command.
 - `prefix: str` The prefix is used to find the command, using text entered into the Spotlightify prompt (identifies command).
 - `get_suggestions(self, parameter="") -> List[Suggestion]` Method that can be overridden to return a list of suggestions,
  which will be used in the method `get_command_suggestions(text: str)` of the `CommandHandler` class (location: `spotlight/handler.py`).

## Suggestions

Suggestions are visual items which are created and displayed via a `Command` class.
Note: I refer to "clicking on the suggestion", this includes hitting the `enter` key on it as well.

The base class is found within `spotlight/suggestions/suggestion.py`. Classes that inherit from this `Suggestion` class are also
found within the `suggestions/` directory.

Template suggestions can be found in `spotlight/suggestions/template.py`. These are general use suggestions
which come with a description of their different abilities.

The Suggestion base class includes the following variables:
 - `title: str` The title of the suggestion (displayed visually).
 - `description: str` The description of the suggestion (displayed visually).
 - `icon_name: str`  The name of an svg asset **without** the file's extension or path (svg assets found within `assets/svg/`).
 **Also strings of length 22 characters are reserved for album ids (for album art),
 see icon_name setter in suggestions.py, line 63.**
 - `function: classmethod` The classmethod must be from the `PlaybackManager` class (location: `api/manager.py`)
 and the `setting` variable must be set to `"exe"`. The method will be executed when the Suggestion is clicked.
 **Set as `lambda: None` if no function is expected to be executed.**
 - `parameter:` The parameter which will be passed into the `function` classmethod on execution. The `function`
 will be executed within `CommandHandler.execute_function(Suggestion)` in `spotlight/handler.py` **Set as `""` if there is no classmethod to be executed or if the classmethod does not take any parameters.**
 - `setting: str` **Possible Settings:** `exe`: will execute the `function` when clicked, `fill`: will fill the prompt with text from `fill_str`, `none`: does nothing when clicked.
 - `fill_str: ` A string which will fill the prompt if `setting` is set to `"fill"` and the suggestion is clicked.

 ![Spotlightify](assets/img/example_suggestion.jpg)

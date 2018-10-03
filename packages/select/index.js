const { createPrompt } = require('@inquirer/core');
const { isUpKey, isDownKey } = require('@inquirer/core/lib/key');
const Paginator = require('@inquirer/core/lib/Paginator');
const chalk = require('chalk');
const figures = require('figures');
const { cursorHide } = require('ansi-escapes');

module.exports = createPrompt(
  readline => ({
    onKeypress: (value, key, { cursorPosition = 0, choices }, setState) => {
      let newCursorPosition = cursorPosition;
      if (isUpKey(key)) {
        newCursorPosition = (cursorPosition - 1 + choices.length) % choices.length;
      } else if (isDownKey(key)) {
        newCursorPosition = (cursorPosition + 1) % choices.length;
      }

      if (newCursorPosition !== cursorPosition) {
        setState({
          cursorPosition: newCursorPosition,
          value: choices[newCursorPosition].value
        });
      }
    },
    paginator: new Paginator(readline)
  }),
  (state, { paginator }) => {
    const { prefix, message, choices, cursorPosition = 0, pageSize = 7 } = state;

    if (state.status === 'done') {
      const choice = choices[cursorPosition];
      return `${prefix} ${message} ${chalk.cyan(choice.name || choice.value)}`;
    }

    const allChoices = choices
      .map(({ name, value, disabled }, index) => {
        const line = name || value;
        if (disabled) {
          return chalk.dim(`- ${line} (disabled)`);
        }
        if (index === cursorPosition) {
          return chalk.cyan(`${figures.pointer} ${line}`);
        }
        return `  ${line}`;
      })
      .join('\n');
    const windowedChoices = paginator.paginate(allChoices, cursorPosition, pageSize);
    return `${prefix} ${message}\n${windowedChoices}${cursorHide}`;
  }
);
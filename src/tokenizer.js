"use strick";

/*
 *  * For the following syntax:
 *
 *   (add 2 (subtract 4 2))
 *
 * Tokens might look something like this:
 *
 *   [
 *     { type: 'paren',  value: '('        },
 *     { type: 'name',   value: 'add'      },
 *     { type: 'number', value: '2'        },
 *     { type: 'paren',  value: '('        },
 *     { type: 'name',   value: 'subtract' },
 *     { type: 'number', value: '4'        },
 *     { type: 'number', value: '2'        },
 *     { type: 'paren',  value: ')'        },
 *     { type: 'paren',  value: ')'        },
 *   ]
 *
 */

function tokenizer(input) {
  let current = 0;
  const tokens = [];

  while (current < input.length) {
    let char = input[current];

    if (char === "(") {
      tokens.push({
        type: "paren",
        value: "(",
      });

      current++;
      continue;
    }

    if (char === ")") {
      tokens.push({
        type: "paren",
        value: ")",
      });

      current++;
      continue;
    }

    const WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      char = input[++current];
      continue;
    }

    const NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let value = "";

      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({
        type: "number",
        value,
      });

      continue;
    }

    //   (concat "foo" "bar")
    //            ^^^   ^^^ string tokens
    if (char === '"') {
      char = input[++current];
      let value = "";
      while (char !== '"') {
        value += char;
        char = input[++current];
      }

      char = input[++current];

      tokens.push({
        type: "string",
        value,
      });

      continue;
    }

    const LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      let value = "";
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }

      char = input[++current];

      tokens.push({
        type: "name",
        value,
      });

      continue;
    }

    // Finally if we have not matched a character by now, we're going to throw
    // an error and completely exit.
    throw new TypeError("I dont know what this character is: " + char);
  }

  return tokens;
}

module.exports = tokenizer;

"use strick";

/**
 * https://github.com/jamiebuilds/the-super-tiny-compiler/blob/master/the-super-tiny-compiler.js
 * https://zhuanlan.zhihu.com/p/515999515
 *
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

/*
 * And an Abstract Syntax Tree (AST) might look like this:
 *
 *   {
 *     type: 'Program',
 *     body: [{
 *       type: 'CallExpression',
 *       name: 'add',
 *       params: [{
 *         type: 'NumberLiteral',
 *         value: '2',
 *       }, {
 *         type: 'CallExpression',
 *         name: 'subtract',
 *         params: [{
 *           type: 'NumberLiteral',
 *           value: '4',
 *         }, {
 *           type: 'NumberLiteral',
 *           value: '2',
 *         }]
 *       }]
 *     }]
 *   }
 */

function parser(tokens) {
  let current = 0;

  function walk() {
    let token = tokens[current];

    if (token.type === "number") {
      current++;

      return {
        type: "NumberLiteral",
        value: token.value,
      };
    }

    if (token.type === "string") {
      current++;

      return {
        type: "StringLiteral",
        value: token.value,
      };
    }

    if (token.type === "paren" && token.value === "(") {
      token = tokens[++current];
      let node = {
        type: "CallExpression",
        name: token.value,
        params: [],
      };

      token = tokens[++current];
      while (
        token.type !== "paren" ||
        (token.type === "paren" && token.value !== ")")
      ) {
        node.params.push(walk());
        token = tokens[current];
      }

      current++;

      return node;
    }

    throw new TypeError(token.type);
  }

  const ast = {
    type: "Program",
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}

function traverser(ast, visitor) {
  function traverseArray(arr, parent) {
    arr.forEach((child) => traverseNode(child, parent));
  }

  function traverseNode(node, parent) {
    const method = visitor[node.type];

    if (method && method.entry) {
      method.entry(node, parent);
    }

    switch (node.type) {
      case "Program":
        traverseArray(node.body, node);
        break;

      case "CallExpression":
        traverseArray(node.params, node);
        break;

      case "NumberLiteral":
      case "StringLiteral":
        break;

      default:
        throw new TypeError(node.type);
    }

    if (method && method.exit) {
      method.exit(node, parent);
    }
  }

  traverseNode(ast, null);
}

const visitor = {
  NumberLiteral: {
    entry(node, parent) {
      parent._context.push({
        type: "NumberLiteral",
        value: node.value,
      });
    },
  },

  StringLiteral: {
    entry(node, parent) {
      parent._context.push({
        type: "StringLiteral",
        value: node.value,
      });
    },
  },

  CallExpression: {
    entry(node, parent) {
      let expression = {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: node.name,
        },
        arguments: [],
      };

      node._context = expression.arguments;

      if (parent.type !== "CallExpression") {
        expression = {
          type: "ExpressionStatement",
          expression,
        };
      }

      parent._context.push(expression);
    },
  },
};

function transformer(ast) {
  const newAst = {
    type: "Program",
    body: [],
  };

  ast._context = newAst.body;

  traverser(ast, visitor);

  return newAst;
}

function codeGenerator(ast) {
  switch (ast.type) {
    case "Program":
      return ast.body.map(codeGenerator).join("\n");

    case "ExpressionStatement":
      return codeGenerator(ast.expression) + ";";

    case "CallExpression":
      return (
        codeGenerator(ast.callee) +
        "(" +
        ast.arguments.map(codeGenerator).join(", ") +
        ")"
      );

    case "Identifier":
      return ast.name;

    case "NumberLiteral":
      return ast.value;

    case "StringLiteral":
      return '"' + ast.value + '"';

    default:
      throw TypeError(ast.type);
  }
}

module.exports = {
  tokenizer,
  parser,
  transformer,
  traverser,
  codeGenerator,
};

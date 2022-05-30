"use strick";
const traverser = require("./traverser");

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

module.exports = transformer;

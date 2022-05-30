"use strick";

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

module.exports = codeGenerator;

"use strick";

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

module.exports = traverser;

"use strick";

/**
 * https://github.com/jamiebuilds/the-super-tiny-compiler/blob/master/the-super-tiny-compiler.js
 * https://zhuanlan.zhihu.com/p/515999515
 *
 */
const tokenizer = require("./tokenizer");
const parser = require("./parser");
const transformer = require("./transformer");
const traverser = require("./traverser");
const codeGenerator = require("./codeGenerator");

function compiler(input) {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  const newAst = transformer(ast);
  const output = codeGenerator(newAst);

  return output;
}

module.exports = {
  tokenizer,
  parser,
  transformer,
  traverser,
  codeGenerator,
  compiler,
};

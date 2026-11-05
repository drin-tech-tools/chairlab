// Step files are .mts: Node 24 strips types natively, no ts loader needed.
const config = {
  paths: ["features/**/*.feature"],
  import: ["features/steps/**/*.mts"],
  format: ["progress"],
};

export default config;

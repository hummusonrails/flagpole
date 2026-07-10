import { defineConfig } from "tsup";

// bundle the service and its deps into one file so the runtime image needs no node_modules
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node22",
  noExternal: [/.*/],
  clean: true,
  banner: {
    js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);",
  },
});

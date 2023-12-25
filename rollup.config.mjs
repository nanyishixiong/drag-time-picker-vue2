import vuePlugin from "rollup-plugin-vue";
import scss from "rollup-plugin-scss";
import terser from "@rollup/plugin-terser";
import compiler from "vue-template-compiler";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/esm/index.js",
      format: "es"
    },
    {
      file: "dist/esm/index.min.js",
      format: "es",
      plugins: [terser()]
    },
    {
      file: "dist/cjs/index.js",
      format: "cjs"
    },
    {
      file: "dist/cjs/index.min.js",
      format: "cjs",
      plugins: [terser()]
    }
  ],
  external: ["vue"],
  plugins: [
    vuePlugin({
      css: true, // 将 CSS 动态注入到 <style> 标签中
      template: {
        compiler: compiler // 自定义 vue-template-compiler vue需要用对应版本的编译器才能正常编译，默认是vue3的编译器
      }
    }),
    scss()
  ]
};

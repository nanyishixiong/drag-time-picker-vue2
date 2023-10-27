import Vue from "vue";
import App from "./App.vue";
import { BmMessage } from "@banmafe/tangram-ui";
import "@banmafe/tangram-ui/dist/tangram-ui.min.css";

Vue.prototype.$message = BmMessage;
new Vue({
  render: (h) => h(App)
}).$mount("#app");

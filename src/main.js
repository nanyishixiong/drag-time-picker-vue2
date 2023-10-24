import Vue from 'vue'
import App from './App.vue'
import * as Tangram from '@banmafe/tangram-ui';
import '@banmafe/tangram-ui/dist/tangram-ui.min.css';

Vue.use(Tangram);
new Vue({
  render: (h) => h(App)
}).$mount('#app')

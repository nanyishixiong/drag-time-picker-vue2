import DragTimePicker from "./index.vue";

DragTimePicker.install = (Vue) => {
  Vue.component(DragTimePicker.name, DragTimePicker);
};
console.log("test");
export default DragTimePicker;

import DragTimePicker from "./index.vue";

DragTimePicker.install = (Vue) => {
  Vue.component(DragTimePicker.name, DragTimePicker);
};
console.log("change");
export default DragTimePicker;

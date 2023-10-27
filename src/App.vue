<template>
  <div style="width: 895px">
    <DragTimePicker v-model="value" :needCustomPeriod="true" :range="24" :step="30" @change="change" />
  </div>
</template>

<script>
import DragTimePicker from "./components/dragTimePicker";
export default {
  name: "App",
  components: {
    DragTimePicker
  },
  data() {
    return {
      value: [],
      disabled: false
    };
  },
  watch: {
    value(val) {
      // console.log(val);
    }
  },
  mounted() {},
  methods: {
    timePeriodChange(value) {
      console.log(value);
    },
    change(value) {
      console.log(value);
    }
  }
};
</script>

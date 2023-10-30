<template>
  <div style="width: 1200px">
    <DragTimePicker v-model="value" :needPeriod="true" :range="24" :step="30" @change="change" :periodList="periodList" />
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
      disabled: false,
      periodList: [
        {
          timePeriod: "01:00~02:00",
          label: "1点到2点",
          key: "1-2",
          selected: false
        },
        {
          timePeriod: "03:00~04:00",
          label: "3点到4点",
          key: "3-4",
          selected: false
        }
      ]
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

<template>
  <DragTimePicker
    v-model="value"
    :range="48"
    @on-clear="clearTime"
    :needCustomPeriod="true"
    @custom-time-period-change="timePeriodChange"
    :status="status"
  />
</template>

<script>
import DragTimePicker from "./components/dragTimePicker/index.vue";
import { createTimeData, splicing } from "./components/dragTimePicker/utils.js";
export default {
  name: "App",
  components: {
    DragTimePicker
  },
  data() {
    return {
      timeData: createTimeData(48),
      timeLineLabel: ["00:00 ~ 12:00", "12:00 ~ 24:00"],
      value: [
        {
          endTime: "18:30",
          startTime: "16:00"
        }
      ],
      // status: 'detail',
      status: ""
    };
  },
  watch: {
    value(val) {
      console.log(val);
    }
  },
  mounted() {
    setTimeout(() => {
      this.value = [
        {
          endTime: "18:30",
          startTime: "16:00"
        },
        {
          endTime: "次日18:30",
          startTime: "次日16:00"
        }
      ];
    }, 3000);
  },
  methods: {
    timePeriodChange({ target }) {
      console.log(target.timePeriod);
    },
    clearTime() {
      this.timeData.forEach((t) => {
        this.$set(t, "check", false);
      });
    }
  }
};
</script>

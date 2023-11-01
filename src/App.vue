<template>
  <div style="width: 1200px">
    <DragTimePicker
      v-model="value"
      :needPeriod="true"
      :step="60"
      :periodList="periodList"
      @change="change"
      @on-error="onError"
      @custom-time-period-change="timePeriodChange"
    />
  </div>
</template>

<script>
import DragTimePicker from "@banmafe/drag-time-picker-vue2";
export default {
  name: "App",
  components: {
    DragTimePicker
  },
  data() {
    return {
      value: [
        { startTime: "01:00", endTime: "02:00" },
        { startTime: "03:00", endTime: "04:00" }
      ],
      disabled: false,
      periodList: [
        {
          timePeriod: "01:00~06:00",
          label: "1点到6点",
          key: "1-6",
          selected: false
        },
        {
          timePeriod: "20:00~23:00",
          label: "20点到23点",
          key: "20-23",
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
    },
    onError(err) {
      console.log(err);
    }
  }
};
</script>

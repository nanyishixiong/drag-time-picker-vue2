<template>
  <div style="width: 895px">
    <DragTimePicker v-model="value" :range="24" />
  </div>
</template>

<script>
import DragTimePicker from "./components/dragTimePicker/index.vue";
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
      console.log(val);
    }
  },
  mounted() {
    // setTimeout(() => {
    //   this.value = [
    //     {
    //       endTime: "18:30",
    //       startTime: "16:00"
    //     },
    //     {
    //       endTime: "次日18:30",
    //       startTime: "次日16:00"
    //     }
    //   ];
    // }, 3000);
  },
  methods: {
    timePeriodChange({ target }) {
      console.log(target.timePeriod);
    }
  }
};
</script>

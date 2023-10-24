<template>
  <DragTimePicker 
    v-model="mult_timeRange" 
    :range="24" 
    :td-count="48" 
    :th-label="timeLineLabel" 
    :data="timeData" 
    @on-clear="clearTime"
    :needCustomPeriod="true"
    @custom-time-period-change="timePeriodChange"
  />
</template>

<script>
import DragTimePicker from './components/dragTimePicker/index.vue'
import { createTimeData, splicing } from './components/dragTimePicker/utils.js';
export default {
  name: 'App',
  components: {
    DragTimePicker
  },
  data(){
    return {
      timeData: createTimeData(48),
      timeLineLabel: ['00:00 - 12:00', '12:00 - 24:00'],
    }
  },
  computed: {
    mult_timeRange() {
      let txt = splicing(this.timeData)
      this.format(txt)
      return txt
    }
  },
  methods: {
    timePeriodChange({ target }, customPeriodModel){
      console.log(target.timePeriod, customPeriodModel);
    },
    format(txt) {
      if(!txt) {
        this.$emit('change-val', 'attendanceTimeRestrictionList', null)
        return
      }
      let timeRange = txt.replace('次日', '').split('、')
      let result = timeRange.map(item => {
        let arr = item.split('~')
        return {
          startTime: arr[0].split(':').join(''),
          endTime: arr[1].split(':').join('')
        }
      });
      this.$emit('change-val', 'attendanceTimeRestrictionList', result)
    },
    clearTime() {
      this.timeData.forEach((t) => {
        this.$set(t, 'check', false)
      })
    },
  }
}
</script>
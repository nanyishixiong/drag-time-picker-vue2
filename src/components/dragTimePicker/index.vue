<template>
  <div>
    <!-- 时间段区域 单选 多选 两种 -->
    <div v-if="needCustomPeriod" style="margin-bottom: 10px;">
      <bm-button v-for="(item, index)  in customPeriodList" :key="index" :disabled="isDetail || disabled" @click="customTimePeriodChangeHandler($event, index)">
        {{item.timePeriod + '(' + item.label + ')'}}
      </bm-button>
      <bm-checkbox-group v-model="customPeriodModel" size="medium">
        <bm-checkbox v-for="(item, index)  in customPeriodList" :key="index" :label="item.timePeriod" border @change="customTimePeriodChangeHandler($event, index, customPeriodModel)">
          {{ item.timePeriod + '(' + item.label + ')' }}
        </bm-checkbox>
      </bm-checkbox-group>
    </div>
    
    <div :class="['c-time', flag]">
      <div class="c-schedue"></div>
      <div :class="{ 'c-schedue': true, 'c-schedue-notransi': mode }" :style="styleValue"></div>
      <table :class="{ 'c-min-table': colspan < 2 }" class="c-time-table">
        <!-- 动态传入 -->
        <thead class="c-time-head">
          <tr>
            <th v-for="(t, i) in thLabel" :key="i" :colspan="12 * colspan">{{ t }}</th>
          </tr>
          <tr>
            <td v-for="(t, n) in theadArr" :key="n" :colspan="colspan">{{ t }}</td>
          </tr>
        </thead>
        <tbody class="c-time-body">
          <tr>
            <td v-for="(t, i) in data" :key="i"
              :data-time="`${t.col}`"
              :class="selectClasses(t)"
              @mouseenter="cellEnter(t)"
              @mousedown="cellDown(t)"
              @mouseup="cellUp(t)"
              class="time-atom-item"></td>
          </tr>
          <tr>
            <td :colspan="tdCount" class="c-time-preview">
              <div class="g-clearfix c-time-con">
                <span class="g-pull-left">{{
                  selectValue ? '已选择时间段' : '可拖动鼠标在灰色区域内选择时间段'
                }}</span>
                <a @click.prevent="$emit('on-clear')" class="g-pull-right">清空选择</a>
              </div>
              <div v-if="selectValue" class="c-time-time">
                <div>{{selectValue}}</div>
              </div>
            </td>
          </tr>
          <tr>
            <td :colspan="tdCount" class="c-time-note">
              <div>注：1.第一个时段的开始时间到最后时段的结束时间持续时长不超过24小时；2.最多只能配置3段时间段</div>
            </td>
          </tr>
        </tbody>
        <tbody class="c-disabled" v-if="isDetail || disabled"></tbody>
      </table>
      <div></div>
    </div>
  </div>
</template>

<script>
const createArr = (len) => {
  return Array.from(Array(len)).map((ret, id) => id)
}
const customPeriodList = [
  {
    timePeriod: '00:00-24:00',
    label: '全天',
    type: 'allDay',
    range: [0, 47],
    selected: false,
  },
  {
    timePeriod: '06:00-10:30',
    label: '早餐',
    type: 'breakfast',
    range: [12, 20],
    selected: false,
  },
  {
    timePeriod: '10:30-13:30',
    label: '午高峰',
    type: 'middayPeak',
    range: [21, 26],
    selected: false,
  },
  {
    timePeriod: '13:30-17:00',
    label: '下午茶',
    type: 'afternoonTea',
    range: [27, 33],
    selected: false,
  },
  {
    timePeriod: '17:00-20:00',
    label: '晚高峰',
    type: 'eveningRushHour',
    range: [34, 39],
    selected: false,
  },
  {
    timePeriod: '20:00-24:00',
    label: '夜宵1',
    type: 'lateNightSnack1',
    range: [40, 47],
    selected: false,
  },
  {
    timePeriod: '00:00-6:00',
    label: '夜宵2',
    type: 'lateNightSnack2',
    range: [0, 11],
    selected: false,
  },
];
export default {
  name: 'DragTimePicker',
  props: {
    continuousTimePeriod: {
      type: Array,
      required: false
    },
    needCustomPeriod: {
      type: Boolean,
      default() {
        return false
      }
    },
    value: {
      type: String,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    tdCount: {
      type: Number,
      default() {
        return 96
      }
    },
    range: {
      type: Number,
      default() {
        return 48
      }
    },
    thLabel: {
      type: Array,
      default() {
        return ['00:00 - 12:00', '12:00 - 24:00', '00:00 - 12:00', '12:00 - 24:00']
      }
    },
    colspan: {
      type: Number,
      default() {
        return 2
      }
    },
    status: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      width: 0,
      height: 0,
      left: 0,
      top: 0,
      mode: 0,
      row: 0,
      col: 0,
      // theadArr: [],
      flag: `flag-${+new Date()}`,
      customPeriodModel: [], // 
      customPeriodList,
    }
  },
  computed: {
    styleValue() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
        left: `${this.left}px`,
        top: `${this.top}px`
      }
    },
    selectValue() {
      return this.value
    },
    selectClasses() {
      return (n) => n.check ? 'ui-selected' : ''
    },
    isDetail() {
      return this.status === 'detail'
    },
    theadArr() {
      return this.range > 24 ? Array.from(Array(this.range / 24)).reduce((prev) => { return prev.concat(createArr(24)) }, []) : createArr(this.range)
    },
  },
  destroyed() {
    this.$emit('on-clear');
  },
  watch: {
    continuousTimePeriod(arr) {
      this.customPeriodModel = []
      arr.forEach(subArr => {
        this.customPeriodList.forEach(item => {
          console.log(subArr, item);
          const isHit = JSON.stringify(item.range) === JSON.stringify([subArr[0].col, subArr[subArr.length-1].col])
          if (isHit) {
            this.customPeriodModel.push(item.timePeriod + '(' + item.label + ')');
          }
        });
      })
    },
    range() {
      this.customPeriodList = this.customPeriodList.map(item => {
        item.selected = false;
        return item;
      });
    },
  },
  methods: {
    customTimePeriodChangeHandler(_, index, customPeriodModel) { // 
      this.customPeriodList[index].selected = !this.customPeriodList[index].selected;
      this.$emit('custom-time-period-change', { target: this.customPeriodList[index] }, customPeriodModel);
    },
    cellDown(item) { // 鼠标落下
      const ele = document.querySelector(
        `.${this.flag} td[data-time='${item.col}']`
      )
      this.check = Boolean(item.check)
      this.mode = 1
      if (ele) {
        this.width = ele.offsetWidth
        this.height = ele.offsetHeight
      }

      this.col = item.col
    },
    cellEnter(item) { // 鼠标进入
      const ele = document.querySelector(
        `.${this.flag} td[data-time='${item.col}']`
      )
      if(item.col - this.col >= 48) {
        return
      }
      if (ele && !this.mode) {
        this.left = ele.offsetLeft
        this.top = ele.offsetTop
      } else if (item.col <= this.col) {
        this.width = (this.col - item.col + 1) * ele.offsetWidth
        this.left = ele.offsetLeft
        this.top = ele.offsetTop
      } else if (item.col >= this.col) {
        this.width = (item.col - this.col + 1) * ele.offsetWidth
        if (item.col > this.col) this.top = ele.offsetTop
        if (item.col === this.col) this.left = ele.offsetLeft
      } 
      // else if (item.col > this.col) {
      //   this.width = (item.col - this.col + 1) * ele.offsetWidth
      //   this.top = ele.offsetTop
      // } else if (item.col < this.col) {
      //   this.width = (this.col - item.col + 1) * ele.offsetWidth
      //   this.left = ele.offsetLeft
      // }
      this.height = ele.offsetHeight
    },
    cellUp(item) { // 鼠标抬起 这三个是控制拖动时的动画效果
      if(item.col - this.col >= 48) {
        this.width = 0
        this.height = 0
        this.mode = 0
        return  this.$message.error('时段选择不得超过24小时')
      }
      if (item.col <= this.col) {
        this.selectTime([item.col, this.col], !this.check)
      } else if (item.col >= this.col) {
        this.selectTime([this.col, item.col], !this.check)
      } 
      // else if (item.col > this.col) {
      //   this.selectTime([this.col, item.col], !this.check)
      // } else if (item.col < this.col) {
      //   this.selectTime([item.col, this.col], !this.check)
      // }

      this.width = 0
      this.height = 0
      this.mode = 0
    },
    selectTime(col, check) {
      const [minCol, maxCol] = col
      this.data.forEach((t) => {
        if (t.col >= minCol && t.col <= maxCol) {
          this.$set(t, 'check', check)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.c-time {
  width: 100%;
  min-width: 640px;
  position: relative;
  display: inline-block;
  overflow-x: auto;
}
.c-schedue {
  background: #99bbec;
  position: absolute;
  width: 0;
  height: 0;
  opacity: '0.6';
  pointer-events: none;
  z-index: 99;
}
.c-schedue-notransi {
  transition: width 0.12s ease, height 0.12s ease, top 0.12s ease,
    left 0.12s ease;
}
.c-time-table {
  border-collapse: collapse !important;
  position: relative;
  th {
    vertical-align: inherit;
    font-weight: bold;
  }
  tr {
    height: 30px;
  }
  tr,
  td,
  th {
    user-select: none;
    border: 1px solid #dee4f5;
    text-align: center;
    min-width: 12px;
    line-height: 1.8em;
    transition: background 0.2s ease;
  }
  .c-time-head {
    font-size: 12px;
    .time-td {
      width: 70px;
    }
  }
  .c-time-body {
    font-size: 12px;
    td {
      &.time-atom-item {
        user-select: unset;
        background-color: #f5f5f5 !important;
      }
      &.ui-selected {
        background-color: #598fe6 !important;
      }
    }
  }
  .c-time-preview {
    line-height: 2.4em;
    padding: 0 10px;
    font-size: 14px;
    .c-time-con {
      line-height: 46px;
      user-select: none;
    }
    .c-time-time {
      text-align: left;
      line-height: 2.4em;
      p {
        max-width: 625px;
        line-height: 1.4em;
        word-break: break-all;
        margin-bottom: 8px;
      }
    }
  }
  .c-time-note{
    div{
      text-align: left;
      padding: 0 10px;
    }
  }
}
.c-min-table {
  tr,
  td,
  th {
    min-width: 24px;
  }
}
.g-clearfix {
  &:after,
  &:before {
    clear: both;
    content: ' ';
    display: table;
  }
}
.g-pull-left {
  float: left;
}
.g-pull-right {
  float: right;
}
.g-tip-text {
  color: #999;
}
.c-disabled {
  width: 100%;
  background: #eee;
  height: 77px;
  position: absolute;
  top: 60px;
  left: 0;
  opacity: .5;
  cursor: not-allowed;
}

</style>
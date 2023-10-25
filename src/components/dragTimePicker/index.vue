<template>
  <div>
    <!-- 时间段区域 单选 多选 两种 -->
    <div v-if="needCustomPeriod" style="margin-bottom: 10px">
      <bm-button
        v-for="(item, index) in customPeriodList"
        :key="index"
        :disabled="isDetail || disabled"
        @click="customTimePeriodChangeHandler($event, index)"
      >
        {{ item.timePeriod + "(" + item.label + ")" }}
      </bm-button>
    </div>

    <div :class="['c-time', flag]">
      <!-- 鼠标拖动时的蒙层 -->
      <div :class="{ 'c-schedue': true, 'c-schedue-notransi': mode }" :style="styleValue"></div>
      <table :class="{ 'c-min-table': colspan < 2 }" class="c-time-table">
        <!-- 表格头 -->
        <thead class="c-time-head">
          <!-- 表头——时间段 00:00 - 12:00 -->
          <tr>
            <th v-for="(t, i) in thLabel" :key="i" :colspan="12 * colspan">{{ t }}</th>
          </tr>
          <!-- 表头——小时 -->
          <tr>
            <td v-for="(t, n) in theadArr" :key="n" :colspan="colspan">{{ t }}</td>
          </tr>
        </thead>
        <!-- 表格体 -->
        <tbody class="c-time-body">
          <tr>
            <td
              v-for="(t, i) in timeData"
              :key="i"
              :data-time="`${t.col}`"
              :class="selectClasses(t)"
              @mouseenter="cellEnter(t)"
              @mousedown="cellDown(t)"
              @mouseup="cellUp(t)"
              class="time-atom-item"
            ></td>
          </tr>
          <tr>
            <td :colspan="tdCount" class="c-time-preview">
              <div class="g-clearfix c-time-con">
                <span class="g-pull-left">
                  {{ selectValue ? "已选择时间段" : "可拖动鼠标在灰色区域内选择时间段" }}
                </span>
                <a @click="clearTime" class="g-pull-right">清空选择</a>
              </div>
              <div v-if="selectValue" class="c-time-time">
                <div>{{ selectValue }}</div>
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
    </div>
  </div>
</template>

<script>
import { createTimeData, splicing, timeToCol } from "./utils.js";

const createArr = (len) => {
  return Array.from(Array(len)).map((_, i) => i);
};
const customPeriodList = [
  {
    timePeriod: "00:00~24:00",
    label: "全天",
    type: "allDay",
    range: [0, 47],
    selected: false
  },
  {
    timePeriod: "06:00~10:30",
    label: "早餐",
    type: "breakfast",
    range: [12, 20],
    selected: false
  },
  {
    timePeriod: "10:30~13:30",
    label: "午高峰",
    type: "middayPeak",
    range: [21, 26],
    selected: false
  },
  {
    timePeriod: "13:30~17:00",
    label: "下午茶",
    type: "afternoonTea",
    range: [27, 33],
    selected: false
  },
  {
    timePeriod: "17:00~20:00",
    label: "晚高峰",
    type: "eveningRushHour",
    range: [34, 39],
    selected: false
  },
  {
    timePeriod: "20:00~24:00",
    label: "夜宵1",
    type: "lateNightSnack1",
    range: [40, 47],
    selected: false
  },
  {
    timePeriod: "00:00~6:00",
    label: "夜宵2",
    type: "lateNightSnack2",
    range: [0, 11],
    selected: false
  }
];
export default {
  name: "DragTimePicker",
  model: {
    prop: "value",
    event: "change:value"
  },
  props: {
    // continuousTimePeriod: {
    //   type: Array,
    //   required: false
    // },
    needCustomPeriod: {
      type: Boolean,
      default() {
        return false;
      }
    },
    value: {
      // v-model
      type: Array,
      required: true
    },
    range: {
      // 代表展示多少个小时
      type: Number,
      default() {
        return 48;
      }
    },
    colspan: {
      type: Number,
      default() {
        return 2;
      }
    },
    status: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    }
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
      flag: `flag-${+new Date()}`,
      customPeriodList,
      timeData: []
    };
  },
  computed: {
    styleValue() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
        left: `${this.left}px`,
        top: `${this.top}px`
      };
    },
    selectClasses() {
      return (n) => (n.check ? "ui-selected" : "");
    },
    isDetail() {
      return this.status === "detail";
    },
    theadArr() {
      // 构建 0-23 的数组，超过24的数组例如48为 0-230-23
      return this.range > 24 ? Array.from(Array(this.range / 24)).reduce((prev) => prev.concat(createArr(24)), []) : createArr(24);
    },
    thLabel() {
      return Array.from(Array(this.range / 24)).reduce((prev) => prev.concat(["00:00 ~ 12:00", "12:00 ~ 24:00"]), []);
    },
    tdCount() {
      return this.range * 2;
    },
    selectValue() {
      // 展示选中时间段字符串
      // timeData 改变 重新计算 selectValue 并将选中值抛出
      const selectValue = splicing(this.timeData);
      const result = this.format(selectValue);
      this.$emit("change:value", result); // 抛出选中值给父组件读取
      return selectValue;
    }
  },
  created() {
    this.timeData = createTimeData(this.range * 2);
    this.valueToSelectValue();
  },
  destroyed() {
    this.$emit("on-clear");
  },
  watch: {
    range() {
      this.customPeriodList = this.customPeriodList.map((item) => {
        item.selected = false;
        return item;
      });
    },
    value(val) {
      // TODO 对value做处理
      console.log(val);
    }
  },
  methods: {
    customTimePeriodChangeHandler(_, index) {
      //
      const { range, selected } = this.customPeriodList[index];
      this.customPeriodList[index].selected = !selected;
      this.selectTime(range, !selected);
      this.$emit("custom-time-period-change", { target: this.customPeriodList[index] });
    },
    cellDown(item) {
      // 鼠标落下
      const ele = document.querySelector(`.${this.flag} td[data-time='${item.col}']`);
      this.check = Boolean(item.check);
      this.mode = 1;
      if (ele) {
        this.width = ele.offsetWidth;
        this.height = ele.offsetHeight;
      }

      this.col = item.col;
    },
    cellEnter(item) {
      // 鼠标进入
      const ele = document.querySelector(`.${this.flag} td[data-time='${item.col}']`);
      if (item.col - this.col >= 48) {
        return;
      }
      if (ele && !this.mode) {
        this.left = ele.offsetLeft;
        this.top = ele.offsetTop;
      } else if (item.col <= this.col) {
        this.width = (this.col - item.col + 1) * ele.offsetWidth;
        this.left = ele.offsetLeft;
        this.top = ele.offsetTop;
      } else if (item.col >= this.col) {
        this.width = (item.col - this.col + 1) * ele.offsetWidth;
        if (item.col > this.col) this.top = ele.offsetTop;
        if (item.col === this.col) this.left = ele.offsetLeft;
      }

      this.height = ele.offsetHeight;
    },
    cellUp(item) {
      // 鼠标抬起 这三个是控制拖动时的动画效果
      if (item.col - this.col >= 48) {
        this.width = 0;
        this.height = 0;
        this.mode = 0;
        return this.$message.error("时段选择不得超过24小时");
      }
      if (item.col <= this.col) {
        this.selectTime([item.col, this.col], !this.check);
      } else if (item.col >= this.col) {
        this.selectTime([this.col, item.col], !this.check);
      }

      this.width = 0;
      this.height = 0;
      this.mode = 0;
    },
    format(txt) {
      if (!txt) {
        return [];
      }
      let timeRange = txt.replace("次日", "").split("、");
      let result = timeRange.map((item) => {
        let arr = item.split("~");
        return {
          startTime: arr[0],
          endTime: arr[1]
        };
      });
      return result;
    },
    valueToSelectValue() {
      // 回填 将传入的值转换为timeData check属性
      if (this.value instanceof Array) {
        this.value.forEach(({ startTime, endTime }) => {
          const minCol = timeToCol(startTime, true);
          const maxCol = timeToCol(endTime, false);
          for (let i = minCol; i <= maxCol; i++) {
            this.$set(this.timeData[i], "check", true);
          }
        });
      }
    },
    selectTime(col, check) {
      const [minCol, maxCol] = col;
      // 一切变化 源于对 timeData check属性的修改
      // timeData需要被主动修改 所以并不能是 计算属性
      this.timeData.forEach((t) => {
        if (t.col >= minCol && t.col <= maxCol) {
          this.$set(t, "check", check);
        }
      });
    },
    clearTime() {
      this.timeData.forEach((t) => {
        this.$set(t, "check", false);
      });
    }
  }
};
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
  opacity: "0.6";
  pointer-events: none;
  z-index: 99;
}
.c-schedue-notransi {
  transition: width 0.12s ease, height 0.12s ease, top 0.12s ease, left 0.12s ease;
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
  .c-time-note {
    div {
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
    content: " ";
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
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

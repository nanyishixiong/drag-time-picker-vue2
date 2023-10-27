<template>
  <div>
    <!-- 时间段区域 支持 单选和多选 -->
    <div v-if="needCustomPeriod" class="button-wrapper">
      <button
        class="el-button"
        v-for="(item, index) in customPeriodList"
        :key="index"
        :disabled="disabled"
        @click="customTimePeriodChangeHandler($event, index)"
      >
        {{ item.timePeriod + "(" + item.label + ")" }}
      </button>
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
        <tbody class="c-disabled" v-if="disabled"></tbody>
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
    step: {
      type: Number,
      default() {
        return 30;
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      mode: 0,
      row: 0,
      col: 0,
      flag: `flag-${+new Date()}`,
      customPeriodList,
      timeData: [],
      isIncoming: false // 当前值是否外部传入
    };
  },
  computed: {
    styleValue() {
      return {
        height: `${this.height}px`,
        left: `${this.left}px`, // width:auto 利用left合和right拉伸蒙层
        right: `${this.right}px`,
        top: `${this.top}px`
      };
    },
    selectClasses() {
      return (n) => (n.check ? "ui-selected" : "");
    },
    theadArr() {
      // 构建 0-23 的数组，超过24的数组例如48为 0-230-23
      return this.range > 24 ? Array.from(Array(this.range / 24)).reduce((prev) => prev.concat(createArr(24)), []) : createArr(24);
    },
    thLabel() {
      return Array.from(Array(this.range / 24)).reduce((prev) => prev.concat(["00:00 ~ 12:00", "12:00 ~ 24:00"]), []);
    },
    tdCount() {
      return this.range * this.colspan;
    },
    colspan() {
      // 一个小时多少格
      if (60 % this.step !== 0) {
        throw new Error(`"step" must be a divisor of 60`);
      }
      return 60 / this.step;
    },
    selectValue() {
      // 展示选中时间段字符串
      // timeData 改变 重新计算 selectValue 并将选中值抛出
      const selectValue = splicing(this.timeData, this.colspan);
      const result = this.format(selectValue);
      if (this.isIncoming) {
        this.isIncoming = false;
      } else {
        this.$emit("change:value", result); // 抛出选中值给父组件读取
      }
      return selectValue;
    }
  },
  created() {
    this.createTimeData();
    this.isIncoming = true;
    this.valueToSelectValue();
  },
  destroyed() {
    this.clearTime();
  },
  watch: {
    range() {
      // range变化重新计算格子
      this.createTimeData();
      this.cancelCustomPerioSelected();
    },
    value() {
      this.isIncoming = true;
      // 回填 将传入的值转换为timeData check属性
      this.valueToSelectValue();
    },
    colspan() {
      // colspan变化重新计算格子
      this.createTimeData();
    }
  },
  methods: {
    createTimeData() {
      this.timeData = createTimeData(this.range * this.colspan, this.step);
    },
    cancelCustomPerioSelected() {
      // 取消 时间段区域 按钮 的选中状态
      this.customPeriodList = this.customPeriodList.map((item) => {
        item.selected = false;
        return item;
      });
    },
    customTimePeriodChangeHandler(_, index) {
      // 时间段区域 按钮 点击回调
      const { range, selected } = this.customPeriodList[index];
      // 按钮选中状态取反
      this.customPeriodList[index].selected = !selected;
      // 选中时间格
      this.selectTime(range, !selected);
      // 触发事件，向自组件抛出数据
      this.$emit("custom-time-period-change", this.customPeriodList[index]);
    },
    cellDown(item) {
      // 鼠标落下
      const ele = document.querySelector(`.${this.flag} td[data-time='${item.col}']`);
      const parent = document.querySelector(`.${this.flag}`);
      this.check = Boolean(item.check);
      this.mode = 1;
      if (ele) {
        this.left = ele.offsetLeft;
        this.right = parent.offsetWidth - (ele.offsetLeft + ele.offsetWidth);
        this.height = ele.offsetHeight;
      }

      this.col = item.col;
    },
    cellEnter(item) {
      // 鼠标进入
      const ele = document.querySelector(`.${this.flag} td[data-time='${item.col}']`);
      const parent = document.querySelector(`.${this.flag}`);
      if (item.col - this.col >= 24 * this.colspan) {
        return;
      }
      if (ele && !this.mode) {
        this.left = ele.offsetLeft;
        this.right = parent.offsetWidth - ele.offsetLeft;
        this.top = ele.offsetTop;
      } else if (item.col == this.col) {
        this.left = ele.offsetLeft;
        this.right = parent.offsetWidth - (ele.offsetLeft + ele.offsetWidth);
      } else if (item.col < this.col) {
        this.left = ele.offsetLeft;
        this.top = ele.offsetTop;
      } else if (item.col > this.col) {
        this.right = parent.offsetWidth - (ele.offsetLeft + ele.offsetWidth);
      }
    },
    cellUp(item) {
      // 鼠标抬起 这三个是控制拖动时的动画效果
      if (item.col - this.col >= 24 * this.colspan) {
        this.height = 0;
        this.mode = 0;
        return this.$message.error("时段选择不得超过24小时");
      }
      if (item.col <= this.col) {
        this.selectTime([item.col, this.col], !this.check);
      } else if (item.col >= this.col) {
        this.selectTime([this.col, item.col], !this.check);
      }

      this.height = 0;
      this.mode = 0;
    },
    format(txt) {
      // 将选中数据转换格式
      if (!txt) {
        return [];
      }
      let timeRange = txt.split("、");
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
          const minCol = timeToCol(startTime, true, this.colspan);
          const maxCol = timeToCol(endTime, false, this.colspan);
          console.log(maxCol, this.timeData.length);
          if (maxCol >= this.timeData.length) throw new Error(`Out of range, please check prop: "value"`);
          for (let i = minCol; i <= maxCol; i++) {
            this.$set(this.timeData[i], "check", true);
          }
        });
      }
    },
    selectTime(col, check) {
      // 选中时间格
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
      this.cancelCustomPerioSelected();
      // 触发事件
      this.$emit("on-clear");
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
  width: auto;
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
  width: 100%;

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
  cursor: pointer;
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
<style lang="scss" scoped>
.button-wrapper {
  margin-bottom: 10px;
  /* display: flex;
  justify-content: space-around;
  flex-wrap: wrap; */
}
.el-button {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 5px;
  transition: 0.1s;
  font-weight: 500;
  padding: 10px;
  font-size: 14px;
  border-radius: 4px;
}
.el-button:hover {
  color: #409eff;
  border-color: #409eff;
}
</style>

const formatDate = (date, fmt, col, colspan) => {
  // 每一天的24:00不要显示成00:00
  if ((col + 1) % (24 * colspan) === 0) {
    return "24:00";
  }
  let ret;
  const opt = {
    "Y+": date.getFullYear().toString(), // 年
    "M+": (date.getMonth() + 1).toString(), // 月
    "d+": date.getDate().toString(), // 日
    "h+": date.getHours().toString(), // 时
    "m+": date.getMinutes().toString(), // 分
    "S+": date.getSeconds().toString(), // 秒
    "q+": Math.floor((date.getMonth() + 3) / 3) // 季
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0"));
    }
  }
  return fmt;
};

const createArr$1 = (len) => {
  return Array.from(Array(len)).map((ret, id) => id);
};

const formatWeektime = (col, step, colspan) => {
  const timestamp = 1542384000000; // '2018-11-17 00:00:00'
  const beginstamp = timestamp + col * step * 60000; // col * step * 60 * 1000
  const endstamp = beginstamp + step * 60000;

  const begin = formatDate(new Date(beginstamp), "hh:mm", col, colspan);
  const end = formatDate(new Date(endstamp), "hh:mm", col, colspan);
  return `${begin}~${end}`;
};

const createTimeData = (max, step, colspan) => {
  return createArr$1(max).map((t, col) => {
    return {
      value: formatWeektime(col, step, colspan),
      begin: formatWeektime(col, step, colspan).split("~")[0],
      end: formatWeektime(col, step, colspan).split("~")[1],
      col,
      check: false
    };
  });
};

function splicing(list, colspan) {
  let same, minCol, maxCol;
  let i = -1;
  const len = list.length;
  const arr = [];

  if (!len) return;
  while (++i < len) {
    const item = list[i];
    if (item.check) {
      if (item.check !== Boolean(same)) {
        minCol = item.col;
        let begin = item.begin,
          end = item.end;
        if (minCol >= 24 * colspan) {
          begin = `次日${begin}`;
          end = `次日${end}`;
        }
        arr.push(...["、", begin, "~", end]);
      } else if (arr.length) {
        maxCol = item.col;
        let end = item.end;
        arr.pop();
        if (maxCol >= 24 * colspan) {
          end = `次日${end}`;
        }
        arr.push(end);
      }
    }
    same = Boolean(item.check);
  }
  arr.shift();
  return arr.join("");
}
// 次日04:30 => col 第几格 00:00~02:00 => [0, 3] 01:30~03:00 => [2, 5]
function timeToCol(time = "", isStart = true, step, colspan) {
  let col = 0;
  if (time.includes("次日")) {
    time = time.replace("次日", "");
    col = 24 * colspan;
  }

  let tmp = isStart ? 0 : 1; // startTime和endTime 计算方式不同 endTime需要 减1

  let [hour, minute] = time.split(":").map((i) => Number(i));
  const totalMins = hour * 60 + minute;
  if (totalMins % step) {
    throw Error(`The time period must be a multiple of the step size`);
  }
  col += totalMins / step - tmp;

  return col;
}

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


const createArr = (len) => {
  return Array.from(Array(len)).map((_, i) => i);
};
const defaultCustomPeriodList = [
  {
    timePeriod: "00:00~24:00",
    label: "全天",
    key: "allDay",
    selected: false
  },
  {
    timePeriod: "06:00~10:30",
    label: "早餐",
    key: "breakfast",
    selected: false
  },
  {
    timePeriod: "10:30~13:30",
    label: "午高峰",
    key: "middayPeak",
    selected: false
  },
  {
    timePeriod: "13:30~17:00",
    label: "下午茶",
    key: "afternoonTea",
    selected: false
  },
  {
    timePeriod: "17:00~20:00",
    label: "晚高峰",
    key: "eveningRushHour",
    selected: false
  },
  {
    timePeriod: "20:00~24:00",
    label: "夜宵1",
    key: "lateNightSnack1",
    selected: false
  },
  {
    timePeriod: "00:00~6:00",
    label: "夜宵2",
    key: "lateNightSnack2",
    selected: false
  }
];
const createPeriodList = (customPeriodList, colspan, step) => {
  customPeriodList.forEach((item) => {
    const [startTime, endTime] = item.timePeriod.split("~");
    const minCol = timeToCol(startTime, true, step, colspan);
    const maxCol = timeToCol(endTime, false, step, colspan);
    item.range = [minCol, maxCol];
  });
  return customPeriodList;
};
var script = {
  name: "DragTimePicker",
  model: {
    prop: "value",
    event: "change"
  },
  props: {
    needPeriod: {
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
      validator: function (value) {
        if (value !== 24 && value !== 48) {
          throw Error(`the value of "range" only be 24 or 48`);
        }
        return true;
      },
      default() {
        return 24;
      }
    },
    step: {
      type: Number,
      default() {
        return 30;
      }
    },
    periodList: {
      type: Array,
      default() {
        return defaultCustomPeriodList;
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
      customPeriodList: [],
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
        this.$emit("change", result); // 抛出选中值给父组件读取
      }
      return selectValue;
    }
  },
  created() {
    this.createTimeData();
    this.customPeriodList = createPeriodList(this.periodList, this.colspan, this.step);
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
      this.timeData = createTimeData(this.range * this.colspan, this.step, this.colspan);
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
        this.$emit("on-error", "时段选择不得超过24小时");
        return;
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
          const minCol = timeToCol(startTime, true, this.step, this.colspan);
          const maxCol = timeToCol(endTime, false, this.step, this.colspan);
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

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function () {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", [
    _vm.needPeriod
      ? _c(
          "div",
          { staticClass: "button-wrapper" },
          _vm._l(_vm.customPeriodList, function (item, index) {
            return _c(
              "button",
              {
                key: item.key,
                staticClass: "el-button",
                attrs: { disabled: _vm.disabled, type: "button" },
                on: {
                  click: function ($event) {
                    return _vm.customTimePeriodChangeHandler($event, index)
                  },
                },
              },
              [
                _vm._v(
                  "\n      " +
                    _vm._s(item.timePeriod + "(" + item.label + ")") +
                    "\n    "
                ),
              ]
            )
          }),
          0
        )
      : _vm._e(),
    _vm._v(" "),
    _c("div", { class: ["c-time", _vm.flag] }, [
      _c("div", {
        class: { "c-schedue": true, "c-schedue-notransi": _vm.mode },
        style: _vm.styleValue,
      }),
      _vm._v(" "),
      _c(
        "table",
        {
          staticClass: "c-time-table",
          class: { "c-min-table": _vm.colspan < 2 },
        },
        [
          _c("thead", { staticClass: "c-time-head" }, [
            _c(
              "tr",
              _vm._l(_vm.thLabel, function (t, i) {
                return _c(
                  "th",
                  { key: i, attrs: { colspan: 12 * _vm.colspan } },
                  [_vm._v(_vm._s(t))]
                )
              }),
              0
            ),
            _vm._v(" "),
            _c(
              "tr",
              _vm._l(_vm.theadArr, function (t, n) {
                return _c("td", { key: n, attrs: { colspan: _vm.colspan } }, [
                  _vm._v(_vm._s(t)),
                ])
              }),
              0
            ),
          ]),
          _vm._v(" "),
          _c("tbody", { staticClass: "c-time-body" }, [
            _c(
              "tr",
              _vm._l(_vm.timeData, function (t, i) {
                return _c("td", {
                  key: i,
                  staticClass: "time-atom-item",
                  class: _vm.selectClasses(t),
                  attrs: { "data-time": "" + t.col },
                  on: {
                    mouseenter: function ($event) {
                      return _vm.cellEnter(t)
                    },
                    mousedown: function ($event) {
                      return _vm.cellDown(t)
                    },
                    mouseup: function ($event) {
                      return _vm.cellUp(t)
                    },
                  },
                })
              }),
              0
            ),
            _vm._v(" "),
            _c("tr", [
              _c(
                "td",
                {
                  staticClass: "c-time-preview",
                  attrs: { colspan: _vm.tdCount },
                },
                [
                  _c("div", { staticClass: "g-clearfix c-time-con" }, [
                    _c("span", { staticClass: "g-pull-left" }, [
                      _vm._v(
                        "\n                " +
                          _vm._s(
                            _vm.selectValue
                              ? "已选择时间段"
                              : "可拖动鼠标在灰色区域内选择时间段"
                          ) +
                          "\n              "
                      ),
                    ]),
                    _vm._v(" "),
                    _c(
                      "a",
                      {
                        staticClass: "g-pull-right",
                        on: { click: _vm.clearTime },
                      },
                      [_vm._v("清空选择")]
                    ),
                  ]),
                  _vm._v(" "),
                  _vm.selectValue
                    ? _c("div", { staticClass: "c-time-time" }, [
                        _c("div", [_vm._v(_vm._s(_vm.selectValue))]),
                      ])
                    : _vm._e(),
                ]
              ),
            ]),
            _vm._v(" "),
            _c("tr", [
              _c(
                "td",
                { staticClass: "c-time-note", attrs: { colspan: _vm.tdCount } },
                [
                  _c("div", [
                    _vm._v(
                      "注：1.第一个时段的开始时间到最后时段的结束时间持续时长不超过24小时；2.最多只能配置3段时间段"
                    ),
                  ]),
                ]
              ),
            ]),
          ]),
          _vm._v(" "),
          _vm.disabled ? _c("tbody", { staticClass: "c-disabled" }) : _vm._e(),
        ]
      ),
    ]),
  ])
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-01744a61_0", { source: ".c-time[data-v-01744a61] {\n  width: 100%;\n  min-width: 640px;\n  position: relative;\n  display: inline-block;\n  overflow-x: auto;\n}\n.c-schedue[data-v-01744a61] {\n  background: #99bbec;\n  position: absolute;\n  width: auto;\n  height: 0;\n  opacity: \"0.6\";\n  pointer-events: none;\n  z-index: 99;\n}\n.c-schedue-notransi[data-v-01744a61] {\n  transition: width 0.12s ease, height 0.12s ease, top 0.12s ease, left 0.12s ease;\n}\n.c-time-table[data-v-01744a61] {\n  border-collapse: collapse !important;\n  position: relative;\n  width: 100%;\n}\n.c-time-table th[data-v-01744a61] {\n  vertical-align: inherit;\n  font-weight: bold;\n}\n.c-time-table tr[data-v-01744a61] {\n  height: 30px;\n}\n.c-time-table tr[data-v-01744a61],\n.c-time-table td[data-v-01744a61],\n.c-time-table th[data-v-01744a61] {\n  user-select: none;\n  border: 1px solid #dee4f5;\n  text-align: center;\n  min-width: 12px;\n  line-height: 1.8em;\n  transition: background 0.2s ease;\n}\n.c-time-table .c-time-head[data-v-01744a61] {\n  font-size: 12px;\n}\n.c-time-table .c-time-head .time-td[data-v-01744a61] {\n  width: 70px;\n}\n.c-time-table .c-time-body[data-v-01744a61] {\n  font-size: 12px;\n}\n.c-time-table .c-time-body td.time-atom-item[data-v-01744a61] {\n  user-select: unset;\n  background-color: #f5f5f5 !important;\n}\n.c-time-table .c-time-body td.ui-selected[data-v-01744a61] {\n  background-color: #598fe6 !important;\n}\n.c-time-table .c-time-preview[data-v-01744a61] {\n  line-height: 2.4em;\n  padding: 0 10px;\n  font-size: 14px;\n}\n.c-time-table .c-time-preview .c-time-con[data-v-01744a61] {\n  line-height: 46px;\n  user-select: none;\n}\n.c-time-table .c-time-preview .c-time-time[data-v-01744a61] {\n  text-align: left;\n  line-height: 2.4em;\n}\n.c-time-table .c-time-preview .c-time-time p[data-v-01744a61] {\n  max-width: 625px;\n  line-height: 1.4em;\n  word-break: break-all;\n  margin-bottom: 8px;\n}\n.c-time-table .c-time-note div[data-v-01744a61] {\n  text-align: left;\n  padding: 0 10px;\n}\n.c-min-table tr[data-v-01744a61],\n.c-min-table td[data-v-01744a61],\n.c-min-table th[data-v-01744a61] {\n  min-width: 24px;\n}\n.g-clearfix[data-v-01744a61]:after, .g-clearfix[data-v-01744a61]:before {\n  clear: both;\n  content: \" \";\n  display: table;\n}\n.g-pull-left[data-v-01744a61] {\n  float: left;\n}\n.g-pull-right[data-v-01744a61] {\n  float: right;\n  cursor: pointer;\n}\n.g-tip-text[data-v-01744a61] {\n  color: #999;\n}\n.c-disabled[data-v-01744a61] {\n  width: 100%;\n  background: #eee;\n  height: 77px;\n  position: absolute;\n  top: 60px;\n  left: 0;\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n/*# sourceMappingURL=index.vue.map */", map: {"version":3,"sources":["/home/runner/work/drag-time-picker-vue2/drag-time-picker-vue2/src/index.vue","index.vue"],"names":[],"mappings":"AA+XA;EACA,WAAA;EACA,gBAAA;EACA,kBAAA;EACA,qBAAA;EACA,gBAAA;AC9XA;ADgYA;EACA,mBAAA;EACA,kBAAA;EACA,WAAA;EACA,SAAA;EACA,cAAA;EACA,oBAAA;EACA,WAAA;AC7XA;AD+XA;EACA,gFAAA;AC5XA;AD8XA;EACA,oCAAA;EACA,kBAAA;EACA,WAAA;AC3XA;AD6XA;EACA,uBAAA;EACA,iBAAA;AC3XA;AD6XA;EACA,YAAA;AC3XA;AD6XA;;;EAGA,iBAAA;EACA,yBAAA;EACA,kBAAA;EACA,eAAA;EACA,kBAAA;EACA,gCAAA;AC3XA;AD6XA;EACA,eAAA;AC3XA;AD4XA;EACA,WAAA;AC1XA;AD6XA;EACA,eAAA;AC3XA;AD6XA;EACA,kBAAA;EACA,oCAAA;AC3XA;AD6XA;EACA,oCAAA;AC3XA;AD+XA;EACA,kBAAA;EACA,eAAA;EACA,eAAA;AC7XA;AD8XA;EACA,iBAAA;EACA,iBAAA;AC5XA;AD8XA;EACA,gBAAA;EACA,kBAAA;AC5XA;AD6XA;EACA,gBAAA;EACA,kBAAA;EACA,qBAAA;EACA,kBAAA;AC3XA;ADgYA;EACA,gBAAA;EACA,eAAA;AC9XA;ADmYA;;;EAGA,eAAA;AChYA;ADoYA;EAEA,WAAA;EACA,YAAA;EACA,cAAA;AClYA;ADqYA;EACA,WAAA;AClYA;ADoYA;EACA,YAAA;EACA,eAAA;ACjYA;ADmYA;EACA,WAAA;AChYA;ADkYA;EACA,WAAA;EACA,gBAAA;EACA,YAAA;EACA,kBAAA;EACA,SAAA;EACA,OAAA;EACA,YAAA;EACA,mBAAA;AC/XA;;AAEA,oCAAoC","file":"index.vue","sourcesContent":["<template>\n  <div>\n    <!-- 时间段区域 支持 单选和多选 -->\n    <div v-if=\"needPeriod\" class=\"button-wrapper\">\n      <button\n        :key=\"item.key\"\n        v-for=\"(item, index) in customPeriodList\"\n        class=\"el-button\"\n        :disabled=\"disabled\"\n        @click=\"customTimePeriodChangeHandler($event, index)\"\n        type=\"button\"\n      >\n        {{ item.timePeriod + \"(\" + item.label + \")\" }}\n      </button>\n    </div>\n\n    <div :class=\"['c-time', flag]\">\n      <!-- 鼠标拖动时的蒙层 -->\n      <div :class=\"{ 'c-schedue': true, 'c-schedue-notransi': mode }\" :style=\"styleValue\"></div>\n      <table :class=\"{ 'c-min-table': colspan < 2 }\" class=\"c-time-table\">\n        <!-- 表格头 -->\n        <thead class=\"c-time-head\">\n          <!-- 表头——时间段 00:00 - 12:00 -->\n          <tr>\n            <th :key=\"i\" v-for=\"(t, i) in thLabel\" :colspan=\"12 * colspan\">{{ t }}</th>\n          </tr>\n          <!-- 表头——小时 -->\n          <tr>\n            <td :key=\"n\" v-for=\"(t, n) in theadArr\" :colspan=\"colspan\">{{ t }}</td>\n          </tr>\n        </thead>\n        <!-- 表格体 -->\n        <tbody class=\"c-time-body\">\n          <tr>\n            <td\n              :key=\"i\"\n              v-for=\"(t, i) in timeData\"\n              :data-time=\"`${t.col}`\"\n              :class=\"selectClasses(t)\"\n              @mouseenter=\"cellEnter(t)\"\n              @mousedown=\"cellDown(t)\"\n              @mouseup=\"cellUp(t)\"\n              class=\"time-atom-item\"\n            ></td>\n          </tr>\n          <tr>\n            <td :colspan=\"tdCount\" class=\"c-time-preview\">\n              <div class=\"g-clearfix c-time-con\">\n                <span class=\"g-pull-left\">\n                  {{ selectValue ? \"已选择时间段\" : \"可拖动鼠标在灰色区域内选择时间段\" }}\n                </span>\n                <a @click=\"clearTime\" class=\"g-pull-right\">清空选择</a>\n              </div>\n              <div v-if=\"selectValue\" class=\"c-time-time\">\n                <div>{{ selectValue }}</div>\n              </div>\n            </td>\n          </tr>\n          <tr>\n            <td :colspan=\"tdCount\" class=\"c-time-note\">\n              <div>注：1.第一个时段的开始时间到最后时段的结束时间持续时长不超过24小时；2.最多只能配置3段时间段</div>\n            </td>\n          </tr>\n        </tbody>\n        <tbody class=\"c-disabled\" v-if=\"disabled\"></tbody>\n      </table>\n    </div>\n  </div>\n</template>\n\n<script>\nimport { createTimeData, splicing, timeToCol } from \"./utils.js\";\n\nconst createArr = (len) => {\n  return Array.from(Array(len)).map((_, i) => i);\n};\nconst defaultCustomPeriodList = [\n  {\n    timePeriod: \"00:00~24:00\",\n    label: \"全天\",\n    key: \"allDay\",\n    selected: false\n  },\n  {\n    timePeriod: \"06:00~10:30\",\n    label: \"早餐\",\n    key: \"breakfast\",\n    selected: false\n  },\n  {\n    timePeriod: \"10:30~13:30\",\n    label: \"午高峰\",\n    key: \"middayPeak\",\n    selected: false\n  },\n  {\n    timePeriod: \"13:30~17:00\",\n    label: \"下午茶\",\n    key: \"afternoonTea\",\n    selected: false\n  },\n  {\n    timePeriod: \"17:00~20:00\",\n    label: \"晚高峰\",\n    key: \"eveningRushHour\",\n    selected: false\n  },\n  {\n    timePeriod: \"20:00~24:00\",\n    label: \"夜宵1\",\n    key: \"lateNightSnack1\",\n    selected: false\n  },\n  {\n    timePeriod: \"00:00~6:00\",\n    label: \"夜宵2\",\n    key: \"lateNightSnack2\",\n    selected: false\n  }\n];\nconst createPeriodList = (customPeriodList, colspan, step) => {\n  customPeriodList.forEach((item) => {\n    const [startTime, endTime] = item.timePeriod.split(\"~\");\n    const minCol = timeToCol(startTime, true, step, colspan);\n    const maxCol = timeToCol(endTime, false, step, colspan);\n    item.range = [minCol, maxCol];\n  });\n  return customPeriodList;\n};\nexport default {\n  name: \"DragTimePicker\",\n  model: {\n    prop: \"value\",\n    event: \"change\"\n  },\n  props: {\n    needPeriod: {\n      type: Boolean,\n      default() {\n        return false;\n      }\n    },\n    value: {\n      // v-model\n      type: Array,\n      required: true\n    },\n    range: {\n      // 代表展示多少个小时\n      validator: function (value) {\n        if (value !== 24 && value !== 48) {\n          throw Error(`the value of \"range\" only be 24 or 48`);\n        }\n        return true;\n      },\n      default() {\n        return 24;\n      }\n    },\n    step: {\n      type: Number,\n      default() {\n        return 30;\n      }\n    },\n    periodList: {\n      type: Array,\n      default() {\n        return defaultCustomPeriodList;\n      }\n    },\n    disabled: {\n      type: Boolean,\n      default: false\n    }\n  },\n  data() {\n    return {\n      height: 0,\n      left: 0,\n      right: 0,\n      top: 0,\n      mode: 0,\n      row: 0,\n      col: 0,\n      flag: `flag-${+new Date()}`,\n      customPeriodList: [],\n      timeData: [],\n      isIncoming: false // 当前值是否外部传入\n    };\n  },\n  computed: {\n    styleValue() {\n      return {\n        height: `${this.height}px`,\n        left: `${this.left}px`, // width:auto 利用left合和right拉伸蒙层\n        right: `${this.right}px`,\n        top: `${this.top}px`\n      };\n    },\n    selectClasses() {\n      return (n) => (n.check ? \"ui-selected\" : \"\");\n    },\n    theadArr() {\n      // 构建 0-23 的数组，超过24的数组例如48为 0-230-23\n      return this.range > 24 ? Array.from(Array(this.range / 24)).reduce((prev) => prev.concat(createArr(24)), []) : createArr(24);\n    },\n    thLabel() {\n      return Array.from(Array(this.range / 24)).reduce((prev) => prev.concat([\"00:00 ~ 12:00\", \"12:00 ~ 24:00\"]), []);\n    },\n    tdCount() {\n      return this.range * this.colspan;\n    },\n    colspan() {\n      // 一个小时多少格\n      if (60 % this.step !== 0) {\n        throw new Error(`\"step\" must be a divisor of 60`);\n      }\n      return 60 / this.step;\n    },\n    selectValue() {\n      // 展示选中时间段字符串\n      // timeData 改变 重新计算 selectValue 并将选中值抛出\n      const selectValue = splicing(this.timeData, this.colspan);\n      const result = this.format(selectValue);\n      if (this.isIncoming) {\n        this.isIncoming = false;\n      } else {\n        this.$emit(\"change\", result); // 抛出选中值给父组件读取\n      }\n      return selectValue;\n    }\n  },\n  created() {\n    this.createTimeData();\n    this.customPeriodList = createPeriodList(this.periodList, this.colspan, this.step);\n    this.isIncoming = true;\n    this.valueToSelectValue();\n  },\n  destroyed() {\n    this.clearTime();\n  },\n  watch: {\n    range() {\n      // range变化重新计算格子\n      this.createTimeData();\n      this.cancelCustomPerioSelected();\n    },\n    value() {\n      this.isIncoming = true;\n      // 回填 将传入的值转换为timeData check属性\n      this.valueToSelectValue();\n    },\n    colspan() {\n      // colspan变化重新计算格子\n      this.createTimeData();\n    }\n  },\n  methods: {\n    createTimeData() {\n      this.timeData = createTimeData(this.range * this.colspan, this.step, this.colspan);\n    },\n    cancelCustomPerioSelected() {\n      // 取消 时间段区域 按钮 的选中状态\n      this.customPeriodList = this.customPeriodList.map((item) => {\n        item.selected = false;\n        return item;\n      });\n    },\n    customTimePeriodChangeHandler(_, index) {\n      // 时间段区域 按钮 点击回调\n      const { range, selected } = this.customPeriodList[index];\n      // 按钮选中状态取反\n      this.customPeriodList[index].selected = !selected;\n      // 选中时间格\n      this.selectTime(range, !selected);\n      // 触发事件，向自组件抛出数据\n      this.$emit(\"custom-time-period-change\", this.customPeriodList[index]);\n    },\n    cellDown(item) {\n      // 鼠标落下\n      const ele = document.querySelector(`.${this.flag} td[data-time='${item.col}']`);\n      const parent = document.querySelector(`.${this.flag}`);\n      this.check = Boolean(item.check);\n      this.mode = 1;\n      if (ele) {\n        this.left = ele.offsetLeft;\n        this.right = parent.offsetWidth - (ele.offsetLeft + ele.offsetWidth);\n        this.height = ele.offsetHeight;\n      }\n\n      this.col = item.col;\n    },\n    cellEnter(item) {\n      // 鼠标进入\n      const ele = document.querySelector(`.${this.flag} td[data-time='${item.col}']`);\n      const parent = document.querySelector(`.${this.flag}`);\n      if (item.col - this.col >= 24 * this.colspan) {\n        return;\n      }\n      if (ele && !this.mode) {\n        this.left = ele.offsetLeft;\n        this.right = parent.offsetWidth - ele.offsetLeft;\n        this.top = ele.offsetTop;\n      } else if (item.col == this.col) {\n        this.left = ele.offsetLeft;\n        this.right = parent.offsetWidth - (ele.offsetLeft + ele.offsetWidth);\n      } else if (item.col < this.col) {\n        this.left = ele.offsetLeft;\n        this.top = ele.offsetTop;\n      } else if (item.col > this.col) {\n        this.right = parent.offsetWidth - (ele.offsetLeft + ele.offsetWidth);\n      }\n    },\n    cellUp(item) {\n      // 鼠标抬起 这三个是控制拖动时的动画效果\n      if (item.col - this.col >= 24 * this.colspan) {\n        this.height = 0;\n        this.mode = 0;\n        this.$emit(\"on-error\", \"时段选择不得超过24小时\");\n        return;\n      }\n      if (item.col <= this.col) {\n        this.selectTime([item.col, this.col], !this.check);\n      } else if (item.col >= this.col) {\n        this.selectTime([this.col, item.col], !this.check);\n      }\n\n      this.height = 0;\n      this.mode = 0;\n    },\n    format(txt) {\n      // 将选中数据转换格式\n      if (!txt) {\n        return [];\n      }\n      let timeRange = txt.split(\"、\");\n      let result = timeRange.map((item) => {\n        let arr = item.split(\"~\");\n        return {\n          startTime: arr[0],\n          endTime: arr[1]\n        };\n      });\n      return result;\n    },\n    valueToSelectValue() {\n      // 回填 将传入的值转换为timeData check属性\n      if (this.value instanceof Array) {\n        this.value.forEach(({ startTime, endTime }) => {\n          const minCol = timeToCol(startTime, true, this.step, this.colspan);\n          const maxCol = timeToCol(endTime, false, this.step, this.colspan);\n          if (maxCol >= this.timeData.length) throw new Error(`Out of range, please check prop: \"value\"`);\n          for (let i = minCol; i <= maxCol; i++) {\n            this.$set(this.timeData[i], \"check\", true);\n          }\n        });\n      }\n    },\n    selectTime(col, check) {\n      // 选中时间格\n      const [minCol, maxCol] = col;\n      // 一切变化 源于对 timeData check属性的修改\n      // timeData需要被主动修改 所以并不能是 计算属性\n      this.timeData.forEach((t) => {\n        if (t.col >= minCol && t.col <= maxCol) {\n          this.$set(t, \"check\", check);\n        }\n      });\n    },\n    clearTime() {\n      this.timeData.forEach((t) => {\n        this.$set(t, \"check\", false);\n      });\n      this.cancelCustomPerioSelected();\n      // 触发事件\n      this.$emit(\"on-clear\");\n    }\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n.c-time {\n  width: 100%;\n  min-width: 640px;\n  position: relative;\n  display: inline-block;\n  overflow-x: auto;\n}\n.c-schedue {\n  background: #99bbec;\n  position: absolute;\n  width: auto;\n  height: 0;\n  opacity: \"0.6\";\n  pointer-events: none;\n  z-index: 99;\n}\n.c-schedue-notransi {\n  transition: width 0.12s ease, height 0.12s ease, top 0.12s ease, left 0.12s ease;\n}\n.c-time-table {\n  border-collapse: collapse !important;\n  position: relative;\n  width: 100%;\n\n  th {\n    vertical-align: inherit;\n    font-weight: bold;\n  }\n  tr {\n    height: 30px;\n  }\n  tr,\n  td,\n  th {\n    user-select: none;\n    border: 1px solid #dee4f5;\n    text-align: center;\n    min-width: 12px;\n    line-height: 1.8em;\n    transition: background 0.2s ease;\n  }\n  .c-time-head {\n    font-size: 12px;\n    .time-td {\n      width: 70px;\n    }\n  }\n  .c-time-body {\n    font-size: 12px;\n    td {\n      &.time-atom-item {\n        user-select: unset;\n        background-color: #f5f5f5 !important;\n      }\n      &.ui-selected {\n        background-color: #598fe6 !important;\n      }\n    }\n  }\n  .c-time-preview {\n    line-height: 2.4em;\n    padding: 0 10px;\n    font-size: 14px;\n    .c-time-con {\n      line-height: 46px;\n      user-select: none;\n    }\n    .c-time-time {\n      text-align: left;\n      line-height: 2.4em;\n      p {\n        max-width: 625px;\n        line-height: 1.4em;\n        word-break: break-all;\n        margin-bottom: 8px;\n      }\n    }\n  }\n  .c-time-note {\n    div {\n      text-align: left;\n      padding: 0 10px;\n    }\n  }\n}\n.c-min-table {\n  tr,\n  td,\n  th {\n    min-width: 24px;\n  }\n}\n.g-clearfix {\n  &:after,\n  &:before {\n    clear: both;\n    content: \" \";\n    display: table;\n  }\n}\n.g-pull-left {\n  float: left;\n}\n.g-pull-right {\n  float: right;\n  cursor: pointer;\n}\n.g-tip-text {\n  color: #999;\n}\n.c-disabled {\n  width: 100%;\n  background: #eee;\n  height: 77px;\n  position: absolute;\n  top: 60px;\n  left: 0;\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n</style>\n<style lang=\"scss\" scoped>\n.button-wrapper {\n  margin-bottom: 10px;\n  /* display: flex;\n  justify-content: space-around;\n  flex-wrap: wrap; */\n}\n.el-button {\n  display: inline-block;\n  line-height: 1;\n  white-space: nowrap;\n  cursor: pointer;\n  background: #fff;\n  border: 1px solid #dcdfe6;\n  color: #606266;\n  text-align: center;\n  box-sizing: border-box;\n  outline: none;\n  margin: 5px;\n  transition: 0.1s;\n  font-weight: 500;\n  padding: 10px;\n  font-size: 14px;\n  border-radius: 4px;\n}\n.el-button:hover {\n  color: #409eff;\n  border-color: #409eff;\n}\n</style>\n",".c-time {\n  width: 100%;\n  min-width: 640px;\n  position: relative;\n  display: inline-block;\n  overflow-x: auto;\n}\n\n.c-schedue {\n  background: #99bbec;\n  position: absolute;\n  width: auto;\n  height: 0;\n  opacity: \"0.6\";\n  pointer-events: none;\n  z-index: 99;\n}\n\n.c-schedue-notransi {\n  transition: width 0.12s ease, height 0.12s ease, top 0.12s ease, left 0.12s ease;\n}\n\n.c-time-table {\n  border-collapse: collapse !important;\n  position: relative;\n  width: 100%;\n}\n.c-time-table th {\n  vertical-align: inherit;\n  font-weight: bold;\n}\n.c-time-table tr {\n  height: 30px;\n}\n.c-time-table tr,\n.c-time-table td,\n.c-time-table th {\n  user-select: none;\n  border: 1px solid #dee4f5;\n  text-align: center;\n  min-width: 12px;\n  line-height: 1.8em;\n  transition: background 0.2s ease;\n}\n.c-time-table .c-time-head {\n  font-size: 12px;\n}\n.c-time-table .c-time-head .time-td {\n  width: 70px;\n}\n.c-time-table .c-time-body {\n  font-size: 12px;\n}\n.c-time-table .c-time-body td.time-atom-item {\n  user-select: unset;\n  background-color: #f5f5f5 !important;\n}\n.c-time-table .c-time-body td.ui-selected {\n  background-color: #598fe6 !important;\n}\n.c-time-table .c-time-preview {\n  line-height: 2.4em;\n  padding: 0 10px;\n  font-size: 14px;\n}\n.c-time-table .c-time-preview .c-time-con {\n  line-height: 46px;\n  user-select: none;\n}\n.c-time-table .c-time-preview .c-time-time {\n  text-align: left;\n  line-height: 2.4em;\n}\n.c-time-table .c-time-preview .c-time-time p {\n  max-width: 625px;\n  line-height: 1.4em;\n  word-break: break-all;\n  margin-bottom: 8px;\n}\n.c-time-table .c-time-note div {\n  text-align: left;\n  padding: 0 10px;\n}\n\n.c-min-table tr,\n.c-min-table td,\n.c-min-table th {\n  min-width: 24px;\n}\n\n.g-clearfix:after, .g-clearfix:before {\n  clear: both;\n  content: \" \";\n  display: table;\n}\n\n.g-pull-left {\n  float: left;\n}\n\n.g-pull-right {\n  float: right;\n  cursor: pointer;\n}\n\n.g-tip-text {\n  color: #999;\n}\n\n.c-disabled {\n  width: 100%;\n  background: #eee;\n  height: 77px;\n  position: absolute;\n  top: 60px;\n  left: 0;\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n/*# sourceMappingURL=index.vue.map */"]}, media: undefined })
,inject("data-v-01744a61_1", { source: ".button-wrapper[data-v-01744a61] {\n  margin-bottom: 10px;\n  /* display: flex;\n  justify-content: space-around;\n  flex-wrap: wrap; */\n}\n.el-button[data-v-01744a61] {\n  display: inline-block;\n  line-height: 1;\n  white-space: nowrap;\n  cursor: pointer;\n  background: #fff;\n  border: 1px solid #dcdfe6;\n  color: #606266;\n  text-align: center;\n  box-sizing: border-box;\n  outline: none;\n  margin: 5px;\n  transition: 0.1s;\n  font-weight: 500;\n  padding: 10px;\n  font-size: 14px;\n  border-radius: 4px;\n}\n.el-button[data-v-01744a61]:hover {\n  color: #409eff;\n  border-color: #409eff;\n}\n\n/*# sourceMappingURL=index.vue.map */", map: {"version":3,"sources":["/home/runner/work/drag-time-picker-vue2/drag-time-picker-vue2/src/index.vue","index.vue"],"names":[],"mappings":"AAyfA;EACA,mBAAA;EACA;;oBAAA;ACtfA;AD0fA;EACA,qBAAA;EACA,cAAA;EACA,mBAAA;EACA,eAAA;EACA,gBAAA;EACA,yBAAA;EACA,cAAA;EACA,kBAAA;EACA,sBAAA;EACA,aAAA;EACA,WAAA;EACA,gBAAA;EACA,gBAAA;EACA,aAAA;EACA,eAAA;EACA,kBAAA;ACvfA;ADyfA;EACA,cAAA;EACA,qBAAA;ACtfA;;AAEA,oCAAoC","file":"index.vue","sourcesContent":["<template>\n  <div>\n    <!-- 时间段区域 支持 单选和多选 -->\n    <div v-if=\"needPeriod\" class=\"button-wrapper\">\n      <button\n        :key=\"item.key\"\n        v-for=\"(item, index) in customPeriodList\"\n        class=\"el-button\"\n        :disabled=\"disabled\"\n        @click=\"customTimePeriodChangeHandler($event, index)\"\n        type=\"button\"\n      >\n        {{ item.timePeriod + \"(\" + item.label + \")\" }}\n      </button>\n    </div>\n\n    <div :class=\"['c-time', flag]\">\n      <!-- 鼠标拖动时的蒙层 -->\n      <div :class=\"{ 'c-schedue': true, 'c-schedue-notransi': mode }\" :style=\"styleValue\"></div>\n      <table :class=\"{ 'c-min-table': colspan < 2 }\" class=\"c-time-table\">\n        <!-- 表格头 -->\n        <thead class=\"c-time-head\">\n          <!-- 表头——时间段 00:00 - 12:00 -->\n          <tr>\n            <th :key=\"i\" v-for=\"(t, i) in thLabel\" :colspan=\"12 * colspan\">{{ t }}</th>\n          </tr>\n          <!-- 表头——小时 -->\n          <tr>\n            <td :key=\"n\" v-for=\"(t, n) in theadArr\" :colspan=\"colspan\">{{ t }}</td>\n          </tr>\n        </thead>\n        <!-- 表格体 -->\n        <tbody class=\"c-time-body\">\n          <tr>\n            <td\n              :key=\"i\"\n              v-for=\"(t, i) in timeData\"\n              :data-time=\"`${t.col}`\"\n              :class=\"selectClasses(t)\"\n              @mouseenter=\"cellEnter(t)\"\n              @mousedown=\"cellDown(t)\"\n              @mouseup=\"cellUp(t)\"\n              class=\"time-atom-item\"\n            ></td>\n          </tr>\n          <tr>\n            <td :colspan=\"tdCount\" class=\"c-time-preview\">\n              <div class=\"g-clearfix c-time-con\">\n                <span class=\"g-pull-left\">\n                  {{ selectValue ? \"已选择时间段\" : \"可拖动鼠标在灰色区域内选择时间段\" }}\n                </span>\n                <a @click=\"clearTime\" class=\"g-pull-right\">清空选择</a>\n              </div>\n              <div v-if=\"selectValue\" class=\"c-time-time\">\n                <div>{{ selectValue }}</div>\n              </div>\n            </td>\n          </tr>\n          <tr>\n            <td :colspan=\"tdCount\" class=\"c-time-note\">\n              <div>注：1.第一个时段的开始时间到最后时段的结束时间持续时长不超过24小时；2.最多只能配置3段时间段</div>\n            </td>\n          </tr>\n        </tbody>\n        <tbody class=\"c-disabled\" v-if=\"disabled\"></tbody>\n      </table>\n    </div>\n  </div>\n</template>\n\n<script>\nimport { createTimeData, splicing, timeToCol } from \"./utils.js\";\n\nconst createArr = (len) => {\n  return Array.from(Array(len)).map((_, i) => i);\n};\nconst defaultCustomPeriodList = [\n  {\n    timePeriod: \"00:00~24:00\",\n    label: \"全天\",\n    key: \"allDay\",\n    selected: false\n  },\n  {\n    timePeriod: \"06:00~10:30\",\n    label: \"早餐\",\n    key: \"breakfast\",\n    selected: false\n  },\n  {\n    timePeriod: \"10:30~13:30\",\n    label: \"午高峰\",\n    key: \"middayPeak\",\n    selected: false\n  },\n  {\n    timePeriod: \"13:30~17:00\",\n    label: \"下午茶\",\n    key: \"afternoonTea\",\n    selected: false\n  },\n  {\n    timePeriod: \"17:00~20:00\",\n    label: \"晚高峰\",\n    key: \"eveningRushHour\",\n    selected: false\n  },\n  {\n    timePeriod: \"20:00~24:00\",\n    label: \"夜宵1\",\n    key: \"lateNightSnack1\",\n    selected: false\n  },\n  {\n    timePeriod: \"00:00~6:00\",\n    label: \"夜宵2\",\n    key: \"lateNightSnack2\",\n    selected: false\n  }\n];\nconst createPeriodList = (customPeriodList, colspan, step) => {\n  customPeriodList.forEach((item) => {\n    const [startTime, endTime] = item.timePeriod.split(\"~\");\n    const minCol = timeToCol(startTime, true, step, colspan);\n    const maxCol = timeToCol(endTime, false, step, colspan);\n    item.range = [minCol, maxCol];\n  });\n  return customPeriodList;\n};\nexport default {\n  name: \"DragTimePicker\",\n  model: {\n    prop: \"value\",\n    event: \"change\"\n  },\n  props: {\n    needPeriod: {\n      type: Boolean,\n      default() {\n        return false;\n      }\n    },\n    value: {\n      // v-model\n      type: Array,\n      required: true\n    },\n    range: {\n      // 代表展示多少个小时\n      validator: function (value) {\n        if (value !== 24 && value !== 48) {\n          throw Error(`the value of \"range\" only be 24 or 48`);\n        }\n        return true;\n      },\n      default() {\n        return 24;\n      }\n    },\n    step: {\n      type: Number,\n      default() {\n        return 30;\n      }\n    },\n    periodList: {\n      type: Array,\n      default() {\n        return defaultCustomPeriodList;\n      }\n    },\n    disabled: {\n      type: Boolean,\n      default: false\n    }\n  },\n  data() {\n    return {\n      height: 0,\n      left: 0,\n      right: 0,\n      top: 0,\n      mode: 0,\n      row: 0,\n      col: 0,\n      flag: `flag-${+new Date()}`,\n      customPeriodList: [],\n      timeData: [],\n      isIncoming: false // 当前值是否外部传入\n    };\n  },\n  computed: {\n    styleValue() {\n      return {\n        height: `${this.height}px`,\n        left: `${this.left}px`, // width:auto 利用left合和right拉伸蒙层\n        right: `${this.right}px`,\n        top: `${this.top}px`\n      };\n    },\n    selectClasses() {\n      return (n) => (n.check ? \"ui-selected\" : \"\");\n    },\n    theadArr() {\n      // 构建 0-23 的数组，超过24的数组例如48为 0-230-23\n      return this.range > 24 ? Array.from(Array(this.range / 24)).reduce((prev) => prev.concat(createArr(24)), []) : createArr(24);\n    },\n    thLabel() {\n      return Array.from(Array(this.range / 24)).reduce((prev) => prev.concat([\"00:00 ~ 12:00\", \"12:00 ~ 24:00\"]), []);\n    },\n    tdCount() {\n      return this.range * this.colspan;\n    },\n    colspan() {\n      // 一个小时多少格\n      if (60 % this.step !== 0) {\n        throw new Error(`\"step\" must be a divisor of 60`);\n      }\n      return 60 / this.step;\n    },\n    selectValue() {\n      // 展示选中时间段字符串\n      // timeData 改变 重新计算 selectValue 并将选中值抛出\n      const selectValue = splicing(this.timeData, this.colspan);\n      const result = this.format(selectValue);\n      if (this.isIncoming) {\n        this.isIncoming = false;\n      } else {\n        this.$emit(\"change\", result); // 抛出选中值给父组件读取\n      }\n      return selectValue;\n    }\n  },\n  created() {\n    this.createTimeData();\n    this.customPeriodList = createPeriodList(this.periodList, this.colspan, this.step);\n    this.isIncoming = true;\n    this.valueToSelectValue();\n  },\n  destroyed() {\n    this.clearTime();\n  },\n  watch: {\n    range() {\n      // range变化重新计算格子\n      this.createTimeData();\n      this.cancelCustomPerioSelected();\n    },\n    value() {\n      this.isIncoming = true;\n      // 回填 将传入的值转换为timeData check属性\n      this.valueToSelectValue();\n    },\n    colspan() {\n      // colspan变化重新计算格子\n      this.createTimeData();\n    }\n  },\n  methods: {\n    createTimeData() {\n      this.timeData = createTimeData(this.range * this.colspan, this.step, this.colspan);\n    },\n    cancelCustomPerioSelected() {\n      // 取消 时间段区域 按钮 的选中状态\n      this.customPeriodList = this.customPeriodList.map((item) => {\n        item.selected = false;\n        return item;\n      });\n    },\n    customTimePeriodChangeHandler(_, index) {\n      // 时间段区域 按钮 点击回调\n      const { range, selected } = this.customPeriodList[index];\n      // 按钮选中状态取反\n      this.customPeriodList[index].selected = !selected;\n      // 选中时间格\n      this.selectTime(range, !selected);\n      // 触发事件，向自组件抛出数据\n      this.$emit(\"custom-time-period-change\", this.customPeriodList[index]);\n    },\n    cellDown(item) {\n      // 鼠标落下\n      const ele = document.querySelector(`.${this.flag} td[data-time='${item.col}']`);\n      const parent = document.querySelector(`.${this.flag}`);\n      this.check = Boolean(item.check);\n      this.mode = 1;\n      if (ele) {\n        this.left = ele.offsetLeft;\n        this.right = parent.offsetWidth - (ele.offsetLeft + ele.offsetWidth);\n        this.height = ele.offsetHeight;\n      }\n\n      this.col = item.col;\n    },\n    cellEnter(item) {\n      // 鼠标进入\n      const ele = document.querySelector(`.${this.flag} td[data-time='${item.col}']`);\n      const parent = document.querySelector(`.${this.flag}`);\n      if (item.col - this.col >= 24 * this.colspan) {\n        return;\n      }\n      if (ele && !this.mode) {\n        this.left = ele.offsetLeft;\n        this.right = parent.offsetWidth - ele.offsetLeft;\n        this.top = ele.offsetTop;\n      } else if (item.col == this.col) {\n        this.left = ele.offsetLeft;\n        this.right = parent.offsetWidth - (ele.offsetLeft + ele.offsetWidth);\n      } else if (item.col < this.col) {\n        this.left = ele.offsetLeft;\n        this.top = ele.offsetTop;\n      } else if (item.col > this.col) {\n        this.right = parent.offsetWidth - (ele.offsetLeft + ele.offsetWidth);\n      }\n    },\n    cellUp(item) {\n      // 鼠标抬起 这三个是控制拖动时的动画效果\n      if (item.col - this.col >= 24 * this.colspan) {\n        this.height = 0;\n        this.mode = 0;\n        this.$emit(\"on-error\", \"时段选择不得超过24小时\");\n        return;\n      }\n      if (item.col <= this.col) {\n        this.selectTime([item.col, this.col], !this.check);\n      } else if (item.col >= this.col) {\n        this.selectTime([this.col, item.col], !this.check);\n      }\n\n      this.height = 0;\n      this.mode = 0;\n    },\n    format(txt) {\n      // 将选中数据转换格式\n      if (!txt) {\n        return [];\n      }\n      let timeRange = txt.split(\"、\");\n      let result = timeRange.map((item) => {\n        let arr = item.split(\"~\");\n        return {\n          startTime: arr[0],\n          endTime: arr[1]\n        };\n      });\n      return result;\n    },\n    valueToSelectValue() {\n      // 回填 将传入的值转换为timeData check属性\n      if (this.value instanceof Array) {\n        this.value.forEach(({ startTime, endTime }) => {\n          const minCol = timeToCol(startTime, true, this.step, this.colspan);\n          const maxCol = timeToCol(endTime, false, this.step, this.colspan);\n          if (maxCol >= this.timeData.length) throw new Error(`Out of range, please check prop: \"value\"`);\n          for (let i = minCol; i <= maxCol; i++) {\n            this.$set(this.timeData[i], \"check\", true);\n          }\n        });\n      }\n    },\n    selectTime(col, check) {\n      // 选中时间格\n      const [minCol, maxCol] = col;\n      // 一切变化 源于对 timeData check属性的修改\n      // timeData需要被主动修改 所以并不能是 计算属性\n      this.timeData.forEach((t) => {\n        if (t.col >= minCol && t.col <= maxCol) {\n          this.$set(t, \"check\", check);\n        }\n      });\n    },\n    clearTime() {\n      this.timeData.forEach((t) => {\n        this.$set(t, \"check\", false);\n      });\n      this.cancelCustomPerioSelected();\n      // 触发事件\n      this.$emit(\"on-clear\");\n    }\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n.c-time {\n  width: 100%;\n  min-width: 640px;\n  position: relative;\n  display: inline-block;\n  overflow-x: auto;\n}\n.c-schedue {\n  background: #99bbec;\n  position: absolute;\n  width: auto;\n  height: 0;\n  opacity: \"0.6\";\n  pointer-events: none;\n  z-index: 99;\n}\n.c-schedue-notransi {\n  transition: width 0.12s ease, height 0.12s ease, top 0.12s ease, left 0.12s ease;\n}\n.c-time-table {\n  border-collapse: collapse !important;\n  position: relative;\n  width: 100%;\n\n  th {\n    vertical-align: inherit;\n    font-weight: bold;\n  }\n  tr {\n    height: 30px;\n  }\n  tr,\n  td,\n  th {\n    user-select: none;\n    border: 1px solid #dee4f5;\n    text-align: center;\n    min-width: 12px;\n    line-height: 1.8em;\n    transition: background 0.2s ease;\n  }\n  .c-time-head {\n    font-size: 12px;\n    .time-td {\n      width: 70px;\n    }\n  }\n  .c-time-body {\n    font-size: 12px;\n    td {\n      &.time-atom-item {\n        user-select: unset;\n        background-color: #f5f5f5 !important;\n      }\n      &.ui-selected {\n        background-color: #598fe6 !important;\n      }\n    }\n  }\n  .c-time-preview {\n    line-height: 2.4em;\n    padding: 0 10px;\n    font-size: 14px;\n    .c-time-con {\n      line-height: 46px;\n      user-select: none;\n    }\n    .c-time-time {\n      text-align: left;\n      line-height: 2.4em;\n      p {\n        max-width: 625px;\n        line-height: 1.4em;\n        word-break: break-all;\n        margin-bottom: 8px;\n      }\n    }\n  }\n  .c-time-note {\n    div {\n      text-align: left;\n      padding: 0 10px;\n    }\n  }\n}\n.c-min-table {\n  tr,\n  td,\n  th {\n    min-width: 24px;\n  }\n}\n.g-clearfix {\n  &:after,\n  &:before {\n    clear: both;\n    content: \" \";\n    display: table;\n  }\n}\n.g-pull-left {\n  float: left;\n}\n.g-pull-right {\n  float: right;\n  cursor: pointer;\n}\n.g-tip-text {\n  color: #999;\n}\n.c-disabled {\n  width: 100%;\n  background: #eee;\n  height: 77px;\n  position: absolute;\n  top: 60px;\n  left: 0;\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n</style>\n<style lang=\"scss\" scoped>\n.button-wrapper {\n  margin-bottom: 10px;\n  /* display: flex;\n  justify-content: space-around;\n  flex-wrap: wrap; */\n}\n.el-button {\n  display: inline-block;\n  line-height: 1;\n  white-space: nowrap;\n  cursor: pointer;\n  background: #fff;\n  border: 1px solid #dcdfe6;\n  color: #606266;\n  text-align: center;\n  box-sizing: border-box;\n  outline: none;\n  margin: 5px;\n  transition: 0.1s;\n  font-weight: 500;\n  padding: 10px;\n  font-size: 14px;\n  border-radius: 4px;\n}\n.el-button:hover {\n  color: #409eff;\n  border-color: #409eff;\n}\n</style>\n",".button-wrapper {\n  margin-bottom: 10px;\n  /* display: flex;\n  justify-content: space-around;\n  flex-wrap: wrap; */\n}\n\n.el-button {\n  display: inline-block;\n  line-height: 1;\n  white-space: nowrap;\n  cursor: pointer;\n  background: #fff;\n  border: 1px solid #dcdfe6;\n  color: #606266;\n  text-align: center;\n  box-sizing: border-box;\n  outline: none;\n  margin: 5px;\n  transition: 0.1s;\n  font-weight: 500;\n  padding: 10px;\n  font-size: 14px;\n  border-radius: 4px;\n}\n\n.el-button:hover {\n  color: #409eff;\n  border-color: #409eff;\n}\n\n/*# sourceMappingURL=index.vue.map */"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = "data-v-01744a61";
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
  );

__vue_component__.install = (Vue) => {
  Vue.component(__vue_component__.name, __vue_component__);
};
console.log("change");

export { __vue_component__ as default };

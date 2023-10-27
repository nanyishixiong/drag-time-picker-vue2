const formatDate = (date, fmt, col, type) => {
  if (type === "end" && (col === 47 || col === 95)) {
    return "24:00";
  }
  const o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (const k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return fmt;
};

const createArr = (len) => {
  return Array.from(Array(len)).map((ret, id) => id);
};

const formatWeektime = (col, step) => {
  const timestamp = 1542384000000; // '2018-11-17 00:00:00'
  const beginstamp = timestamp + col * step * 60000; // col * step * 60 * 1000
  const endstamp = beginstamp + step * 60000;

  const begin = formatDate(new Date(beginstamp), "hh:mm", col);
  const end = formatDate(new Date(endstamp), "hh:mm", col, "end");
  return `${begin}~${end}`;
};

const createTimeData = (max, step) => {
  return createArr(max).map((t, col) => {
    return {
      value: formatWeektime(col, step),
      begin: formatWeektime(col, step).split("~")[0],
      end: formatWeektime(col, step).split("~")[1],
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
// 次日04:30 => col 第几格
function timeToCol(time = "", isStart = true, colspan) {
  let col = 0;
  if (time.includes("次日")) {
    time = time.replace("次日", "");
    col = 24 * colspan;
  }

  let tmp = isStart ? 1 : 0; // startTime和endTime 计算方式不同

  let [hour, minute] = time.split(":");
  if (minute === "30") {
    // 4 * 2 = 8格 后面有30分钟 总共9格，索引为8
    col += hour * colspan + tmp;
  } else {
    col += hour * colspan - 1 + tmp;
  }

  return col;
}

export { splicing, createTimeData, timeToCol };

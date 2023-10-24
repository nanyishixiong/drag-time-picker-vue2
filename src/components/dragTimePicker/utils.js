const formatDate = (date, fmt, col, type) => {
  if(type === 'end' && (col === 47 || col === 95)) {
    return '24:00'
  }
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return fmt
}

const createArr = (len) => {
  return Array.from(Array(len)).map((ret, id) => id)
}

const formatWeektime = (col) => {
  const timestamp = 1542384000000 // '2018-11-17 00:00:00'
  const beginstamp = timestamp + col * 1800000 // col * 30 * 60 * 1000
  const endstamp = beginstamp + 1800000

  const begin = formatDate(new Date(beginstamp), 'hh:mm', col)
  const end = formatDate(new Date(endstamp), 'hh:mm', col, 'end')
  return `${begin}~${end}`
}

const createTimeData = (max) => {
  return createArr(max).map((t, col) => {
    return {
      value: formatWeektime(col),
      begin: formatWeektime(col).split('~')[0],
      end: formatWeektime(col).split('~')[1],
      col,
      check: false
     }
  })
}

export default createTimeData(96)

function splicing(list) {
  let same, minCol, maxCol
  let i = -1
  const len = list.length
  const arr = []

  if (!len) return
  while (++i < len) {
    const item = list[i]
    if (item.check) {
      if (item.check !== Boolean(same)) {
        minCol = item.col
        arr.push(...['、', item.begin, '~', item.end])
      } else if (arr.length) {
        maxCol = item.col
        let end = item.end
        arr.pop()
        if(maxCol > 47 && minCol <=47){
          end = `次日${end}`
        }
        arr.push(end)
      }
    }
    same = Boolean(item.check)
  }
  arr.shift()
  return arr.join('')
}

export {
  splicing,
  createTimeData
}
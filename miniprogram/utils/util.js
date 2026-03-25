/**
 * 工具函数库
 */

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @param {string} format - 格式字符串 'YYYY-MM-DD HH:mm:ss'
 */
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 获取两个日期之间的天数差
 */
const getDaysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
};

/**
 * 判断是否是今天
 */
const isToday = (date) => {
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
};

/**
 * 获取本周的第一天（周日）
 */
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
};

/**
 * 获取本月的第一天
 */
const getMonthStart = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * 获取本月的最后一天
 */
const getMonthEnd = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * 防抖函数
 */
const debounce = (fn, delay = 500) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

/**
 * 节流函数
 */
const throttle = (fn, delay = 500) => {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
};

/**
 * 显示加载提示
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({ title, mask: true });
};

/**
 * 隐藏加载提示
 */
const hideLoading = () => {
  wx.hideLoading();
};

/**
 * 显示成功提示
 */
const showSuccess = (title) => {
  wx.showToast({ title, icon: 'success' });
};

/**
 * 显示错误提示
 */
const showError = (title) => {
  wx.showToast({ title, icon: 'none' });
};

/**
 * 生成唯一ID
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

module.exports = {
  formatDate,
  getDaysBetween,
  isToday,
  getWeekStart,
  getMonthStart,
  getMonthEnd,
  debounce,
  throttle,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  generateId
};

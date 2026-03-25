// pages/calendar/calendar.js
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    currentYear: 0,
    currentMonth: 0,
    weeks: [],
    schedules: {},
    selectedDate: '',
    todaySchedules: [],
    viewMode: 'month' // month, week
  },

  onLoad: function () {
    const now = new Date();
    this.setData({
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1,
      selectedDate: this.formatDate(now)
    });
    this.generateCalendar();
  },

  onShow: function () {
    this.loadMonthSchedules();
  },

  // 生成日历数据
  generateCalendar: function () {
    const { currentYear, currentMonth } = this.data;
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const firstDayWeek = firstDay.getDay(); // 第一天是周几
    const daysInMonth = lastDay.getDate(); // 本月天数

    const weeks = [];
    let week = [];

    // 填充上月的空白
    for (let i = 0; i < firstDayWeek; i++) {
      week.push({
        day: '',
        date: '',
        isCurrentMonth: false
      });
    }

    // 填充当月日期
    for (let day = 1; day <= daysInMonth; day++) {
      const date = this.formatDate(new Date(currentYear, currentMonth - 1, day));
      week.push({
        day: day,
        date: date,
        isCurrentMonth: true,
        isToday: date === this.formatDate(new Date())
      });

      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    // 填充下月的空白
    if (week.length > 0) {
      while (week.length < 7) {
        week.push({
          day: '',
          date: '',
          isCurrentMonth: false
        });
      }
      weeks.push(week);
    }

    this.setData({ weeks });
  },

  // 加载本月日程
  loadMonthSchedules: function () {
    const { currentYear, currentMonth } = this.data;
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    db.collection('schedules')
      .where({
        start_time: db.command.gte(startOfMonth).and(db.command.lte(endOfMonth))
      })
      .orderBy('start_time', 'asc')
      .get()
      .then(res => {
        // 按日期分组
        const schedules = {};
        res.data.forEach(item => {
          const dateKey = this.formatDate(new Date(item.start_time));
          if (!schedules[dateKey]) {
            schedules[dateKey] = [];
          }
          schedules[dateKey].push(item);
        });

        this.setData({ schedules });

        // 加载选中日期的日程
        if (this.data.selectedDate) {
          this.loadSelectedDateSchedules(this.data.selectedDate);
        }
      })
      .catch(err => {
        console.error('加载日程失败', err);
      });
  },

  // 格式化日期
  formatDate: function (date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 上个月
  prevMonth: function () {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 1) {
      currentYear--;
      currentMonth = 12;
    } else {
      currentMonth--;
    }
    this.setData({ currentYear, currentMonth });
    this.generateCalendar();
    this.loadMonthSchedules();
  },

  // 下个月
  nextMonth: function () {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 12) {
      currentYear++;
      currentMonth = 1;
    } else {
      currentMonth++;
    }
    this.setData({ currentYear, currentMonth });
    this.generateCalendar();
    this.loadMonthSchedules();
  },

  // 选择日期
  selectDate: function (e) {
    const date = e.currentTarget.dataset.date;
    if (!date) return;

    this.setData({ selectedDate: date });
    this.loadSelectedDateSchedules(date);
  },

  // 加载选中日期的日程
  loadSelectedDateSchedules: function (date) {
    const daySchedules = this.data.schedules[date] || [];
    this.setData({
      todaySchedules: daySchedules.map(item => ({
        ...item,
        timeDisplay: this.formatTime(new Date(item.start_time))
      }))
    });
  },

  // 格式化时间
  formatTime: function (date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 跳转到日程详情
  goToSchedule: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/schedule/schedule?id=${id}`
    });
  },

  // 创建日程
  createSchedule: function () {
    const { selectedDate } = this.data;
    wx.navigateTo({
      url: `/pages/schedule/schedule?date=${selectedDate}`
    });
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: '我的日程日历',
      path: '/pages/calendar/calendar'
    };
  }
});

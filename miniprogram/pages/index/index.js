// pages/index/index.js
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    today: '',
    schedules: [],
    loading: true
  },

  onLoad: function () {
    this.setTodayDate();
  },

  onShow: function () {
    this.loadTodaySchedules();
  },

  onPullDownRefresh: function () {
    this.loadTodaySchedules().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 设置今日日期
  setTodayDate: function () {
    const now = new Date();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const weekDay = weekDays[now.getDay()];

    this.setData({
      today: `${month}月${date}日 星期${weekDay}`
    });
  },

  // 加载今日日程
  loadTodaySchedules: function () {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    return db.collection('schedules')
      .where({
        start_time: db.command.gte(startOfDay).and(db.command.lte(endOfDay))
      })
      .orderBy('start_time', 'asc')
      .get()
      .then(res => {
        const schedules = res.data.map(item => {
          return {
            ...item,
            timeDisplay: this.formatTime(item.start_time),
            statusClass: this.getStatusClass(item)
          };
        });

        this.setData({
          schedules: schedules,
          loading: false
        });
      })
      .catch(err => {
        console.error('加载日程失败', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      });
  },

  // 格式化时间显示
  formatTime: function (date) {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 获取状态样式类
  getStatusClass: function (schedule) {
    const now = new Date();
    const startTime = new Date(schedule.start_time);
    const endTime = schedule.end_time ? new Date(schedule.end_time) : null;

    if (schedule.status === 'completed') {
      return 'completed';
    } else if (schedule.status === 'cancelled') {
      return 'cancelled';
    } else if (endTime && now > endTime) {
      return 'overdue';
    } else if (now >= startTime) {
      return 'ongoing';
    } else {
      return 'pending';
    }
  },

  // 跳转到创建日程页面
  goToAddSchedule: function () {
    wx.navigateTo({
      url: '/pages/schedule/schedule'
    });
  },

  // 查看日程详情
  viewScheduleDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/schedule/schedule?id=${id}`
    });
  },

  // 完成日程
  completeSchedule: function (e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认完成',
      content: '确定要将此日程标记为完成吗？',
      success: (res) => {
        if (res.confirm) {
          db.collection('schedules').doc(id).update({
            data: {
              status: 'completed',
              updated_at: new Date()
            }
          }).then(() => {
            wx.showToast({
              title: '已完成',
              icon: 'success'
            });
            this.loadTodaySchedules();
          }).catch(err => {
            console.error('更新失败', err);
            wx.showToast({
              title: '操作失败',
              icon: 'none'
            });
          });
        }
      }
    });
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: '我的日程管理',
      path: '/pages/index/index'
    };
  }
});

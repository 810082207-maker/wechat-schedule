// pages/schedule/schedule.js
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    isEdit: false,
    scheduleId: '',

    // 表单数据
    title: '',
    description: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    category: '',
    tags: [],
    reminder: 15, // 提前多少分钟提醒

    // 选项
    categories: ['工作', '学习', '生活', '健康', '娱乐', '其他'],
    categoryIndex: 0,
    reminderOptions: [
      { value: 0, label: '不提醒' },
      { value: 5, label: '提前5分钟' },
      { value: 15, label: '提前15分钟' },
      { value: 30, label: '提前30分钟' },
      { value: 60, label: '提前1小时' },
      { value: 1440, label: '提前1天' }
    ],
    reminderIndex: 2,

    tagInput: '',
    loading: false
  },

  onLoad: function (options) {
    // 设置默认日期为今天
    const today = new Date();
    const dateStr = this.formatDate(today);

    this.setData({
      date: dateStr
    });

    // 如果有id参数，说明是编辑模式
    if (options.id) {
      this.setData({
        isEdit: true,
        scheduleId: options.id,
        loading: true
      });
      this.loadSchedule(options.id);
    }
  },

  // 加载日程数据（编辑模式）
  loadSchedule: function (id) {
    db.collection('schedules').doc(id).get().then(res => {
      const data = res.data;
      const startDate = new Date(data.start_time);
      const endDate = data.end_time ? new Date(data.end_time) : null;

      this.setData({
        title: data.title,
        description: data.description || '',
        date: this.formatDate(startDate),
        startTime: this.formatTimeString(startDate),
        endTime: endDate ? this.formatTimeString(endDate) : this.formatTimeString(new Date(startDate.getTime() + 3600000)),
        location: data.location || '',
        category: data.category || '',
        categoryIndex: data.category ? this.data.categories.indexOf(data.category) : 0,
        tags: data.tags || [],
        reminder: data.reminder_minutes || 15,
        reminderIndex: this.getReminderIndex(data.reminder_minutes || 15),
        loading: false
      });
    }).catch(err => {
      console.error('加载日程失败', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    });
  },

  // 格式化日期
  formatDate: function (date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 格式化时间字符串
  formatTimeString: function (date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 获取提醒选项索引
  getReminderIndex: function (minutes) {
    const index = this.data.reminderOptions.findIndex(item => item.value === minutes);
    return index >= 0 ? index : 2;
  },

  // 输入事件处理
  onTitleInput: function (e) {
    this.setData({ title: e.detail.value });
  },

  onDescriptionInput: function (e) {
    this.setData({ description: e.detail.value });
  },

  onDateChange: function (e) {
    this.setData({ date: e.detail.value });
  },

  onStartTimeChange: function (e) {
    this.setData({ startTime: e.detail.value });
  },

  onEndTimeChange: function (e) {
    this.setData({ endTime: e.detail.value });
  },

  onLocationInput: function (e) {
    this.setData({ location: e.detail.value });
  },

  onCategoryChange: function (e) {
    const index = e.detail.value;
    this.setData({
      categoryIndex: index,
      category: this.data.categories[index]
    });
  },

  onReminderChange: function (e) {
    const index = e.detail.value;
    this.setData({
      reminderIndex: index,
      reminder: this.data.reminderOptions[index].value
    });
  },

  onTagInput: function (e) {
    this.setData({ tagInput: e.detail.value });
  },

  // 添加标签
  addTag: function () {
    const tag = this.data.tagInput.trim();
    if (tag && !this.data.tags.includes(tag)) {
      this.setData({
        tags: [...this.data.tags, tag],
        tagInput: ''
      });
    }
  },

  // 删除标签
  removeTag: function (e) {
    const index = e.currentTarget.dataset.index;
    const tags = this.data.tags.filter((_, i) => i !== index);
    this.setData({ tags });
  },

  // 保存日程
  saveSchedule: function () {
    // 表单验证
    if (!this.data.title.trim()) {
      wx.showToast({
        title: '请输入日程标题',
        icon: 'none'
      });
      return;
    }

    // 构建时间对象
    const startTime = this.buildDateTime(this.data.date, this.data.startTime);
    const endTime = this.buildDateTime(this.data.date, this.data.endTime);

    if (endTime <= startTime) {
      wx.showToast({
        title: '结束时间必须晚于开始时间',
        icon: 'none'
      });
      return;
    }

    // 构建日程数据
    const scheduleData = {
      title: this.data.title.trim(),
      description: this.data.description.trim(),
      start_time: startTime,
      end_time: endTime,
      location: this.data.location.trim(),
      category: this.data.category,
      tags: this.data.tags,
      reminder_minutes: this.data.reminder,
      status: 'pending',
      updated_at: new Date()
    };

    this.setData({ loading: true });

    // 根据是否是编辑模式选择操作
    const operation = this.data.isEdit
      ? db.collection('schedules').doc(this.data.scheduleId).update({ data: scheduleData })
      : db.collection('schedules').add({ data: { ...scheduleData, created_at: new Date() } });

    operation.then(res => {
      wx.showToast({
        title: this.data.isEdit ? '更新成功' : '创建成功',
        icon: 'success'
      });

      // 设置提醒
      if (this.data.reminder > 0) {
        this.setReminder(startTime, scheduleData.title);
      }

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }).catch(err => {
      console.error('保存失败', err);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    });
  },

  // 构建日期时间对象
  buildDateTime: function (dateStr, timeStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, 0);
  },

  // 设置提醒（调用云函数发送模板消息）
  setReminder: function (startTime, title) {
    const reminderTime = new Date(startTime.getTime() - this.data.reminder * 60000);

    // 只有提醒时间在未来才设置
    if (reminderTime > new Date()) {
      wx.cloud.callFunction({
        name: 'reminder',
        data: {
          time: reminderTime,
          title: title,
          type: 'schedule_reminder'
        }
      }).then(res => {
        console.log('提醒设置成功', res);
      }).catch(err => {
        console.error('提醒设置失败', err);
      });
    }
  },

  // 删除日程
  deleteSchedule: function () {
    if (!this.data.isEdit) return;

    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      confirmColor: '#f5222d',
      success: (res) => {
        if (res.confirm) {
          db.collection('schedules').doc(this.data.scheduleId).remove().then(() => {
            wx.showToast({
              title: '已删除',
              icon: 'success'
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }).catch(err => {
            console.error('删除失败', err);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          });
        }
      }
    });
  }
});

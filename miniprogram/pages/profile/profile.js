// pages/profile/profile.js
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    userInfo: null,
    stats: {
      totalSchedules: 0,
      completedSchedules: 0,
      completionRate: 0
    },
    recentTags: [],
    loading: true
  },

  onLoad: function () {
    this.loadUserInfo();
    this.loadStats();
  },

  onShow: function () {
    this.loadStats();
  },

  // 加载用户信息
  loadUserInfo: function () {
    app.getUserInfo().then(userInfo => {
      this.setData({ userInfo });
    }).catch(err => {
      console.error('获取用户信息失败', err);
    });
  },

  // 加载统计数据
  loadStats: function () {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 获取本月日程统计
    db.collection('schedules')
      .where({
        created_at: db.command.gte(startOfMonth)
      })
      .get()
      .then(res => {
        const schedules = res.data;
        const totalSchedules = schedules.length;
        const completedSchedules = schedules.filter(s => s.status === 'completed').length;
        const completionRate = totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 0;

        // 提取最近使用的标签
        const tagMap = {};
        schedules.forEach(s => {
          if (s.tags && s.tags.length > 0) {
            s.tags.forEach(tag => {
              tagMap[tag] = (tagMap[tag] || 0) + 1;
            });
          }
        });
        const recentTags = Object.entries(tagMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag, count]) => tag);

        this.setData({
          stats: {
            totalSchedules,
            completedSchedules,
            completionRate
          },
          recentTags,
          loading: false
        });
      })
      .catch(err => {
        console.error('加载统计失败', err);
        this.setData({ loading: false });
      });
  },

  // 获取用户信息（头像昵称）
  getUserProfile: function () {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const { userInfo } = res;
        // 更新用户信息到数据库
        db.collection('users').where({
          _openid: '{openid}'
        }).update({
          data: {
            nickname: userInfo.nickName,
            avatar: userInfo.avatarUrl,
            updated_at: new Date()
          }
        }).then(() => {
          this.setData({
            userInfo: {
              ...this.data.userInfo,
              nickname: userInfo.nickName,
              avatar: userInfo.avatarUrl
            }
          });
        });
      }
    });
  },

  // 清除所有已完成日程
  clearCompleted: function () {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有已完成的日程吗？此操作不可恢复。',
      confirmColor: '#f5222d',
      success: (res) => {
        if (res.confirm) {
          // 批量删除已完成的日程
          db.collection('schedules')
            .where({
              status: 'completed'
            })
            .remove()
            .then(() => {
              wx.showToast({
                title: '已清除',
                icon: 'success'
              });
              this.loadStats();
            })
            .catch(err => {
              console.error('清除失败', err);
              wx.showToast({
                title: '清除失败',
                icon: 'none'
              });
            });
        }
      }
    });
  },

  // 导出日程数据
  exportData: function () {
    wx.showLoading({ title: '导出中...' });

    db.collection('schedules')
      .orderBy('start_time', 'desc')
      .limit(1000)
      .get()
      .then(res => {
        // 生成CSV格式数据
        const csvData = this.generateCSV(res.data);

        wx.hideLoading();

        // 复制到剪贴板
        wx.setClipboardData({
          data: csvData,
          success: () => {
            wx.showToast({
              title: '已复制到剪贴板',
              icon: 'success'
            });
          }
        });
      })
      .catch(err => {
        wx.hideLoading();
        console.error('导出失败', err);
        wx.showToast({
          title: '导出失败',
          icon: 'none'
        });
      });
  },

  // 生成CSV数据
  generateCSV: function (schedules) {
    const headers = ['标题', '开始时间', '结束时间', '地点', '分类', '状态', '备注'];
    const rows = schedules.map(s => [
      s.title,
      new Date(s.start_time).toLocaleString('zh-CN'),
      s.end_time ? new Date(s.end_time).toLocaleString('zh-CN') : '',
      s.location || '',
      s.category || '',
      s.status === 'completed' ? '已完成' : s.status === 'cancelled' ? '已取消' : '待完成',
      s.description || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  },

  // 关于我们
  showAbout: function () {
    wx.showModal({
      title: '关于我的日程',
      content: '版本：1.0.0\n\n一款简洁的个人日程管理工具，帮助你高效管理每一天。',
      showCancel: false
    });
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: '我在用「我的日程」管理日常事务，推荐给你！',
      path: '/pages/index/index'
    };
  }
});

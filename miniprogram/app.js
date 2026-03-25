// app.js
App({
  onLaunch: function () {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'your-cloud-env-id', // 替换为你的云开发环境ID
        traceUser: true,
      });
    }

    // 获取用户信息
    this.getUserInfo();
  },

  getUserInfo: function () {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database();
      db.collection('users').where({
        _openid: '{openid}' // 云开发会自动替换
      }).get().then(res => {
        if (res.data.length > 0) {
          this.globalData.userInfo = res.data[0];
          resolve(res.data[0]);
        } else {
          // 新用户，创建用户记录
          this.createUserInfo().then(resolve).catch(reject);
        }
      }).catch(err => {
        console.error('获取用户信息失败', err);
        reject(err);
      });
    });
  },

  createUserInfo: function () {
    const db = wx.cloud.database();
    return db.collection('users').add({
      data: {
        nickname: '新用户',
        avatar: '',
        created_at: new Date(),
        updated_at: new Date()
      }
    }).then(res => {
      return this.getUserInfo();
    });
  },

  globalData: {
    userInfo: null,
    schedules: []
  }
});

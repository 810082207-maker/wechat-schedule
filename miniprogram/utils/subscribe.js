/**
 * 订阅消息服务
 * 微信小程序订阅消息功能封装
 */

/**
 * 请求订阅消息授权
 * @param {string} templateId - 模板消息ID
 * @returns {Promise<boolean>} - 用户是否授权
 */
const requestSubscribe = (templateId) => {
  return new Promise((resolve, reject) => {
    wx.requestSubscribeMessage({
      tmplIds: [templateId],
      success: (res) => {
        console.log('订阅消息授权结果：', res);
        
        if (res[templateId] === 'accept') {
          // 用户同意授权
          resolve(true);
        } else if (res[templateId] === 'reject') {
          // 用户拒绝授权
          wx.showToast({
            title: '您已拒绝提醒通知',
            icon: 'none'
          });
          resolve(false);
        } else if (res[templateId] === 'ban') {
          // 已被封禁
          wx.showToast({
            title: '订阅功能已被封禁',
            icon: 'none'
          });
          resolve(false);
        }
      },
      fail: (err) => {
        console.error('订阅消息请求失败：', err);
        wx.showToast({
          title: '请求失败，请重试',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

/**
 * 请求多个订阅消息授权
 * @param {Array<string>} templateIds - 模板消息ID数组
 * @returns {Promise<Object>} - 各模板的授权结果
 */
const requestMultipleSubscribe = (templateIds) => {
  return new Promise((resolve, reject) => {
    wx.requestSubscribeMessage({
      tmplIds: templateIds,
      success: (res) => {
        console.log('批量订阅消息授权结果：', res);
        resolve(res);
      },
      fail: (err) => {
        console.error('批量订阅消息请求失败：', err);
        reject(err);
      }
    });
  });
};

/**
 * 检查订阅消息权限
 * @param {string} templateId - 模板消息ID
 * @returns {Promise<Object>} - 权限状态
 */
const checkSubscribeAuth = async (templateId) => {
  try {
    // 获取设置
    const settings = await wx.getSetting();
    
    if (settings.authSetting['scope.subscribemsg']) {
      return { allowed: true, message: '已开启订阅消息' };
    }
    
    return { allowed: false, message: '未开启订阅消息' };
  } catch (err) {
    console.error('检查订阅权限失败：', err);
    return { allowed: false, message: '检查失败' };
  }
};

/**
 * 保存用户订阅偏好到数据库
 * @param {string} scheduleId - 日程ID
 * @param {number} reminderMinutes - 提前提醒分钟数
 * @param {boolean} enabled - 是否启用提醒
 */
const saveReminderPreference = (scheduleId, reminderMinutes, enabled) => {
  const db = wx.cloud.database();
  
  return db.collection('reminder_preferences').add({
    data: {
      schedule_id: scheduleId,
      reminder_minutes: reminderMinutes,
      enabled: enabled,
      created_at: new Date(),
      updated_at: new Date()
    }
  });
};

/**
 * 更新日程提醒设置
 * @param {string} scheduleId - 日程ID
 * @param {Object} reminderData - 提醒设置
 */
const updateScheduleReminder = (scheduleId, reminderData) => {
  const db = wx.cloud.database();
  
  return db.collection('schedules').doc(scheduleId).update({
    data: {
      reminder_enabled: reminderData.enabled,
      reminder_minutes: reminderData.minutes,
      reminder_template_id: reminderData.templateId,
      updated_at: new Date()
    }
  });
};

/**
 * 创建日程提醒（包含订阅请求）
 * @param {Object} scheduleData - 日程数据
 * @param {string} templateId - 订阅消息模板ID
 * @returns {Promise<Object>} - 结果
 */
const createScheduleWithReminder = async (scheduleData, templateId) => {
  const db = wx.cloud.database();
  
  // 先创建日程
  const result = await db.collection('schedules').add({
    data: {
      ...scheduleData,
      created_at: new Date(),
      updated_at: new Date()
    }
  });
  
  // 如果用户选择了提醒，弹出订阅授权
  if (scheduleData.reminder_enabled && scheduleData.reminder_minutes > 0) {
    try {
      const subscribed = await requestSubscribe(templateId);
      
      if (subscribed) {
        // 授权成功，设置提醒
        await scheduleReminder(result._id, scheduleData.start_time, scheduleData.reminder_minutes);
      }
      
      return {
        ...result,
        reminder_subscribed: subscribed
      };
    } catch (err) {
      console.error('设置提醒失败：', err);
      return result;
    }
  }
  
  return result;
};

/**
 * 为日程设置提醒（写入提醒队列）
 * @param {string} scheduleId - 日程ID
 * @param {Date} startTime - 日程开始时间
 * @param {number} reminderMinutes - 提前提醒分钟数
 */
const scheduleReminder = async (scheduleId, startTime, reminderMinutes) => {
  const db = wx.cloud.database();
  
  // 计算提醒时间
  const reminderTime = new Date(new Date(startTime).getTime() - reminderMinutes * 60 * 1000);
  
  // 如果提醒时间已过，不设置
  if (reminderTime <= new Date()) {
    console.log('提醒时间已过，跳过设置');
    return;
  }
  
  // 添加到提醒队列
  return await db.collection('reminders').add({
    data: {
      schedule_id: scheduleId,
      reminder_time: reminderTime,
      status: 'pending',
      created_at: new Date()
    }
  });
};

/**
 * 取消日程提醒
 * @param {string} scheduleId - 日程ID
 */
const cancelReminder = (scheduleId) => {
  const db = wx.cloud.database();
  
  return db.collection('reminders')
    .where({ schedule_id: scheduleId })
    .update({
      data: {
        status: 'cancelled',
        updated_at: new Date()
      }
    });
};

module.exports = {
  requestSubscribe,
  requestMultipleSubscribe,
  checkSubscribeAuth,
  saveReminderPreference,
  updateScheduleReminder,
  createScheduleWithReminder,
  scheduleReminder,
  cancelReminder
};

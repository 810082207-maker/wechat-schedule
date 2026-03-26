/**
 * 云函数：发送订阅消息
 * 
 * 功能：
 * 1. 定时检查需要发送的提醒
 * 2. 调用微信订阅消息API发送提醒
 * 
 * 配置：
 * 需要在微信公众平台获取订阅消息模板ID
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 订阅消息模板ID（需要替换为实际的模板ID）
const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

/**
 * 云函数入口
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  // 处理不同类型的请求
  switch (event.action) {
    case 'sendReminder':
      return await sendReminder(openid, event.scheduleId);
    
    case 'checkReminders':
      return await checkAndSendReminders();
    
    case 'schedule':
      return await scheduleReminder(openid, event.data);
    
    case 'cancel':
      return await cancelReminder(event.scheduleId);
    
    default:
      return {
        success: false,
        errMsg: '未知的操作类型'
      };
  }
};

/**
 * 发送单条订阅消息提醒
 * @param {string} openid - 用户openid
 * @param {string} scheduleId - 日程ID
 */
async function sendReminder(openid, scheduleId) {
  try {
    // 获取日程信息
    const scheduleRes = await db.collection('schedules').doc(scheduleId).get();
    const schedule = scheduleRes.data;

    if (!schedule) {
      return {
        success: false,
        errMsg: '日程不存在'
      };
    }

    // 发送订阅消息
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid,
      template_id: schedule.reminder_template_id || TEMPLATE_ID,
      page: `/pages/schedule/schedule?id=${scheduleId}`,
      data: {
        thing1: { // 日程标题（最多20字符）
          value: schedule.title.substring(0, 20)
        },
        date2: { // 日程时间
          value: formatDateTime(schedule.start_time)
        },
        character_string3: { // 地点（如果有）
          value: schedule.location || '无'
        },
        phrase4: { // 分类（如果有）
          value: schedule.category || '一般'
        }
      }
    });

    // 更新提醒状态
    await db.collection('reminders')
      .where({ schedule_id: scheduleId })
      .update({
        data: {
          status: 'sent',
          sent_at: new Date()
        }
      });

    return {
      success: true,
      message: '提醒发送成功',
      result
    };

  } catch (err) {
    console.error('发送提醒失败：', err);
    return {
      success: false,
      errMsg: err.message || '发送失败'
    };
  }
}

/**
 * 检查并发送所有待发送的提醒
 * 由定时触发器调用
 */
async function checkAndSendReminders() {
  try {
    const now = new Date();

    // 查询所有待发送的提醒
    const remindersRes = await db.collection('reminders')
      .where({
        status: 'pending',
        reminder_time: _.lte(now)
      })
      .limit(100) // 每次最多处理100条
      .get();

    const reminders = remindersRes.data;
    const results = [];

    // 逐个发送提醒
    for (const reminder of reminders) {
      try {
        // 获取日程信息
        const scheduleRes = await db.collection('schedules').doc(reminder.schedule_id).get();
        const schedule = scheduleRes.data;

        if (schedule && schedule.status === 'pending') {
          // 发送提醒
          await cloud.openapi.subscribeMessage.send({
            touser: schedule._openid,
            template_id: schedule.reminder_template_id || TEMPLATE_ID,
            page: `/pages/schedule/schedule?id=${reminder.schedule_id}`,
            data: {
              thing1: {
                value: schedule.title.substring(0, 20)
              },
              date2: {
                value: formatDateTime(schedule.start_time)
              },
              character_string3: {
                value: schedule.location || '无'
              },
              phrase4: {
                value: schedule.category || '一般'
              }
            }
          });

          // 更新状态
          await db.collection('reminders').doc(reminder._id).update({
            data: {
              status: 'sent',
              sent_at: new Date()
            }
          });

          results.push({
            scheduleId: reminder.schedule_id,
            status: 'success'
          });
        } else {
          // 日程已取消或不存在
          await db.collection('reminders').doc(reminder._id).update({
            data: {
              status: 'skipped',
              skip_reason: schedule ? '日程已完成' : '日程不存在'
            }
          });
        }
      } catch (err) {
        console.error(`发送提醒失败 ${reminder.schedule_id}：`, err);
        results.push({
          scheduleId: reminder.schedule_id,
          status: 'failed',
          error: err.message
        });
      }
    }

    return {
      success: true,
      processed: reminders.length,
      results
    };

  } catch (err) {
    console.error('检查提醒失败：', err);
    return {
      success: false,
      errMsg: err.message
    };
  }
}

/**
 * 为日程安排提醒
 */
async function scheduleReminder(openid, data) {
  const { scheduleId, startTime, reminderMinutes } = data;

  // 计算提醒时间
  const reminderTime = new Date(new Date(startTime).getTime() - reminderMinutes * 60 * 1000);

  // 如果提醒时间已过，不设置
  if (reminderTime <= new Date()) {
    return {
      success: false,
      errMsg: '提醒时间已过'
    };
  }

  // 添加到提醒队列
  const result = await db.collection('reminders').add({
    data: {
      schedule_id: scheduleId,
      reminder_time: reminderTime,
      status: 'pending',
      created_at: new Date()
    }
  });

  return {
    success: true,
    reminderId: result._id,
    reminderTime: reminderTime
  };
}

/**
 * 取消日程提醒
 */
async function cancelReminder(scheduleId) {
  const result = await db.collection('reminders')
    .where({ schedule_id: scheduleId })
    .update({
      data: {
        status: 'cancelled',
        cancelled_at: new Date()
      }
    });

  return {
    success: true,
    updated: result.stats.updated
  };
}

/**
 * 格式化日期时间
 */
function formatDateTime(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

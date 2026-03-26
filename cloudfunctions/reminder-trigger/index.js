/**
 * 云函数定时触发器配置
 * 
 * 用于定期检查并发送订阅消息提醒
 * 
 * 配置方法：
 * 1. 在微信开发者工具中打开云开发控制台
 * 2. 进入「云函数」→「定时触发器」
 * 3. 添加定时触发器
 * 
 * 推荐配置：
 * - 每5分钟检查一次（适合实时性要求高的场景）
 * - 或每小时检查一次（节省资源）
 */

// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  
  console.log('定时任务开始执行：', new Date().toISOString());
  
  try {
    const now = new Date();
    
    // 查询所有待发送的提醒（提醒时间 <= 当前时间）
    const remindersRes = await db.collection('reminders')
      .where({
        status: 'pending',
        reminder_time: db.command.lte(now)
      })
      .limit(50) // 每次最多处理50条
      .get();
    
    const reminders = remindersRes.data;
    console.log(`找到 ${reminders.length} 条待发送的提醒`);
    
    let successCount = 0;
    let failCount = 0;
    
    // 逐个发送提醒
    for (const reminder of reminders) {
      try {
        // 获取关联的日程
        const scheduleRes = await db.collection('schedules')
          .doc(reminder.schedule_id)
          .get();
        
        const schedule = scheduleRes.data;
        
        if (!schedule) {
          // 日程不存在，标记为跳过
          await db.collection('reminders').doc(reminder._id).update({
            data: {
              status: 'skipped',
              skip_reason: '日程不存在',
              processed_at: new Date()
            }
          });
          continue;
        }
        
        if (schedule.status !== 'pending') {
          // 日程已完成或已取消，标记为跳过
          await db.collection('reminders').doc(reminder._id).update({
            data: {
              status: 'skipped',
              skip_reason: `日程状态：${schedule.status}`,
              processed_at: new Date()
            }
          });
          continue;
        }
        
        // 发送订阅消息
        await cloud.openapi.subscribeMessage.send({
          touser: schedule._openid,
          template_id: 'YOUR_TEMPLATE_ID', // 替换为你的模板ID
          page: `/pages/schedule/schedule?id=${schedule._id}`,
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
        
        // 更新提醒状态为已发送
        await db.collection('reminders').doc(reminder._id).update({
          data: {
            status: 'sent',
            sent_at: new Date(),
            processed_at: new Date()
          }
        });
        
        successCount++;
        
      } catch (err) {
        console.error(`发送提醒失败 ${reminder._id}：`, err);
        
        // 更新提醒状态
        await db.collection('reminders').doc(reminder._id).update({
          data: {
            status: 'failed',
            error_message: err.message,
            processed_at: new Date()
          }
        });
        
        failCount++;
      }
    }
    
    console.log(`定时任务完成：成功 ${successCount}，失败 ${failCount}`);
    
    return {
      success: true,
      total: reminders.length,
      success: successCount,
      failed: failCount,
      timestamp: new Date().toISOString()
    };
    
  } catch (err) {
    console.error('定时任务执行失败：', err);
    return {
      success: false,
      error: err.message
    };
  }
};

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

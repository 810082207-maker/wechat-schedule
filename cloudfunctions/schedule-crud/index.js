// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data, id } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    switch (action) {
      case 'create':
        return await createSchedule(openid, data);
      case 'update':
        return await updateSchedule(openid, id, data);
      case 'delete':
        return await deleteSchedule(openid, id);
      case 'get':
        return await getSchedule(openid, id);
      case 'list':
        return await listSchedules(openid, data);
      default:
        return {
          success: false,
          errMsg: '未知操作'
        };
    }
  } catch (err) {
    console.error(err);
    return {
      success: false,
      errMsg: err.message
    };
  }
};

// 创建日程
async function createSchedule(openid, data) {
  const result = await db.collection('schedules').add({
    data: {
      _openid: openid,
      ...data,
      status: data.status || 'pending',
      created_at: new Date(),
      updated_at: new Date()
    }
  });

  return {
    success: true,
    _id: result._id
  };
}

// 更新日程
async function updateSchedule(openid, id, data) {
  const result = await db.collection('schedules')
    .where({
      _id: id,
      _openid: openid
    })
    .update({
      data: {
        ...data,
        updated_at: new Date()
      }
    });

  return {
    success: true,
    updated: result.stats.updated
  };
}

// 删除日程
async function deleteSchedule(openid, id) {
  const result = await db.collection('schedules')
    .where({
      _id: id,
      _openid: openid
    })
    .remove();

  return {
    success: true,
    removed: result.stats.removed
  };
}

// 获取单个日程
async function getSchedule(openid, id) {
  const result = await db.collection('schedules')
    .where({
      _id: id,
      _openid: openid
    })
    .get();

  return {
    success: true,
    data: result.data[0] || null
  };
}

// 获取日程列表
async function listSchedules(openid, data = {}) {
  const { startDate, endDate, status, category, limit = 100 } = data;

  let query = db.collection('schedules').where({
    _openid: openid
  });

  // 时间范围筛选
  if (startDate && endDate) {
    query = query.where({
      start_time: _.gte(new Date(startDate)).and(_.lte(new Date(endDate)))
    });
  }

  // 状态筛选
  if (status) {
    query = query.where({ status });
  }

  // 分类筛选
  if (category) {
    query = query.where({ category });
  }

  const result = await query
    .orderBy('start_time', 'asc')
    .limit(limit)
    .get();

  return {
    success: true,
    data: result.data,
    count: result.data.length
  };
}

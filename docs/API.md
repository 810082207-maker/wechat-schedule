# API 文档

## 云函数 API

### 1. 用户认证 (auth)

#### 获取用户信息

**调用方式：**
```javascript
wx.cloud.callFunction({
  name: 'auth',
  data: {}
})
```

**返回数据：**
```json
{
  "openid": "用户OpenID",
  "appid": "小程序AppID",
  "unionid": "用户UnionID"
}
```

---

### 2. 日程管理 (schedule-crud)

#### 创建日程

**调用方式：**
```javascript
wx.cloud.callFunction({
  name: 'schedule-crud',
  data: {
    action: 'create',
    data: {
      title: '日程标题',
      description: '备注说明',
      start_time: new Date(),
      end_time: new Date(),
      location: '地点',
      category: '工作',
      tags: ['标签1', '标签2'],
      reminder_minutes: 15
    }
  }
})
```

**返回数据：**
```json
{
  "success": true,
  "_id": "日程ID"
}
```

#### 更新日程

**调用方式：**
```javascript
wx.cloud.callFunction({
  name: 'schedule-crud',
  data: {
    action: 'update',
    id: '日程ID',
    data: {
      title: '新标题',
      status: 'completed'
    }
  }
})
```

#### 删除日程

**调用方式：**
```javascript
wx.cloud.callFunction({
  name: 'schedule-crud',
  data: {
    action: 'delete',
    id: '日程ID'
  }
})
```

#### 获取日程列表

**调用方式：**
```javascript
wx.cloud.callFunction({
  name: 'schedule-crud',
  data: {
    action: 'list',
    data: {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      status: 'pending',
      category: '工作',
      limit: 100
    }
  }
})
```

**返回数据：**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

---

### 3. 提醒功能 (reminder)

#### 设置提醒

**调用方式：**
```javascript
wx.cloud.callFunction({
  name: 'reminder',
  data: {
    time: new Date('2024-01-15 09:00:00'),
    title: '会议提醒',
    type: 'schedule_reminder'
  }
})
```

**返回数据：**
```json
{
  "success": true,
  "message": "提醒设置成功",
  "reminderTime": "2024-01-15T01:00:00.000Z"
}
```

---

## 本地数据库 API

小程序也支持直接使用云开发数据库 API：

### 查询日程

```javascript
const db = wx.cloud.database();

// 查询今日日程
db.collection('schedules')
  .where({
    start_time: db.command.gte(startDate).and(db.command.lte(endDate))
  })
  .orderBy('start_time', 'asc')
  .get()
  .then(res => {
    console.log(res.data);
  });
```

### 创建日程

```javascript
db.collection('schedules').add({
  data: {
    title: '新日程',
    start_time: new Date(),
    end_time: new Date(),
    status: 'pending'
  }
});
```

### 更新日程

```javascript
db.collection('schedules').doc('日程ID').update({
  data: {
    status: 'completed'
  }
});
```

### 删除日程

```javascript
db.collection('schedules').doc('日程ID').remove();
```

---

## 错误处理

所有API调用都应该包含错误处理：

```javascript
wx.cloud.callFunction({
  name: 'schedule-crud',
  data: { ... }
}).then(res => {
  if (res.result.success) {
    // 成功处理
  } else {
    // 业务错误
    console.error(res.result.errMsg);
  }
}).catch(err => {
  // 网络或其他错误
  console.error(err);
});
```

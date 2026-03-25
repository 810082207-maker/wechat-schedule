# 开发指南

## 项目架构

```
微信日程小程序
├── 前端（小程序）
│   ├── 页面层（Pages）
│   ├── 组件层（Components）
│   ├── 工具层（Utils）
│   └── 样式层（Styles）
│
├── 后端（云函数）
│   ├── 认证函数
│   ├── 数据操作函数
│   └── 业务逻辑函数
│
└── 数据层（云数据库）
    ├── 用户集合
    ├── 日程集合
    └── 提醒集合
```

## 开发流程

### 1. 本地开发

```bash
# 克隆项目
git clone https://github.com/your-username/wechat-schedule.git

# 打开微信开发者工具
# 导入项目目录

# 编辑代码
# 实时预览
```

### 2. 测试

- 在模拟器中测试
- 在真机上测试
- 检查各种网络状况下的表现

### 3. 提交代码

```bash
git add .
git commit -m "feat: 添加新功能"
git push origin main
```

## 代码规范

### JavaScript 规范

```javascript
// ✅ 好的做法
const getUserInfo = async () => {
  try {
    const result = await db.collection('users').get();
    return result.data;
  } catch (err) {
    console.error('获取用户信息失败', err);
    throw err;
  }
};

// ❌ 避免
function get_user_info() {
  db.collection('users').get().then(res => {
    console.log(res);
  });
}
```

### 命名规范

- 文件名：小写 + 连字符（`schedule-card.js`）
- 变量名：驼峰式（`scheduleList`）
- 常量名：大写 + 下划线（`MAX_RETRY_COUNT`）
- 函数名：驼峰式（`getScheduleList()`）

### 注释规范

```javascript
/**
 * 获取日程列表
 * @param {string} userId - 用户ID
 * @param {object} options - 查询选项
 * @param {string} options.status - 日程状态
 * @returns {Promise<Array>} 日程列表
 */
const getScheduleList = async (userId, options = {}) => {
  // 实现代码
};
```

## 常见任务

### 添加新页面

1. 在 `miniprogram/pages/` 下创建新文件夹
2. 创建 `.js`、`.json`、`.wxml`、`.wxss` 文件
3. 在 `app.json` 中注册页面

```json
{
  "pages": [
    "pages/index/index",
    "pages/new-page/new-page"  // 新页面
  ]
}
```

### 添加新组件

1. 在 `miniprogram/components/` 下创建新文件夹
2. 创建组件文件
3. 在页面中注册和使用

```javascript
// 页面 JSON
{
  "usingComponents": {
    "schedule-card": "/components/schedule-card/schedule-card"
  }
}

// 页面 WXML
<schedule-card schedule="{{item}}" />
```

### 调用云函数

```javascript
wx.cloud.callFunction({
  name: 'schedule-crud',
  data: {
    action: 'create',
    data: {
      title: '新日程',
      start_time: new Date()
    }
  }
}).then(res => {
  console.log('成功', res.result);
}).catch(err => {
  console.error('失败', err);
});
```

### 数据库操作

```javascript
const db = wx.cloud.database();

// 查询
db.collection('schedules')
  .where({ status: 'pending' })
  .get()
  .then(res => console.log(res.data));

// 新增
db.collection('schedules').add({
  data: { title: '新日程' }
});

// 更新
db.collection('schedules').doc('id').update({
  data: { status: 'completed' }
});

// 删除
db.collection('schedules').doc('id').remove();
```

## 性能优化

### 1. 减少数据库查询

```javascript
// ❌ 不好：多次查询
for (let i = 0; i < ids.length; i++) {
  db.collection('schedules').doc(ids[i]).get();
}

// ✅ 好：一次查询
db.collection('schedules')
  .where({ _id: db.command.in(ids) })
  .get();
```

### 2. 使用缓存

```javascript
// 缓存用户信息
const userCache = {};

const getUserInfo = async (userId) => {
  if (userCache[userId]) {
    return userCache[userId];
  }
  
  const result = await db.collection('users').doc(userId).get();
  userCache[userId] = result.data;
  return result.data;
};
```

### 3. 图片优化

- 使用合适的图片格式（PNG/JPG）
- 压缩图片大小
- 使用 CDN 加速

## 调试技巧

### 1. 使用 console

```javascript
console.log('普通日志', data);
console.warn('警告', data);
console.error('错误', data);
```

### 2. 查看网络请求

在开发者工具中：
- 点击「Network」标签
- 查看请求和响应

### 3. 查看存储数据

在开发者工具中：
- 点击「Storage」标签
- 查看本地存储、会话存储等

### 4. 远程调试

```javascript
// 在 app.js 中启用远程调试
if (wx.getSystemInfoSync().platform === 'devtools') {
  console.log('开发者工具环境');
}
```

## 常见错误

### 1. 云函数超时

**原因：** 数据库查询过慢或网络问题

**解决：**
- 添加数据库索引
- 优化查询条件
- 增加超时时间

### 2. 权限错误

**原因：** 数据库权限规则配置不正确

**解决：**
- 检查权限规则
- 确认用户已登录
- 查看云函数日志

### 3. 内存溢出

**原因：** 加载过多数据或内存泄漏

**解决：**
- 分页加载数据
- 及时释放资源
- 使用 WeakMap 存储引用

## 版本管理

### Git 工作流

```bash
# 创建特性分支
git checkout -b feature/new-feature

# 提交代码
git add .
git commit -m "feat: 添加新功能"

# 推送到远程
git push origin feature/new-feature

# 创建 Pull Request
# 等待审核和合并

# 删除本地分支
git branch -d feature/new-feature
```

### 提交信息规范

```
feat: 添加新功能
fix: 修复 Bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
perf: 性能优化
test: 添加测试
chore: 构建工具或依赖更新
```

## 资源链接

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [JavaScript 规范](https://google.github.io/styleguide/javascriptguide.xml)
- [Git 工作流](https://www.atlassian.com/git/tutorials/comparing-workflows)

# 微信日程管理项目

> 类似飞书/钉钉的个人日程管理工具

## 一、项目背景

### 目标
打造一个微信内的日程管理工具，帮助用户高效管理个人事务。

### 对标产品
- **飞书日程**：企业级日程协作，个人+团队日程管理
- **钉钉日程**：强协作属性，支持会议邀请、日程共享
- **本项目定位**：个人日程管理工具，微信生态内使用

## 二、核心功能规划

### MVP 阶段（第一版）
- [ ] 日程创建（标题、时间、地点、备注）
- [ ] 日程列表查看（日/周/月视图）
- [ ] 日程编辑与删除
- [ ] 日程提醒（微信模板消息）
- [ ] 基础日历视图

### 进阶功能（第二版）
- [ ] 重复日程（每天/每周/每月）
- [ ] 日程分类与标签
- [ ] 日程搜索
- [ ] 日程分享（小程序码/链接）
- [ ] 语音输入创建日程

### 高级功能（第三版）
- [ ] 日程统计分析（完成率、时间分布）
- [ ] 智能日程建议
- [ ] 与其他日历同步（Google/Apple/Outlook）
- [ ] AI 助手对话式创建日程

## 三、技术架构

### 前端（微信小程序）
```
技术栈：
- 微信小程序原生 / Taro / uni-app
- 日历组件：自定义开发或使用现成组件
- 状态管理：MobX / Redux
- UI 组件库：Vant Weapp / WeUI
```

### 后端
```
技术栈选项：
A. Node.js + Express/NestJS + MongoDB
B. Python + FastAPI + PostgreSQL
C. Go + Gin + MySQL
```

### 基础设施
- 云服务：腾讯云 / 阿里云
- 数据库：MongoDB / PostgreSQL
- 缓存：Redis
- 消息队列：RabbitMQ（提醒通知）
- 部署：Docker + Kubernetes

### 微信能力
- 小程序登录
- 模板消息（日程提醒）
- 小程序码生成
- 微信支付（会员功能，可选）

## 四、数据模型设计

### User 用户表
```json
{
  "_id": "ObjectId",
  "openid": "微信openid",
  "nickname": "昵称",
  "avatar": "头像",
  "created_at": "创建时间",
  "updated_at": "更新时间"
}
```

### Schedule 日程表
```json
{
  "_id": "ObjectId",
  "user_id": "用户ID",
  "title": "日程标题",
  "description": "备注说明",
  "start_time": "开始时间",
  "end_time": "结束时间",
  "location": "地点",
  "category": "分类",
  "tags": ["标签"],
  "reminder_minutes": [提前提醒分钟数],
  "repeat_rule": {
    "type": "none/daily/weekly/monthly/yearly",
    "interval": 1,
    "end_date": "结束日期"
  },
  "status": "pending/completed/cancelled",
  "created_at": "创建时间",
  "updated_at": "更新时间"
}
```

## 五、API 设计

### 认证相关
- `POST /api/auth/login` - 微信登录
- `POST /api/auth/refresh` - 刷新 token

### 日程相关
- `GET /api/schedules` - 获取日程列表
- `POST /api/schedules` - 创建日程
- `GET /api/schedules/:id` - 获取日程详情
- `PUT /api/schedules/:id` - 更新日程
- `DELETE /api/schedules/:id` - 删除日程
- `GET /api/schedules/date/:date` - 获取指定日期日程

## 六、开发计划

### 阶段一：需求确认与技术选型（1周）
- [ ] 确认详细需求
- [ ] 确定技术栈
- [ ] 搭建开发环境
- [ ] 数据库设计确认

### 阶段二：后端开发（2周）
- [ ] 用户认证模块
- [ ] 日程 CRUD 接口
- [ ] 提醒通知系统
- [ ] 数据库设计实现

### 阶段三：前端开发（2周）
- [ ] 小程序框架搭建
- [ ] 日程列表页
- [ ] 日程创建/编辑页
- [ ] 日历视图组件
- [ ] 个人中心页

### 阶段四：测试与优化（1周）
- [ ] 功能测试
- [ ] 性能优化
- [ ] UI/UX 优化
- [ ] Bug 修复

### 阶段五：上线与运营
- [ ] 小程序审核提交
- [ ] 正式上线
- [ ] 用户反馈收集
- [ ] 迭代优化

## 七、待确认问题

1. **技术栈偏好**：你更熟悉哪种后端技术？Node.js / Python / Go？
2. **部署方式**：自建服务器还是使用云开发？
3. **用户规模**：预期的用户规模是多少？（影响架构设计）
4. **商业模式**：是否考虑会员付费功能？
5. **设计资源**：是否有 UI 设计师，还是需要自己设计？

## 八、下一步行动

- [ ] 回答上述待确认问题
- [ ] 确定技术栈
- [ ] 搭建项目脚手架
- [ ] 开始后端开发

---

_创建时间：2026-03-25_

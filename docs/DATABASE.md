# 数据库设计

## 集合（Collections）

### 1. users - 用户表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| _id | string | 用户ID（自动生成） |
| _openid | string | 微信OpenID（云开发自动注入） |
| nickname | string | 用户昵称 |
| avatar | string | 头像URL |
| created_at | date | 创建时间 |
| updated_at | date | 更新时间 |

**索引：**
- `_openid` (唯一索引)

---

### 2. schedules - 日程表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| _id | string | 日程ID（自动生成） |
| _openid | string | 微信OpenID（云开发自动注入） |
| title | string | 日程标题 |
| description | string | 备注说明 |
| start_time | date | 开始时间 |
| end_time | date | 结束时间 |
| location | string | 地点 |
| category | string | 分类（工作/学习/生活/健康/娱乐/其他） |
| tags | array | 标签数组 |
| reminder_minutes | number | 提前提醒分钟数 |
| repeat_rule | object | 重复规则 |
| status | string | 状态（pending/completed/cancelled） |
| created_at | date | 创建时间 |
| updated_at | date | 更新时间 |

**repeat_rule 结构：**
```json
{
  "type": "none|daily|weekly|monthly|yearly",
  "interval": 1,
  "end_date": "结束日期（可选）"
}
```

**索引：**
- `_openid` + `start_time` (复合索引)
- `_openid` + `status` (复合索引)

---

### 3. reminders - 提醒表（可选）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| _id | string | 提醒ID |
| _openid | string | 用户OpenID |
| schedule_id | string | 关联的日程ID |
| reminder_time | date | 提醒时间 |
| status | string | 状态（pending/sent/failed） |
| created_at | date | 创建时间 |

---

## 数据库初始化

在微信开发者工具中，打开云开发控制台，创建以下集合：

1. 点击「数据库」→「添加集合」
2. 创建集合：`users`、`schedules`、`reminders`
3. 设置权限规则：
   - 所有集合权限设为「仅创建者可读写」

---

## 数据库规则（安全规则）

```json
{
  "read": "auth.openid == doc._openid",
  "write": "auth.openid == doc._openid"
}
```

这样可以确保用户只能访问自己的数据。

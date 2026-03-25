# 微信日程管理小程序

> 一款简洁优雅的个人日程管理工具，帮助你高效管理每一天 📅

![小程序截图](docs/screenshots/preview.png)

## ✨ 功能特性

### 核心功能
- 📝 **日程创建** - 快速创建日程，支持标题、时间、地点、分类、标签
- 📅 **日历视图** - 月视图日历，直观查看日程分布
- ⏰ **智能提醒** - 支持多种提醒时间设置（5分钟/15分钟/30分钟/1小时/1天）
- ✅ **状态管理** - 标记日程完成状态，清晰追踪进度

### 进阶功能
- 🏷️ **标签系统** - 自定义标签，灵活分类管理
- 📊 **数据统计** - 查看日程完成率，了解时间分配
- 📤 **数据导出** - 支持导出CSV格式数据
- 🔄 **数据同步** - 云端存储，多设备同步

## 🚀 快速开始

### 前置要求

1. 注册微信小程序账号：https://mp.weixin.qq.com
2. 下载微信开发者工具：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
3. 开通微信云开发（免费额度足够个人使用）

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/your-username/wechat-schedule.git
cd wechat-schedule
```

#### 2. 导入项目

1. 打开微信开发者工具
2. 选择「导入项目」
3. 选择项目目录
4. 填写你的小程序 AppID

#### 3. 配置云开发环境

1. 在微信开发者工具中，点击「云开发」按钮
2. 创建云开发环境（选择基础版，免费）
3. 复制环境ID

4. 修改 `miniprogram/app.js` 中的环境ID：

```javascript
wx.cloud.init({
  env: 'your-cloud-env-id', // 替换为你的云开发环境ID
  traceUser: true,
});
```

#### 4. 创建数据库集合

在云开发控制台中创建以下集合：

- `users` - 用户信息
- `schedules` - 日程数据

设置权限：所有集合设为「仅创建者可读写」

#### 5. 部署云函数

在微信开发者工具中：

1. 右键点击 `cloudfunctions/auth` 文件夹
2. 选择「上传并部署：云端安装依赖」
3. 同样操作部署 `schedule-crud` 和 `reminder` 函数

#### 6. 添加图标

在 `miniprogram/images/` 目录下添加以下图标（建议尺寸 81×81）：

- `today.png` / `today-active.png`
- `calendar.png` / `calendar-active.png`
- `profile.png` / `profile-active.png`
- `default-avatar.png`

#### 7. 运行项目

点击开发者工具中的「编译」按钮，即可在模拟器中预览

## 📖 项目结构

```
wechat-schedule/
├── miniprogram/              # 小程序前端代码
│   ├── pages/                # 页面
│   │   ├── index/            # 首页（今日日程）
│   │   ├── schedule/         # 日程详情/编辑
│   │   ├── calendar/         # 日历视图
│   │   └── profile/          # 个人中心
│   ├── components/           # 组件
│   ├── utils/                # 工具函数
│   ├── images/               # 图片资源
│   ├── app.js                # 应用入口
│   ├── app.json              # 应用配置
│   └── app.wxss              # 全局样式
│
├── cloudfunctions/           # 云函数
│   ├── auth/                 # 用户认证
│   ├── schedule-crud/        # 日程增删改查
│   └── reminder/             # 提醒功能
│
├── docs/                     # 文档
│   ├── DATABASE.md           # 数据库设计
│   └── API.md                # API文档
│
└── README.md                 # 项目说明
```

## 🎨 自定义配置

### 修改主题色

在 `miniprogram/app.wxss` 中修改：

```css
.btn-primary {
  background-color: #4A90E2; /* 修改为你喜欢的颜色 */
}
```

### 修改分类选项

在 `miniprogram/pages/schedule/schedule.js` 中修改：

```javascript
categories: ['工作', '学习', '生活', '健康', '娱乐', '其他']
```

## 📝 开发计划

### v1.1（计划中）
- [ ] 重复日程功能
- [ ] 日程搜索
- [ ] 语音输入创建日程
- [ ] 日程分享功能

### v1.2（计划中）
- [ ] 日程统计分析
- [ ] 与其他日历同步
- [ ] AI 智能建议

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目采用 MIT 协议 - 详见 [LICENSE](LICENSE) 文件

## 💬 联系方式

- 作者：Your Name
- 邮箱：your.email@example.com
- 微信：your-wechat-id

## 🙏 致谢

- 感谢微信小程序团队提供的优秀开发平台
- 灵感来源于飞书、钉钉等优秀的日程管理产品
- 感谢所有贡献者的付出

---

**如果这个项目对你有帮助，欢迎 Star ⭐ 支持！**

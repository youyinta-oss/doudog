# FiveM 人物Mod插件系统

一个完整的FiveM服务器人物Mod管理系统，包含后端API、用户Web界面和管理员控制面板。

## 功能特性

### 管理员面板
- 数据统计面板：玩家总数、代币总量、Mod总数、今日销售
- 用户管理：查看所有玩家、赠送代币、赠送Mod
- Mod管理：添加、编辑、删除、上架/下架Mod

### 用户端
- Mod商城：浏览和购买人物Mod
- 我的仓库：查看已拥有的Mod、装备Mod
- 个人中心：查看余额

## 技术栈

### 后端
- Node.js + Express
- SQLite数据库
- TypeScript

### 前端
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router
- Zustand状态管理

### FiveM
- Lua脚本
- NUI界面

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```
这将同时启动前端（http://localhost:5173）和后端API（http://localhost:3001）

### 访问系统
- 用户商城：http://localhost:5173/shop
- 管理面板：http://localhost:5173/admin

## FiveM服务器配置

1. 将 `fivem-mod` 文件夹复制到您的FiveM服务器resources目录
2. 修改 `fivem-mod/client.lua` 中的 `apiUrl` 变量为您的API地址
3. 在 `server.cfg` 中添加 `ensure fivem-mod`
4. 重启服务器

### 使用命令
- `/modshop` - 打开Mod商店
- 按F5键 - 打开Mod商店

## 测试账号

系统初始化时创建了3个测试玩家：
- PlayerOne (license:abc123def456) - 1000代币
- GamerPro (license:xyz789ghi012) - 2500代币
- NeonNinja (license:mno345pqr678) - 500代币

## API端点

### 管理API
- `GET /api/admin/stats` - 获取统计数据
- `GET /api/admin/users` - 获取用户列表
- `POST /api/admin/users/:id/give-coins` - 赠送代币
- `POST /api/admin/users/:id/give-mod` - 赠送Mod
- `GET /api/admin/mods/admin` - 获取所有Mod
- `POST /api/admin/mods` - 创建Mod
- `PUT /api/admin/mods/:id` - 更新Mod
- `DELETE /api/admin/mods/:id` - 删除Mod

### 用户API
- `GET /api/mods` - 获取可购买的Mod
- `GET /api/user/:identifier/mods` - 获取用户拥有的Mod
- `GET /api/user/:identifier/coins` - 获取用户代币
- `POST /api/user/:identifier/buy-mod` - 购买Mod
- `POST /api/user/:identifier/equip-mod` - 装备Mod

## 目录结构

```
/workspace
├── api/                    # 后端API
│   ├── routes/            # API路由
│   ├── database.ts        # 数据库初始化
│   ├── app.ts             # Express应用
│   └── server.ts          # 服务器入口
├── src/                    # 前端源码
│   ├── components/        # React组件
│   ├── pages/             # 页面组件
│   ├── lib/               # 工具函数
│   └── App.tsx            # 应用入口
├── fivem-mod/             # FiveM资源
│   ├── fxmanifest.lua     # 资源清单
│   ├── client.lua         # 客户端脚本
│   ├── server.lua         # 服务器脚本
│   └── html/              # NUI界面
└── database.sqlite        # SQLite数据库
```

## 设计风格

系统采用赛博朋克/科技感暗黑主题：
- 主色调：深紫色 (#6C2BD9)
- 强调色：霓虹粉 (#FF00FF)
- 背景色：深灰黑 (#0D0D0D)
- 字体：Orbitron (标题) + Rajdhani (正文)

## 开发说明

### 前端开发
```bash
npm run client:dev
```

### 后端开发
```bash
npm run server:dev
```

### 构建生产版本
```bash
npm run build
```

## 许可证

MIT

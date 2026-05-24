# FiveM 人物Mod商店系统

一个完整的FiveM服务器人物Mod商店插件，使用MySQL数据库存储数据，包含玩家商店和管理员管理面板，全部在游戏内通过NUI界面操作。

## 功能特性

### 玩家端
- **Mod商城** - 浏览和购买各种人物模型
- **我的仓库** - 查看已拥有的Mod、装备/卸下Mod
- **一键装备** - 点击即可应用Mod到角色
- **美观界面** - 赛博朋克风格的游戏内UI

### 管理员端
- **Mod管理** - 游戏内添加、编辑、删除Mod（名称、价格、模型、图片URL、描述）
- **玩家管理** - 查看在线玩家、赠送金币
- **数据库存储** - 所有数据通过oxmysql存储在MySQL中

## 快速开始

### 1. 前置依赖
确保你的FiveM服务器已安装：
- [oxmysql](https://github.com/overextended/oxmysql)

### 2. 安装插件
1. 将 `fivem-mod-shop` 文件夹复制到你的服务器 `resources` 目录
2. 编辑 `server.cfg`，添加：
   ```
   ensure oxmysql
   ensure fivem-mod-shop
   ```
3. 重启服务器

### 3. 配置
编辑 `fivem-mod-shop/config.lua`：
- 设置默认金币数
- 添加管理员标识符

## 使用方法

### 玩家
- 按 `F5` 或输入 `/modshop` 打开商店

### 管理员
- 按 `F6` 或输入 `/modshopadmin` 打开管理面板
- 在管理面板中添加和管理Mod

## 文件结构

```
/workspace
└── fivem-mod-shop/         # FiveM插件
    ├── fxmanifest.lua      # 资源清单
    ├── config.lua          # 配置文件
    ├── server/
    │   └── main.lua        # 服务器端脚本
    ├── client/
    │   └── main.lua        # 客户端脚本
    └── html/
        ├── index.html      # NUI界面
        ├── style.css       # 样式文件
        └── app.js          # JavaScript逻辑
```

## 数据库

插件会自动创建三个表：
- `modshop_players` - 玩家数据
- `modshop_mods` - Mod商品
- `modshop_owned` - 玩家拥有的Mod

## 许可证

MIT

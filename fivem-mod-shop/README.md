# FiveM Mod商店系统

## 📦 简介

这是一个独立的FiveM服务器插件，提供完整的人物Mod商店系统！

## 🎯 功能特性

- **Mod商城** - 购买各种人物模型
- **我的仓库** - 查看和装备已拥有的Mod
- **独立数据库** - 使用MySQL/oxmysql存储数据
- **NUI界面** - 美观的游戏内界面
- **一键装备** - 点击即可装备Mod到角色

## 🚀 安装步骤

### 1. 前置依赖
确保你的服务器已安装：
- [oxmysql](https://github.com/overextended/oxmysql)

### 2. 安装插件
1. 将 `fivem-mod-shop` 文件夹复制到你的服务器 `resources` 目录
2. 编辑 `server.cfg` 文件，添加以下行：
   ```
   ensure oxmysql
   ensure fivem-mod-shop
   ```
3. 重启服务器

### 3. 配置
编辑 [config.lua](file:///workspace/fivem-mod-shop/config.lua) 文件：

```lua
-- 修改默认金币数
Config.DefaultCoins = 1000

-- 添加管理员标识符
Config.AdminIdentifiers = {
    'license:你的license这里'
}
```

## 🎮 使用方法

### 玩家操作
- 按 `F5` 键或输入 `/modshop` 打开商店
- 在商城中浏览和购买Mod
- 在仓库中装备已拥有的Mod

### 管理员功能
- 按 `F6` 键或输入 `/modshopadmin` 打开管理面板
- **Mod管理**：添加、编辑、删除Mod（包括名称、价格、模型、图片URL、描述）
- **玩家管理**：查看在线玩家、赠送金币给玩家
- 所有Mod数据都存储在MySQL数据库中

## 📁 文件结构

```
fivem-mod-shop/
├── fxmanifest.lua          # 资源清单
├── config.lua              # 配置文件
├── server/
│   └── main.lua            # 服务器端脚本
├── client/
│   └── main.lua            # 客户端脚本
└── html/
    ├── index.html          # NUI界面
    ├── style.css           # 样式文件
    └── app.js              # JavaScript逻辑
```

## 🗄️ 数据库

插件会自动创建以下表：
- `modshop_players` - 玩家数据
- `modshop_mods` - Mod商品
- `modshop_owned` - 玩家拥有的Mod

## 🎨 自定义

### 管理Mod
进入游戏使用管理员面板（F6）添加、编辑、删除Mod，包括：
- Mod名称和描述
- 价格设置
- 模型名称/哈希
- 图片URL
- 分类选择

### 更换界面颜色
编辑 [html/style.css](file:///workspace/fivem-mod-shop/html/style.css) 中的颜色变量

### 修改按键
在 [config.lua](file:///workspace/fivem-mod-shop/config.lua) 中修改：
```lua
Config.OpenKey = 'F5' -- 玩家打开商店按键
Config.AdminKey = 'F6' -- 管理员打开面板按键
```

## 🔧 故障排除

### 界面不显示
- 确保 `ensure fivem-mod-shop` 在 `server.cfg` 中
- 检查控制台有无错误
- 确保 oxmysql 已正确安装

### 无法购买Mod
- 检查数据库连接
- 确认玩家有足够金币
- 查看客户端控制台错误

## 📝 技术说明

- **框架兼容性** - 独立运行，不依赖QBCore/ESX（支持检测）
- **数据库** - 使用oxmysql操作MySQL
- **性能优化** - 异步数据库查询，无性能影响

## 📄 许可证

MIT License

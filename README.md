# 🧧 压岁钱收支看板

一款纯前端的春节红包收支管理看板，帮助您清晰记录春节期间的红包往来，一目了然地查看收支情况。

## ✨ 功能特性

- **收支记录**：手动录入每笔红包，包含亲友关系、金额、收/发类型、渠道、时间
- **快速批量添加**：支持一键添加多笔相同金额给不同亲友（如连给三个表弟各 200）
- **实时汇总**：自动计算总收入、总支出、净额
- **可视化图表**：
  - 环形图：展示各亲友收支占比
  - 折线图：展示除夕到初七每日收支波动
- **数据持久化**：使用 IndexedDB 本地存储最近 50 条记录，刷新页面数据不丢失
- **数据导入**：支持导入 JSON 格式的示例数据，快速验收图表效果
- **响应式设计**：适配桌面、平板、移动设备
- **离线可用**：纯前端应用，无需网络

## 🛠️ 技术栈

- **前端框架**：Vue 3.4 + TypeScript 5.3
- **构建工具**：Vite 5.0
- **状态管理**：Pinia 2.1
- **可视化**：ECharts 5.5
- **样式**：Tailwind CSS 3.4
- **本地存储**：IndexedDB (idb 8.0)
- **图标**：Lucide Vue Next
- **部署**：Docker + Nginx

## 📦 项目结构

```
ljx-0293-1/
├── src/
│   ├── components/
│   │   ├── SummaryCards.vue      # 收支汇总卡片
│   │   ├── PieChart.vue          # 环形图组件
│   │   ├── LineChart.vue         # 折线图组件
│   │   ├── RedPacketForm.vue     # 录入表单
│   │   └── RecordList.vue        # 记录列表
│   ├── stores/
│   │   └── redPacket.ts          # Pinia 状态管理
│   ├── utils/
│   │   ├── idb.ts                # IndexedDB 封装
│   │   └── date.ts               # 日期工具函数
│   ├── types/
│   │   └── index.ts              # TypeScript 类型定义
│   ├── App.vue                   # 主页面
│   └── main.ts                   # 入口文件
├── public/
│   └── sample-data.json          # 示例数据（40条）
├── docker/
│   └── nginx.conf                # Nginx 配置
├── docker-compose.yml            # Docker Compose 配置
├── tailwind.config.js            # Tailwind 配置
├── tsconfig.json                 # TypeScript 配置
└── vite.config.ts                # Vite 配置
```

## 🚀 快速开始

### 开发模式

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开浏览器访问 http://localhost:5173
```

### 构建生产版本

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 🐳 Docker 一键部署

```bash
# 1. 先构建生产版本
npm run build

# 2. 启动 Nginx 静态资源服务
docker-compose up -d

# 3. 打开浏览器访问 http://localhost:8080

# 停止服务
docker-compose down

# 查看服务状态
docker-compose ps
```

## 📊 导入示例数据验收图表效果

应用内置了 40 条示例数据，涵盖除夕到初七的收支记录。导入后可以立即看到完整的图表效果。

### 导入步骤

1. 启动应用（开发模式或 Docker 部署均可）
2. 在页面顶部「最近记录」区域，点击右上角的「导入 JSON」按钮
3. 在文件选择对话框中，选择 `public/sample-data.json` 文件
4. 确认导入成功后，即可看到：
   - 汇总卡片显示总收入 ¥28,712.42、总支出 ¥10,798.66、净额 +¥17,913.76
   - 环形图展示各亲友的收支占比（爷爷奶奶、外公外婆等）
   - 折线图展示除夕到初八的每日收支波动趋势
   - 记录列表显示 40 条详细记录

### 示例数据说明

示例数据包含：
- **收红包**：22 笔，来自长辈、哥哥姐姐、朋友、同事等
- **发红包**：18 笔，发给弟弟妹妹、侄子侄女、长辈等
- **覆盖日期**：2026年1月24日（除夕）至 1月31日（初七）
- **渠道分布**：微信、支付宝、现金
- **金额范围**：52元 ~ 5000元

## 🎯 使用指南

### 添加单笔红包

1. 选择「收红包」或「发红包」类型
2. 选择亲友关系（支持38种常用关系）
3. 输入金额（支持小数点后两位）
4. 选择渠道（微信/支付宝/现金）
5. 选择日期和时间（默认为当前时间）
6. 点击「添加记录」

### 快速批量添加

1. 点击「批量添加」按钮切换到批量模式
2. 设置金额、类型、渠道、时间
3. 添加多个亲友（最多10人）
4. 点击「批量添加 N 笔」一次性添加

### 删除记录

1. 鼠标悬停在记录行上，右侧会显示删除按钮
2. 点击删除按钮，会出现「确认」和「取消」按钮
3. 点击「确认」删除记录，图表会即时联动刷新

## 🔧 常用命令

```bash
# 类型检查
npm run check

# 代码检查
npm run lint

# 代码修复
npm run lint:fix
```

## 📝 数据格式说明

### JSON 导入格式

```json
[
  {
    "id": "unique-id",
    "relation": "爸爸",
    "amount": 2000,
    "type": "receive",
    "channel": "wechat",
    "date": "2026-01-24",
    "time": "09:30",
    "createdAt": "2026-01-24T01:30:00.000Z"
  }
]
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| relation | string | 亲友关系 |
| amount | number | 金额（元） |
| type | string | `receive` 收红包 / `send` 发红包 |
| channel | string | `wechat` 微信 / `alipay` 支付宝 / `cash` 现金 |
| date | string | 日期（YYYY-MM-DD） |
| time | string | 时间（HH:mm） |
| createdAt | string | 创建时间（ISO 格式） |

## 💡 特色说明

- **春节主题设计**：中国红 + 金色配色，营造节日氛围
- **智能日期范围**：自动识别除夕到初八，折线图按传统节日标签展示
- **数据容量**：最多保存最近 50 条记录，自动清理旧数据
- **隐私保护**：所有数据存储在本地 IndexedDB，不上传任何服务器
- **性能优化**：图表数据变化时实时联动刷新，响应时间 < 100ms

## 📄 License

MIT


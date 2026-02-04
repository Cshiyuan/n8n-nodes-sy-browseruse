# 如何让 AI 帮我从小红书上收集有用的旅游攻略

<!--
封面图建议：AI 智能旅游攻略收集主题
原图参考：https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80
需要下载后上传到微信素材库
-->

> 用 N8N + Browser Use + Docker + AI，打造智能旅游攻略收集系统

---

## 本文概要

| 项目 | 内容 |
|------|------|
| **阅读时长** | 约 30 分钟 |
| **难度等级** | ⭐⭐⭐ 进阶级 |
| **适合人群** | 有一定技术基础的开发者、自动化爱好者 |

**本文要点：**
- 为什么要自动化收集旅游攻略
- 技术架构设计（N8N + Browser Use + PostgreSQL）
- 完整的环境搭建步骤
- 两个核心工作流的详细配置
- AI 智能分析与攻略生成
- 成本分析与安全建议

**前置知识：**
- 了解 Docker 基本操作
- 了解 N8N 基础用法（可先阅读《AI连接一切？N8N 入门到上手》）

---

## 一、为什么要做这个项目？

### 1.1 传统收集旅游攻略的痛点

假设你计划去成都旅游，想在小红书上找攻略，通常的流程是：

1. 打开小红书，搜索"成都旅游攻略"
2. 一篇一篇点开笔记，复制粘贴到备忘录
3. 收藏了 50+ 篇笔记，但根本看不完
4. 信息混乱：有的说宽窄巷子必去，有的说是游客陷阱
5. 最后出发前匆忙翻看，还是不知道该去哪

**问题核心：**
- ❌ **信息过载**：几千篇笔记，无从下手
- ❌ **质量参差**：真实体验 vs 商业推广分不清
- ❌ **整理困难**：手动复制粘贴，效率低下
- ❌ **无法提炼**：看了很多，但没有总结归纳

### 1.2 理想的解决方案

如果有一个系统能：

- ✅ **自动抓取**：AI 帮你浏览小红书，收集热门攻略
- ✅ **智能筛选**：过滤广告，只保留真实游记
- ✅ **结构化存储**：分类保存到数据库（景点、美食、住宿）
- ✅ **AI 总结**：自动提取关键信息，生成专属攻略
- ✅ **持续更新**：定时抓取，始终获取最新内容

这就是我们今天要做的！

---

## 二、技术方案设计

<!--
图片占位：系统架构设计示意图
原图参考：https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&q=80
建议自己绘制架构图
-->

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                        N8N 工作流                         │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌───────┐ │
│  │Schedule  │ → │Browser   │ → │Data      │ → │AI     │ │
│  │Trigger   │   │Use       │   │Process   │   │Analyze│ │
│  └──────────┘   └──────────┘   └──────────┘   └───────┘ │
│                       ↓              ↓             ↓      │
└───────────────────────────────────────────────────────────┘
                        ↓              ↓             ↓
                 ┌──────────┐   ┌──────────┐   ┌──────────┐
                 │小红书网站 │   │PostgreSQL│   │生成报告  │
                 └──────────┘   │ Docker   │   └──────────┘
                                └──────────┘
```

### 2.2 技术栈选择

| 组件 | 技术选型 | 作用 |
|------|---------|------|
| **工作流编排** | N8N | 整个流程的"大脑"，协调各个环节 |
| **浏览器自动化** | Browser Use (SYBrowserUse 节点) | AI 驱动，自动浏览小红书并提取数据 |
| **数据存储** | PostgreSQL (Docker) | 本地数据库，存储抓取的攻略数据 |
| **数据处理** | N8N Code 节点 + JavaScript | 清洗、去重、结构化数据 |
| **AI 分析** | OpenAI GPT-4 / Claude | 理解内容，提取关键信息，生成总结 |
| **定时任务** | N8N Schedule Trigger | 每天自动抓取新内容 |

> 💡 **完整项目源码**：本文所有配置和代码都已开源
>
> GitHub：github.com/Cshiyuan/n8n-nodes-sy-browseruse

### 2.3 数据流设计

**输入：**
- 搜索关键词："成都旅游攻略"、"成都美食推荐"
- 抓取数量：每次 20 篇笔记
- 筛选条件：点赞 > 1000，评论 > 50

**处理流程：**
1. Browser Use 抓取 → 获取笔记标题、内容、图片、作者、点赞数
2. 数据清洗 → 去除广告、格式化内容、提取标签
3. 存入数据库 → 按景点/美食/住宿分类存储
4. AI 分析 → 提取关键信息（推荐理由、注意事项、价格区间）
5. 生成报告 → 汇总成结构化的旅游攻略

**输出：**
- 结构化数据：数据库中的分类攻略
- 可视化报告：Markdown 格式的旅游指南
- 智能推荐：AI 根据你的偏好推荐行程

---

## 三、环境准备

<!--
图片占位：开发环境配置示意图
原图参考：https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1000&q=80
-->

### 3.1 安装 N8N

如果你还没安装 N8N，参考上一篇文章《AI连接一切？N8N 入门到上手》快速部署：

```bash
# 使用 Docker 部署
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 3.2 部署 PostgreSQL 数据库

使用 Docker Compose 部署 PostgreSQL：

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: travel_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: travel_guide
      POSTGRES_USER: n8n_user
      POSTGRES_PASSWORD: your_strong_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  adminer:
    image: adminer
    container_name: db_admin
    restart: unless-stopped
    ports:
      - "8080:8080"

volumes:
  postgres_data:
```

创建数据库初始化脚本 `init.sql`：

```sql
-- 创建攻略表
CREATE TABLE IF NOT EXISTS travel_notes (
    id SERIAL PRIMARY KEY,
    note_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100),
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    category VARCHAR(50),  -- 'attraction' | 'food' | 'accommodation' | 'other'
    tags TEXT[],           -- 标签数组
    images TEXT[],         -- 图片 URL 数组
    url VARCHAR(500),
    extracted_info JSONB,  -- AI 提取的结构化信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建分析结果表
CREATE TABLE IF NOT EXISTS ai_summaries (
    id SERIAL PRIMARY KEY,
    query VARCHAR(200) NOT NULL,
    summary TEXT NOT NULL,
    recommendations JSONB,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_note_id ON travel_notes(note_id);
CREATE INDEX idx_category ON travel_notes(category);
CREATE INDEX idx_created_at ON travel_notes(created_at DESC);
CREATE INDEX idx_likes ON travel_notes(likes DESC);
```

启动数据库：

```bash
# 启动 PostgreSQL 和 Adminer（数据库管理界面）
docker-compose up -d

# 验证数据库运行
docker ps | grep postgres

# 访问 Adminer 查看数据库: http://localhost:8080
# System: PostgreSQL
# Server: postgres
# Username: n8n_user
# Password: your_strong_password
# Database: travel_guide
```

### 3.3 安装 Browser Use 节点

> 📦 **项目地址**：github.com/Cshiyuan/n8n-nodes-sy-browseruse
>
> 状态：开源项目，即将发布到 npm

**安装方式 1：从 GitHub 直接安装**（推荐）

```bash
# 进入 N8N 数据目录
cd ~/.n8n

# 从 GitHub 直接安装 n8n-nodes-sy-browseruse
npm install github:Cshiyuan/n8n-nodes-sy-browseruse

# 重启 N8N
docker restart n8n
```

**安装方式 2：克隆源码本地开发**

```bash
# 克隆项目
git clone https://github.com/Cshiyuan/n8n-nodes-sy-browseruse.git
cd n8n-nodes-sy-browseruse

# 安装依赖并构建
npm install
npm run build

# 链接到 N8N（用于开发测试）
npm link
cd ~/.n8n
npm link n8n-nodes-sy-browseruse

# 重启 N8N
docker restart n8n
```

### 3.4 配置 Browser Use 凭据

**方式 1：使用 Cloud API（推荐新手）**

1. 访问 Browser Use Cloud（browseruse.com）注册账号
2. 获取 API Key
3. 在 N8N 中添加凭据：
   - Credentials > New > Browser Use Cloud API
   - API Key：填入你的密钥

**方式 2：使用 Local Bridge（本地运行）**

```bash
# 安装 browser-use Python 包
pip install browser-use playwright

# 安装浏览器
playwright install chromium

# 启动本地桥接服务
browser-use bridge --port 8000 --host 0.0.0.0
```

在 N8N 中配置：
- Credentials > New > Browser Use Local Bridge API
- Bridge URL：`http://localhost:8000`

### 3.5 配置数据库连接

在 N8N 中添加 PostgreSQL 凭据：

1. Credentials > New > Postgres
2. 填写连接信息：
   - Host：`localhost`（或 Docker 容器名 `postgres`）
   - Database：`travel_guide`
   - User：`n8n_user`
   - Password：`your_strong_password`
   - Port：`5432`

### 3.6 配置 AI API

根据你选择的 AI 提供商：

**OpenAI：**
- Credentials > New > OpenAI API
- API Key：你的 OpenAI Key

**Anthropic Claude：**
- Credentials > New > Anthropic API
- API Key：你的 Anthropic Key

---

## 四、工作流搭建

<!--
图片占位：工作流节点配置示意图
原图参考：https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&q=80
-->

### 4.1 工作流 1：抓取小红书攻略

#### 节点配置

**1. Schedule Trigger - 定时触发器**

```
节点名称：每天定时抓取
配置：
- Trigger Interval: Days
- Days Between Triggers: 1
- Trigger at Hour: 9
- Trigger at Minute: 0
```

**2. Code - 设置搜索参数**

```javascript
// 定义要搜索的关键词和配置
const queries = [
  {
    keyword: '成都旅游攻略',
    category: 'attraction',
    maxResults: 20
  },
  {
    keyword: '成都美食推荐',
    category: 'food',
    maxResults: 15
  },
  {
    keyword: '成都住宿推荐',
    category: 'accommodation',
    maxResults: 10
  }
];

return queries.map(query => ({ json: query }));
```

**3. SYBrowserUse - AI 抓取小红书**

> 🔧 **节点文档**：查看项目 README 了解所有参数和高级用法

```
节点名称：抓取小红书笔记
配置：
- Connection Type: Local Bridge (或 Cloud API)
- Operation: Run Task
- Instructions:
  打开小红书网站 https://www.xiaohongshu.com，
  搜索"{{ $json.keyword }}"，
  提取前 {{ $json.maxResults }} 篇笔记的以下信息：
  - 笔记标题
  - 笔记 ID（从 URL 提取）
  - 作者昵称
  - 点赞数
  - 评论数
  - 笔记内容（前 500 字）
  - 第一张封面图 URL
  - 笔记链接

  只抓取点赞数 > 1000 的笔记。
  返回 JSON 格式，格式为：
  [
    {
      "title": "笔记标题",
      "note_id": "笔记ID",
      "author": "作者",
      "likes": 点赞数,
      "comments": 评论数,
      "content": "内容",
      "image_url": "封面图URL",
      "url": "笔记链接"
    }
  ]

- AI Provider: Anthropic Claude (或 OpenAI)
- Model: claude-3-5-sonnet (或 gpt-4)
- Max Steps: 30
- Wait for completion: true
```

> ⚠️ **注意事项**：
> - 小红书有反爬虫机制，建议使用 Local Bridge 模式
> - 抓取速度不要太快，避免被限流
> - 如果遇到登录验证，可以在指令中让 AI 手动登录

**4. Code - 解析和清洗数据**

```javascript
// 解析 Browser Use 返回的结果
const items = $input.all();
const category = items[0].json.category;
const results = [];

for (const item of items) {
  try {
    // Browser Use 返回的数据在 result 或 output 字段
    const taskResult = item.json.result || item.json.output || item.json;

    // 如果是字符串，尝试解析为 JSON
    let notes = [];
    if (typeof taskResult === 'string') {
      // 提取 JSON 部分（可能包含其他文本）
      const jsonMatch = taskResult.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        notes = JSON.parse(jsonMatch[0]);
      }
    } else if (Array.isArray(taskResult)) {
      notes = taskResult;
    } else if (taskResult.notes) {
      notes = taskResult.notes;
    }

    // 清洗和标准化数据
    for (const note of notes) {
      // 数据验证和清洗
      if (!note.title || !note.note_id) continue;

      // 清理内容中的广告词
      let content = note.content || '';
      const adKeywords = ['广告', '合作', '推广', '联系微信', '购买链接'];
      const hasAd = adKeywords.some(keyword => content.includes(keyword));

      // 提取标签（从内容中提取 #标签）
      const tags = [];
      const tagMatches = content.match(/#[\u4e00-\u9fa5a-zA-Z0-9]+/g);
      if (tagMatches) {
        tags.push(...tagMatches.map(tag => tag.replace('#', '')));
      }

      results.push({
        note_id: note.note_id,
        title: note.title.trim(),
        content: content.trim(),
        author: note.author || '未知',
        likes: parseInt(note.likes) || 0,
        comments: parseInt(note.comments) || 0,
        category: category,
        tags: tags,
        images: note.image_url ? [note.image_url] : [],
        url: note.url || `https://www.xiaohongshu.com/explore/${note.note_id}`,
        has_ad: hasAd,
        raw_data: note
      });
    }
  } catch (error) {
    console.error('解析数据失败:', error);
  }
}

// 按点赞数排序
results.sort((a, b) => b.likes - a.likes);

return results.map(r => ({ json: r }));
```

**5. IF - 过滤广告内容**

```
节点名称：过滤广告
配置：
- Conditions:
  - {{ $json.has_ad }} is false
  - {{ $json.likes }} >= 1000
```

**6. Postgres - 存入数据库（插入或更新）**

```
节点名称：保存到数据库
配置：
- Operation: Insert or Update
- Table: travel_notes
- Columns:
  - note_id = {{ $json.note_id }}
  - title = {{ $json.title }}
  - content = {{ $json.content }}
  - author = {{ $json.author }}
  - likes = {{ $json.likes }}
  - comments = {{ $json.comments }}
  - category = {{ $json.category }}
  - tags = {{ JSON.stringify($json.tags) }}
  - images = {{ JSON.stringify($json.images) }}
  - url = {{ $json.url }}
  - updated_at = NOW()
- On Conflict: note_id
- Update Columns: title, content, likes, comments, tags, images, updated_at
```

这样就完成了第一个工作流：定时抓取小红书攻略并存入数据库！

> 💾 **工作流导出**：完整的工作流配置文件可在项目 workflows 目录下载，可直接导入 N8N 使用。

---

### 4.2 工作流 2：AI 分析与总结

<!--
图片占位：AI 数据分析示意图
原图参考：https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1000&q=80
-->

创建第二个工作流，用于分析数据库中的攻略并生成总结。

#### 节点配置

**1. Manual Trigger - 手动触发**

```
节点名称：手动生成攻略
配置：无需配置，点击执行即可
```

**2. Code - 设置分析参数**

```javascript
// 定义要生成攻略的目的地和偏好
return [{
  json: {
    destination: '成都',
    categories: ['attraction', 'food', 'accommodation'],
    minLikes: 2000,  // 只分析高赞内容
    daysPlanned: 3    // 计划游玩天数
  }
}];
```

**3. Postgres - 查询高质量攻略**

```
节点名称：查询热门攻略
配置：
- Operation: Execute Query
- Query:
  SELECT
    category,
    title,
    content,
    author,
    likes,
    comments,
    tags,
    url
  FROM travel_notes
  WHERE category = ANY(ARRAY[{{ $json.categories.map(c => `'${c}'`).join(',') }}])
    AND likes >= {{ $json.minLikes }}
  ORDER BY likes DESC, created_at DESC
  LIMIT 50;
```

**4. Code - 按类别分组数据**

```javascript
// 按类别分组攻略
const items = $input.all();
const destination = items[0].json.destination;

// 分组数据
const grouped = {
  attraction: [],
  food: [],
  accommodation: []
};

for (const item of items) {
  const category = item.json.category;
  if (grouped[category]) {
    grouped[category].push({
      title: item.json.title,
      content: item.json.content,
      likes: item.json.likes,
      tags: item.json.tags,
      url: item.json.url
    });
  }
}

return [{
  json: {
    destination: destination,
    attractions: grouped.attraction,
    foods: grouped.food,
    accommodations: grouped.accommodation
  }
}];
```

**5. OpenAI / Anthropic - AI 分析景点**

```
节点名称：AI 分析景点推荐
配置：
- Resource: Message / Chat
- Operation: Create / Send
- Model: gpt-4 (或 claude-3-5-sonnet)
- Messages:
  System:
    你是一位专业的旅游顾问，擅长从大量用户游记中提取有价值的信息。
    你的任务是分析小红书上关于{{ $json.destination }}的旅游攻略，
    总结出最值得去的景点，并给出实用建议。

  User:
    以下是从小红书收集的{{ $json.destination }}景点相关攻略（已按点赞数排序）：

    {{ JSON.stringify($json.attractions, null, 2) }}

    请帮我：
    1. 总结出最受欢迎的 TOP 10 景点
    2. 每个景点给出：
       - 推荐理由（为什么值得去？）
       - 游玩时长建议
       - 最佳游览时间
       - 注意事项（如避坑提示）
       - 门票/费用信息（如果提到）
    3. 按照"必去景点"、"推荐景点"、"可选景点"分类

    请以 JSON 格式返回。
```

**6-7. 类似配置 AI 分析美食和住宿**

（配置类似景点分析，针对不同类别调整 Prompt）

**8. Code - 合并所有分析结果**

```javascript
// 合并景点、美食、住宿的分析结果
const items = $input.all();

const attractionsResult = items.find(i => i.json.must_visit);
const foodsResult = items.find(i => i.json.categories);
const accommodationsResult = items.find(i => i.json.budget);

// 解析 JSON（如果是字符串）
const parseResult = (data) => {
  if (typeof data === 'string') {
    const jsonMatch = data.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  }
  return data;
};

const attractions = parseResult(attractionsResult.json);
const foods = parseResult(foodsResult.json);
const accommodations = parseResult(accommodationsResult.json);

return [{
  json: {
    destination: '成都',
    generated_at: new Date().toISOString(),
    attractions: attractions,
    foods: foods,
    accommodations: accommodations
  }
}];
```

**9. OpenAI / Anthropic - 生成最终攻略**

```
节点名称：生成完整旅游攻略
配置：
- System Prompt:
  你是一位资深旅游策划师，擅长设计高质量的旅行路线。
  基于前面分析的数据，为用户生成一份详细的旅游攻略。

- User Prompt:
  我计划去成都旅游 3 天，请根据以下分析结果生成攻略：

  景点分析：{{ JSON.stringify($json.attractions, null, 2) }}
  美食分析：{{ JSON.stringify($json.foods, null, 2) }}
  住宿分析：{{ JSON.stringify($json.accommodations, null, 2) }}

  请生成：
  1. 3 天详细行程安排（每天的景点、用餐、住宿）
  2. 预算估算（分低/中/高预算）
  3. 交通建议（市内交通方式）
  4. 必备物品清单
  5. 特别提示（天气、安全、风俗等）

  请以清晰的 Markdown 格式输出，适合直接保存为旅游指南。
```

**10. Postgres - 保存攻略到数据库**

```
节点名称：保存攻略
配置：
- Operation: Insert
- Table: ai_summaries
- Columns:
  - query = '成都旅游攻略'
  - summary = {{ $json.markdown }}
  - recommendations = {{ JSON.stringify($json) }}
  - generated_at = NOW()
```

**11. 输出选项（可选）**

你可以添加以下任一节点来输出攻略：

- **保存为本地文件**：Write Binary File
- **发送到邮箱**：Email 节点
- **发送到 Notion**：Notion 节点

---

## 五、实际效果展示

<!--
图片占位：数据收集效果展示
原图参考：https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1000&q=80
-->

### 5.1 数据库数据示例

执行工作流后，数据库中的数据：

```sql
-- 查询成都景点攻略
SELECT title, likes, comments, tags
FROM travel_notes
WHERE category = 'attraction'
ORDER BY likes DESC
LIMIT 5;
```

结果示例：

| title | likes | comments | tags |
|-------|-------|----------|------|
| 成都3天2夜保姆级攻略!避雷指南 | 15234 | 892 | {成都旅游, 春熙路, 宽窄巷子} |
| 本地人推荐!成都小众景点合集 | 12890 | 654 | {小众景点, 文艺打卡} |
| 成都熊猫基地最全游玩攻略 | 11567 | 723 | {熊猫基地, 亲子游} |

### 5.2 AI 生成的攻略示例

<!--
图片占位：成都熊猫基地
原图参考：https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=1000&q=80
-->

```markdown
# 成都旅游攻略
> 基于 127 篇小红书真实用户分享，由 AI 智能生成

## 📍 必去景点 TOP 5

### 1. 成都大熊猫繁育研究基地 🐼
**推荐理由**：世界上最大的大熊猫保护研究中心

**游玩时长**：3-4 小时
**最佳时间**：早上 8:00-10:00（熊猫最活跃）
**门票**：55 元

**注意事项**：
- 一定要早去！熊猫上午活跃，下午都在睡觉
- 门口不要买竹子，景区内免费观看喂食
- 建议路线：月亮产房 → 太阳产房 → 成年熊猫区

### 2. 宽窄巷子
**推荐理由**：成都最具代表性的历史文化街区

**游玩时长**：2-3 小时
**最佳时间**：下午 4 点后，避开人流高峰
**门票**：免费

**注意事项**：
- 商业化严重，但拍照很出片
- 推荐小吃：叶儿粑、三大炮
- 避坑：巷子里的茶馆价格较贵

（更多内容省略...）
```

---

## 六、进阶优化与扩展

<!--
图片占位：系统优化升级示意图
原图参考：https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1000&q=80
-->

### 6.1 多目的地支持

修改工作流，支持任意城市：

```javascript
const destinations = [
  { city: '成都', keywords: ['成都旅游', '成都美食', '成都住宿'] },
  { city: '重庆', keywords: ['重庆旅游', '重庆火锅', '重庆民宿'] },
  { city: '西安', keywords: ['西安旅游', '西安美食', '西安住宿'] }
];

return destinations.map(dest => ({ json: dest }));
```

### 6.2 个性化推荐

根据用户偏好过滤：

```javascript
const userPreferences = {
  budget: 'mid_range',        // 'budget' | 'mid_range' | 'luxury'
  travelStyle: 'cultural',    // 'cultural' | 'adventure' | 'relaxation'
  dietaryRestrictions: [],    // ['vegetarian', 'no_spicy']
  interests: ['history', 'food', 'photography']
};
```

### 6.3 实时监控和告警

添加数据质量监控，当抓取质量异常时发送告警。

### 6.4 数据可视化

使用 N8N 的 Dashboard 或对接 Grafana 进行数据可视化。

### 6.5 自动发布到社交媒体

在工作流末尾添加发布节点，自动发布到微信公众号、知乎、博客等平台。

---

## 七、常见问题与解决方案

**Q1：Browser Use 抓取失败，报"反爬虫检测"**

解决方案：
1. 使用 Local Bridge 模式，配置浏览器指纹
2. 添加随机延迟，模拟人类浏览行为
3. 如需登录，在 Instructions 中指示 AI 登录

**Q2：AI 提取的数据格式不一致**

在 Instructions 中严格定义 JSON Schema，并添加格式验证。

**Q3：数据库存储中文乱码**

确保 PostgreSQL 使用 UTF-8 编码。

**Q4：AI 生成的攻略太长，超过 token 限制**

分阶段生成，或使用更大 context window 的模型。

**Q5：如何定期自动更新攻略？**

创建"更新检查"工作流，当新增内容超过阈值时触发重新生成。

---

## 八、成本分析

### 8.1 技术成本

| 服务 | 方案 | 成本 |
|------|------|------|
| **N8N** | 自托管 (Docker) | 免费 |
| **PostgreSQL** | 本地 Docker | 免费 |
| **Browser Use** | Local Bridge | 免费（仅 AI API 费用） |
| **Browser Use** | Cloud API | $0.02-0.05/任务 |
| **AI API** | Claude 3.5 Sonnet | $0.003/1K tokens (input) |

### 8.2 实际使用成本估算

**场景**：抓取成都旅游攻略，生成 3 天行程

- 抓取阶段：约 $0.05-0.10
- 分析阶段：约 $0.15-0.20
- **总成本**：约 $0.25/次

**月度成本**（每天更新）：约 $7.5/月

相比人工收集整理（至少 2-3 小时），成本极低！

---

## 九、安全与隐私

### 9.1 数据安全

- ✅ **本地存储**：所有数据存在自己的数据库，不上传第三方
- ✅ **API Key 保护**：使用 N8N 的 Credentials 系统，加密存储
- ✅ **访问控制**：N8N 设置密码保护，避免未授权访问

### 9.2 遵守法律法规

- ⚠️ **小红书用户协议**：爬取数据仅供个人使用，不得商业用途
- ⚠️ **频率控制**：不要高频抓取，避免对平台造成压力
- ⚠️ **版权声明**：生成的攻略应注明数据来源于小红书用户分享

### 9.3 伦理使用建议

- ✅ 尊重原创者，引用时注明来源
- ✅ 用于个人旅行规划，不用于商业推广
- ✅ 发现有价值的内容，可以给原作者点赞支持

---

## 总结

<!--
图片占位：智能旅行新时代
原图参考：https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1000&q=80
-->

### 我们实现了什么？

通过这个项目，我们构建了一个完整的 **AI 驱动的旅游攻略收集系统**：

- ✅ **自动化**：无需手动浏览，AI 自动抓取小红书攻略
- ✅ **智能化**：AI 理解内容，提取关键信息，生成个性化攻略
- ✅ **结构化**：数据存入数据库，方便查询和二次利用
- ✅ **可扩展**：可适配其他平台（马蜂窝、抖音）和场景

### 技能收获

通过这个实战项目，你掌握了：

- N8N 工作流的高级用法（多节点协作、数据流转）
- Browser Use AI 浏览器自动化实战
- Docker 部署和管理数据库
- 与 AI API（OpenAI/Claude）的深度集成
- 数据清洗、分析和可视化的完整流程

### 未来扩展方向

1. **多平台聚合**：同时抓取小红书、马蜂窝、抖音、B 站的攻略
2. **实时更新**：监控热门话题，第一时间获取最新攻略
3. **社交分享**：自动发布到朋友圈、公众号、博客
4. **路线规划**：集成地图 API，生成最优游览路线
5. **AI 对话助手**：做成聊天机器人，随时询问旅游问题

### 写在最后

AI 时代，**信息获取不再是问题，信息的整理和利用才是关键**。

这个项目展示了如何用 AI 和自动化工具，把散落在互联网上的碎片信息，转化为真正有价值的知识。

希望这篇教程能激发你的灵感，去创造更多有趣的自动化项目！

---

## 相关资源

| 资源 | 链接 |
|------|------|
| 本项目源码 | github.com/Cshiyuan/n8n-nodes-sy-browseruse |
| N8N 官方文档 | docs.n8n.io |
| 系列文章 | 公众号内搜索"N8N" |

**相关文章：**
- 《AI连接一切？N8N 入门到上手》
- 《n8n 自定义节点开发完全指南》

---

## 关于作者

**Cshiyuan** - 专注于 AI 自动化和效率工具开发

- 📧 邮箱：826718591@qq.com
- 🐙 GitHub：github.com/Cshiyuan
- 💬 问题反馈：GitHub Issues

---

**如果觉得有帮助：**
- 👍 点个「赞」支持一下
- 👀 点击「在看」让更多人看到
- 💬 有问题欢迎「留言」讨论
- ⭐ 给 GitHub 项目点个 Star

---

*本文首发于微信公众号，转载请注明出处*

**最后更新**：2025-12-10

> 💡 **声明**：本教程仅用于学习和个人使用，请遵守相关平台的用户协议和法律法规。

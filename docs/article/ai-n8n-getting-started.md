# AI 连接一切？N8N 入门到上手

<!--
封面图建议：AI 与自动化工作流主题
原图参考：https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80
需要下载后上传到微信素材库
-->

> 从 0 到 1，带你玩转 N8N 自动化工作流，解锁 AI 时代的效率密码

---

## 本文概要

| 项目 | 内容 |
|------|------|
| **阅读时长** | 约 20 分钟 |
| **难度等级** | ⭐⭐ 入门级 |
| **适合人群** | 开发者、运营、产品经理、效率爱好者 |

**本文要点：**
- N8N 是什么，为什么选它
- 3 分钟 Docker 快速部署
- 5 分钟创建第一个工作流
- 自定义节点开发入门
- AI 浏览器自动化实战

---

## 写在前面

你有没有遇到过这些场景？

- 每天要手动从 Excel 导数据到 CRM 系统，重复劳动让人崩溃
- 需要定时抓取网站数据，写爬虫太麻烦，在线工具又不够灵活
- 想让 AI 帮你自动浏览网页、填写表单，却不知道从何下手
- 老板要求整合十几个系统的数据，每个都要写代码对接

如果你点头了，那这篇文章就是为你准备的。

今天我们要聊的 **N8N**，可能是你见过最"懂人性"的自动化工具——它不仅能连接一切，还能让 AI 为你打工！

---

## 一、N8N 是什么？为什么选它？

### 1.1 用人话说 N8N

**N8N**（读作 nodemation）是一个**开源的工作流自动化平台**，简单来说就是：

> 把重复的工作交给机器，让你专注于更有价值的事情。

它的核心理念是"节点式编程"——通过拖拽各种功能节点（比如读取数据、发送邮件、调用 API），用连线把它们串起来，就能搭建出强大的自动化流程。

<!--
图片占位：N8N 工作流界面截图
建议自己截取 N8N 界面图，展示节点连接效果
-->

### 1.2 为什么选 N8N？

市面上自动化工具不少（Zapier、Make、Power Automate），为什么偏偏选 N8N？

| 特性 | N8N | Zapier/Make | 纯代码开发 |
|------|-----|-------------|-----------|
| **开源免费** | ✅ 完全开源 | ❌ 付费订阅 | ✅ 免费 |
| **数据隐私** | ✅ 自己部署，数据可控 | ❌ 数据在第三方 | ✅ 自己掌控 |
| **学习成本** | 🟡 可视化 + 代码 | 🟢 纯可视化 | 🔴 需要编程基础 |
| **扩展性** | ✅ 可自定义节点 | ❌ 受限于平台 | ✅ 完全自定义 |
| **AI 集成** | ✅ 原生支持 | 🟡 部分支持 | 🟡 需自行开发 |

**简单说**：
- 如果你是个人开发者或小团队，预算有限但想要完全掌控 → **选 N8N**
- 如果你不想写代码，也不在乎每月几十美金 → 选 Zapier
- 如果你是技术大牛，追求极致性能 → 自己写代码

### 1.3 N8N 的"杀手锏"功能

N8N 最让人兴奋的是它的**可扩展性**：

- ✅ **400+ 内置节点**：GitHub、Google Sheets、Slack、OpenAI、数据库...该有的都有
- ✅ **自定义节点**：可以开发自己的节点，封装业务逻辑
- ✅ **AI 驱动**：内置 AI Agent 节点，还能集成 LangChain
- ✅ **浏览器自动化**：通过自定义节点（比如本项目的 `SYBrowserUse`），让 AI 帮你操作浏览器！

> 💡 **本文配套项目**：n8n-nodes-sy-browseruse - 开源的 AI 浏览器自动化节点，让你的 N8N 拥有智能操作网页的能力！
>
> GitHub：github.com/Cshiyuan/n8n-nodes-sy-browseruse

---

## 二、快速开始：3 分钟部署 N8N

<!--
图片占位：Docker 容器化部署示意图
原图参考：https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1000&q=80
-->

### 2.1 方式一：Docker 一键部署（推荐）

如果你已经安装了 Docker，部署 N8N 只需要一行命令：

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**解释一下**：
- `-p 5678:5678`：映射端口，访问 `http://localhost:5678` 即可
- `-v ~/.n8n:/home/node/.n8n`：数据持久化，重启 Docker 不丢失工作流

运行后，打开浏览器访问 `http://localhost:5678`，你会看到 N8N 的欢迎界面。

<!--
图片占位：N8N 欢迎界面截图
建议自己截取实际界面
-->

**首次使用需要注册账号**（本地账号，数据不上传），填写邮箱和密码即可。

### 2.2 方式二：npm 全局安装

如果你更喜欢用 Node.js：

```bash
# 安装 N8N
npm install n8n -g

# 启动 N8N
n8n start
```

同样，访问 `http://localhost:5678` 即可使用。

### 2.3 生产环境部署（可选）

如果你想在服务器上长期运行 N8N，推荐使用 Docker Compose：

```yaml
# docker-compose.yml
version: '3'
services:
  n8n:
    image: n8nio/n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_password
      - N8N_HOST=your-domain.com
      - N8N_PROTOCOL=https
      - N8N_PORT=5678
      - WEBHOOK_URL=https://your-domain.com/
    volumes:
      - ~/.n8n:/home/node/.n8n
```

运行 `docker-compose up -d` 即可后台启动。

> ⚠️ **生产环境注意事项**：
> - 务必配置 HTTPS（使用 Nginx + Let's Encrypt）
> - 开启身份验证，避免数据泄露
> - 定期备份 `~/.n8n` 目录

---

## 三、第一个工作流：5 分钟上手

<!--
图片占位：可视化工作流编排示意图
原图参考：https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&q=80
-->

### 3.1 创建你的第一个 Workflow

登录 N8N 后，点击右上角的 **"New Workflow"**，你会看到一个空白画布和一个 **"Start"** 节点。

我们来做一个简单的示例：**每天定时获取 GitHub 热门仓库，发送到 Slack**。

#### 步骤 1：添加定时触发器

1. 点击 **Start** 节点旁的 `+` 号
2. 搜索 `Schedule Trigger`，选择它
3. 配置触发时间（比如每天早上 9 点）

#### 步骤 2：调用 GitHub API

1. 点击上一个节点的 `+` 号
2. 搜索 `HTTP Request`，选择它
3. 配置：
   - **Method**：GET
   - **URL**：`https://api.github.com/search/repositories?q=stars:>1000&sort=stars&order=desc`
   - 这个 API 会返回 GitHub 上 star 最多的仓库

#### 步骤 3：处理数据

1. 添加 `Code` 节点
2. 编写 JavaScript 代码提取仓库名称：

```javascript
// 获取上一个节点的数据
const data = $input.all();
const repos = data[0].json.items;

// 提取前 5 个仓库
const topRepos = repos.slice(0, 5).map(repo => ({
  name: repo.full_name,
  stars: repo.stargazers_count,
  url: repo.html_url
}));

return topRepos.map(repo => ({ json: repo }));
```

#### 步骤 4：发送到 Slack

1. 添加 `Slack` 节点
2. 选择 **"Send Message"** 操作
3. 连接你的 Slack 账号（会弹出 OAuth 授权）
4. 配置消息格式：

```
今日 GitHub 热门仓库：
{{ $json.name }} - ⭐ {{ $json.stars }}
{{ $json.url }}
```

#### 步骤 5：测试运行

点击右上角的 **"Execute Workflow"**，N8N 会立即运行工作流，你会看到每个节点的执行结果。

如果一切顺利，你的 Slack 频道会收到一条消息！🎉

### 3.2 工作流的核心概念

在 N8N 中，你需要理解几个核心概念：

**1. 节点（Node）**

每个节点代表一个操作：
- **Trigger 节点**：触发工作流（定时、Webhook、手动）
- **数据节点**：读取/写入数据（数据库、API、文件）
- **逻辑节点**：条件判断、循环、合并数据
- **Action 节点**：执行操作（发邮件、发通知、调用服务）

**2. 连接（Connection）**

用线连接节点，数据会从上一个节点流向下一个。

**3. 表达式（Expression）**

N8N 支持用 `{{ }}` 引用数据：
- `{{ $json.name }}`：获取当前项的 name 字段
- `{{ $node["HTTP Request"].json.data }}`：获取特定节点的数据
- `{{ new Date().toISOString() }}`：使用 JavaScript 表达式

**4. 执行模式**
- **测试执行**：点击按钮手动运行，查看结果
- **生产执行**：激活工作流，按触发器自动运行

---

## 四、进阶：定制化开发你的节点

### 4.1 为什么要开发自定义节点？

N8N 虽然有 400+ 节点，但有些场景还是需要自己动手：

- ✅ **内部系统对接**：公司的 ERP、CRM 等内部系统
- ✅ **复杂业务逻辑**：需要封装成可复用的节点
- ✅ **新兴服务**：N8N 还未支持的第三方 API
- ✅ **性能优化**：频繁使用的操作优化为专用节点

### 4.2 环境准备

开发 N8N 节点需要：

```bash
# 1. 安装 Node.js（推荐 v18 或更高）
node -v  # 检查版本

# 2. 安装 N8N CLI 工具
npm install -g @n8n/node-cli

# 3. 初始化项目
npx @n8n/node-cli init

# 4. 输入项目信息
# Package name: n8n-nodes-my-awesome-tool
# Node name: MyAwesomeTool
# Author: Your Name

cd n8n-nodes-my-awesome-tool
npm install
```

### 4.3 节点开发三件套

N8N 节点开发遵循"三层架构"：

**1. 节点定义层（`*.node.ts`）**

定义节点的外观和参数：

```typescript
// nodes/MyAwesomeTool/MyAwesomeTool.node.ts
import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class MyAwesomeTool implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'My Awesome Tool',
    name: 'myAwesomeTool',
    group: ['transform'],
    version: 1,
    description: '我的超级节点',
    defaults: { name: 'My Awesome Tool' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          { name: 'Do Something', value: 'doSomething' },
        ],
        default: 'doSomething',
      },
    ],
  };

  async execute(this: IExecuteFunctions) {
    // 调用操作实现层
    return await executeOperation(this);
  }
}
```

**2. 操作实现层（`operations.ts`）**

实现具体的业务逻辑：

```typescript
// nodes/MyAwesomeTool/operations.ts
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

export async function executeOperation(
  context: IExecuteFunctions
): Promise<INodeExecutionData[][]> {
  const items = context.getInputData();
  const returnData: INodeExecutionData[] = [];

  for (let i = 0; i < items.length; i++) {
    const operation = context.getNodeParameter('operation', i) as string;
    const inputText = context.getNodeParameter('inputText', i) as string;

    if (operation === 'doSomething') {
      const result = inputText.toUpperCase();
      returnData.push({
        json: { result },
        pairedItem: { item: i },
      });
    }
  }

  return [returnData];
}
```

**3. 传输层（`transport.ts`）**

封装 API 调用：

```typescript
// nodes/MyAwesomeTool/transport.ts
import { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';

export async function callExternalApi(
  context: IExecuteFunctions,
  endpoint: string,
  data: any
): Promise<any> {
  const options: IHttpRequestOptions = {
    method: 'POST',
    url: `https://api.example.com${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data,
  };

  return await context.helpers.httpRequest(options);
}
```

### 4.4 本地测试你的节点

开发完成后，如何在本地 N8N 中测试？

```bash
# 1. 编译项目
npm run build

# 2. 链接到本地 N8N
npm link

# 3. 在 N8N 数据目录安装
cd ~/.n8n
npm link n8n-nodes-my-awesome-tool

# 4. 重启 N8N
n8n start
```

现在打开 N8N，搜索你的节点，就能看到它了！

### 4.5 发布到 npm

测试无误后，发布到 npm 供全世界使用：

```bash
# 1. 登录 npm
npm login

# 2. 发布包
npm publish

# 3. 其他人安装
# 在 N8N 界面 Settings > Community Nodes > Install
# 输入: n8n-nodes-my-awesome-tool
```

---

## 五、实战：AI 浏览器自动化

<!--
图片占位：AI 机器人自动化示意图
原图参考：https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1000&q=80
-->

### 5.1 场景：让 AI 帮你操作浏览器

想象一个场景：你需要每天登录公司的报销系统，填写一堆表单，重复且枯燥。能不能让 AI 自动完成？

答案是：**可以！**

通过 `SYBrowserUse` 节点（本项目开发的自定义节点），你可以用自然语言指挥 AI 操作浏览器。

### 5.2 安装 SYBrowserUse 节点

> 📦 **开源项目**：SYBrowserUse 是本文作者开发的开源节点
>
> GitHub：github.com/Cshiyuan/n8n-nodes-sy-browseruse

**安装方式 1：从 GitHub 直接安装**（推荐）

```bash
# 在 N8N 数据目录
cd ~/.n8n

# 从 GitHub 直接安装
npm install github:Cshiyuan/n8n-nodes-sy-browseruse

# 重启 N8N
n8n start
```

**安装方式 2：克隆源码本地安装**

```bash
# 克隆项目
git clone https://github.com/Cshiyuan/n8n-nodes-sy-browseruse.git
cd n8n-nodes-sy-browseruse

# 安装依赖并构建
npm install
npm run build

# 链接到 N8N
npm link

# 在 N8N 数据目录链接
cd ~/.n8n
npm link n8n-nodes-sy-browseruse

# 重启 N8N
n8n start
```

> 💡 **提示**：项目即将发布到 npm，届时可通过 `npm install n8n-nodes-sy-browseruse` 一键安装

### 5.3 配置 Browser Use API

`SYBrowserUse` 支持两种模式：

**1. Cloud API 模式（推荐新手）**

1. 访问 Browser Use Cloud（browseruse.com）注册账号
2. 获取 API Key
3. 在 N8N 中添加凭据：
   - Credentials > New > Browser Use Cloud API
   - 填入 API Key

**2. Local Bridge 模式（本地运行）**

如果你想在本地运行浏览器自动化：

```bash
# 安装 browser-use Python 包
pip install browser-use

# 启动本地桥接服务
browser-use bridge --port 8000
```

在 N8N 中配置：
- Credentials > New > Browser Use Local Bridge API
- Bridge URL：`http://localhost:8000`

### 5.4 创建 AI 浏览器工作流

> 🔍 **更多示例**：查看项目 workflows 示例目录获取更多实战工作流配置

**示例 1：AI 自动搜索并整理信息**

创建一个新工作流：

1. **添加 Schedule Trigger**：每天早上 9 点触发
2. **添加 SYBrowserUse 节点**：
   - Operation：`Run Task`
   - Instructions：
     ```
     打开 Google，搜索"2024 年最佳 AI 工具"，
     提取前 5 个搜索结果的标题和链接
     ```
   - AI Provider：`Anthropic Claude`（或 OpenAI、Google）
3. **添加 Google Sheets 节点**：将结果写入表格

点击 Execute，AI 会自动：
1. 打开浏览器
2. 访问 Google
3. 输入搜索词
4. 提取结果
5. 返回结构化数据

**示例 2：自动填写表单**

```
Instructions：
打开 https://example.com/apply，
填写以下信息：
- 姓名：张三
- 邮箱：zhangsan@example.com
- 申请原因：学习 N8N 自动化
最后点击提交按钮
```

AI 会理解你的指令，自动完成所有操作！

### 5.5 SYBrowserUse 支持的操作

| 操作 | 说明 | 使用场景 |
|------|------|---------|
| `Run Task` | 执行浏览器任务 | 自动化任何网页操作 |
| `Get Task Status` | 查询任务状态 | 监控长时间任务 |
| `Stop Task` | 停止任务 | 紧急中断 |
| `Pause Task` | 暂停任务 | 需要人工介入 |
| `Resume Task` | 恢复任务 | 继续执行 |
| `Get Task Media` | 获取截图/录屏 | 调试和记录 |

### 5.6 多 AI 提供商支持

`SYBrowserUse` 支持多家 AI 提供商：

- **Anthropic Claude**：推理能力强，适合复杂任务
- **OpenAI GPT-4**：通用性好，响应快
- **Google Gemini**：免费额度高
- **Mistral**：开源模型
- **OpenRouter**：聚合多个模型
- **Custom**：自定义 API 端点

在节点配置中选择 AI Provider，填入对应的 API Key 即可。

---

## 六、N8N 最佳实践

### 6.1 工作流设计原则

**1. 单一职责**

每个工作流只做一件事，避免过于复杂。

❌ **不推荐**：
```
一个工作流同时：抓取数据 + 处理数据 + 发送邮件 + 更新数据库 + 生成报表
```

✅ **推荐**：
```
工作流 1：抓取数据 → 存入数据库
工作流 2：定时读取数据库 → 生成报表 → 发送邮件
```

**2. 错误处理**

使用 `Error Trigger` 节点捕获错误，发送告警。

**3. 数据验证**

在关键节点添加 `IF` 节点，验证数据格式。

### 6.2 性能优化

**1. 批量处理**

避免在循环中逐个调用 API，使用批量接口。

**2. 缓存机制**

使用 `Set` 和 `Get` 节点缓存常用数据。

**3. 限速控制**

调用第三方 API 时，使用 `Wait` 节点避免触发限流。

### 6.3 安全建议

1. **凭据管理**：永远不要在工作流中硬编码 API Key，使用 Credentials
2. **权限控制**：生产环境开启身份验证和 Webhook 签名验证
3. **数据加密**：敏感数据使用 `Crypto` 节点加密
4. **定期审计**：查看执行日志，发现异常行为

---

## 七、常见问题 FAQ

**Q1：N8N 免费吗？**

N8N 有两个版本：
- **开源版**：完全免费，自己部署
- **N8N Cloud**：官方托管，有免费套餐（每月 5,000 次执行），付费套餐 $20/月起

**Q2：N8N 和 Zapier 哪个好？**

- **预算紧张、重视隐私** → N8N
- **不想折腾、追求稳定** → Zapier
- **需要深度定制** → N8N

**Q3：自定义节点开发难吗？**

如果你会 TypeScript，难度不高：
- 简单节点：1-2 小时
- 复杂节点（多操作、OAuth 认证）：1-2 天

**Q4：N8N 能处理大数据量吗？**

N8N 更适合**中小规模自动化**（每次处理几千条数据）。如果是百万级数据处理，建议使用专业的 ETL 工具（Airflow、Dagster）。

**Q5：如何监控工作流运行状态？**

- 查看 Execution History
- 配置 Error Workflow 发送告警
- 使用 Webhook 节点推送状态到监控系统

**Q6：SYBrowserUse 支持哪些浏览器？**

基于 Playwright，支持：Chromium（推荐）、Firefox、WebKit

**Q7：AI 浏览器自动化的成本？**

- **Cloud API**：按任务计费，约 $0.01-0.05/任务
- **Local Bridge**：免费，但需要自己提供 AI API（OpenAI、Anthropic 等）

---

## 八、学习资源

### 官方资源
- **N8N 官方文档**：docs.n8n.io
- **N8N YouTube 频道**：youtube.com/@n8n-io
- **N8N 社区论坛**：community.n8n.io

### 推荐教程
- N8N 101：零基础入门（docs.n8n.io/courses/level-one/）
- 自定义节点开发指南（docs.n8n.io/integrations/creating-nodes/）
- 工作流模板库（n8n.io/workflows/）

### 开源项目
- **N8N 官方仓库**：github.com/n8n-io/n8n
- **社区节点集合**：npmjs.com/search?q=n8n-nodes
- **本项目（AI 浏览器自动化）**：github.com/Cshiyuan/n8n-nodes-sy-browseruse

---

## 总结

### N8N 能给你带来什么？

通过这篇文章，我们从 0 到 1 搭建了 N8N，创建了第一个工作流，甚至开发了自定义节点。

N8N 不仅仅是一个自动化工具，它更是一个**效率倍增器**：

- ✅ **解放双手**：重复工作交给机器，你专注于创造性工作
- ✅ **降低门槛**：可视化 + 代码，技术和非技术人员都能用
- ✅ **无限扩展**：开源架构，想做什么就做什么
- ✅ **AI 赋能**：结合 AI，实现真正的智能自动化

### AI 连接一切的时代

我们正处在一个激动人心的时代：

- AI 不再只是聊天机器人，它可以操作浏览器、处理文档、调用 API
- 自动化不再是程序员的专利，每个人都能搭建自己的"AI 员工"
- 数据不再孤立，N8N 让一切系统互联互通

想象一下未来的工作场景：

> 早上 9 点，AI 自动抓取行业新闻，整理成摘要发给你；
> 客户在网站填写表单，AI 自动分类并分配给对应销售；
> 每周五下午，AI 汇总本周数据，生成可视化报表...

这不是科幻，这就是 N8N + AI 能实现的现实。

### 下一步行动

1. 🚀 **动手尝试**：用 Docker 部署 N8N，创建第一个工作流
2. 🎯 **探索可能**：思考工作中哪些重复任务可以自动化
3. 💡 **加入社区**：在 N8N 社区分享你的工作流和节点
4. ⭐ **持续学习**：关注本项目的更新，体验最新的 AI 浏览器自动化功能

---

## 相关资源

| 资源 | 链接 |
|------|------|
| 本项目源码 | github.com/Cshiyuan/n8n-nodes-sy-browseruse |
| N8N 官方文档 | docs.n8n.io |
| 系列文章 | 公众号内搜索"N8N" |

---

## 关于作者

**Cshiyuan** - 专注于 AI 自动化和效率工具开发

- 📧 邮箱：826718591@qq.com
- 🐙 GitHub：github.com/Cshiyuan

---

**如果觉得有帮助：**
- 👍 点个「赞」支持一下
- 👀 点击「在看」让更多人看到
- 💬 有问题欢迎「留言」讨论
- ⭐ 给 GitHub 项目点个 Star

---

*本文首发于微信公众号，转载请注明出处*

**最后更新**：2025-12-10

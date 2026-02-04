# n8n 自定义节点开发完全指南

<!--
封面图建议：代码与开发主题
原图参考：https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80
需要下载后上传到微信素材库
-->

> 从零开始，手把手教你开发 n8n 自定义节点，扩展工作流自动化能力

---

## 本文概要

| 项目 | 内容 |
|------|------|
| **阅读时长** | 约 25 分钟 |
| **难度等级** | ⭐⭐⭐ 进阶级 |
| **适合人群** | 有 TypeScript 基础的开发者 |

**本文要点：**
- n8n 是什么及其核心特性
- 为什么要开发自定义节点
- 节点开发三层架构详解
- 凭据系统与安全认证
- 完整的开发、测试、发布流程
- 实战案例：AI 浏览器自动化节点

**前置知识：**
- TypeScript 基础语法
- Node.js 开发经验
- 了解 n8n 基本概念（可先阅读入门文章）

---

## 一、什么是 n8n？

### 1.1 概述

**n8n**（nodemation）是一个开源的工作流自动化工具，采用公平代码许可证（Fair-code License）。它允许你通过可视化的方式连接各种应用程序和服务，创建强大的自动化工作流，无需编写复杂的代码。

### 1.2 核心特性

**1. 可视化工作流编辑器**
- 节点式编程：通过拖拽节点和连接线创建工作流
- 实时预览：即时查看每个节点的执行结果
- 调试功能：轻松追踪数据流和排查问题

**2. 丰富的集成能力**
- 400+ 内置节点：支持 GitHub、Google Sheets、Slack、Notion 等主流服务
- HTTP 请求：支持任何具有 API 的服务
- Webhook：接收和响应外部事件
- 自定义节点：可以创建专属的节点扩展功能

**3. 灵活的部署方式**
- 自托管：完全控制数据和隐私
- n8n Cloud：官方托管服务，开箱即用
- Docker：容器化部署，易于维护

**4. 强大的数据处理**
- JavaScript 表达式：在节点中直接编写 JS 代码处理数据
- 数据转换：内置函数处理 JSON、日期、文本等
- 分支和循环：支持条件判断和批量处理

### 1.3 使用场景

n8n 适用于各种自动化场景：

- **数据同步**：在不同系统之间同步数据（如 CRM 到 Google Sheets）
- **通知和提醒**：监控事件并发送通知（如 GitHub issue 提醒到 Slack）
- **数据处理**：定时抓取、清洗和分析数据
- **API 集成**：连接多个 API 创建复杂的业务流程
- **内容管理**：自动化发布和更新内容
- **监控和告警**：监控服务状态并自动响应

### 1.4 为什么选择 n8n？

**vs Zapier / Make（Integromat）**
- ✅ **开源**：代码完全开放，可自定义
- ✅ **自托管**：数据留在自己的服务器上
- ✅ **无限制**：没有执行次数或功能限制
- ✅ **成本低**：自托管版本免费使用

**vs 纯代码自动化**
- ✅ **可视化**：工作流一目了然，易于理解和维护
- ✅ **快速开发**：拖拽式操作，大幅减少开发时间
- ✅ **团队协作**：非技术人员也能参与工作流设计
- ✅ **内置集成**：无需从零实现常用服务的集成

---

## 二、n8n 自定义节点开发

### 2.1 为什么要开发自定义节点？

虽然 n8n 提供了 400+ 内置节点，但在以下情况下，你可能需要开发自定义节点：

1. **内部系统集成**：连接公司内部的 API 或服务
2. **专有服务**：集成尚未被 n8n 官方支持的第三方服务
3. **复杂业务逻辑**：封装特定的业务流程为可复用节点
4. **性能优化**：将频繁使用的操作优化为专用节点
5. **社区贡献**：开发开源节点分享给 n8n 社区

> 💡 **参考项目**：本文基于实际开源项目 n8n-nodes-sy-browseruse 编写，包含完整的节点开发示例。
>
> GitHub：github.com/Cshiyuan/n8n-nodes-sy-browseruse

### 2.2 技术栈要求

开发 n8n 自定义节点需要以下技术：

- **TypeScript**：n8n 节点使用 TypeScript 开发
- **Node.js**：n8n 运行在 Node.js 环境
- **n8n-workflow**：n8n 提供的核心类型和工具
- **@n8n/node-cli**：官方节点开发工具链

### 2.3 项目结构

一个典型的 n8n 社区节点包结构如下：

```
n8n-nodes-my-package/
├── package.json              # npm 包配置
├── tsconfig.json             # TypeScript 配置
├── nodes/                    # 节点实现目录
│   └── MyNode/
│       ├── MyNode.node.ts    # 节点定义
│       ├── operations.ts     # 操作实现
│       └── transport.ts      # API 通信层
├── credentials/              # 凭据定义目录
│   └── MyApi.credentials.ts  # API 凭据
└── icons/                    # 节点图标
    └── mynode.svg
```

---

## 三、节点开发三层架构

<!--
图片占位：三层架构示意图
原图参考：https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&q=80
建议自己绘制架构图
-->

n8n 节点遵循清晰的三层架构模式：

### 3.1 节点定义层（`*.node.ts`）

这是节点的入口文件，定义节点的外观和行为。

```typescript
import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class MyNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'My Node',           // 节点显示名称
    name: 'myNode',                   // 节点内部名称
    group: ['transform'],             // 节点分组
    version: 1,                       // 节点版本
    description: 'My custom node',    // 节点描述
    defaults: {
      name: 'My Node',
    },
    inputs: ['main'],                 // 输入端点
    outputs: ['main'],                // 输出端点
    credentials: [                    // 凭据配置
      {
        name: 'myApi',
        required: true,
      },
    ],
    properties: [                     // 节点参数
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          { name: 'Get', value: 'get' },
          { name: 'Create', value: 'create' },
        ],
        default: 'get',
      },
    ],
  };

  // 节点执行方法
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // 调用操作实现层
  }
}
```

**关键配置说明：**

| 属性 | 说明 |
|------|------|
| `displayName` | 用户在界面中看到的名称 |
| `name` | 代码中使用的唯一标识符 |
| `properties` | 定义节点的可配置参数 |
| `credentials` | 指定需要的认证凭据 |
| `execute` | 节点的核心执行逻辑 |

> 📦 **完整示例**：查看 SYBrowserUse 节点源码了解实际项目中的节点定义
>
> 路径：nodes/SYBrowserUse/SYBrowserUse.node.ts

### 3.2 操作实现层（`operations.ts`）

负责具体的业务逻辑实现。

```typescript
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

export async function executeGetOperation(
  context: IExecuteFunctions,
  itemIndex: number
): Promise<INodeExecutionData> {
  // 1. 获取用户输入的参数
  const resourceId = context.getNodeParameter('resourceId', itemIndex) as string;

  // 2. 参数验证
  if (!resourceId) {
    throw new NodeOperationError(
      context.getNode(),
      'Resource ID is required',
      { itemIndex }
    );
  }

  // 3. 调用 API
  const response = await makeApiRequest(context, 'GET', `/resource/${resourceId}`);

  // 4. 返回标准格式
  return {
    json: response,
    pairedItem: { item: itemIndex },
  };
}
```

**最佳实践：**
- ✅ 清晰的参数提取和验证
- ✅ 使用 `NodeOperationError` 抛出错误
- ✅ 返回标准的 `INodeExecutionData` 格式
- ✅ 包含 `pairedItem` 用于追踪数据来源

### 3.3 传输层（`transport.ts`）

封装 API 调用和错误处理。

```typescript
import { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';

export async function makeApiRequest(
  context: IExecuteFunctions,
  method: string,
  endpoint: string,
  body?: any
): Promise<any> {
  // 1. 获取凭据
  const credentials = await context.getCredentials('myApi');

  // 2. 构建请求
  const options: IHttpRequestOptions = {
    method,
    url: `https://api.example.com${endpoint}`,
    headers: {
      'Authorization': `Bearer ${credentials.apiKey}`,
      'Content-Type': 'application/json',
    },
    body,
  };

  // 3. 发送请求
  try {
    const response = await context.helpers.httpRequest(options);
    return response;
  } catch (error) {
    // 4. 错误处理
    throw new NodeApiError(context.getNode(), error);
  }
}
```

**关键点：**
- 使用 `context.helpers.httpRequest` 发送 HTTP 请求
- 统一的错误处理和转换
- 认证信息从凭据系统获取
- 支持不同的 HTTP 方法

---

## 四、凭据系统

凭据用于安全地存储 API 密钥、令牌等敏感信息。

```typescript
import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class MyApiCredentials implements ICredentialType {
  name = 'myApi';
  displayName = 'My API';
  documentationUrl = 'https://docs.example.com/api';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,  // 隐藏输入
      },
      default: '',
      required: true,
    },
  ];

  // 自动注入认证头
  authenticate = {
    type: 'generic',
    properties: {
      headers: {
        'Authorization': '={{`Bearer ${$credentials.apiKey}`}}',
      },
    },
  };

  // 凭据测试
  test = {
    request: {
      baseURL: 'https://api.example.com',
      url: '/ping',
    },
  };
}
```

**凭据类型：**

| 类型 | 说明 |
|------|------|
| API Key | 简单的密钥认证 |
| OAuth2 | 标准 OAuth2 授权流程 |
| Basic Auth | 用户名和密码 |
| Custom | 自定义认证方式 |

---

## 五、开发工具链

### 5.1 初始化项目

```bash
# 安装 n8n CLI 工具
npm install -g @n8n/node-cli

# 创建新项目
npx @n8n/node-cli init

# 进入项目目录
cd n8n-nodes-my-package

# 安装依赖
npm install
```

### 5.2 开发命令

```bash
# 开发模式 - 监听文件变化
npm run dev

# 构建项目
npm run build

# 代码检查
npm run lint

# 自动修复 lint 问题
npm run lint:fix
```

### 5.3 本地测试

```bash
# 启动 n8n 并加载自定义节点
n8n start

# 或使用 Docker
docker run -it --rm \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  -v $(pwd):/data \
  n8nio/n8n
```

---

## 六、package.json 配置

n8n 节点包需要特殊的 `package.json` 配置：

```json
{
  "name": "n8n-nodes-my-package",
  "version": "1.0.0",
  "description": "My custom n8n nodes",
  "keywords": ["n8n-community-node-package"],
  "license": "MIT",
  "scripts": {
    "build": "n8n-node build",
    "dev": "n8n-node dev",
    "lint": "n8n-node lint",
    "lint:fix": "n8n-node lint --fix"
  },
  "files": ["dist"],
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/MyApi.credentials.js"
    ],
    "nodes": [
      "dist/nodes/MyNode/MyNode.node.js"
    ]
  },
  "devDependencies": {
    "@n8n/node-cli": "*",
    "typescript": "~5.9.2"
  },
  "peerDependencies": {
    "n8n-workflow": "*"
  }
}
```

**关键字段：**

| 字段 | 说明 |
|------|------|
| `keywords` | 必须包含 `"n8n-community-node-package"` |
| `n8n.credentials` | 凭据文件列表（编译后的路径） |
| `n8n.nodes` | 节点文件列表（编译后的路径） |
| `files` | 发布到 npm 的文件（只包含 `dist`） |

---

## 七、实战案例：浏览器自动化节点

<!--
图片占位：AI 浏览器自动化示意图
原图参考：https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1000&q=80
-->

以本项目中的 `SYBrowserUse` 节点为例，它实现了 AI 驱动的浏览器自动化：

### 7.1 节点特性

- **双模式架构**：支持 Cloud API 和 Local Bridge 两种连接方式
- **8 种操作**：Run Task、Get Task Status、Stop Task 等
- **多 AI 提供商**：支持 OpenAI、Anthropic、Google 等
- **动态配置**：根据连接类型显示不同的参数

### 7.2 关键实现

**节点定义 - 双模式配置：**

```typescript
export class SYBrowserUse implements INodeType {
  description: INodeTypeDescription = {
    // ...
    properties: [
      {
        displayName: 'Connection Type',
        name: 'connectionType',
        type: 'options',
        options: [
          { name: 'Cloud API', value: 'cloud' },
          { name: 'Local Bridge', value: 'localBridge' },
        ],
        default: 'cloud',
      },
      // 根据 connectionType 动态显示凭据
      {
        displayName: 'Credentials',
        name: 'credentials',
        type: 'credentials',
        required: true,
        displayOptions: {
          show: {
            connectionType: ['cloud'],
          },
        },
        default: 'browserUseCloudApi',
      },
      // ...
    ],
  };
}
```

**操作实现 - Run Task：**

```typescript
export async function executeRunTask(
  context: IExecuteFunctions,
  itemIndex: number,
  config: OperationContext
): Promise<INodeExecutionData> {
  // 获取参数
  const instructions = context.getNodeParameter('instructions', itemIndex) as string;
  const aiProvider = context.getNodeParameter('aiProvider', itemIndex) as string;

  // 构建请求体
  const payload = {
    task: instructions,
    ai_provider: aiProvider,
  };

  // 调用 API
  const response = await makeApiRequest(
    context,
    'POST',
    '/tasks',
    payload,
    config
  );

  return {
    json: response,
    pairedItem: { item: itemIndex },
  };
}
```

### 7.3 源码参考

查看完整实现：
- **节点定义**：nodes/SYBrowserUse/SYBrowserUse.node.ts
- **操作实现**：nodes/SYBrowserUse/operations.ts
- **传输层**：nodes/SYBrowserUse/transport.ts

---

## 八、最佳实践

### 8.1 错误处理

```typescript
// 使用 n8n 特定的错误类型
import { NodeOperationError, NodeApiError } from 'n8n-workflow';

// 参数错误
throw new NodeOperationError(
  this.getNode(),
  'Invalid parameter value',
  { itemIndex }
);

// API 错误
throw new NodeApiError(
  this.getNode(),
  error,
  { itemIndex }
);
```

### 8.2 参数验证

```typescript
// 验证必需参数
const apiKey = this.getNodeParameter('apiKey', itemIndex) as string;
if (!apiKey?.trim()) {
  throw new NodeOperationError(
    this.getNode(),
    'API Key is required',
    { itemIndex }
  );
}

// 验证 JSON 格式
const jsonString = this.getNodeParameter('jsonData', itemIndex) as string;
try {
  JSON.parse(jsonString);
} catch (error) {
  throw new NodeOperationError(
    this.getNode(),
    'Invalid JSON format',
    { itemIndex }
  );
}
```

### 8.3 批量处理

```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  const returnData: INodeExecutionData[] = [];

  // 遍历所有输入项
  for (let i = 0; i < items.length; i++) {
    try {
      const result = await executeOperation(this, i);
      returnData.push(result);
    } catch (error) {
      // 错误处理
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return [returnData];
}
```

### 8.4 资源导向设计

对于复杂节点，使用 resource/operation 两级参数组织：

```typescript
properties: [
  {
    displayName: 'Resource',
    name: 'resource',
    type: 'options',
    options: [
      { name: 'Issue', value: 'issue' },
      { name: 'Pull Request', value: 'pullRequest' },
    ],
    default: 'issue',
  },
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    displayOptions: {
      show: {
        resource: ['issue'],
      },
    },
    options: [
      { name: 'Get', value: 'get' },
      { name: 'Create', value: 'create' },
      { name: 'Update', value: 'update' },
    ],
    default: 'get',
  },
]
```

---

## 九、发布和分发

> 🎯 **实际案例**：n8n-nodes-sy-browseruse 开源项目，可从 GitHub 直接安装
>
> 安装命令：`npm install github:Cshiyuan/n8n-nodes-sy-browseruse`

### 9.1 发布到 npm

```bash
# 登录 npm
npm login

# 发布包
npm publish

# 或使用 release-it 自动化
npm run release
```

### 9.2 用户安装

用户可以通过 n8n 界面安装社区节点：

1. 打开 n8n 设置
2. 进入"社区节点"部分
3. 输入包名 `n8n-nodes-my-package`
4. 点击安装

或通过命令行：

```bash
# 在 n8n 数据目录安装
cd ~/.n8n
npm install n8n-nodes-my-package

# 重启 n8n
n8n start
```

### 9.3 版本管理

遵循语义化版本规范：

| 版本类型 | 说明 | 示例 |
|---------|------|------|
| 主版本号 | 不兼容的 API 变更 | 1.0.0 → 2.0.0 |
| 次版本号 | 向后兼容的功能性新增 | 1.0.0 → 1.1.0 |
| 修订号 | 向后兼容的问题修正 | 1.0.0 → 1.0.1 |

```bash
# 自动版本更新和发布
npm run release

# 手动指定版本
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.1 -> 1.1.0
npm version major  # 1.1.0 -> 2.0.0
```

---

## 十、调试技巧

### 10.1 使用 VS Code 调试

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to n8n",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true
    }
  ]
}
```

启动 n8n 调试模式：

```bash
n8n start --tunnel --debug
```

### 10.2 日志输出

```typescript
// 使用 console.log
console.log('Debug info:', data);

// 在 n8n 界面查看节点输出
return [{
  json: {
    debug: 'Debug information',
    data: processedData,
  },
}];
```

---

## 十一、常见问题

**Q：节点无法在 n8n 中显示？**

检查：
- `package.json` 中 `keywords` 包含 `"n8n-community-node-package"`
- `n8n` 字段正确配置了节点和凭据路径
- 编译输出在 `dist` 目录
- 重启 n8n

**Q：如何处理大量数据？**

- 使用批量 API
- 实现分页
- 添加速率限制
- 考虑使用流式处理

**Q：如何测试 OAuth2 认证？**

- 本地使用 ngrok 暴露回调 URL
- 使用 n8n Cloud 的 OAuth 回调
- 参考官方 OAuth2 节点实现

---

## 十二、学习资源

### 官方文档
- **n8n 文档**：docs.n8n.io
- **节点开发指南**：docs.n8n.io/integrations/creating-nodes/
- **API 参考**：docs.n8n.io/api/

### 示例项目
- **n8n 官方节点**：github.com/n8n-io/n8n/tree/master/packages/nodes-base
- **社区节点**：npmjs.com/search?q=n8n-nodes

### 社区
- **n8n 论坛**：community.n8n.io
- **Discord**：n8n 官方 Discord 服务器
- **GitHub Discussions**：github.com/n8n-io/n8n/discussions

---

## 总结

n8n 是一个强大而灵活的工作流自动化平台，通过自定义节点开发，你可以：

- ✅ **扩展功能**：集成任何 API 或服务
- ✅ **提升效率**：封装复杂逻辑为可复用节点
- ✅ **分享贡献**：将节点发布到社区供他人使用
- ✅ **完全控制**：自托管部署，数据安全可控

### 开发流程总结

1. **规划**：确定节点功能和参数设计
2. **初始化**：使用 `@n8n/node-cli` 创建项目
3. **实现**：按照三层架构编写代码
4. **测试**：本地测试节点功能
5. **发布**：发布到 npm 供他人使用
6. **维护**：根据反馈持续改进

### 下一步

- 🚀 克隆本项目查看完整示例
- 📖 阅读 n8n 官方文档
- 💡 开始开发你的第一个自定义节点
- 🌟 向社区分享你的节点

---

## 相关资源

| 资源 | 链接 |
|------|------|
| 本项目源码 | github.com/Cshiyuan/n8n-nodes-sy-browseruse |
| N8N 官方文档 | docs.n8n.io |
| 节点开发指南 | docs.n8n.io/integrations/creating-nodes |

**相关文章：**
- 《AI连接一切？N8N 入门到上手》
- 《如何让 AI 帮我从小红书上收集有用的旅游攻略》

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

> 💡 本文基于 n8n-nodes-sy-browseruse 项目实战经验编写，包含 SYBrowserUse 和 GitHub Issues 两个实际节点的实现案例。

# n8n-nodes-sy-browseruse 项目结构

本文档记录了 n8n-nodes-sy-browseruse 项目的完整技术栈和文件树结构。**AI 代理在尝试任何任务之前必须阅读此文件,以了解项目组织。**

## 技术栈

### 核心技术
- **TypeScript 5.9.2** 与 **npm** - 类型安全的 JavaScript 开发和依赖管理
  - 编译目标: ES2019
  - 模块系统: CommonJS
  - 严格模式启用,包含所有类型检查选项
  - 生成声明文件(.d.ts)和源码映射
- **n8n-workflow** (peer dependency) - n8n 工作流引擎核心类型和工具
  - 提供 `INodeType`, `IExecuteFunctions`, `INodeExecutionData` 等核心接口
- **@n8n/node-cli** (dev) - n8n 社区节点开发工具链
  - 提供 `n8n-node build/dev/lint/release` 命令

### 集成服务与 API
- **Browser Use Cloud API** (https://api.browser-use.com/api/v1)
  - AI 驱动的浏览器自动化云服务
  - 支持多种 AI 提供商(Anthropic, OpenAI, Google, Mistral, OpenRouter 等)
- **Browser Use Local Bridge**
  - 本地浏览器自动化桥接服务
  - 可配置自定义 API 端点
- **Gomarkdown2image API** (http://localhost:8080 默认)
  - Markdown 到图片转换服务
  - 支持 AI 增强的 Markdown 处理(OpenAI, Anthropic, Google Gemini, Ollama)
  - 支持 PNG/JPEG/WebP 输出格式

### 开发与质量工具
- **ESLint 9.32.0** - 代码质量和 linting
  - 使用 @typescript-eslint/parser 和 @typescript-eslint/type-utils
  - 配置了 TypeScript 严格规则
- **Prettier 3.6.2** - 代码格式化
  - 统一代码风格
- **TypeScript Compiler** - 静态类型检查和编译
  - 配置: `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`
- **@n8n/node-cli** - 构建、开发、发布和 linting 自动化
  - 封装了 TypeScript 编译和打包流程

### CI/CD 与自动化
- **GitHub Actions** - 持续集成和自动化工作流
  - 工作流: `.github/workflows/ci.yml`
  - 触发: PR、main/master 分支推送、版本标签推送
  - 步骤: 依赖安装 → 安全审计 → Lint → 测试 → 构建 → 发布(仅标签)
  - 运行环境: Ubuntu Latest + Node.js 22
  - 自动发布: 检测到 v* 标签时自动发布到 npm
- **release-it 19.0.4+** - 自动化版本管理和发布流程
  - 版本号管理、CHANGELOG 生成、Git 标签

### 部署与分发
- **npm** - 包发布到 npm registry
  - 包名: `n8n-nodes-sy-browseruse`
  - 发布文件: `dist/` 目录(编译后的 JavaScript 和声明文件)
- **n8n Community Nodes** - 通过 n8n 社区节点安装机制分发

## 完整项目结构

```
n8n-nodes-sy-browseruse/
├── README.md                              # 项目概述和使用说明
├── CHANGELOG.md                           # 版本变更历史
├── CLAUDE.md                              # 主 AI 上下文文件
├── AGENTS.md                              # 代理配置文档
├── package.json                           # npm 包配置和依赖
├── tsconfig.json                          # TypeScript 编译配置
├── .gitignore                             # Git 忽略规则
├── .vscode/                               # VS Code 工作区配置
├── .idea/                                 # IntelliJ IDEA 配置
│   └── inspectionProfiles/                # 代码检查配置
├── .claude/                               # Claude Code CLI 配置
│   ├── hooks/                             # 自动化钩子脚本
│   └── commands/                          # 自定义斜杠命令
│       ├── README.md                      # 命令使用说明
│       ├── code-review.md                 # 代码审查命令
│       ├── create-docs.md                 # 文档生成命令
│       ├── full-context.md                # 完整上下文加载命令
│       ├── gemini-consult.md              # Gemini 咨询命令
│       ├── handoff.md                     # 任务交接命令
│       ├── refactor.md                    # 重构命令
│       └── update-docs.md                 # 文档更新命令
├── .github/                               # GitHub 配置
│   └── workflows/                         # CI/CD 工作流
├── nodes/                                 # n8n 节点实现
│   ├── SYBrowserUse/                      # 浏览器自动化节点
│   │   ├── SYBrowserUse.node.ts           # 节点定义和配置
│   │   ├── SYBrowserUse.node.json         # 节点元数据
│   │   ├── operations.ts                  # 操作实现(8种操作)
│   │   └── transport.ts                   # API 通信层
│   └── SYMarkdownToImage/                 # Markdown 转图片节点
│       ├── SYMarkdownToImage.node.ts      # 节点定义和配置
│       ├── operations.ts                  # 操作实现(Convert, HealthCheck)
│       └── transport.ts                   # API 通信和二进制响应处理
├── credentials/                           # n8n 凭据定义
│   ├── BrowserUseCloudApi.credentials.ts  # Browser Use Cloud API 凭据
│   ├── BrowserUseLocalBridgeApi.credentials.ts # 本地桥接凭据
│   └── MarkdownToImageApi.credentials.ts  # Markdown to Image API 凭据
├── icons/                                 # 节点图标资源
│   ├── action.svg                         # Action 图标
│   ├── browseruse.svg                     # Browser Use 图标
│   ├── sybrowseruse.svg                   # SYBrowserUse 图标
│   ├── markdown2image.svg                 # Markdown to Image 图标
│   ├── github.svg                         # GitHub 浅色主题图标(保留)
│   └── github.dark.svg                    # GitHub 深色主题图标(保留)
├── docs/                                  # 项目文档
│   ├── README.md                          # 文档索引
│   ├── CONTEXT-tier2-component.md         # 第2层文档模板
│   ├── CONTEXT-tier3-feature.md           # 第3层文档模板
│   ├── MCP-ASSISTANT-RULES.md             # MCP 助手规则
│   ├── webhook-callback-guide.md          # Webhook 回调配置指南
│   ├── ai-context/                        # AI 上下文文档
│   │   ├── project-structure.md           # 此文件 - 技术栈和项目结构
│   │   ├── docs-overview.md               # 文档架构说明
│   │   ├── system-integration.md          # 系统集成模式
│   │   ├── deployment-infrastructure.md   # 部署基础设施
│   │   └── handoff.md                     # 任务管理和交接
│   └── article/                           # 用户教程文章
│       ├── ai-n8n-getting-started.md      # AI 和 n8n 入门指南
│       ├── ai-xiaohongshu-travel-guide-collector.md # 小红书旅游攻略收集案例
│       ├── n8n-custom-node-development.md # n8n 自定义节点开发教程
│       └── WECHAT_TEMPLATE.md             # 微信消息模板
├── dist/                                  # 编译输出目录(git 忽略)
│   ├── nodes/                             # 编译后的节点
│   │   ├── SYBrowserUse/
│   │   └── SYMarkdownToImage/
│   ├── credentials/                       # 编译后的凭据
│   └── icons/                             # 复制的图标资源
└── node_modules/                          # npm 依赖(git 忽略)
    └── @types/node/                       # Node.js 类型定义
```

## 架构模式

### n8n 包配置
项目使用 `package.json` 中的 `n8n` 字段配置节点包:

```json
{
  "n8n": {
    "n8nNodesApiVersion": 1,
    "strict": false,
    "credentials": [
      "dist/credentials/BrowserUseCloudApi.credentials.js",
      "dist/credentials/BrowserUseLocalBridgeApi.credentials.js",
      "dist/credentials/MarkdownToImageApi.credentials.js"
    ],
    "nodes": [
      "dist/nodes/SYBrowserUse/SYBrowserUse.node.js",
      "dist/nodes/SYMarkdownToImage/SYMarkdownToImage.node.js"
    ]
  }
}
```

**关键配置说明**:
- `n8nNodesApiVersion: 1` - 使用 n8n Nodes API v1
- `strict: false` - 禁用严格模式,允许自定义 eslint 配置
- 所有路径指向 `dist/` 编译输出,而非源码
- 项目包含 2 个节点: SYBrowserUse(浏览器自动化) 和 SYMarkdownToImage(Markdown 转图片)

### n8n 节点架构

#### 三层结构模式
每个节点遵循职责分离的三层架构:

1. **节点定义层** (`*.node.ts`)
   - 实现 `INodeType` 接口
   - 定义 `INodeTypeDescription` - 节点元数据、参数、凭据
   - 协调操作执行和数据流
   - 示例: `SYBrowserUse.node.ts:33-268`

2. **操作实现层** (`operations.ts`)
   - 具体业务逻辑实现
   - 参数提取和验证
   - 调用传输层 API
   - 返回标准 `INodeExecutionData` 格式
   - 示例: `operations.ts:27-168` (executeRunTask, executeGetTaskStatus 等)

3. **传输层** (`transport.ts`)
   - API 客户端封装
   - HTTP 请求构建和执行
   - 认证头注入
   - 统一错误处理(`NodeApiError`, `NodeOperationError`)
   - 支持 JSON 和二进制响应处理(用于图片等二进制数据)
   - 示例: `transport.ts:75-135` (makeApiRequest 函数)

#### 凭据系统
- **独立凭据文件**: 每种认证方式一个文件
- **认证配置**: 实现 `ICredentialType` 接口
- **自动注入**: 使用 `authenticate` 配置自动添加认证头
- **凭据测试**: 实现 `test` 方法验证凭据有效性
- **动态显示**: 使用 `displayOptions` 根据连接类型显示相应凭据

#### 双模式架构(SYBrowserUse 节点)
- **连接类型切换**: `connectionType` 参数控制 Cloud/LocalBridge 模式
- **动态配置**: 使用 `displayOptions` 根据模式显示不同参数
- **统一接口**: 两种模式共享相同的操作接口
- **配置验证**: `validateConnection` 确保配置正确

#### 二进制数据处理(SYMarkdownToImage 节点)
- **ArrayBuffer 响应**: 使用 `encoding: 'arraybuffer'` 获取二进制数据
- **Buffer 转换**: 将 ArrayBuffer 转换为 Node.js Buffer
- **Base64 编码**: 使用 `IBinaryData` 格式,数据以 base64 字符串存储
- **MIME 类型**: 从响应头提取 Content-Type,支持 PNG/JPEG/WebP
- **元数据输出**: JSON 字段包含文件大小、格式、时间戳等信息

### TypeScript 配置要点

**编译选项** (`tsconfig.json`):
- **模块系统**: `"module": "commonjs"` - n8n 使用 CommonJS
- **目标环境**: `"target": "es2019"` - Node.js 兼容性
- **严格模式**: 全部类型检查选项启用
- **声明文件**: `"declaration": true` - 生成 .d.ts 文件
- **输出目录**: `"outDir": "./dist/"` - 编译到 dist 目录

**包含文件**:
```json
"include": ["credentials/**/*", "nodes/**/*", "nodes/**/*.json", "package.json"]
```
注意: 包含 `.json` 文件,因为某些节点使用 JSON 配置

### 开发工作流

#### 本地开发
```bash
# 开发模式 - 监听文件变化,自动重新加载
npm run dev

# 使用自定义 n8n 数据文件夹
npm run dev:docker-path
```

#### 构建和质量检查
```bash
# TypeScript 编译
npm run build

# 监听模式编译(用于开发)
npm run build:watch

# ESLint 检查
npm run lint

# 自动修复 lint 问题
npm run lint:fix
```

#### 发布流程
```bash
# 自动化版本管理和发布(使用 release-it)
npm run release

# 发布前检查(在 npm publish 前自动运行)
npm run prepublishOnly
```

#### CI/CD 流程
GitHub Actions 自动化流程(`.github/workflows/ci.yml`):
1. **触发条件**: Pull Request、push 到 main/master 分支、或 v* 标签推送
2. **环境**: Ubuntu Latest + Node.js 22
3. **构建步骤**:
   - 检出代码
   - 安装依赖(`npm ci`)
   - 安全审计(`npm audit`)
   - 运行 lint 检查
   - 运行测试(当前为占位符)
   - 构建项目
   - 上传构建产物
4. **发布步骤**(仅标签触发):
   - 重新构建项目
   - 自动发布到 npm registry

### 调试配置

**VS Code 调试** (`.vscode/launch.json`):
- **配置**: "Attach to running n8n"
- **方式**: 附加到正在运行的 n8n 进程
- **用途**: 调试节点在 n8n 环境中的执行

**调试步骤**:
1. 启动 n8n: `n8n start` 或 `npm run dev`
2. VS Code 中选择 "Attach to running n8n" 配置
3. 选择 n8n 进程
4. 在节点代码中设置断点

### 文档层次

#### 已实现文档(第 1 层 - 基础)
- **`/CLAUDE.md`** - 项目级编码标准、n8n 节点开发模式、架构原则
- **`/docs/ai-context/project-structure.md`** (本文件) - 技术栈和项目结构
- **`/docs/ai-context/docs-overview.md`** - 三层文档系统说明

#### 未来扩展(第 2-3 层)
- **第 2 层(组件)**: 未来可为每个节点创建 `nodes/[NodeName]/CONTEXT.md`
  - 节点特定的架构决策
  - 操作设计理由
  - 与其他系统的集成模式
- **第 3 层(功能)**: 未来可为特定功能模块创建详细文档
  - 复杂操作的实现细节
  - 特定资源的处理模式
  - 边缘情况处理

---

*本文档反映了 n8n-nodes-sy-browseruse 的实际项目结构。随着项目发展,请保持更新。*

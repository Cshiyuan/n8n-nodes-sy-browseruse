# n8n-nodes-sy-browseruse - AI 上下文 (claude-master)

## 1. 项目概览
- **愿景**: 为 n8n 工作流自动化平台提供强大的 AI 驱动浏览器自动化能力,通过智能浏览器交互提升工作流的自动化水平
- **当前阶段**: 活跃开发中 - v0.1.0,专注于 SYBrowserUse 浏览器自动化节点
- **关键架构**: n8n 社区节点包,基于 TypeScript 构建,采用标准的 n8n 节点扩展架构
- **开发策略**: 模块化设计,清晰分离节点定义、操作实现、传输层和凭据管理,遵循 n8n 社区节点最佳实践

## 2. 项目结构

**⚠️ 关键: AI 代理在尝试任何任务之前必须阅读[项目结构文档](/docs/ai-context/project-structure.md),以了解完整的技术栈、文件树和项目组织。**

n8n-nodes-ten-brain 遵循 n8n 社区节点包的标准架构模式。项目专注于 AI 驱动的浏览器自动化功能。有关完整的技术栈和文件树结构,请参见 [docs/ai-context/project-structure.md](/docs/ai-context/project-structure.md)。

### 核心组件

#### 节点实现
- **SYBrowserUse Node** (`nodes/SYBrowserUse/`) - AI 驱动的浏览器自动化节点
  - 支持 Cloud API 和 Local Bridge 两种连接模式
  - 提供 8 种核心操作: Run Task, Get Task Status, Stop Task, Get Task Media 等
  - 集成多种 AI 提供商(Anthropic, OpenAI, Google, Mistral, OpenRouter 等)

#### 凭据系统
- **Browser Use Cloud API** - Cloud 模式的 API Key 认证
- **Browser Use Local Bridge API** - 本地桥接模式的连接配置

## 3. 编码标准与 AI 指令

### 通用指令
- 你最重要的工作是管理你自己的上下文。在计划更改之前,始终阅读任何相关文件。
- 更新文档时,保持更新简洁、切中要点,防止膨胀。
- 遵循 KISS、YAGNI 和 DRY 原则编写代码。
- 如有疑问,遵循经过验证的最佳实践进行实现。
- 未经用户批准,不要提交到 git。
- 不要运行任何服务器,而是告诉用户运行服务器进行测试。
- 始终优先考虑行业标准库/框架,而不是自定义实现。
- 永远不要模拟任何东西。永远不要使用占位符。永远不要省略代码。
- 在相关的地方应用 SOLID 原则。使用现代框架特性而不是重新发明解决方案。
- 对想法的好坏要严格诚实。
- 使副作用明确且最小化。

### n8n 节点开发特定标准

#### 节点结构模式
- **职责分离**: 节点定义(`.node.ts`)、操作实现(`operations.ts`)、传输层(`transport.ts`)严格分离
- **类型安全**: 所有 n8n 类型必须正确导入和使用(`INodeType`, `INodeTypeDescription`, `IExecuteFunctions` 等)
- **错误处理**: 使用 `NodeOperationError` 和 `NodeApiError` 进行错误抛出,始终包含 `itemIndex` 上下文
- **参数验证**: 在操作执行前验证所有用户输入,提供清晰的错误消息

#### 文件组织与模块化
- 默认创建多个小的、专注的文件,而不是大的单体文件
- 每个文件应该有单一职责和明确目的
- 尽可能将文件保持在 350 行以下
- 节点文件结构应遵循:
  ```
  nodes/[NodeName]/
  ├── [NodeName].node.ts      # 节点定义和配置
  ├── operations.ts            # 操作实现逻辑
  ├── transport.ts             # API 通信层
  └── resources/               # 资源特定的操作定义(可选)
  ```
- 凭据文件独立存放在 `credentials/` 目录
- 正确导入/导出 - 设计以实现可重用性和可维护性

### TypeScript 标准

#### 类型注解(必需)
- **始终**为函数参数和返回值使用类型注解
- 优先使用 n8n 提供的类型而不是自定义类型
- 对复杂类型使用 `import type` 语法
- 使用 n8n 的类型系统:
  ```typescript
  import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';

  async function executeOperation(
    context: IExecuteFunctions,
    itemIndex: number
  ): Promise<INodeExecutionData> {
    // 实现
  }
  ```

#### 命名约定
- **类**: PascalCase (例如, `SYBrowserUse`, `GithubIssues`)
- **函数/方法**: camelCase (例如, `executeRunTask`, `makeApiRequest`)
- **常量**: UPPER_SNAKE_CASE (例如, `MAX_RETRY_COUNT`)
- **接口**: PascalCase 带 `I` 前缀或描述性后缀 (例如, `INodeType`, `OperationContext`)
- **私有方法**: 不强制前导下划线,但应通过访问修饰符或文档明确标识

#### 文档要求
- 每个公共函数都需要 JSDoc 注释
- 双语注释(中英文)以提高可读性:
  ```typescript
  /**
   * 执行 Run Task 操作
   * Execute Run Task operation
   */
  export async function executeRunTask(...) { }
  ```
- 关键业务逻辑需要行内注释说明意图

### 安全优先
- 永远不要信任外部输入 - 在节点参数获取后立即验证
- 将 API 密钥和敏感信息保存在凭据中,永远不要硬编码
- 使用 n8n 的凭据系统 - 正确配置 `authenticate` 和 `test` 属性
- 记录操作失败,但永远不要记录敏感数据(API 密钥、令牌、用户数据)
- SSRF 防护拦截事件使用 `context.logger.warn()` 记录以支持安全审计
- 在 API 请求中正确处理认证头:
  ```typescript
  headers: {
    Authorization: `Bearer ${credentials.apiKey}`,
  }
  ```

### 错误处理
- 使用 n8n 特定异常而不是通用 Error:
  ```typescript
  throw new NodeOperationError(
    context.getNode(),
    '错误消息',
    { itemIndex }
  );

  throw new NodeApiError(
    context.getNode(),
    { message: 'API 错误', statusCode: 404 },
    { itemIndex }
  );
  ```
- **始终包含 itemIndex**: 所有错误必须包含 `{ itemIndex }` 上下文,以便在批处理场景中精确定位问题数据项
- **传输层错误上下文**: 传输层函数(`getConnectionConfig`, `validateConnection`, `makeBinaryApiRequest`)接受可选的 `itemIndex` 参数并传递给错误
- **适当的异常日志**: 对所有 catch 块进行日志记录,避免空异常处理;使用 `context.logger.warn()` 或 `context.logger.error()` 记录异常信息
- 提供有用且可操作的错误消息
- 在 API 调用失败时包含 HTTP 状态码和响应信息
- 安全失败 - 错误不应该暴露 API 密钥或系统内部信息

### n8n API 设计原则
- **节点配置**:
  - 使用 `displayOptions` 控制参数可见性
  - 提供合理的 `default` 值
  - 使用 `description` 提供清晰的参数说明
  - 合理使用 `required` 标记必填参数

- **操作实现**:
  - 使用 `context.getNodeParameter()` 获取用户输入
  - 返回标准的 `INodeExecutionData` 格式
  - 支持批处理多个输入项

- **凭据处理**:
  - 使用 `context.getCredentials()` 安全获取凭据
  - 实现 `test` 方法验证凭据有效性
  - 使用 `authenticate` 配置自动注入认证头

- **传输层**:
  - 集中 API 调用逻辑在 `transport.ts`
  - 使用 `context.helpers.httpRequest()` 或 `context.helpers.requestWithAuthentication()` 进行 HTTP 调用
  - 统一处理 API 错误和重试逻辑

## 4. 多代理工作流与上下文注入

### 子代理的自动上下文注入
当使用 Task 工具生成子代理时,核心项目上下文(CLAUDE.md、project-structure.md、docs-overview.md)会通过 subagent-context-injector 钩子自动注入到它们的提示中。这确保所有子代理都能立即访问必要的项目文档,而无需在每个 Task 提示中手动指定。

## 5. MCP 服务器集成

### Gemini 咨询服务器
**何时使用:**
- 需要深入分析 n8n 节点架构或多种实现方法的复杂问题
- 代码审查和 n8n 最佳实践讨论
- 调试跨多个文件的复杂 n8n 工作流问题
- 节点性能优化和重构指导
- n8n API 和生态系统的详细解释

**自动上下文注入:**
- 套件的 `gemini-context-injector.sh` 钩子会为新会话自动包含:
  - `/docs/ai-context/project-structure.md` - 完整的项目结构和技术栈
  - 此文件 (`CLAUDE.md`) - 项目特定编码标准和指南

**使用模式:**
```python
# 新咨询会话(项目结构由钩子自动附加)
mcp__gemini__consult_gemini(
    specific_question="如何优化 SYBrowserUse 节点的 API 调用性能?",
    problem_description="需要降低浏览器任务执行的延迟",
    code_context="当前实现在 operations.ts 中...",
    attached_files=[
        "nodes/SYBrowserUse/operations.ts",
        "nodes/SYBrowserUse/transport.ts"
    ],
    preferred_approach="optimize"
)
```

**重要:** 将 Gemini 的响应视为咨询反馈。批判性地评估建议,将有价值的见解融入你的解决方案,然后继续实施。

### Context7 文档服务器
**何时使用:**
- 查询 n8n 官方文档和 API 参考
- 了解 n8n 节点开发的最新最佳实践
- 使用其他外部库/框架(如果项目扩展)
- 排查 n8n 平台特定的问题

**使用模式:**
```python
# 获取 n8n 文档
mcp__context7__resolve_library_id(libraryName="n8n")
mcp__context7__get_library_docs(
    context7CompatibleLibraryID="/n8n-io/n8n",
    topic="node-development",
    tokens=8000
)
```

## 6. 任务完成后协议
完成任何编码任务后,遵循此检查清单:

### 1. 类型安全与质量检查
- **TypeScript 编译**: 运行 `npm run build` 确保无编译错误
- **代码风格检查**: 运行 `npm run lint` 检查代码风格
- **自动修复**: 如果有可自动修复的问题,运行 `npm run lint:fix`
- **安全审计**: CI/CD 流程自动运行 `npm audit` 检查依赖安全问题

### 2. n8n 节点验证
- 确保节点能在 n8n 环境中正确加载
- 验证节点图标和显示名称正确配置
- 测试凭据验证功能(`test` 方法)
- 验证所有操作的参数和输出格式

### 3. 验证
- 确保所有类型检查和 lint 检查通过后再认为任务完成
- 如果发现错误,在标记任务完成之前修复它们
- 更新相关文档(如果修改了节点行为或添加了新功能)

## 7. 项目特定模式

### SYBrowserUse 节点模式
- **双模式架构**: 支持 Cloud API 和 Local Bridge 两种连接模式
- **动态配置**: 基于 `connectionType` 参数动态显示不同的凭据和配置选项
- **AI 提供商集成**: 支持多种 AI 提供商(Anthropic, OpenAI, Google, Mistral, OpenRouter, Custom),使用统一的配置接口
- **任务管理**: 完整的任务生命周期管理(创建、查询、暂停、恢复、停止)
- **媒体处理**: 支持获取任务执行过程中的截图和录制数据
- **类型安全**: 使用 `IDataObject` 替代 `any` 类型,确保类型安全

### SYMarkdownToImage 节点模式
- **凭据中的 AI 配置**: AI Provider(OpenAI, Anthropic, Google, Ollama)及其配置统一在凭据中管理
- **二进制响应处理**: 正确处理图片等二进制数据,使用 `IBinaryData` 格式和 base64 编码
- **条件参数显示**: 使用 `displayOptions` 根据 `imageFormat` 动态显示 `imageQuality` 参数
- **输入验证**: Markdown 内容大小限制(100KB)防止 DoS,使用白名单验证
- **AI 增强开关**: 节点参数中的 `enableAI` 开关配合凭据中的 AI 配置实现灵活的 AI 功能
- **元数据输出**: JSON 字段提供详细元数据(文件大小、格式、时间戳等),便于调试和监控

### 传输层模式
- **配置验证**: 在 API 调用前验证连接配置和凭据,支持可选的 `itemIndex` 参数用于批处理错误定位
- **统一错误处理**: 集中处理 API 错误,转换为 n8n 特定异常,所有错误都包含 `{ itemIndex }` 上下文以便精确追踪
- **安全日志记录**: 对所有异常处理块进行适当日志记录,SSRF 防护拦截事件使用 `context.logger.warn()` 记录以支持安全审计
- **动态 URL 构建**: 基于连接类型和操作构建正确的 API 端点
- **请求封装**: 使用 `makeApiRequest` 统一处理认证、头部和错误
- **二进制请求支持**: `makeBinaryApiRequest` 处理图片等二进制响应,使用 `encoding: 'arraybuffer'` 和 Buffer 转换,支持 `itemIndex` 参数
- **类型安全**: 所有函数参数和返回值使用明确的 n8n 类型(`IDataObject`, `IExecuteFunctions` 等)

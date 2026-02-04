# n8n-nodes-sy-browseruse 文档架构

本项目使用**三层文档系统**,按稳定性和范围组织知识,实现高效的 AI 上下文加载和可扩展的开发。

## 三层系统如何运作

**第 1 层(基础层)**: 稳定的、系统级文档,很少变更 - 架构原则、技术决策、跨组件模式和核心开发协议。AI 代理在每个会话开始时应加载这些文档。

**第 2 层(组件层)**: 主要组件的架构章程 - 高层设计原则、集成模式和组件级约定,不包含功能特定细节。当处理特定节点时加载。

**第 3 层(功能层)**: 与代码共置的细粒度文档 - 具体的实现模式、技术细节和随功能演进的本地架构决策。按需加载。

这种层次结构允许 AI 代理高效地加载目标上下文,同时保持稳定的核心知识基础。

## 文档原则

- **共置**: 文档位于相关代码附近,便于维护和发现
- **智能扩展**: 在需要时创建新的文档文件,遵循三层结构
- **AI 优先**: 针对高效的 AI 上下文加载和机器可读模式进行优化
- **简洁性**: 仅包含必要信息,避免冗余和膨胀
- **交叉引用**: 使用文件路径和代码引用链接相关概念

## 第 1 层: 基础文档(系统级)

项目根目录和 `docs/ai-context/` 中的核心文档:

### 必读文档

- **[主上下文](/CLAUDE.md)** - *每个会话必需*
  - n8n 节点开发编码标准和最佳实践
  - TypeScript 和 n8n API 使用规范
  - 安全要求和错误处理模式
  - MCP 服务器集成(Gemini 咨询、Context7 文档)
  - 项目特定架构模式(三层节点结构、凭据系统、双模式架构)
  - 开发工作流和任务完成后协议

- **[项目结构](/docs/ai-context/project-structure.md)** - *必读*
  - 完整的技术栈详解(TypeScript 5.9.2、n8n-workflow、ESLint、Prettier)
  - 详细的项目文件树结构
  - n8n 包配置和编译设置
  - 三层节点架构深度解析(带代码引用)
  - 凭据系统和认证模式
  - 开发工作流命令(build、lint、dev、release)
  - CI/CD 配置(GitHub Actions)
  - VS Code 调试配置

- **[文档架构](/docs/ai-context/docs-overview.md)** - *本文件*
  - 三层文档系统说明
  - 文档索引和导航
  - 文档创建和维护指南

### 专项文档(按需参考)

- **[系统集成](/docs/ai-context/system-integration.md)** - *用于跨组件工作*
  - ⚠️ 待更新: 当前为通用模板
  - 应记录: n8n 工作流数据流模式、Browser Use 和 GitHub API 集成模式

- **[部署基础设施](/docs/ai-context/deployment-infrastructure.md)** - *基础设施模式*
  - ⚠️ 待更新: 当前为通用模板
  - 应记录: npm 发布流程、n8n 社区节点安装机制、用户环境配置

- **[任务管理](/docs/ai-context/handoff.md)** - *会话连续性*
  - 当前任务跟踪
  - 文档系统进度
  - 下一会话目标和待办事项

## 第 2 层: 组件级文档

### n8n 节点组件

项目包含两个 n8n 节点:

#### 🔜 建议创建的第 2 层文档

- **[SYBrowserUse 节点](/nodes/SYBrowserUse/CONTEXT.md)** - *浏览器自动化节点架构*
  - 尚未创建
  - 应记录:
    - 双模式架构设计决策(Cloud API vs Local Bridge)
    - 8 种操作的设计理由和使用场景
    - AI 提供商集成策略(Anthropic, OpenAI, Google, Mistral, OpenRouter, Custom)
    - 任务生命周期管理模式
    - 与其他 n8n 节点的集成模式

- **[SYMarkdownToImage 节点](/nodes/SYMarkdownToImage/CONTEXT.md)** - *Markdown 转图片节点架构*
  - 尚未创建
  - 应记录:
    - 二进制响应处理模式(ArrayBuffer → Buffer → Base64)
    - AI 增强配置策略(凭据中统一管理 AI Provider)
    - 条件参数显示设计(imageQuality 根据 imageFormat 动态显示)
    - 与其他 n8n 节点的数据流集成

### 凭据组件

- **凭据系统** - 当前在 `/CLAUDE.md` 和 `/docs/ai-context/project-structure.md` 中记录
  - 3 种凭据类型(Browser Use Cloud API, Browser Use Local Bridge API, Markdown to Image API)
  - 认证自动注入机制
  - 凭据验证测试方法
  - AI Provider 配置管理(在 Markdown to Image API 凭据中)

## 第 3 层: 功能特定文档

与代码共置的细粒度文档,按需创建:

### 🔜 潜在的第 3 层文档位置

当节点复杂度增加或需要详细实现指南时,可考虑创建:

#### SYBrowserUse 节点功能文档
- `/nodes/SYBrowserUse/operations/CONTEXT.md` - 操作实现模式
  - 8 种操作的具体实现细节
  - 参数验证和错误处理模式
  - API 请求构建和响应处理
  - 类型安全实践(使用 `IDataObject` 替代 `any`)

- `/nodes/SYBrowserUse/transport/CONTEXT.md` - 传输层模式
  - API 客户端封装策略
  - 双模式端点路由逻辑
  - 错误转换和重试机制
  - 类型安全的请求/响应处理

#### SYMarkdownToImage 节点功能文档
- `/nodes/SYMarkdownToImage/operations/CONTEXT.md` - 操作实现模式
  - Convert 和 Health Check 操作实现细节
  - Markdown 内容验证(大小限制、格式检查)
  - AI 参数处理(从凭据读取配置)
  - 二进制数据格式转换(`IBinaryData` 和 base64 编码)

- `/nodes/SYMarkdownToImage/transport/CONTEXT.md` - 传输层模式
  - 二进制 API 请求封装(`makeBinaryApiRequest`)
  - ArrayBuffer 到 Buffer 的转换逻辑
  - MIME 类型提取和文件扩展名映射
  - 超时配置策略(AI 增强 vs 基础转换)

### 当前状态

目前项目处于早期阶段,**尚未创建第 3 层文档**。随着节点功能的成熟和复杂度增加,应根据需要创建这些详细文档。

## 文档创建指南

### 何时创建新文档

#### 创建第 2 层文档(组件级)的时机
- 添加新的 n8n 节点
- 节点有 5+ 个操作或复杂的架构决策
- 需要记录跨节点的集成模式
- 组件有独特的设计模式值得单独说明

#### 创建第 3 层文档(功能特定)的时机
- 单个功能模块超过 300 行代码
- 复杂的实现逻辑需要详细说明
- 有非显而易见的边缘情况处理
- 功能有特定的测试或调试策略

### 创建新文档的步骤

#### 添加第 2 层文档(组件级)
1. 在组件根目录创建 `CONTEXT.md`
   ```bash
   # 示例
   touch nodes/NewNode/CONTEXT.md
   ```

2. 使用第 2 层模板结构:
   - 目的和职责
   - 当前状态和演化上下文
   - 组件特定开发指南
   - 主要子系统组织
   - 架构模式和设计决策
   - 集成点

3. 更新本文件(docs-overview.md)的"第 2 层"部分

4. 可选: 更新 `/docs/ai-context/project-structure.md` 的文件树

#### 添加第 3 层文档(功能特定)
1. 在功能目录创建 `CONTEXT.md`
   ```bash
   # 示例
   touch nodes/SYBrowserUse/operations/CONTEXT.md
   ```

2. 使用第 3 层模板结构:
   - 功能架构
   - 实现模式
   - 关键文件和结构
   - 集成点
   - 开发模式(测试、调试)

3. 更新本文件(docs-overview.md)的"第 3 层"部分

4. 在父组件的 `CONTEXT.md` 中添加交叉引用

### 文档维护

#### 定期审查(每季度或重大变更后)
- 验证第 1 层文档与代码实现的一致性
- 检查交叉引用的有效性
- 更新过时的架构决策说明
- 移除已弃用功能的文档

#### 代码变更时的文档更新
- **重大架构变更**: 必须更新相关的第 1 层和第 2 层文档
- **功能增强**: 更新相关的第 3 层文档
- **Bug 修复**: 通常不需要更新文档,除非涉及架构理解
- **重构**: 更新受影响的文档,确保代码引用仍然有效

### 弃用文档

当功能或组件被移除时:
1. 删除相应的 `CONTEXT.md` 文件
2. 更新本文件(docs-overview.md),移除相关条目
3. 检查其他文档中的交叉引用,移除或更新
4. 在 `/docs/ai-context/handoff.md` 中记录文档变更

## 文档质量标准

### 优秀文档的特征
- ✅ **准确性**: 与当前代码实现一致
- ✅ **简洁性**: 仅包含必要信息,无冗余
- ✅ **结构化**: 使用清晰的标题、列表、代码块
- ✅ **交叉引用**: 包含文件路径和行号引用
- ✅ **上下文完整**: 说明"为什么"而不仅是"是什么"
- ✅ **AI 友好**: 易于 AI 代理解析和理解

### 避免的反模式
- ❌ 过时的代码示例或文件引用
- ❌ 模糊的架构描述(如"灵活的设计")
- ❌ 缺少具体代码引用的抽象概念
- ❌ 重复其他文档中已有的信息
- ❌ 过度详细的实现细节在高层文档中

## 使用 /create-docs 命令

项目配置了 `/create-docs` 命令用于自动生成和更新文档:

```bash
# 创建或重新生成文档
/create-docs <target-path>

# 示例
/create-docs CLAUDE.md                              # 重新生成根文档
/create-docs docs/ai-context/project-structure.md   # 更新项目结构
/create-docs nodes/SYBrowserUse/CONTEXT.md          # 创建第 2 层文档
```

命令会:
1. 分析目标路径和代码库
2. 确定文档层级(第 1、2 或 3 层)
3. 选择适当的生成策略
4. 创建或更新文档内容
5. 更新文档注册表(本文件)
6. 提供架构智能和改进建议

---

## 当前文档系统状态

### 已完成(第 1 层)
- ✅ `/CLAUDE.md` - 优秀,包含完整的 n8n 节点开发标准
- ✅ `/docs/ai-context/project-structure.md` - 优秀,详细的技术栈和架构
- ✅ `/docs/ai-context/docs-overview.md` - 本文件,已更新为实际项目结构

### 待更新(第 1 层)
- ⚠️ `/docs/ai-context/system-integration.md` - 需要替换通用模板为实际集成模式
- ⚠️ `/docs/ai-context/deployment-infrastructure.md` - 需要添加 npm 发布和安装指南

### 建议创建(第 2 层)
- 🔜 `/nodes/SYBrowserUse/CONTEXT.md` - SYBrowserUse 节点架构章程
- 🔜 `/nodes/SYMarkdownToImage/CONTEXT.md` - SYMarkdownToImage 节点架构章程

### 未来考虑(第 3 层)
- 💭 功能特定文档 - 当节点复杂度增加时按需创建

---

*本文档反映 n8n-nodes-sy-browseruse 项目的实际文档架构。随着项目发展定期更新。*

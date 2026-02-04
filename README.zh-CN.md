# n8n-nodes-sy-browseruse

[English](README.md) | [中文](README.zh-CN.md)

这是一个 n8n 社区节点，通过 SYBrowserUse 节点为你的 n8n 工作流提供 AI 驱动的浏览器自动化能力。

[n8n](https://n8n.io/) 是一个[公平代码许可](https://docs.n8n.io/sustainable-use-license/)的工作流自动化平台。

## 目录

- [安装](#安装)
- [核心特性](#核心特性)
- [操作列表](#操作列表)
- [凭据配置](#凭据配置)
- [Webhook 回调支持](#webhook-回调支持)
- [兼容性](#兼容性)
- [资源链接](#资源链接)

## 安装

### 方式一：通过 n8n UI 安装（推荐）

1. 打开 n8n
2. 进入 **Settings** → **Community Nodes**
3. 点击 **Install**
4. 输入：`n8n-nodes-sy-browseruse`
5. 点击安装并同意风险警告

### 方式二：通过 npm 安装

```bash
npm install n8n-nodes-sy-browseruse
```

详细安装指南请参考 [n8n 社区节点文档](https://docs.n8n.io/integrations/community-nodes/installation/)。

## 核心特性

- 🤖 **AI 驱动自动化**：使用自然语言指令控制浏览器交互
- ☁️ **双连接模式**：支持云端 API 和本地桥接两种连接方式
- 🔄 **Webhook 回调**：长时间任务自动恢复工作流执行（v1.1.0+）
- 🎯 **多 AI 提供商**：支持 Anthropic、OpenAI、Google、Mistral、OpenRouter 及自定义提供商
- 📊 **任务管理**：完整的生命周期控制（运行、暂停、恢复、停止）
- 📸 **媒体获取**：访问任务执行过程中的截图、视频和 PDF

## 操作列表

### SYBrowserUse 节点

- **Run Task（运行任务）**: 使用自然语言指令执行浏览器自动化
- **Get Task（获取任务）**: 检索完整的任务详情，包括结果和媒体
- **Get Task Status（获取任务状态）**: 检查正在运行的任务的当前状态
- **Get Task Media（获取任务媒体）**: 下载任务执行过程中的截图、视频或 PDF
- **List Tasks（列出任务）**: 获取最近任务列表，可配置限制数量
- **Pause Task（暂停任务）**: 临时暂停正在运行的任务
- **Resume Task（恢复任务）**: 恢复之前暂停的任务
- **Stop Task（停止任务）**: 终止正在运行的任务

## 凭据配置

### Browser Use Cloud API（云端 API）

连接到官方 Browser Use 云服务：

1. 在 [Browser Use](https://browser-use.com/) 注册并获取 API 密钥
2. 在 n8n 中创建 "Browser Use Cloud API" 类型的凭据
3. 输入你的 API Key
4. 测试连接以验证

### Browser Use Local Bridge API（本地桥接 API）

连接到本地运行的 Browser Use 服务：

1. 按照[文档](https://docs.browser-use.com/)设置 Browser Use 桥接服务
2. 在 n8n 中创建 "Browser Use Local Bridge API" 类型的凭据
3. 输入本地服务的 URL（例如：`http://localhost:8000`）
4. 如果服务需要认证，可选择输入访问令牌
5. 测试连接以验证

⚠️ **重要提示**：本节点需要配合增强版 Browser Use 后端使用，以支持 webhook 回调等扩展功能。

**推荐后端**：[browser-n8n-local (sybrowseruse 分支)](https://github.com/Cshiyuan/browser-n8n-local/tree/sybrowseruse)

## Webhook 回调支持

### v1.1.0+ 新特性：异步任务完成

对于长时间运行的浏览器任务（>5 分钟），SYBrowserUse 现在支持通过 webhook 回调自动恢复工作流：

- 🔔 **自动通知**：任务完成时 Browser Use 自动回调 n8n
- ⚡ **资源高效**：工作流在任务执行期间暂停，无需轮询
- 🔧 **简单配置**：仅需启用一个参数

### 快速设置

1. 在 Run Task 节点中启用 "Use Webhook Callback"
2. 在 Run Task 后添加 Wait 节点（模式：On Webhook Call）
3. Wait 恢复后在后续节点中处理结果

### 详细指南

参见 [Webhook 回调指南](docs/webhook-callback-guide.md) 获取完整的设置说明，包括：
- n8n 工作流配置步骤
- Browser Use 后端实现要求
- 常见问题排查
- 最佳实践和安全考虑

**注意**：需要支持 `webhook_url` 参数的 Browser Use 后端版本。

## 兼容性

- 兼容 n8n@1.60.0 或更高版本
- Webhook 回调功能需要 n8n@1.0.0+（支持 `$execution.resumeUrl`）
- 推荐使用增强版后端：[browser-n8n-local](https://github.com/Cshiyuan/browser-n8n-local/tree/sybrowseruse)

## 资源链接

- [n8n 社区节点文档](https://docs.n8n.io/integrations/#community-nodes)
- [Browser Use 官方文档](https://docs.browser-use.com/)
- [Webhook 回调实现指南](docs/webhook-callback-guide.md)
- [增强版后端仓库](https://github.com/Cshiyuan/browser-n8n-local/tree/sybrowseruse)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 作者

**Cshiyuan**
- Email: 826718591@qq.com
- GitHub: [@Cshiyuan](https://github.com/Cshiyuan)

---

⭐ 如果这个项目对你有帮助，请给个 Star！

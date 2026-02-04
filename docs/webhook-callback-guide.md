# SYBrowserUse Webhook 回调指南

## 概述

Webhook 回调模式允许长时间运行的浏览器任务自动通知 n8n 工作流，无需轮询。当 Browser Use 完成任务时，会自动调用 n8n 的 resumeUrl，恢复暂停的工作流执行。

**适用场景**:
- ✅ 长时间运行的浏览器任务(>5分钟)
- ✅ 复杂的多页面数据抓取
- ✅ 需要等待动态内容加载的任务
- ✅ 希望工作流暂停期间不占用资源

**前提条件**:
- n8n 版本支持 `$execution.resumeUrl` (推荐 v1.0.0+)
- Browser Use 后端支持 `webhook_url` 参数
- n8n 实例可从外部网络访问

---

## n8n 工作流配置

### 步骤 1: 配置 Run Task 节点

1. 添加 **SYBrowserUse** 节点
2. 选择操作: **Run Task**
3. 配置任务指令 (Instructions)
4. **启用 Webhook 回调**:
   - 设置 `Use Webhook Callback` = `true`
5. **确认 Resume URL 已自动填充**:
   - Resume URL 字段应显示: `={{$execution.resumeUrl}}`
   - 这是 Wait 节点生成的唯一回调 URL

**示例配置**:
```
Operation: Run Task
Instructions: Go to example.com and extract all product information
Use Webhook Callback: ✓ (true)
Resume URL: ={{$execution.resumeUrl}} (自动填充)
```

### 步骤 2: 添加 Wait 节点

在 Run Task 节点之后立即添加 **Wait** 节点:

1. 添加 **Wait** 节点 (n8n 内置节点)
2. 配置 Wait 模式:
   - **Resume**: 选择 `On webhook call`
3. **可选配置**:
   - **Limit Time**: 设置最大等待时间(如 1800 秒 = 30 分钟)
   - **Resume On Timeout**: 建议启用，超时后继续执行而非失败

**示例配置**:
```
Resume: On webhook call
Options:
  - Limit Time: 1800 seconds
  - Resume On Timeout: ✓
```

### 步骤 3: 处理任务结果

Wait 节点恢复后，工作流继续执行。任务结果通过 `$json` 访问:

**方案 A: 直接使用 Webhook 传递的数据**
```json
// Wait 节点恢复后，$json 包含 Browser Use 回调的 payload
{
  "event": "task.completed",
  "task_id": "task_xyz789",
  "status": "completed",
  "result": {
    "final_result": "...",
    "extracted_data": {...}
  }
}

// 在后续节点中访问:
{{ $json.result.final_result }}
{{ $json.task_id }}
{{ $json.status }}
```

**方案 B: 使用 Get Task 获取详细结果**

添加 **SYBrowserUse** 节点:
- 操作: **Get Task**
- Task ID: `={{ $('Run Task').item.json.task_id }}`

这样可以获取完整的任务详情，包括截图、日志等。

---

## 工作流示例

### 完整工作流结构

```
┌────────────────────┐
│ Manual Trigger     │
└─────────┬──────────┘
          │
┌─────────▼──────────┐
│ Run Task           │
│ - useWebhook: true │
│ - 返回 task_id     │
└─────────┬──────────┘
          │
┌─────────▼──────────┐
│ Wait (Webhook)     │
│ - 暂停工作流       │
│ - 等待 Browser Use │
└─────────┬──────────┘
          │ (任务完成后自动恢复)
          │
┌─────────▼──────────┐
│ 处理结果           │
│ - 访问 $json       │
│ - 或 Get Task      │
└────────────────────┘
```

### JSON 工作流定义

```json
{
  "name": "Browser Task with Webhook",
  "nodes": [
    {
      "parameters": {},
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "runTask",
        "instructions": "Go to news.ycombinator.com and extract top 5 stories",
        "useWebhookCallback": true,
        "resumeUrl": "={{$execution.resumeUrl}}"
      },
      "name": "Run Task",
      "type": "n8n-nodes-sy-browseruse.syBrowserUse",
      "position": [450, 300]
    },
    {
      "parameters": {
        "resume": "webhook",
        "options": {
          "limit": 1800,
          "resumeOnTimeout": true
        }
      },
      "name": "Wait",
      "type": "n8n-nodes-base.wait",
      "position": [650, 300]
    },
    {
      "parameters": {
        "jsCode": "return [\n  {\n    json: {\n      task_id: $json.task_id,\n      status: $json.status,\n      result: $json.result\n    }\n  }\n];"
      },
      "name": "Process Result",
      "type": "n8n-nodes-base.code",
      "position": [850, 300]
    }
  ]
}
```

---

## Browser Use 后端配置

### API Payload 格式要求

Browser Use 后端需要接受以下 payload 格式:

```python
# POST /api/v1/run-task
{
  "task": "浏览器任务指令",
  "ai_provider": "anthropic",

  # 新增字段 (必须支持)
  "webhook_url": "https://n8n.example.com/webhook-waiting/exec-abc123",
  "webhook_events": ["task.completed", "task.failed"],  # 可选

  # 其他现有参数...
}
```

**字段说明**:
- `webhook_url` (string, 可选): n8n 的 resumeUrl，任务完成时调用
- `webhook_events` (array, 可选): 触发 webhook 的事件列表
  - `"task.completed"` - 任务成功完成
  - `"task.failed"` - 任务执行失败

### Webhook 回调实现 (Python 示例)

```python
import httpx
import logging
from datetime import datetime

class BrowserTask:
    def __init__(self, task_id, instructions, webhook_url=None, webhook_events=None):
        self.task_id = task_id
        self.instructions = instructions
        self.webhook_url = webhook_url
        self.webhook_events = webhook_events or ["task.completed"]
        self.status = "running"
        self.result = None

    async def execute(self):
        try:
            # 执行浏览器任务
            self.result = await run_browser_automation(self.instructions)
            self.status = "completed"

            # 触发 webhook 回调
            if self.webhook_url and "task.completed" in self.webhook_events:
                await self._trigger_webhook("task.completed")

        except Exception as e:
            self.status = "failed"
            self.error = str(e)

            # 触发失败 webhook
            if self.webhook_url and "task.failed" in self.webhook_events:
                await self._trigger_webhook("task.failed")

    async def _trigger_webhook(self, event_type):
        """触发 n8n webhook 回调"""
        if not self.webhook_url:
            return

        payload = {
            "event": event_type,
            "task_id": self.task_id,
            "status": self.status,
            "timestamp": datetime.utcnow().isoformat(),
        }

        if self.status == "completed":
            payload["result"] = self.result
        elif self.status == "failed":
            payload["error"] = self.error

        # 重试机制
        max_retries = 3
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.post(
                        self.webhook_url,
                        json=payload,
                        headers={
                            "Content-Type": "application/json",
                            "User-Agent": "Browser-Use-Webhook/1.0"
                        }
                    )

                    if 200 <= response.status_code < 300:
                        logging.info(f"✅ Webhook success: {self.task_id}")
                        return
                    else:
                        logging.warning(f"⚠️ Webhook status {response.status_code}")

            except httpx.TimeoutException:
                logging.warning(f"⏱️ Webhook timeout (attempt {attempt + 1})")
            except Exception as e:
                logging.error(f"❌ Webhook error: {e}")

            # 指数退避
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)

        logging.error(f"❌ Webhook failed after {max_retries} attempts")
```

### Webhook Payload 格式

Browser Use 调用 n8n resumeUrl 时的 payload:

```json
POST https://n8n.example.com/webhook-waiting/exec-abc123
Content-Type: application/json

{
  "event": "task.completed",
  "task_id": "task_xyz789",
  "status": "completed",
  "timestamp": "2025-12-11T10:32:15.123Z",
  "result": {
    "final_result": "任务执行结果",
    "extracted_data": {...},
    "screenshots": [...]
  }
}

// 或失败时:
{
  "event": "task.failed",
  "task_id": "task_xyz789",
  "status": "failed",
  "timestamp": "2025-12-11T10:32:15.123Z",
  "error": "错误信息描述"
}
```

---

## 故障排查

### 问题 1: Webhook 未触发

**症状**: Wait 节点一直等待，直到超时

**可能原因**:
- Browser Use 后端未实现 webhook 回调
- Resume URL 未正确传递给 Browser Use
- Resume URL 不可访问(网络问题)

**解决方案**:
1. **检查 Run Task 返回值**:
   ```json
   {
     "task_id": "xxx",
     "_webhook_configured": true,  // 应该为 true
     "_webhook_url": "https://..."  // 应该包含完整 URL
   }
   ```

2. **检查 Browser Use 后端日志**:
   - 确认收到了 `webhook_url` 参数
   - 查看 webhook 调用日志(成功/失败)

3. **验证 Resume URL 可访问性**:
   ```bash
   # 测试 Resume URL 是否可访问
   curl -X POST https://your-n8n.com/webhook-waiting/exec-123 \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

4. **检查防火墙设置**:
   - 确保 n8n 实例可从 Browser Use 后端访问
   - 如果使用本地 n8n，考虑使用 ngrok 等隧道工具

### 问题 2: Wait 节点超时

**症状**: Wait 节点在设定时间后自动恢复，但任务可能还在运行

**解决方案**:
1. **增加超时时间**:
   ```
   Wait 节点配置:
   - Limit Time: 3600 秒 (1小时) 或更长
   ```

2. **启用 Resume On Timeout**:
   - 超时后继续执行，而非失败
   - 后续可使用 Get Task Status 检查任务状态

3. **检查任务是否真正完成**:
   ```javascript
   // 在 Wait 节点后添加 IF 节点
   {{ $json.status === 'completed' }}
   ```

### 问题 3: Resume URL 为空

**症状**: Run Task 返回 `_webhook_url: undefined`

**可能原因**:
- Wait 节点未放置在 Run Task 之后
- n8n 版本不支持 `$execution.resumeUrl`

**解决方案**:
1. **确认工作流顺序**:
   ```
   Run Task → Wait (必须紧邻)
   ```

2. **手动设置 Resume URL**:
   - 在 Run Task 的 Resume URL 参数中手动输入完整 URL
   - 格式: `https://your-n8n.com/webhook-waiting/{{$execution.id}}`

3. **升级 n8n 版本**:
   - 推荐使用 n8n v1.0.0 或更高版本

### 问题 4: Webhook 数据丢失

**症状**: Wait 节点恢复后，`$json` 不包含任务结果

**解决方案**:
1. **检查 Browser Use 回调 payload**:
   - 确保包含 `result` 字段
   - 验证 JSON 格式正确

2. **使用 Get Task 作为后备**:
   ```
   Wait 节点后:
   - Get Task (operation: getTask)
   - Task ID: {{ $('Run Task').item.json.task_id }}
   ```

---

## 最佳实践

### 1. 设置合理的超时时间

```
短任务 (<5分钟): 600 秒
中等任务 (5-15分钟): 1800 秒
长任务 (>15分钟): 3600 秒或更长
```

### 2. 错误处理

在 Wait 节点后添加条件判断:

```
IF 节点:
  条件: {{ $json.status === 'completed' }}
  True 分支: 处理成功结果
  False 分支: 错误处理或重试
```

### 3. 日志记录

在关键步骤添加日志节点,记录:
- Run Task 返回的 task_id
- Webhook 配置状态
- 任务最终结果

### 4. 本地开发调试

使用 ngrok 将本地 n8n 暴露到公网:

```bash
# 安装 ngrok
brew install ngrok  # macOS
# 或 apt install ngrok  # Linux

# 启动隧道
ngrok http 5678

# 使用 ngrok 提供的 URL 配置 n8n
# 例如: https://abc123.ngrok.io
```

---

## 安全考虑

### Webhook URL 验证

Browser Use 后端应验证 webhook_url 安全性:

```python
from urllib.parse import urlparse

def validate_webhook_url(url: str) -> bool:
    """验证 webhook URL"""
    parsed = urlparse(url)

    # 禁止内网地址
    if parsed.hostname in ["localhost", "127.0.0.1", "0.0.0.0"]:
        return False

    # 仅允许 http/https
    if parsed.scheme not in ["http", "https"]:
        return False

    return True
```

### Webhook 签名 (可选)

增强安全性,验证回调来源:

```python
import hmac
import hashlib

def sign_payload(payload: dict, secret: str) -> str:
    """生成 HMAC 签名"""
    payload_str = json.dumps(payload, sort_keys=True)
    signature = hmac.new(
        secret.encode(),
        payload_str.encode(),
        hashlib.sha256
    ).hexdigest()
    return signature

# 在发送 webhook 时添加签名
headers = {
    "Content-Type": "application/json",
    "X-Webhook-Signature": sign_payload(payload, WEBHOOK_SECRET)
}
```

---

## 参考资料

- [n8n Wait 节点文档](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/)
- [n8n Webhook 节点文档](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [Browser Use API 文档](https://docs.browser-use.com/)

---

## 版本历史

- **v1.1.0** (2025-12-11): 初始 webhook 回调支持

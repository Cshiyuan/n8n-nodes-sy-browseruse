# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-11

### Added
- = **Webhook Callback Support**: Run Task operation now supports webhook callbacks for automatic workflow resumption
  - New parameter: `useWebhookCallback` - Enable/disable webhook callback mode
  - New parameter: `webhookNotice` - UI notice for webhook setup guidance
  - New parameter: `resumeUrl` - Automatically populated from n8n Wait node's `$execution.resumeUrl`
- ¡ **Seamless n8n Wait Node Integration**: Works with Wait node (On Webhook Call mode) for async task completion
- =Ê **Webhook Debug Metadata**: Run Task returns `_webhook_configured` and `_webhook_url` fields for debugging
- =Ö **Comprehensive Documentation**: Added detailed [Webhook Callback Guide](docs/webhook-callback-guide.md) covering:
  - n8n workflow configuration steps
  - Browser Use backend implementation requirements (Python examples)
  - Complete workflow JSON templates
  - Troubleshooting guide and best practices

### Changed
- **No Breaking Changes**: Webhook callback feature is opt-in via `useWebhookCallback` parameter
- Enhanced `executeRunTask` function to support optional `webhook_url` parameter passing to Browser Use API
- Improved error handling: Webhook configuration failures log warnings but don't block task execution

### Technical Details
- Modified files:
  - `nodes/SYBrowserUse/SYBrowserUse.node.ts`: Added 3 new parameters for webhook configuration
  - `nodes/SYBrowserUse/operations.ts`: Enhanced `executeRunTask` with webhook URL extraction and validation logic
- API Payload Enhancement: Sends `webhook_url` and `webhook_events` to Browser Use API when webhook callback is enabled
- URL Validation: Basic validation ensures `resumeUrl` starts with `http://` or `https://`
- Graceful Degradation: If `resumeUrl` is empty or invalid, logs warning and continues without webhook

### Requirements
- n8n version: 1.0.0+ (for `$execution.resumeUrl` support)
- Browser Use backend: Requires version with `webhook_url` parameter support (custom implementation needed)

## [1.0.0] - 2025-XX-XX

### Added
- Initial release of SYBrowserUse node
- Support for Cloud API and Local Bridge connection modes
- 8 core operations: Run Task, Get Task, Get Task Status, Stop Task, Get Task Media, Pause Task, Resume Task, List Tasks
- Multiple AI provider integration: Anthropic, OpenAI, Google (Gemini), Mistral, OpenRouter, Custom
- Browser configuration options: headful mode, custom Chrome, vision model support
- Browser data persistence with encryption
- Output model schema support for structured data extraction

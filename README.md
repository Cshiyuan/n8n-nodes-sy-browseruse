# n8n-nodes-sy-browseruse

This is an n8n community node. It lets you use AI-powered browser automation in your n8n workflows through the SYBrowserUse node.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Features](#features)
[Operations](#operations)
[Credentials](#credentials)
[Webhook Callback Support](#webhook-callback-support)
[Compatibility](#compatibility)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Features

- 🤖 **AI-Powered Automation**: Use natural language instructions to control browser interactions
- ☁️ **Dual Connection Modes**: Connect via Cloud API or Local Bridge
- 🔄 **Webhook Callbacks**: Automatic workflow resumption for long-running tasks (v1.1.0+)
- 🎯 **Multiple AI Providers**: Support for Anthropic, OpenAI, Google, Mistral, OpenRouter, and custom providers
- 📊 **Task Management**: Complete lifecycle control (run, pause, resume, stop)
- 📸 **Media Retrieval**: Access screenshots, videos, and PDFs from task executions

## Operations

### SYBrowserUse Node

- **Run Task**: Execute browser automation with natural language instructions
- **Get Task**: Retrieve complete task details including results and media
- **Get Task Status**: Check the current status of a running task
- **Get Task Media**: Download screenshots, videos, or PDFs from task execution
- **List Tasks**: Get a list of recent tasks with configurable limit
- **Pause Task**: Temporarily pause a running task
- **Resume Task**: Resume a previously paused task
- **Stop Task**: Terminate a running task

## Credentials

### Browser Use Cloud API

Connect to the official Browser Use cloud service:

1. Sign up at [Browser Use](https://browser-use.com/) to get your API key
2. In n8n, create a new credential of type "Browser Use Cloud API"
3. Enter your API Key
4. Test the connection to verify

### Browser Use Local Bridge API

Connect to a locally running Browser Use service:

1. Set up the Browser Use bridge service following the [documentation](https://docs.browser-use.com/)
2. In n8n, create a new credential of type "Browser Use Local Bridge API"
3. Enter the URL of your local service (e.g., `http://localhost:8000`)
4. Optionally enter an access token if your service requires authentication
5. Test the connection to verify

## Webhook Callback Support

### v1.1.0+ Feature: Asynchronous Task Completion

For long-running browser tasks (>5 minutes), SYBrowserUse now supports automatic workflow resumption via webhook callbacks:

- 🔔 **Automatic Notification**: Browser Use calls back to n8n when task completes
- ⚡ **Resource Efficient**: Workflow pauses during task execution, no polling required
- 🔧 **Simple Configuration**: Enable with a single parameter

**Quick Setup**:
1. Enable "Use Webhook Callback" in Run Task node
2. Add a Wait node (mode: "On Webhook Call") after Run Task
3. Process results in subsequent nodes after Wait resumes

**Detailed Guide**: See [Webhook Callback Guide](docs/webhook-callback-guide.md) for complete setup instructions including:
- n8n workflow configuration steps
- Browser Use backend implementation requirements
- Troubleshooting common issues
- Best practices and security considerations

**Note**: Requires Browser Use backend version with webhook_url parameter support.

## Compatibility

- Compatible with n8n@1.60.0 or later
- Webhook callback feature requires n8n@1.0.0+ (for `$execution.resumeUrl` support)

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Browser Use documentation](https://docs.browser-use.com/)
- [Webhook Callback Implementation Guide](docs/webhook-callback-guide.md)

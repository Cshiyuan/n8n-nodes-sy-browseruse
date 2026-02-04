// 导入 n8n 工作流相关的类型和类
// Import n8n workflow related types and classes
import type { IExecuteFunctions } from 'n8n-workflow';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

// 导入传输层和操作实现
// Import transport layer and operations
import { getConnectionConfig, validateConnection } from './transport';
import {
	executeRunTask,
	executeGetTaskStatus,
	executeStopTask,
	executeGetTaskMedia,
	executeGetTask,
	executePauseTask,
	executeResumeTask,
	executeListTasks,
	type OperationContext,
} from './operations';

/**
 * SYBrowserUse 节点类
 * 用于通过 AI 自动化浏览器交互，支持 Cloud API 和本地桥接两种连接方式
 *
 * SYBrowserUse Node Class
 * Used for automating browser interactions with AI, supports both Cloud API and Local Bridge connection methods
 */
export class SYBrowserUse implements INodeType {
	// 节点描述配置
	// Node description configuration
	description: INodeTypeDescription = {
		displayName: 'SYBrowserUse',
		name: 'syBrowserUse',
		icon: 'file:../../icons/sybrowseruse.svg',
		group: ['transform'], // 节点分组 / Node group
		version: 1,
		description: 'Automate browser interactions using AI',
		defaults: {
			name: 'Browser Use',
		},
		inputs: ['main'], // 输入端点 / Input endpoints
		outputs: ['main'], // 输出端点 / Output endpoints
		usableAsTool: true, // 可作为工具使用 / Can be used as a tool
		// 凭据配置：根据连接类型显示不同的凭据
		// Credentials configuration: Display different credentials based on connection type
		credentials: [
			// Cloud API 凭据配置（仅在选择 Cloud 连接时显示）
			// Cloud API credentials (only shown when Cloud connection is selected)
			{
				name: 'browserUseCloudApi',
				required: true,
				displayOptions: {
					show: {
						connectionType: ['cloud'],
					},
				},
			},
			// 本地桥接凭据配置（仅在选择 Local 连接时显示）
			// Local Bridge credentials (only shown when Local connection is selected)
			{
				name: 'browserUseLocalBridgeApi',
				required: true,
				displayOptions: {
					show: {
						connectionType: ['local'],
					},
				},
			},
		],
		// 节点属性配置
		// Node properties configuration
		properties: [
			// 连接类型选择器：Cloud API 或本地桥接
			// Connection Type selector: Cloud API or Local Bridge
			{
				displayName: 'Connection Type',
				name: 'connectionType',
				type: 'options',
				options: [
					{
						name: 'Cloud API',
						value: 'cloud',
						description: 'Connect to Browser Use Cloud API (simplest setup)',
					},
					{
						name: 'Local Bridge',
						value: 'local',
						description:
							'Connect to locally running Browser Use bridge (requires additional setup)',
					},
				],
				default: 'cloud',
				description: 'Choose how to connect to Browser Use',
			},

			// 本地桥接设置提示（仅在选择 Local 连接时显示）
			// Local Bridge setup notice (only shown when Local connection is selected)
			{
				displayName: 'Local Bridge Setup Required',
				name: 'localBridgeNotice',
				type: 'notice',
				default:
					'The Local Bridge option requires setting up a Python service separately. Please refer to the documentation for installation instructions.',
				displayOptions: {
					show: {
						connectionType: ['local'],
					},
				},
			},

			// 操作选择器：定义所有可用的浏览器自动化操作
			// Operation selector: Define all available browser automation operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Task',
						value: 'getTask',
					},
					{
						name: 'Get Task Media',
						value: 'getTaskMedia',
					},
					{
						name: 'Get Task Status',
						value: 'getTaskStatus',
					},
					{
						name: 'List Tasks',
						value: 'listTasks',
					},
					{
						name: 'Pause Task',
						value: 'pauseTask',
					},
					{
						name: 'Resume Task',
						value: 'resumeTask',
					},
					{
						name: 'Run Task',
						value: 'runTask',
					},
					{
						name: 'Stop Task',
						value: 'stopTask',
					},
				],
				default: 'runTask',
			},

			// 任务指令参数（用于 Run Task 操作）
			// Task instruction parameter (for Run Task operation)
			{
				displayName: 'Instructions',
				name: 'instructions',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				placeholder: 'e.g., Go to google.com and search for "n8n automation"',
				displayOptions: {
					show: {
						operation: ['runTask'],
					},
				},
				description: 'Natural language instructions for the browser automation',
				required: true,
			},

			// 新增 output_model_schema 参数（用于 Run Task 操作）
			// New output_model_schema parameter (for Run Task operation)
			{
				displayName: 'Output Model Schema',
				name: 'outputModelSchema',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '{}',
				placeholder: '{\n  "type": "object",\n  "properties": {\n    "result": {\n      "type": "string"\n    }\n  }\n}',
				displayOptions: {
					show: {
						operation: ['runTask'],
					},
				},
				description: 'JSON Schema for the expected output model',
			},

			// 选择 AI 提供商（用于 Run Task 操作）
			// Select AI provider (for Run Task operation)
			{
				displayName: 'AI Provider',
				name: 'aiProvider',
				type: 'options',
				options: [
					{
						name: 'Anthropic',
						value: 'anthropic',
					},
					{
						name: 'Browser Use Default',
						value: 'browser_use',
					},
					{
						name: 'Custom',
						value: 'custom',
					},
					{
						name: 'Google (Gemini)',
						value: 'google',
					},
					{
						name: 'Mistral',
						value: 'mistral',
					},
					{
						name: 'OpenAI',
						value: 'openai',
					},
					{
						name: 'OpenRouter',
						value: 'openrouter',
					},
					{
						name: 'Use Default (API Decides)',
						value: 'auto',
					},
				],
				default: 'auto',
				displayOptions: {
					show: {
						operation: ['runTask'],
					},
				},
				description: 'Choose which AI provider should execute this task',
			},

			// 自定义 AI 提供商标识（用于选择 Custom 时）
			// Custom AI provider identifier (shown when Custom is selected)
			{
				displayName: 'Custom AI Provider',
				name: 'customAiProvider',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['runTask'],
						aiProvider: ['custom'],
					},
				},
				required: true,
				description: 'Enter the provider key expected by the Browser Use API when using a custom provider',
			},

			// 启用视觉模型选项（用于 Run Task 操作）
			// Enable vision model option (for Run Task operation)
			{
				displayName: 'Use Vision',
				name: 'useVision',
				type: 'options',
				options: [
					{ name: 'Auto (API Decides)', value: 'auto' },
					{ name: 'Enable', value: 'true' },
					{ name: 'Disable', value: 'false' },
				],
				default: 'auto',
				displayOptions: {
					show: {
						operation: ['runTask'],
					},
				},
				description: 'Whether to enable vision model support during task execution (auto/true/false)',
			},

			// 启用有头模式（用于 Run Task 操作）
			// Enable headful mode (for Run Task operation)
			{
				displayName: 'Headful Mode',
				name: 'headful',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['runTask'],
					},
				},
				description: 'Whether to run the browser in headful mode instead of headless',
			},

			// 启用自定义 Chrome（用于 Run Task 操作）
			// Enable custom Chrome usage (for Run Task operation)
			{
				displayName: 'Use Custom Chrome',
				name: 'useCustomChrome',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['runTask'],
					},
				},
				description: 'Whether to use a custom Chrome installation configured on the server',
			},

			// 保存浏览器数据选项（用于 Run Task 操作）
			// Save browser data option (for Run Task operation)
			{
				displayName: 'Save Browser Data',
				name: 'saveBrowserData',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['runTask'],
					},
				},
				description:
					'Whether to save browser cookies and other data. Cookies are safely encrypted before storing in the database.',
			},

			// Webhook 回调开关（用于 Run Task 操作）
			// Webhook callback switch (for Run Task operation)
			{
				displayName: 'Use Webhook Callback',
				name: 'useWebhookCallback',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['runTask'],
					},
				},
				description: 'Whether to enable webhook callback to automatically resume workflow when task completes',
				hint: 'Requires a Wait node (On Webhook Call) after this node',
			},

			// Webhook 回调说明
			// Webhook callback notice
			{
				displayName: 'Webhook Setup Notice',
				name: 'webhookNotice',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						operation: ['runTask'],
						useWebhookCallback: [true],
					},
				},
				description: '✅ Webhook callback enabled. Add a Wait node (mode: On Webhook Call) after this node to pause workflow until task completes.',
			},

			// Resume URL（从 Wait 节点获取）
			// Resume URL (from Wait node)
			{
				displayName: 'Resume URL',
				name: 'resumeUrl',
				type: 'string',
				default: '={{$execution.resumeUrl}}',
				displayOptions: {
					show: {
						operation: ['runTask'],
						useWebhookCallback: [true],
					},
				},
				description: 'The webhook URL that Browser Use will call when task completes',
				hint: 'Automatically populated from Wait node. You can customize this if needed.',
			},

			// 任务 ID 参数（用于需要指定任务的操作）
			// Task ID parameter (for operations that require specifying a task)
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'getTaskStatus',
							'stopTask',
							'getTaskMedia',
							'getTask',
							'pauseTask',
							'resumeTask',
						],
					},
				},
				description: 'ID of the task to interact with',
				required: true,
			},

			// 媒体类型参数（用于 Get Task Media 操作）
			// Media type parameter (for Get Task Media operation)
			{
				displayName: 'Media Type',
				name: 'mediaType',
				type: 'options',
				options: [
					{ name: 'Screenshot', value: 'screenshot' },
					{ name: 'Video', value: 'video' },
					{ name: 'PDF', value: 'pdf' },
				],
				default: 'screenshot',
				displayOptions: {
					show: {
						operation: ['getTaskMedia'],
					},
				},
				description: 'Type of media to retrieve from the task',
			},

			// 限制数量参数（用于 List Tasks 操作）
			// Limit parameter (for List Tasks operation)
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 40,
				},
				default: 20,
				displayOptions: {
					show: {
						operation: ['listTasks'],
					},
				},
				description: 'Max number of results to return',
			},
		],
	};

	/**
	 * 执行节点的主方法
	 * Main execution method of the node
	 */
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// 获取输入数据
		// Get input data
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// 获取用户选择的操作
		// Get user selected operation
		const operation = this.getNodeParameter('operation', 0) as string;

		// 获取连接配置和凭据
		// Get connection configuration and credentials
		const { credentials, baseUrl, connectionType } = await getConnectionConfig(this);

		// 验证连接
		// Validate connection
		await validateConnection(this, baseUrl, credentials, connectionType);

		// 构建操作上下文
		// Build operation context
		const config: OperationContext = {
			baseUrl,
			credentials,
			connectionType,
		};

		// 遍历所有输入项并执行相应操作
		// Iterate through all input items and execute corresponding operations
		for (let i = 0; i < items.length; i++) {
			try {
				let result: INodeExecutionData;
				// 根据操作类型调用相应的执行方法
				// Call the corresponding execution method based on operation type
				switch (operation) {
					case 'runTask':
						result = await executeRunTask(this, i, config);
						break;

					case 'getTaskStatus':
						result = await executeGetTaskStatus(this, i, config);
						break;

					case 'stopTask':
						result = await executeStopTask(this, i, config);
						break;

					case 'getTaskMedia':
						result = await executeGetTaskMedia(this, i, config);
						break;

					case 'getTask':
						result = await executeGetTask(this, i, config);
						break;

					case 'pauseTask':
						result = await executePauseTask(this, i, config);
						break;

					case 'resumeTask':
						result = await executeResumeTask(this, i, config);
						break;

					case 'listTasks':
						result = await executeListTasks(this, i, config);
						break;

					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: i,
						});
				}

				returnData.push(result);
			} catch (error) {
				// 错误处理：如果启用了"失败时继续"，则记录错误并继续处理下一项
				// Error handling: If "continue on fail" is enabled, log the error and continue with next item
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}
		return [returnData];
	}
}

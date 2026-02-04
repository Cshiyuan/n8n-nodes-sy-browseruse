/**
 * Browser Use 操作实现
 * Browser Use Operations Implementation
 *
 * 包含所有浏览器自动化操作的具体实现
 * Contains concrete implementations of all browser automation operations
 */

import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeApiRequest } from './transport';

/**
 * 操作上下文接口
 * Operation context interface
 */
export interface OperationContext {
	baseUrl: string;
	credentials: IDataObject;
	connectionType: string;
}

/**
 * 验证 Task ID 格式，防止路径遍历注入
 * Validate Task ID format to prevent path traversal injection
 */
function validateTaskId(
	taskId: string,
	context: IExecuteFunctions,
	itemIndex: number,
): string {
	const trimmed = taskId.trim();

	// 检查是否为空
	// Check if empty
	if (!trimmed) {
		throw new NodeOperationError(
			context.getNode(),
			'Task ID cannot be empty',
			{ itemIndex }
		);
	}

	// 只允许字母数字、连字符和下划线，防止路径遍历
	// Only allow alphanumeric, hyphens and underscores to prevent path traversal
	if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
		throw new NodeOperationError(
			context.getNode(),
			`Invalid Task ID format: "${trimmed}". Task ID should only contain alphanumeric characters, hyphens, and underscores.`,
			{ itemIndex }
		);
	}

	// 限制长度防止 DoS
	// Limit length to prevent DoS
	if (trimmed.length > 100) {
		throw new NodeOperationError(
			context.getNode(),
			`Task ID is too long (max 100 characters, got ${trimmed.length})`,
			{ itemIndex }
		);
	}

	// 返回 URL 编码后的 taskId
	// Return URL-encoded taskId
	return encodeURIComponent(trimmed);
}

/**
 * 执行 Run Task 操作
 * Execute Run Task operation
 */
export async function executeRunTask(
	context: IExecuteFunctions,
	itemIndex: number,
	config: OperationContext,
): Promise<INodeExecutionData> {
	const instructions = context.getNodeParameter('instructions', itemIndex) as string;
	const saveBrowserData = context.getNodeParameter('saveBrowserData', itemIndex) as boolean;
	const useVision = context.getNodeParameter('useVision', itemIndex) as string;
	const headful = context.getNodeParameter('headful', itemIndex) as boolean;
	const useCustomChrome = context.getNodeParameter('useCustomChrome', itemIndex) as boolean;
	const aiProvider = context.getNodeParameter('aiProvider', itemIndex) as string;
	const outputModelSchemaParam = context.getNodeParameter('outputModelSchema', itemIndex) as string;

	// 获取 webhook 相关参数
	// Get webhook related parameters
	const useWebhookCallback = context.getNodeParameter('useWebhookCallback', itemIndex, false) as boolean;

	let outputModelSchema: string | undefined;

	const trimmedSchema = outputModelSchemaParam.trim();

	if (trimmedSchema.length > 0) {
		try {
			JSON.parse(trimmedSchema);
		} catch (error) {
			throw new NodeOperationError(
				context.getNode(),
				`Output Model Schema must be valid JSON: ${error.message}`,
				{ itemIndex }
			);
		}
		outputModelSchema = trimmedSchema;
	}

	let aiProviderValue: string | undefined;

	if (aiProvider === 'custom') {
		const customAiProvider = context.getNodeParameter('customAiProvider', itemIndex) as string;
		const trimmedProvider = customAiProvider.trim();

		if (trimmedProvider.length === 0) {
			throw new NodeOperationError(context.getNode(), 'Custom AI Provider must not be empty', {
				itemIndex,
			});
		}

		aiProviderValue = trimmedProvider;
	} else if (aiProvider !== 'auto') {
		aiProviderValue = aiProvider;
	}

	const payload: IDataObject = {
		task: instructions,
		save_browser_data: saveBrowserData,
	};

	if (outputModelSchema !== undefined) {
		payload.output_model_schema = outputModelSchema;
	}

	if (aiProviderValue !== undefined) {
		payload.ai_provider = aiProviderValue;
	}

	// useVision 参数处理：只有明确选择 true/false 时才添加，auto 时由 API 决定
	// useVision parameter handling: only add when explicitly true/false, let API decide when auto
	if (useVision === 'true') {
		payload.use_vision = true;
	} else if (useVision === 'false') {
		payload.use_vision = false;
	}

	if (headful !== undefined) {
		payload.headful = headful;
	}

	if (useCustomChrome !== undefined) {
		payload.use_custom_chrome = useCustomChrome;
	}

	// 如果启用 webhook 回调，添加 webhook_url
	// If webhook callback is enabled, add webhook_url
	if (useWebhookCallback) {
		// 获取 resumeUrl (从 Wait 节点生成)
		// Get resumeUrl (generated from Wait node)
		const resumeUrl = context.getNodeParameter('resumeUrl', itemIndex) as string;

		if (!resumeUrl || resumeUrl.trim() === '') {
			throw new NodeOperationError(
				context.getNode(),
				'Webhook callback is enabled but Resume URL is empty. Please ensure a Wait node is configured.',
				{ itemIndex }
			);
		}

		// 解析并验证 resumeUrl
		// Parse and validate resumeUrl
		const cleanedUrl = resumeUrl.trim();

		// 检测未解析的表达式
		// Detect unresolved expressions
		if (cleanedUrl.startsWith('={{') || cleanedUrl.includes('$execution')) {
			throw new NodeOperationError(
				context.getNode(),
				'Resume URL expression not evaluated. Ensure a Wait node (On Webhook Call) is placed AFTER this node.',
				{ itemIndex }
			);
		}

		// URL 格式验证和 SSRF 防护
		// URL format validation and SSRF protection
		let parsedUrl: URL;
		try {
			parsedUrl = new URL(cleanedUrl);
		} catch (error) {
			throw new NodeOperationError(
				context.getNode(),
				`Invalid Resume URL format: ${error.message}`,
				{ itemIndex }
			);
		}

		// 只允许 HTTP/HTTPS 协议
		// Only allow HTTP/HTTPS protocols
		if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
			context.logger.warn(`SSRF Protection: Blocked invalid protocol ${parsedUrl.protocol} for URL: ${cleanedUrl}`);
			throw new NodeOperationError(
				context.getNode(),
				'Only HTTP and HTTPS protocols are allowed for webhook URL',
				{ itemIndex }
			);
		}

		// SSRF 防护: 阻止内网地址
		// SSRF protection: Block internal network addresses
		const hostname = parsedUrl.hostname.toLowerCase();

		// 阻止环回地址
		// Block loopback addresses
		if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
			context.logger.warn(`SSRF Protection: Blocked loopback address ${hostname} for URL: ${cleanedUrl}`);
			throw new NodeOperationError(
				context.getNode(),
				'Webhook URL cannot target localhost. Use a publicly accessible URL or configure n8n WEBHOOK_URL environment variable.',
				{ itemIndex }
			);
		}

		// 阻止私有 IP 范围 (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
		// Block private IP ranges
		if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname)) {
			context.logger.warn(`SSRF Protection: Blocked private IP address ${hostname} for URL: ${cleanedUrl}`);
			throw new NodeOperationError(
				context.getNode(),
				'Webhook URL cannot target private IP ranges. Use a publicly accessible URL.',
				{ itemIndex }
			);
		}

		// 阻止云元数据端点 (AWS, GCP, Azure)
		// Block cloud metadata endpoints
		if (hostname.startsWith('169.254.') || hostname.startsWith('fd00:')) {
			context.logger.warn(`SSRF Protection: Blocked link-local address ${hostname} for URL: ${cleanedUrl}`);
			throw new NodeOperationError(
				context.getNode(),
				'Webhook URL cannot target link-local addresses.',
				{ itemIndex }
			);
		}

		// 记录成功通过 SSRF 检查的 URL (仅在 debug 模式下)
		// Log URLs that passed SSRF checks (debug mode only)
		context.logger.debug(`SSRF Protection: URL ${cleanedUrl} passed all security checks`);

		payload.webhook_url = cleanedUrl;

		// 添加 webhook 事件类型
		// Add webhook event types
		payload.webhook_events = ['task.completed', 'task.failed'];

		context.logger.info('Webhook callback configured successfully');
	}

	const response = await makeApiRequest(
		context,
		'POST',
		`${config.baseUrl}/run-task`,
		config.credentials,
		config.connectionType,
		payload,
	);

	// 返回结果，包含 webhook 配置元数据
	// Return result with webhook configuration metadata
	return {
		json: {
			...response,
			// 添加元数据（如果启用了 webhook）
			// Add metadata (if webhook is enabled)
			...(useWebhookCallback && {
				_webhook_configured: true,
				_webhook_url: payload.webhook_url,
				_webhook_events: payload.webhook_events,
			}),
		},
		pairedItem: { item: itemIndex },
	};
}

/**
 * 执行 Get Task Status 操作
 * Execute Get Task Status operation
 */
export async function executeGetTaskStatus(
	context: IExecuteFunctions,
	itemIndex: number,
	config: OperationContext,
): Promise<INodeExecutionData> {
	const taskId = validateTaskId(
		context.getNodeParameter('taskId', itemIndex) as string,
		context,
		itemIndex,
	);

	const response = await makeApiRequest(
		context,
		'GET',
		`${config.baseUrl}/task/${taskId}/status`,
		config.credentials,
		config.connectionType,
	);

	return {
		json: response,
		pairedItem: { item: itemIndex },
	};
}

/**
 * 执行 Stop Task 操作
 * Execute Stop Task operation
 */
export async function executeStopTask(
	context: IExecuteFunctions,
	itemIndex: number,
	config: OperationContext,
): Promise<INodeExecutionData> {
	const taskId = validateTaskId(
		context.getNodeParameter('taskId', itemIndex) as string,
		context,
		itemIndex,
	);

	const response = await makeApiRequest(
		context,
		'PUT',
		`${config.baseUrl}/stop-task/${taskId}`,
		config.credentials,
		config.connectionType,
	);

	return {
		json: response,
		pairedItem: { item: itemIndex },
	};
}

/**
 * 执行 Get Task Media 操作
 * Execute Get Task Media operation
 */
export async function executeGetTaskMedia(
	context: IExecuteFunctions,
	itemIndex: number,
	config: OperationContext,
): Promise<INodeExecutionData> {
	const taskId = validateTaskId(
		context.getNodeParameter('taskId', itemIndex) as string,
		context,
		itemIndex,
	);
	const mediaType = context.getNodeParameter('mediaType', itemIndex) as string;

	const encodedMediaType = encodeURIComponent(mediaType);
	const response = await makeApiRequest(
		context,
		'GET',
		`${config.baseUrl}/task/${taskId}/media?type=${encodedMediaType}`,
		config.credentials,
		config.connectionType,
	);

	return {
		json: response,
		pairedItem: { item: itemIndex },
	};
}

/**
 * 执行 Get Task 操作
 * Execute Get Task operation
 */
export async function executeGetTask(
	context: IExecuteFunctions,
	itemIndex: number,
	config: OperationContext,
): Promise<INodeExecutionData> {
	const taskId = validateTaskId(
		context.getNodeParameter('taskId', itemIndex) as string,
		context,
		itemIndex,
	);

	const response = await makeApiRequest(
		context,
		'GET',
		`${config.baseUrl}/task/${taskId}`,
		config.credentials,
		config.connectionType,
	);

	return {
		json: response,
		pairedItem: { item: itemIndex },
	};
}

/**
 * 执行 Pause Task 操作
 * Execute Pause Task operation
 */
export async function executePauseTask(
	context: IExecuteFunctions,
	itemIndex: number,
	config: OperationContext,
): Promise<INodeExecutionData> {
	const taskId = validateTaskId(
		context.getNodeParameter('taskId', itemIndex) as string,
		context,
		itemIndex,
	);

	const response = await makeApiRequest(
		context,
		'PUT',
		`${config.baseUrl}/pause-task/${taskId}`,
		config.credentials,
		config.connectionType,
	);

	return {
		json: response,
		pairedItem: { item: itemIndex },
	};
}

/**
 * 执行 Resume Task 操作
 * Execute Resume Task operation
 */
export async function executeResumeTask(
	context: IExecuteFunctions,
	itemIndex: number,
	config: OperationContext,
): Promise<INodeExecutionData> {
	const taskId = validateTaskId(
		context.getNodeParameter('taskId', itemIndex) as string,
		context,
		itemIndex,
	);

	const response = await makeApiRequest(
		context,
		'PUT',
		`${config.baseUrl}/resume-task/${taskId}`,
		config.credentials,
		config.connectionType,
	);

	return {
		json: response,
		pairedItem: { item: itemIndex },
	};
}

/**
 * 执行 List Tasks 操作
 * Execute List Tasks operation
 */
export async function executeListTasks(
	context: IExecuteFunctions,
	itemIndex: number,
	config: OperationContext,
): Promise<INodeExecutionData> {
	const limit = context.getNodeParameter('limit', itemIndex) as number;

	const encodedLimit = encodeURIComponent(limit.toString());
	const response = await makeApiRequest(
		context,
		'GET',
		`${config.baseUrl}/tasks?limit=${encodedLimit}`,
		config.credentials,
		config.connectionType,
	);

	return {
		json: response,
		pairedItem: { item: itemIndex },
	};
}

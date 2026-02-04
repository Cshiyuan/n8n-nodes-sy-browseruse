/**
 * Browser Use API 传输层
 * Transport layer for Browser Use API
 *
 * 包含连接配置、验证、请求封装和认证等功能
 * Contains connection configuration, validation, request wrapper, and authentication
 */

import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

/**
 * 连接配置接口
 * Connection configuration interface
 */
export interface ConnectionConfig {
	credentials: IDataObject;
	baseUrl: string;
	connectionType: string;
}

/**
 * 获取连接配置和凭据
 * Get connection configuration and credentials
 */
export async function getConnectionConfig(
	context: IExecuteFunctions,
	itemIndex: number = 0,
): Promise<ConnectionConfig> {
	const connectionType = context.getNodeParameter('connectionType', 0) as string;
	let credentials;
	let baseUrl: string;

	if (connectionType === 'cloud') {
		// Cloud API 模式：使用官方云服务
		// Cloud API mode: Use official cloud service
		credentials = await context.getCredentials('browserUseCloudApi');

		if (!credentials.apiKey) {
			throw new NodeOperationError(
				context.getNode(),
				'API Key is required for Browser Use Cloud API',
				{ itemIndex },
			);
		}

		baseUrl = 'https://api.browser-use.com/api/v1';
	} else {
		// 本地桥接模式：连接到本地运行的 Python 服务
		// Local Bridge mode: Connect to locally running Python service
		credentials = await context.getCredentials('browserUseLocalBridgeApi');

		if (!credentials.url) {
			throw new NodeOperationError(
				context.getNode(),
				'URL is required for Browser Use Local Bridge',
				{ itemIndex },
			);
		}

		baseUrl = credentials.url as string;
		try {
			const parsedUrl = new URL(baseUrl);
			if (parsedUrl.hostname === 'localhost') {
				parsedUrl.hostname = '127.0.0.1';
				baseUrl = parsedUrl.toString();
			}
		} catch (error) {
			// 记录 URL 解析错误但不中断流程，验证会在后续捕获
			// Log URL parsing errors but don't interrupt flow, validation will catch it later
			context.logger.warn(`URL parsing warning: ${error instanceof Error ? error.message : 'Invalid URL format'}`);
		}

		baseUrl = baseUrl.replace(/\/+$/, '');
		if (!baseUrl.endsWith('/api/v1')) {
			baseUrl = `${baseUrl}/api/v1`;
		}
	}

	return { credentials, baseUrl, connectionType };
}

/**
 * 验证连接可用性
 * Validate connection availability
 */
export async function validateConnection(
	context: IExecuteFunctions,
	baseUrl: string,
	credentials: IDataObject,
	connectionType: string,
	itemIndex: number = 0,
): Promise<void> {
	try {
		await context.helpers.httpRequest({
			method: 'GET',
			url: `${baseUrl}/ping`,
			headers: {
				Authorization: buildAuthorizationHeader(credentials, connectionType),
			},
			json: true,
		});
	} catch (error) {
		const errorMessage =
			connectionType === 'cloud'
				? `Failed to connect to Browser Use Cloud API: ${error.message}`
				: `Failed to connect to Browser Use Local Bridge at ${baseUrl}: ${error.message}`;
		throw new NodeApiError(context.getNode(), error, { message: errorMessage, itemIndex });
	}
}

/**
 * 构建认证头
 * Build authorization header
 */
export function buildAuthorizationHeader(
	credentials: IDataObject,
	connectionType: string,
): string | undefined {
	if (connectionType === 'cloud') {
		return `Bearer ${credentials.apiKey}`;
	}
	return credentials.token ? `Bearer ${credentials.token}` : undefined;
}

/**
 * 通用 API 请求方法
 * Generic API request method
 */
export async function makeApiRequest(
	context: IExecuteFunctions,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE',
	url: string,
	credentials: IDataObject,
	connectionType: string,
	body?: IDataObject,
	timeout?: number,
): Promise<IDataObject> {
	// 默认超时设置：POST (runTask) 10分钟，其他请求 2分钟
	// Default timeout: POST (runTask) 10 minutes, other requests 2 minutes
	const defaultTimeout = method === 'POST' ? 600000 : 120000;

	return await context.helpers.httpRequest({
		method,
		url,
		headers: {
			Authorization: buildAuthorizationHeader(credentials, connectionType),
			...(body && { 'Content-Type': 'application/json' }),
		},
		...(body && { body }),
		json: true,
		timeout: timeout || defaultTimeout,
	});
}

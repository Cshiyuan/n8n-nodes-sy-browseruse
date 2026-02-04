import { config } from '@n8n/node-cli/eslint';

// 扩展配置以禁用有问题的规则
export default [
	...config,
	{
		// 忽略归档目录
		ignores: ['.archive/**/*'],
	},
	{
		files: ['./nodes/**/*.ts'],
		rules: {
			// 禁用 limit 默认值检查，因为该规则硬编码要求默认值为 50
			// 但没有考虑 maxValue 可能小于 50 的情况
			'n8n-nodes-base/node-param-default-wrong-for-limit': 'off',
			'n8n-nodes-base/node-filename-against-convention': 'off',
		},
	},
];

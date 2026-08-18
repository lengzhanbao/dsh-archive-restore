import { defineTool } from '@deepseek-ai/dsh-tools';
import z from 'schemastery';
export const name = '@dsh-external/dsh-archive-restore';
export const inject = ['tools'];
export const Config = z.object({
    title: z.string().default('已归档会话恢复区'),
});
export function apply(ctx, config) {
    ctx.effect(() => ctx.tools.register(defineTool({
        name: '_dsh_external_dsh_archive_restore_about',
        description: '说明：已归档会话恢复区挂载在侧边栏 footer（sidebar.footer.action slot），对话列表和设置按钮之间。归档会话后该区列出已归档会话，每项可恢复或删除。',
        parameters: {},
        output: {
            schema: { type: 'string' },
            render: (_args, value) => [{ type: 'text', text: String(value) }],
        },
        async execute() {
            return JSON.stringify({ title: config.title, hint: '恢复区在 web 界面底部，无需此工具操作' });
        },
    })), '@dsh-external/dsh-archive-restore: about tool');
}
//# sourceMappingURL=index.js.map
/**
 * @dsh-external/dsh-archive-restore — host 侧（仅注册一个说明性工具）。
 *
 * 恢复区本身是纯前端能力：client 面板挂 shell.overlay，直接调
 * ctx.workspaces.unarchiveSession（DSH 0.x 新增对称 RPC）反归档。
 * host 侧不需要 webServer API，这里只留一个说明性工具，保持插件
 * host/client 双侧结构完整。
 *
 * 构建：npm run build（tsc -p tsconfig.json 编译 src/ → lib/）。
 */
import type { Context } from 'cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import z from 'schemastery'

export const name = '@dsh-external/dsh-archive-restore'
export const inject = ['tools']

export interface Config {
  title: string
}

export const Config = z.object({
  title: z.string().default('已归档会话恢复区'),
})

export function apply(ctx: Context, config: Config): void {
  ctx.effect(() => ctx.tools.register(defineTool({
    name: '_dsh_external_dsh_archive_restore_about',
    description: '说明：已归档会话恢复区挂载在侧边栏 footer（sidebar.footer.action slot），对话列表和设置按钮之间。归档会话后该区列出已归档会话，每项可恢复或删除。',
    parameters: {},
    output: {
      schema: { type: 'string' },
      render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }],
    },
    async execute() {
      return JSON.stringify({ title: config.title, hint: '恢复区在 web 界面底部，无需此工具操作' })
    },
  })), '@dsh-external/dsh-archive-restore: about tool')
}

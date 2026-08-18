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
import type { Context } from 'cordis';
import z from 'schemastery';
export declare const name = "@dsh-external/dsh-archive-restore";
export declare const inject: string[];
export interface Config {
    title: string;
}
export declare const Config: z<Schemastery.ObjectS<{
    title: z<string, string>;
}>, Schemastery.ObjectT<{
    title: z<string, string>;
}>>;
export declare function apply(ctx: Context, config: Config): void;

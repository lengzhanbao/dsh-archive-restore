# dsh-archive-restore

DSH (DeepSeek Harness) 侧边栏「已归档会话」恢复区插件 —— Codex 风格的归档管理 UI。

归档会话后，会话不会消失得无影无踪：它会出现在侧边栏底部（设置按钮上方、对话列表下方）的可折叠「已归档」区，你可以随时**恢复**它回对话列表，或**删除**它（从 UI 隐藏，数据保留）。

## 功能

- 📥 侧边栏底部归档区：位置在对话列表和设置按钮之间（`sidebar.footer.action` slot），与 Codex 的 archived chats 交互一致
- 🔽 可折叠区块：默认收起显示「已归档 (N)」，点击展开列出每条归档会话
- ↩️ 恢复：一键把会话从归档集合移除，回到对话列表原位置
- ✕ 删除：从归档栏移除该条（localStorage 隐藏，**不删除任何会话数据**）
- 🏷️ 显示真实对话标题（fallback 到会话 id 短标签），悬停可见完整标题
- 📐 侧边栏收起为 rail 时显示 📥 图标 + 数量角标
- 🚫 无归档会话时不渲染任何内容，零干扰

## 截图

（待补充 —— 欢迎 PR 补充截图）

## 工作原理

- 插件客户端注册到 `sidebar.footer.action` 列表 slot（由 `@deepseek-ai/dsh-client-ui-sidebar` 声明）
- 订阅 `ctx.workspaces.list` 快照的 `archivedSessionIds`（registry-global 归档集合），变化即重渲染
- 「恢复」调用 `ctx.workspaces.unarchiveSession(id)` → 经 apiproxy RPC `workspace.unarchiveSession` → workspace registry 从归档集合移除该 id，会话回到原分组位置
- 「删除」仅把会话 id 写入浏览器 `localStorage`（key: `dsh-archive-restore:deleted`），渲染时过滤——**不动任何持久化数据**

## 环境要求

- DSH (DeepSeek Harness) web 端（`dsh web`）
- **核心支持**：需要 DSH 提供 `workspace.unarchiveSession` RPC（官方 DSH 目前只有单向的 archive，本插件依赖的对称 unarchive 需要打核心补丁，见下文「核心补丁」）

## 安装

### 方式 A：super-injector 正规装配（推荐）

在 DSH 环境内（如 web 会话中）：

```
dev_install_package E:\path\to\dsh-archive-restore
```

- 自动写入 profile `package.json`（dependencies `link:` + `bundles`）
- 建立 node_modules junction
- `loader.create` 热装配，免重启生效
- 重启后由 bundles 列表正常装配（双路径一致）

### 方式 B：手动装配

1. 把插件目录放到任意位置，例如 `E:\DeepSeekHarness\profiles\web\plugins\dsh-archive-restore`
2. 在 `E:\DeepSeekHarness\profiles\web\package.json` 的 `dependencies` 加：
   ```json
   "@dsh-external/dsh-archive-restore": "link:E:/DeepSeekHarness/profiles/web/plugins/dsh-archive-restore"
   ```
3. 在 `dsh.profile.bundles` 数组加 `"@dsh-external/dsh-archive-restore"`
4. 建 junction：
   ```
   mklink /J E:\DeepSeekHarness\profiles\web\node_modules\@dsh-external\dsh-archive-restore E:\DeepSeekHarness\profiles\web\plugins\dsh-archive-restore
   ```
5. 重启 `dsh web`

> ⚠️ 注意：不要用 super-injector 的 `dev_inject_plugin` 注入本插件——它会给 loader entry 加 `@file:` 前缀，与本插件 `client.js` 里注册的全名 id 不匹配，导致前端加载失败（历史踩坑，见 CHANGELOG）。

## 核心补丁

DSH 官方 workspace registry 只有 `archiveSession`（单向）。本插件的「恢复」依赖对称的 `unarchiveSession`。补丁改动（DSH 源码树 `E:\DeepSeekHarness\src\deepseek-harness`）：

| 文件 | 改动 |
|------|------|
| `packages/workspace/workspace/src/index.ts` | `WorkspaceRegistry` 新增 `unarchiveSession(sessionId)`：幂等地把 id 从 `archivedSessionIds` 过滤掉 |
| `packages/host/apiproxy/src/api-proxy.ts` | 新增 `workspace.unarchiveSession` RPC handler |
| `packages/host/apiproxy/src/api/workspace.schema.ts` | 新增 request/value zod schema |
| `packages/host/apiproxy/src/api/workspace.ts` | `WorkspaceApi` 接口新增 `unarchiveSession` |
| `packages/host/apiproxy/src/api/rpc-map.ts` | 注册 `'workspace.unarchiveSession'` |
| `packages/host/apiproxy/src/fetch/handler.ts` `client.ts` | fetch 路由 + IApiClient 方法 |
| `packages/client/runtime/...` | manager / service / contract 增加 `unarchiveSession` |
| `packages/client/ui-workspace/...` | slot 注入 `unarchiveSession` |

如果你的 DSH 发行版已内置 `workspace.unarchiveSession`（检查 `dsh web` 运行时是否支持），则无需打补丁。

## 构建

```bash
DSH_CHECKOUT=E:\DeepSeekHarness\src\deepseek-harness bash scripts/build.sh
```

- host：`tsc -p tsconfig.json` → `lib/index.js`
- client：`tsdown` → `lib/client.js`（ModuleLoader 模块）

> 已知问题：当前 tsdown 版本对 `format: 'cjs'` + banner 的输出会在 factory 体内保留顶层 `import`（非法 ESM），导致前端 SyntaxError。仓库已附带**手写修复版 `lib/client.js`**（纯 CommonJS：`require("react")` + `exports.apply/inject`），可直接使用；如重新构建请检查产物开头是否为 `window.__ModuleLoader__.load({...})` 且函数体内无 `import`。

## 使用

1. 打开 DSH web（`dsh web`，默认 http://127.0.0.1:3080）
2. 在会话菜单里选择「归档会话」
3. 侧边栏底部出现「已归档 (N)」，点击展开
4. 每条会话可「恢复」回对话列表，或「✕」从归档栏移除

## 许可证

BSD-3-Clause © 2026 lengzhanbao

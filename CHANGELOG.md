# Changelog

## 0.0.1 (2026-08-18)

- 初始发布：侧边栏归档恢复区（`sidebar.footer.action` slot，Codex 风格）
- 恢复：`ctx.workspaces.unarchiveSession(id)`（依赖核心补丁 `workspace.unarchiveSession` RPC）
- 删除：localStorage 隐藏（`dsh-archive-restore:deleted`），不删除会话数据
- 真实对话标题显示（`ctx.sessions` displayTitle，fallback id 短标签）
- rail 收起态显示 📥 + 数量角标；无归档不渲染

### 踩坑记录（供维护者参考）

- `dev_inject_plugin`（super-injector 运行时注入）会给 loader entry id 加 `@file:` 前缀，与 `client.js` 注册的全名 id 不匹配 → 前端报 `loaded without registering ... via __ModuleLoader__.load`。**必须用 `dev_install_package` 正规 bundle 装配**（entry id = 包全名，天然匹配）。
- 当前 tsdown/rolldown 对 `format: 'cjs'` + banner 的产物会在 `factory` 函数体内保留顶层 `import`（非法 ESM）→ 前端 SyntaxError。仓库附带的 `lib/client.js` 为手写纯 CommonJS 修复版；重新构建后务必检查。
- 卸载插件四步走：① profile package.json 移除 dependencies+bundles ② 删 node_modules junction ③ 清 super-injector `registry.json` ④ patch 处理（任一遗漏都可能让下次启动或前端报错）。

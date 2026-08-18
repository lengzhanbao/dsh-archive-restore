window.__ModuleLoader__.load({
	id: "@dsh-external/dsh-archive-restore",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const { createElement, useEffect, useState } = require("react");
		//#region src/client/index.ts
		/**
		* @dsh-external/dsh-archive-restore — 侧边栏归档恢复区（sidebar.footer.action slot）。
		*
		* 位置：侧边栏 footer 区，在对话列表（sidebar.workspaces）和设置按钮
		* （sidebar.settings）之间——和 Codex 的 archived chats 区类似。
		*
		* 行为：
		* - 订阅 ctx.workspaces.list 快照，读取 archivedSessionIds；
		* - 可折叠区块：默认收起，显示「已归档 (N)」；点击展开列出每条归档会话；
		* - 每条会话两个按钮：
		*   「恢复」→ ctx.workspaces.unarchiveSession(id)，会话回到对话列表；
		*   「删除」→ 加入 localStorage 隐藏集，从归档栏消失（数据保留，不永久删除）；
		* - 侧边栏收起为 rail 时显示归档图标 + 数量角标；
		* - 无归档会话时不渲染任何内容。
		*/
		/** localStorage key：被用户「删除」的归档会话 ID 集合。 */
		const DELETED_KEY = "dsh-archive-restore:deleted";
		function loadDeleted() {
			try {
				const raw = localStorage.getItem(DELETED_KEY);
				return new Set(raw ? JSON.parse(raw) : []);
			} catch {
				return new Set();
			}
		}
		function saveDeleted(ids) {
			try {
				localStorage.setItem(DELETED_KEY, JSON.stringify([...ids]));
			} catch {}
		}
		/** 从 sessionId 截取可读短标签。 */
		function shortLabel(id) {
			return (id.split("-").pop() ?? id).slice(0, 8);
		}
		// ── 样式常量 ──────────────────────────────────────
		const S = {
			section: {
				width: "100%",
				boxSizing: "border-box",
				borderTop: "1px solid var(--dsw-specific-sidebar-divider, rgba(128,128,128,0.18))",
				fontSize: "12px",
				lineHeight: "1.5",
				color: "var(--dsw-text-primary, inherit)"
			},
			header: {
				display: "flex",
				alignItems: "center",
				gap: "6px",
				padding: "6px 12px",
				cursor: "pointer",
				userSelect: "none",
				fontWeight: "600",
				opacity: "0.85"
			},
			chevron: {
				transition: "transform 0.15s",
				fontSize: "10px"
			},
			count: {
				marginLeft: "auto",
				fontSize: "11px",
				opacity: "0.6",
				background: "rgba(128,128,128,0.15)",
				borderRadius: "8px",
				padding: "0 6px"
			},
			list: {
				maxHeight: "200px",
				overflowY: "auto",
				paddingBottom: "4px"
			},
			row: {
				display: "flex",
				alignItems: "center",
				gap: "4px",
				padding: "3px 12px"
			},
			label: {
				flex: "1 1 0",
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap",
				opacity: "0.75",
				fontSize: "11px"
			},
			btnRestore: {
				flex: "0 0 auto",
				cursor: "pointer",
				background: "transparent",
				color: "var(--dsw-text-accent, #4d8df0)",
				border: "1px solid var(--dsw-text-accent, #4d8df0)",
				borderRadius: "3px",
				padding: "1px 6px",
				fontSize: "10px"
			},
			btnDelete: {
				flex: "0 0 auto",
				cursor: "pointer",
				background: "transparent",
				color: "var(--dsw-text-secondary, rgba(128,128,128,0.7))",
				border: "none",
				borderRadius: "3px",
				padding: "1px 4px",
				fontSize: "10px"
			},
			rail: {
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				height: "32px",
				position: "relative"
			},
			badge: {
				position: "absolute",
				top: "2px",
				right: "4px",
				fontSize: "9px",
				background: "var(--dsw-text-accent, #4d8df0)",
				color: "#fff",
				borderRadius: "7px",
				padding: "0 4px",
				minWidth: "14px",
				textAlign: "center"
			}
		};
		// ── 组件工厂（闭包捕获 ctx）───────────────────────
		function makeArchiveSection(ctx) {
			return function ArchiveSection(props) {
				const [archivedIds, setArchivedIds] = useState(() =>
					ctx.workspaces.list.getSnapshot().archivedSessionIds.map(String)
				);
				const [expanded, setExpanded] = useState(false);
				const [deletedIds, setDeletedIds] = useState(() => loadDeleted());
				const [sessionsTick, setSessionsTick] = useState(0);
				// 订阅 workspaces + sessions 快照——归档集合或会话标题变化即重渲染。
				useEffect(() => {
					const sync = () => {
						setArchivedIds(ctx.workspaces.list.getSnapshot().archivedSessionIds.map(String));
						setSessionsTick((t) => t + 1);
					};
					sync();
					const off1 = ctx.workspaces.list.subscribe(sync);
					const off2 = ctx.sessions.list.subscribe(sync);
					return () => {
						off1();
						off2();
					};
				}, [ctx]);
				// 过滤掉已「删除」的会话。
				const visibleIds = archivedIds.filter((id) => !deletedIds.has(id));
				// 会话标题：优先快照里的 displayTitle，缺失时退回 id 短标签。
				const byId = ctx.sessions.list.getSnapshot().byId;
				const titleOf = (id) => {
					const s = byId[id];
					if (s && s.displayTitle && s.displayTitle.trim() !== "") return s.displayTitle;
					return shortLabel(id);
				};
				// ── rail 模式（侧边栏收起）──────────────────
				if (!props.wide) {
					if (visibleIds.length === 0) return null;
					return createElement(
						"div",
						{ style: S.rail, title: `已归档 ${visibleIds.length}` },
						createElement("span", { style: { fontSize: "16px", opacity: "0.6" } }, "📥"),
						createElement("span", { style: S.badge }, String(visibleIds.length))
					);
				}
				// ── 无归档会话时不渲染 ──────────────────────
				if (visibleIds.length === 0 && archivedIds.length === 0) return null;
				// ── 恢复 ──
				const onRestore = async (id) => {
					try {
						await ctx.workspaces.unarchiveSession(id);
					} catch {
						/* 核心未部署 unarchiveSession 时静默失败 */
					}
				};
				// ── 删除（localStorage 隐藏，数据保留）──
				const onDelete = (id) => {
					const next = new Set(deletedIds);
					next.add(id);
					setDeletedIds(next);
					saveDeleted(next);
				};
				// ── 折叠态：只显示 header ───────────────────
				const chevronStyle = expanded
					? Object.assign({}, S.chevron, { transform: "rotate(90deg)" })
					: S.chevron;
				const header = createElement(
					"div",
					{ style: S.header, onClick: () => setExpanded((v) => !v) },
					createElement("span", { style: chevronStyle }, "▶"),
					createElement("span", null, "已归档"),
					createElement("span", { style: S.count }, String(visibleIds.length))
				);
				if (!expanded) return createElement("div", { style: S.section }, header);
				// ── 展开态：header + 会话列表 ───────────────
				const rows = visibleIds.map((id) =>
					createElement(
						"div",
						{ key: id, style: S.row },
						createElement("span", { style: S.label, title: titleOf(id) }, titleOf(id)),
						createElement("button", { style: S.btnRestore, onClick: () => void onRestore(id) }, "恢复"),
						createElement("button", { style: S.btnDelete, onClick: () => onDelete(id) }, "✕")
					)
				);
				return createElement("div", { style: S.section }, header, createElement("div", { style: S.list }, ...rows));
			};
		}
		// ── 插件入口 ──────────────────────────────────────
		exports.inject = ["slots", "workspaces", "sessions"];
		function apply(ctx) {
			const Section = makeArchiveSection(ctx);
			ctx.effect(
				() =>
					ctx.slots.inject("sidebar.footer.action", () =>
						ctx.slots.register({
							name: "sidebar.footer.action",
							id: "@dsh-external/dsh-archive-restore",
							label: () => "已归档会话",
							inject: () => ({})
						}, (props) => Section(props))
					),
				"@dsh-external/dsh-archive-restore: sidebar footer action"
			);
		}
		exports.apply = apply;
		//#endregion
		return module.exports;
	}
});
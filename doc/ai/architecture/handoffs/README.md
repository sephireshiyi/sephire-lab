# Handoffs

> 架构师会话的临时交接文档。
>
> 用途：记录某次架构会话的设计决策、实施计划、交接给 developer/reviewer 的上下文。
>
> 生命周期：项目稳定后可整体清理（交接内容已落到决策文档/LOG/TODO）。

---

## 交接文档清单

| 日期 | 文档 | 内容摘要 | 状态 |
|---|---|---|---|
| 2026-06-13 | `2026-06-13-path-a.md` | 路径 A 完整设计：首页 + Model Checker + 部署（6 个 session） | ⏸️ 待实施 |

---

## 命名约定

`YYYY-MM-DD-<topic>.md`

- 日期：架构会话日期
- Topic：主题简称（如 `path-a` / `music-design` / `gallery-pipeline`）

---

## 清理策略

**触发条件**（满足任一即可清理）：
1. 交接的实施计划全部完成（developer LOG 有记录）
2. 决策内容已并入正式决策文档（如 `decisions/` 下的文档）
3. 6 个月无引用（过时）

**清理方式**：直接删除（不归档，因为内容已落到其他文档）

```bash
# 例子：路径 A 实施完成后
rm doc/ai/architecture/handoffs/2026-06-13-path-a.md
```

# Archive

> 已完成决策的历史记录 或 项目无关的通用框架文档。
>
> 归档原则：
> 1. **已完成决策**：实施完成 + 部署后验证 + 3 个月稳定
> 2. **通用框架**：与 Sephire Lab 项目无关的通用技术讨论
> 3. **不删除**：保留完整历史，供回溯参考

---

## 已归档文档

| 归档日期 | 文档 | 原因 |
|---|---|---|
| 2026-06-13 | `markdown-rendering-tradeoffs.md` | 通用 Markdown 渲染框架讨论，项目已选定 @next/mdx |

---

## 待归档清单（未来触发）

| 文档 | 当前状态 | 归档条件 |
|---|---|---|
| `blog-mdx-pipeline.md` | ✅ 已确认，切片 A/B 已实施 | 部署后 + 3 个月稳定 |
| `blog-reader-theme.md` | ✅ 已确认，待实施 KI-3 | KI-3 解决后 + 3 个月稳定 |
| `homepage-design.md` | ✅ 已确认，待实施 | 路径 A Session 1 完成 + 3 个月稳定 |
| `tools-model-checker.md` | ✅ 已确认，待实施 | 路径 A Session 2-3 完成 + 3 个月稳定 |
| `infra-deployment.md` | ✅ 已确认，待实施 | 路径 A Session 4-6 完成（部署后即归档） |
| `infra-fonts.md` | ⏸️ 部分待定（§6 preload） | 字体问题全部解决后 + 3 个月稳定 |

---

## 归档操作示例

```bash
# 当某决策满足归档条件时
git mv doc/ai/architecture/decisions/<file>.md \
       doc/ai/architecture/archive/YYYY-MM-DD-<topic>.md

# 更新本 README.md 的"已归档文档"表格
```

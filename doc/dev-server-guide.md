# Dev Server 后台运行指南

> 使用 `nohup` 让 Next.js dev server 在后台持久运行（关闭终端后继续）+ 保持热加载

---

## 启动

```bash
cd /Users/jiechu/shiyi-lab
nohup pnpm dev > dev.log 2>&1 &
```

**输出示例**：`[1] 12345` —— 12345 是 PID，记下来

---

## 确认状态

```bash
# 查看日志（实时滚动，Ctrl+C 退出查看）
tail -f dev.log

# 查看端口占用
lsof -i tcp:3000 -P -n

# 查看进程
ps aux | grep '[n]ext dev'
```

---

## 停止

```bash
# 方法 1：用 PID（如果记得的话）
kill <PID>

# 方法 2：查端口找 PID
lsof -i tcp:3000 -P -n  # 找到 PID
kill <PID>

# 方法 3：杀所有 next dev
pkill -f "next dev"
```

---

## 重启（改了 next.config.ts 时必须重启）

```bash
# 1. 停止
pkill -f "next dev"

# 2. 等端口释放
sleep 1

# 3. 重新启动
cd /Users/jiechu/shiyi-lab
nohup pnpm dev > dev.log 2>&1 &
```

---

## 清空日志

```bash
> dev.log
```

---

## 验证方法（重要约定：别和 dev server 抢 `.next`）

`next dev` 和 `next build` 默认写同一个目录 `.next`，且 `next build` 启动时会**清空 `.next`**（除 `.next/cache`，见 Next 16 文档 `upgrading/version-11.md`）。所以 dev server 在 3000 跑着时直接 `pnpm build`，会把 dev 脚下的运行时文件清掉 → 刷新 3000 报 500 / 找不到 chunk，dev server 需重启才恢复。**端口不冲突（build 不起服务器），冲突的是 `.next` 目录。**

**约定（架构师 + 开发者都遵守）：**

| 验证目标 | 用什么 | 安全性 |
|---|---|---|
| 类型检查（最常用） | `npx tsc --noEmit` | ✅ 不碰 `.next`，可与 dev 并存 |
| 页面 / 样式 / 主题效果 | 看运行中的 3000 + `tail -f dev.log` | ✅ dev 自己的产物 |
| 生产构建产物（`○ Static` / `● SSG` 标记、build 时 zod 校验、bundle 大小） | `pnpm build` —— **必须先停 dev** | ⚠️ 需独占 `.next` |

生产构建的安全姿势：

```bash
pkill -f "next dev" && sleep 1
pnpm build              # 此刻独占 .next
cd ~/shiyi-lab && nohup pnpm dev > dev.log 2>&1 &   # 看完再起回来
```

> 默认走 `tsc --noEmit`；只有确实要看生产构建标记时才停 dev 跑 build，并事先说明。`pnpm lint` 当前因 KI-1 已知红，不计入常规验证，留到 task9 部署前清。

---

## 注意事项

- ✅ **热加载自动生效**：改 `.tsx`/`.ts`/`.css`/`.mdx` 自动刷新，不用重启
- ⚠️ **改 `next.config.ts` 必须手动重启**（Turbopack 限制）
- ⚠️ **关机后进程消失**：`nohup` 只保证"关终端继续跑"，不是开机自启
- 📝 **日志文件 `dev.log` 会持续增长**，定期清空

---

## 快捷命令备忘

```bash
# 启动
cd ~/shiyi-lab && nohup pnpm dev > dev.log 2>&1 &

# 查看日志
tail -f ~/shiyi-lab/dev.log

# 停止
pkill -f "next dev"

# 重启
pkill -f "next dev" && sleep 1 && cd ~/shiyi-lab && nohup pnpm dev > dev.log 2>&1 &
```

# Model Checker 工具设计决策

> 记录 `/tools/model-checker` 的功能范围、技术实现、API 设计、部署考量。
>
> **状态**：✅ 已确认（2026-06-13）
>
> **更新历史**：
> - 2026-06-13：初版。基于 MVP 要求 + "学习全栈"定位，确定功能范围与技术栈。

---

## 1. 工具定位与用途

### 为什么做这个工具

**项目定位**："承载在线小工具与技术实验记录"+"大学生学习全栈开发的载体"

Model Checker 是一个**实用性工具**，同时满足：
1. **对外展示**：开发者常需测试各家 LLM API（OpenAI、Anthropic、本地模型）的可用性、模型列表、响应延迟——这是真实需求
2. **学习载体**：涉及前后端交互、API 调用、错误处理、环境变量、CORS、异步状态管理——是完整的全栈 feature

### 核心功能

**一句话**：给定 API Base URL + API Key，测试该端点是否可用、支持哪些模型、响应是否正常。

**支持的协议**：
- OpenAI-compatible API（`/v1/models` 端点）
- Anthropic-compatible API（`/v1/messages` 简单测试）

**不做**：实际对话、流式输出、批量测试、历史记录存储（无数据库）

---

## 2. 功能范围（MVP）

### 2.1 用户输入

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| **API Provider** | 单选（OpenAI / Anthropic / Custom） | ✅ | 预设常见服务商，Custom 可自定义 |
| **Base URL** | 文本 | ✅ | API 端点（如 `https://api.openai.com/v1`） |
| **API Key** | 密码框 | ✅ | 不存储、不传给后端日志 |
| **Test Type** | 单选（List Models / Simple Test） | ✅ | 列举模型 or 发简单请求 |

### 2.2 测试流程

```
用户填表 → 点击"Test"
   ↓
前端调用 `/api/model-checker`（POST）
   ↓
后端用 `fetch` 调用目标 API
   ↓  
返回：成功（模型列表 / 响应内容）or 失败（错误信息）
   ↓
前端展示结果（绿色成功 / 红色失败）
```

### 2.3 输出展示

**成功情况**：
- ✅ 连接成功
- 延迟：XXX ms
- 模型列表：`gpt-4`, `gpt-3.5-turbo`, ...（List Models）
- 或：响应内容 `{"message": "Hello!"}` 的 preview（Simple Test）

**失败情况**：
- ❌ 连接失败
- 错误信息：`401 Unauthorized` / `Network Error` / `Timeout`

---

## 3. 技术实现

### 3.1 前端（`/tools/model-checker`）

**页面组件**：`app/tools/model-checker/page.tsx`

```tsx
"use client";
import { useState } from "react";

export default function ModelCheckerPage() {
  const [provider, setProvider] = useState("openai");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [testType, setTestType] = useState("list-models");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleTest() {
    setLoading(true);
    const res = await fetch("/api/model-checker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, baseUrl, apiKey, testType }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div>
      {/* 表单：provider dropdown / base URL input / API key password / test type radio */}
      {/* Test 按钮 */}
      {/* 结果展示区（成功 / 失败） */}
    </div>
  );
}
```

**技术要点**：
- `"use client"`（需要表单状态 + 异步请求）
- 使用 `<form>` + `onSubmit`（防止默认刷新）
- API Key 用 `type="password"`（不可见）+ 明确提示"不会存储"
- Loading 状态（按钮 disabled + spinner）
- 错误边界处理（网络错误 / API 错误 / 解析错误）

### 3.2 后端（`/api/model-checker`）

**API 路由**：`app/api/model-checker/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { provider, baseUrl, apiKey, testType } = await req.json();

  // 输入校验
  if (!baseUrl || !apiKey) {
    return NextResponse.json({ success: false, error: "缺少必填参数" }, { status: 400 });
  }

  try {
    let url = "";
    let headers = {};
    
    if (testType === "list-models") {
      // OpenAI: GET /v1/models
      url = `${baseUrl}/models`;
      headers = { Authorization: `Bearer ${apiKey}` };
    } else {
      // Anthropic: POST /v1/messages（简单测试）
      url = `${baseUrl}/messages`;
      headers = {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      };
    }

    const startTime = Date.now();
    const response = await fetch(url, {
      method: testType === "list-models" ? "GET" : "POST",
      headers,
      body: testType === "list-models" ? undefined : JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 10,
        messages: [{ role: "user", content: "hi" }],
      }),
    });
    const latency = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({
        success: false,
        status: response.status,
        error: error.slice(0, 500), // 截断长错误
      });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, latency, data });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
```

**技术要点**：
- **不记日志中的 API Key**（敏感信息）
- **超时处理**：`fetch` 加 `signal: AbortSignal.timeout(10000)`（10s）
- **CORS**：Next.js API Routes 默认同源，无 CORS 问题（前端与 API 同域）
- **错误分类**：网络错误 / 4xx 客户端错误 / 5xx 服务端错误 / 超时
- **响应裁剪**：`data` 可能很大（上百个模型），前端只展示前 20 个

### 3.3 预设服务商配置

```ts
// lib/model-providers.ts
export const MODEL_PROVIDERS = [
  { id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", authType: "bearer" },
  { id: "anthropic", name: "Anthropic", baseUrl: "https://api.anthropic.com/v1", authType: "x-api-key" },
  { id: "openrouter", name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", authType: "bearer" },
  { id: "custom", name: "Custom", baseUrl: "", authType: "bearer" },
];
```

用户选 provider 后自动填充 base URL，Custom 可手动改。

---

## 4. UI 设计约定

### 4.1 页面布局

```
┌─────────────────────────────────────┐
│ [导航栏 - 已有]                      │
├─────────────────────────────────────┤
│                                     │
│  Model API Checker                  │  ← 页面标题（text-4xl）
│  测试 LLM API 端点的可用性与延迟      │  ← 副标题（text-secondary）
│                                     │
│  ┌─────────────────────────────┐   │
│  │ API Provider: [OpenAI ▼]    │   │  ← Dropdown（Headless UI）
│  │ Base URL: [...............] │   │  ← Input
│  │ API Key:  [••••••••••••••••]│   │  ← Password input
│  │ Test Type: ◉ List Models    │   │  ← Radio group
│  │            ○ Simple Test     │   │
│  │                              │   │
│  │ [     Test     ]  ← 按钮     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✅ 连接成功                  │   │  ← 结果区（动态显示）
│  │ 延迟：234 ms                 │   │
│  │                              │   │
│  │ 模型列表：                   │   │
│  │ • gpt-4-turbo               │   │
│  │ • gpt-3.5-turbo             │   │
│  │ • ...                        │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 4.2 样式约定

| 元素 | 规范 |
|---|---|
| **容器** | `max-w-2xl mx-auto px-lg py-4xl` |
| **表单卡片** | `border border-[var(--border-color)] rounded-lg p-xl` |
| **输入框** | `w-full px-md py-sm border rounded` + focus ring |
| **按钮** | `bg-[var(--text-primary)] text-[var(--bg-primary)] px-xl py-md rounded hover:opacity-90` |
| **结果卡片** | 成功 `border-green-500 bg-green-50`，失败 `border-red-500 bg-red-50`（需适配三主题） |
| **Loading 状态** | 按钮 disabled + spinner（iconify `svg-spinners:ring-resize`） |

### 4.3 响应式

- 桌面（≥768px）：表单与结果左右并列（可选，MVP 先上下排列）
- 移动端：上下堆叠，输入框宽度 100%

---

## 5. 安全与隐私

### 5.1 API Key 处理

- **前端**：`type="password"` + 明确提示"API Key 仅用于本次测试，不会存储或上传到服务器日志"
- **后端**：
  - 不写入日志（`console.log` 不包含 `apiKey`）
  - 不存数据库（MVP 无数据库）
  - 不传给第三方（只用于直连目标 API）
- **传输**：HTTPS（Vercel 默认）

### 5.2 Rate Limiting

**问题**：恶意用户可能用我们的 API 作为代理刷目标服务

**MVP 方案（简单）**：
- 前端：按钮点击后 5s 内 disabled（防连点）
- 后端：Vercel 自带 Serverless Functions 限制（每次调用有超时，自然限流）

**后续方案（部署后按需加）**：
- IP-based rate limiting（`@vercel/edge-rate-limit` 或 Upstash Redis）
- 每 IP 每分钟最多 10 次请求

### 5.3 环境变量

**无需环境变量**（MVP）：用户提供自己的 API Key，工具本身不存 Key。

若后续要加"内置 API Key 供演示"：
```
# .env.local
DEMO_OPENAI_KEY=sk-...
```

---

## 6. 错误处理与用户体验

### 6.1 常见错误场景

| 错误 | 原因 | 用户提示 |
|---|---|---|
| `401 Unauthorized` | API Key 错误 | "API Key 无效，请检查后重试" |
| `404 Not Found` | Base URL 错误 | "端点不存在，请检查 Base URL（如 `/v1` 后缀）" |
| `Network Error` | 网络问题 / CORS | "网络连接失败，请检查 URL 是否正确或稍后重试" |
| `Timeout` | 服务响应慢 | "请求超时（>10s），目标服务可能过载" |
| `JSON Parse Error` | 返回非 JSON | "目标服务返回格式异常" |

### 6.2 用户引导

**初次访问**：表单预填 OpenAI 的 Base URL，并有占位提示：
```
API Key: sk-... (在此粘贴你的 API Key)
```

**帮助链接**（可选）：
- "如何获取 OpenAI API Key？" → 外链到官方文档
- "支持哪些服务商？" → 展开说明（OpenAI-compatible / Anthropic-compatible）

---

## 7. 实施计划（交给 developer）

### 任务分解

#### 阶段 1：后端 API（先跑通逻辑）

1. 创建 `app/api/model-checker/route.ts`
2. 实现 POST 接口（接收 `{ baseUrl, apiKey, testType }`）
3. 调用目标 API（OpenAI `/models` 或 Anthropic `/messages`）
4. 返回 `{ success, latency, data?, error? }`
5. 本地测试：用 `curl` 或 Postman 调 `/api/model-checker`

#### 阶段 2：前端页面

6. 创建 `app/tools/model-checker/page.tsx`（`"use client"`）
7. 表单：provider dropdown / base URL input / API key password / test type radio
8. 调用后端 `/api/model-checker`
9. 结果展示区（成功 / 失败 / loading）
10. 样式：spacing token / 主题变量 / 响应式

#### 阶段 3：体验优化

11. 添加 loading spinner
12. 前端输入校验（URL 格式 / API Key 非空）
13. 错误提示优化（根据 §6.1 错误场景）
14. 安全提示文案（"API Key 不会存储"）

#### 阶段 4：工具索引页

15. 更新 `app/tools/page.tsx`（当前是占位页）
16. 展示 Model Checker 卡片（标题 + 描述 + 链接）
17. 未来可扩展：多个工具的列表

### 验证标准

- 后端：`curl -X POST http://localhost:3000/api/model-checker -d '{"baseUrl":"...","apiKey":"...","testType":"list-models"}' -H "Content-Type: application/json"` 返回正确 JSON
- 前端：填表 → 点击 Test → 显示结果（成功绿色 / 失败红色）
- 错误场景：故意填错 API Key / URL → 显示正确错误提示
- 三主题：light / dark / reader 下表单与结果卡片颜色正常
- `pnpm build` 绿

---

## 8. 未来扩展（非 MVP）

### 8.1 更多协议支持

- Google Gemini API
- Mistral API
- 本地 Ollama（`http://localhost:11434/api/generate`）

### 8.2 批量测试

- 一次测多个 Base URL（比较延迟）
- 生成延迟对比图表（Recharts）

### 8.3 历史记录

- 浏览器 localStorage 保存最近 5 次测试（Base URL + 结果，不存 API Key）
- 快速重测

### 8.4 高级功能

- 流式输出测试（SSE）
- Token 计数测试
- 模型对比（同一 prompt，多个模型响应）

**这些都不在 MVP，先跑通基础功能。**

---

## 9. 与其他文档的关系

- **根 `CLAUDE.md`**：MVP 范围明确要求 `/tools/model-checker`——本文档定义了完整实现方案
- **`homepage-design.md`**：首页 Tools 预览区（未来扩展）可链接到 Model Checker
- **TODO.md Milestone 5**：本设计覆盖全部任务项（输入表单 / 结果展示 / API 路由 / 两种协议支持）

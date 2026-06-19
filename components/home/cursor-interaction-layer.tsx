/**
 * 首页光标交互层边界（占位）。
 *
 * 基础 MVP 不实现任何粒子效果：这里只是一个透明的 passthrough 包裹层，
 * 用来在架构上预留「以光标为中心、密度向外递减的粒子动画」的挂载点，
 * 避免未来把交互效果硬编码进普通内容组件（见父任务 design.md「交互边界」）。
 *
 * 后续高保真任务在此处挂载 canvas / 监听 pointer 事件 / 渲染粒子层，
 * 内容继续作为 children 渲染在交互层之上。当前不加 canvas、监听或动画。
 */
export function CursorInteractionLayer({
  children,
}: {
  children: React.ReactNode;
}) {
  // 预留：未来在此渲染绝对定位的粒子 canvas，并叠加在 children 之下/之上。
  return <div className="relative">{children}</div>;
}

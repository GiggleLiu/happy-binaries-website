---
title: "给 AI Agent 一个时钟"
description: "为跨越时间的 Agent 打造的休眠基础设施。"
date: 2026-07-07
tags: [ai, agents, automation, cryochamber]
lang: zh
translationOf: give-ai-agents-a-clock
---

*为跨越时间的 Agent 打造的休眠基础设施*

![Cryochamber 漫画：制定计划、休眠、在合适的时间醒来、选择下一次唤醒时间](/assets/images/cryochamber-give-ai-agents-a-clock.jpg)

在运行长周期 AI Agent 的过程中，我反复遇到一个问题：大多数时候，它们根本无事可做。

它们在等待人类的回复、一个截止日期、某个阈值，或是某个外部变化。但许多 Agent 系统仍将等待视作活动——以固定的心跳频率唤醒模型，询问有无变化，得到否定答案后，继续为下一轮模型调用买单。

Cryochamber 是我对这种不同原语的一次尝试：让 Agent 完成一次会话，自行决定下一次会话何时值得运行，然后休眠。

这个比喻借自星际旅行。如果人类有朝一日要飞往太阳系外的某颗行星，难点不仅在于飞得够快，更在于如何熬过那段漫长的航程：保全使命，在空旷的岁月中沉睡，在关键时刻醒来。Cryochamber 将同样的思路应用于 AI Agent——Agent 不该为了保持「在线」而持续消耗能量，它应当铭记使命，在空闲时沉睡，只在有实际工作要做时才醒来。

## 等待不是工作

当你需要持续在线时，心跳模式很管用。以 OpenClaw 为例，它将心跳定义为主会话中的周期性 Agent 轮次，默认间隔为 30 分钟或 1 小时，其文档也专门讨论了成本控制——心跳同样是完整的 Agent 轮次，间隔越短，消耗的 token 越多。对某些产品而言，这确实是合适的设计，有时你确实希望助手随时待命。

但对于任务稀疏的场景，心跳或许是错误的默认选择。如果一切如常，我不想让模型去「思考」，我希望有一个守护进程来负责等待。

这一点很重要，因为空闲的模型轮次，终究还是模型轮次。OpenAI 按输入和输出 token 计费，其对话状态文档明确指出，响应链中先前的输入 token，仍会被计入输入 token 费用。提示缓存虽然可以降低重复前缀的成本，但并不能让空闲轮次变成免费的。

最省钱的 Agent 空闲轮次，就是你压根不跑的那一次。

## 一个会自己决定何时醒来的磁盘监控

让我对这个想法产生切身体会的，是一个名为 `disk-size-warn` 的小 chamber。

它的工作很平凡：检查磁盘使用情况，在情况恶化之前发出警告。计划要求它检查 `/` 和 `/System/Volumes/Data`，使用率偏高时上报，且绝不未经允许修改系统。

有趣的是它的唤醒策略：

- 低于 80%：休眠 7 天
- 80-85%：休眠 3 天
- 85-90%：明天再检查
- 超过 90%：12 小时后检查

这并不复杂，却改变了控制循环。调度不再由外部强加于 Agent，而是由 Agent 自行观察现状、判断自身处于哪个级别、必要时发送报告、安排下一次唤醒时间，然后休眠。

当磁盘使用率达到 87% 时，这个 chamber 每天检查一次，并开始寻找可以清理的目标。当我质疑它的初次诊断时，我给它发了条消息；守护进程立刻唤醒了 Agent。Agent 随即检查了更深层的目录，更新了记录，最终揪出了一个隐藏大户：`~/.julia` 占用了约 70 GB。

你当然可以用 cron 任务每天跑一次 `df`，也可以用心跳 Agent 每半小时自问一次磁盘是否需要关注。但这里的体验是不同的：模型只在情况值得开启下一次会话时，才被调用。

## 计划是策略，不是排期

在 Cryochamber 中，`plan.md` 更接近一份策略文档，而非脚本。

以 `disk-size-warn` 为例，它的计划没有写「永远每天运行一次」，而是写明了什么是重要的：磁盘压力、清理建议、用户权限，以及每个严重级别对应的下一次唤醒间隔。

在一次会话结束时，Agent 将这份策略转换成一条具体的待办：

```text
检查磁盘使用情况，如接近满载则上报
在 2026-05-04T21:30
```

守护进程负责维护这个等待状态。它可以在空闲期间保持休眠，无需调用模型。待办到期，则启动新会话。消息到达，则立刻唤醒。如果机器曾因挂起而导致唤醒延迟，下一条 prompt 会附带延迟唤醒通知，Agent 可据此自行调整。

这种分离是核心设计：Agent 负责判断，守护进程负责等待。

## Cron、心跳与休眠

Cron 给操作者一个时钟。它简单可靠，但调度是 Agent 外部固定的。

心跳给 Agent 一个脉搏。它能让助手保持在线，但「什么都没发生」仍可能变成又一次模型调用。

Hermes Agent 提供了一种更广泛的自动化模型：cron 任务、技能、持久化目标和全新的 Agent 会话。其 cron 文档为高频轮询设计了一条 `wakeAgent: false` 的预检查路径，目的正是避免在一切如常时，为空洞的 Agent 轮次付费。这是很好的优化。

Cryochamber 则从另一端切入。休眠才是原语。Agent 完成一轮有边界、可量化、上下文完整的工作会话，自行判断下一次会话何时值得运行，而后退出。

```text
cron:      操作者决定 Agent 何时运行
heartbeat: 系统持续给 Agent 分配轮次
cryo:      Agent 决定下一次轮次何时值得运行
```

有些任务理应是 cron 任务。有些助手需要心跳模式。但对于自适应的长周期工作，我希望默认状态是休眠。

## 守护进程的契约

一旦允许模型在两次会话之间消失，那些看似无聊的底层部分就变得至关重要。

Cryochamber 把这些部分放在模型之外。守护进程记住下一次唤醒时间、监听收件箱、启动 Agent 进程、记录会话日志，并执行生命周期。Agent 通过 `cryo-agent` 进行通信：发送消息、接收收件箱消息、添加待办、休眠。

这为系统带来了几项切实的保障：每次会话都会留下一条可见消息，即使 Agent 过早退出也不例外。Agent 收到的每一条收件箱消息，都能得到 Agent 本人或守护进程的兜底回复。待办事项在到期时被领取，如果一次会话崩溃了，守护进程会以退避策略重新调度已领取的工作，而不是悄悄丢弃。

模型在醒着的时候可以很聪明，守护进程在模型离线时则必须可靠。

## 跨越时间的 Agent

Cryochamber 的重点不在于每个 Agent 都需要一个守护进程，而在于某些 Agent 的工作天然跨越时间。

对 `disk-size-warn` 来说，要问的问题不仅是「Agent 该做什么」，还有「下一次值得醒来的有用时刻是什么时候？」答案取决于实际情况：磁盘压力、趋势、紧急程度，以及我是否问了一个问题。

这就是我想赋予 Agent 的时钟。

不是持续在线，也不是固定轮询，而是一个小小的循环：

```text
唤醒 → 观察 → 行动 → 选择下一次唤醒 → 休眠
```

如果世界变得更快，就更快醒来。如果什么都没变，就什么也别消耗。如果情况变得紧急，就升级处理。如果工作暂时结束，就消失。

Cryochamber 是我将这种循环变成日常的尝试。

## 参考资料

- [OpenClaw Heartbeat](https://docs.openclaw.ai/gateway/heartbeat)
- [Hermes Agent scheduled tasks](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron)
- [Hermes Agent persistent goals](https://hermes-agent.nousresearch.com/docs/user-guide/features/goals)
- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
- [OpenAI conversation state](https://developers.openai.com/api/docs/guides/conversation-state)
- [OpenAI prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)

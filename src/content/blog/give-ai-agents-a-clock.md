---
title: "Give AI Agents a Clock"
description: "Hibernation infrastructure for agents that work across time, using Cryochamber's disk-size monitor as the running example."
date: 2026-07-07
tags: [ai, agents, automation, cryochamber]
---

*Hibernation infrastructure for agents that work across time*

![Cryochamber cartoon: make a plan, hibernate, wake at the right time, and choose the next wake](/assets/images/cryochamber-give-ai-agents-a-clock.jpg)

I kept running into a small problem with long-running AI agents: most of the
time, there is nothing for them to do.

They are waiting for a human reply, a deadline, a threshold, or some external
change. But many agent systems still treat waiting as activity. They wake the
model on a fixed heartbeat, ask whether anything changed, and pay for another
model turn even when the answer is no.

Cryochamber is my attempt at a different primitive: let the agent finish one
session, decide when the next session is worth running, and then hibernate.

The metaphor is borrowed from interstellar travel. If humans ever travel to a
planet outside the solar system, the hard part is not only moving fast. It is
surviving the long middle of the journey: preserving the mission, sleeping
through the empty years, and waking at the moments that matter. Cryochamber
applies the same idea to AI agents. The agent should not burn energy just to
remain present. It should remember the mission, sleep through idle time, and
wake when there is useful work to do.

## Waiting Is Not Work

A heartbeat is useful when you want continuous presence. OpenClaw, for example,
describes heartbeat as periodic agent turns in the main session, with defaults
like 30 minutes or 1 hour. Its docs also discuss cost controls, because
heartbeats are full agent turns and shorter intervals burn more tokens.
That is the right shape for some products. Sometimes you want an assistant to
feel present.

But for sparse work, heartbeat feels like the wrong default. If nothing changed,
I do not want the model to think. I want a daemon to wait.

This matters because idle model turns are still model turns. OpenAI prices API
usage by input and output tokens, and its conversation-state docs note that
previous input tokens in a response chain are still billed as input tokens.
Prompt caching can reduce repeated-prefix cost, but it does not make idle turns
free.

The cheapest idle agent turn is the one you do not run.

## A Disk Monitor That Decides When To Wake

The example that made this concrete for me was a small chamber called
`disk-size-warn`.

Its job is ordinary: check my disk usage and warn me before things get painful.
The plan says to inspect `/` and `/System/Volumes/Data`, report when usage is
high, and never modify the system without permission.

The interesting part is the wake policy:

- under 80%: sleep for 7 days
- 80-85%: sleep for 3 days
- 85-90%: check again tomorrow
- over 90%: check again in 12 hours

That is not complicated, but it changes the control loop. The schedule is not
fixed outside the agent. The agent observes the current situation, decides which
case it is in, sends a report if needed, schedules the next wake, and
hibernates.

When the disk was at 87%, the chamber checked daily and started looking for
cleanup targets. When I challenged the first diagnosis, I sent it a message; the
daemon woke the agent immediately. The agent inspected deeper directories,
updated its notes, and eventually found a major hidden consumer: `~/.julia` was
using about 70 GB.

A cron job could run `df` every day. A heartbeat agent could ask itself every
half hour whether the disk needs attention. But this felt different: the model
was invoked only when the situation justified another session.

## The Plan Is A Policy, Not A Schedule

In Cryochamber, `plan.md` is closer to a policy document than a script.

For `disk-size-warn`, the plan does not say "run every day forever." It says
what matters: disk pressure, cleanup suggestions, user permission, and the next
wake interval for each severity level.

At the end of a session, the agent turns that policy into a concrete TODO:

```text
check disk usage and report if near full
at 2026-05-04T21:30
```

The daemon owns that waiting state. It can sleep through the idle period without
calling the model. If the TODO becomes due, it starts another session. If I send
a message, it wakes immediately. If the machine was suspended and the wake is
late, the next prompt includes a delayed-wake notice so the agent can account
for that.

That separation is the core design: the agent owns judgment; the daemon owns
waiting.

## Cron, Heartbeat, And Hibernation

Cron gives the operator a clock. It is simple and reliable, but the schedule is
fixed outside the agent.

Heartbeat gives the agent a pulse. It can keep an assistant present, but
"nothing happened" can still become another model turn.

Hermes Agent has a broader automation model: cron jobs, skills, persistent
goals, and fresh agent sessions. Its cron docs include a `wakeAgent: false`
pre-check path for frequent polls, specifically to avoid paying for
zero-content agent turns when nothing changed. That is a good optimization.

Cryochamber starts from the other side. Hibernation is the primitive. The agent
does one bounded session of work, decides when the next session is worth
running, and exits.

```text
cron:      the operator decides when the agent runs
heartbeat: the system keeps giving the agent turns
cryo:      the agent decides when the next turn is worth running
```

Some tasks should be cron jobs. Some assistants need heartbeat. But for adaptive
long-running work, I want the default state to be sleep.

## What The Daemon Guarantees

Once the model is allowed to disappear between sessions, the boring parts become
important.

Cryochamber keeps those parts outside the model. The daemon remembers the next
wake time, watches the inbox, starts the agent process, records the session log,
and enforces the lifecycle. The agent communicates through `cryo-agent`: send a
message, receive inbox messages, add a TODO, hibernate.

This gives the system a few practical guarantees. Every session leaves a visible
message, even if the agent exits too early. Every inbox message that the agent
receives gets either an agent reply or a daemon fallback. TODOs are claimed when
they are due, and if a session crashes, the daemon reschedules the claimed work
with backoff instead of silently dropping it.

The model can be clever when it is awake. The daemon should be dependable while
the model is gone.

## Agents That Work Across Time

The point of Cryochamber is not that every agent needs a daemon. It is that some
agent work naturally spans time.

For `disk-size-warn`, the question is not only "what should the agent do?" It is
also "when is the next useful moment to think?" The answer depends on the
situation: disk pressure, trend, urgency, and whether I have asked a question.

That is the clock I want to give agents.

Not continuous presence. Not fixed polling. A small loop:

```text
wake -> observe -> act -> choose next wake -> hibernate
```

If the world changes sooner, wake sooner. If nothing changes, spend nothing. If
the situation becomes urgent, escalate. If the work is done for now, disappear.

Cryochamber is my attempt to make that loop ordinary.

## Sources

- [OpenClaw Heartbeat](https://docs.openclaw.ai/gateway/heartbeat)
- [Hermes Agent scheduled tasks](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron)
- [Hermes Agent persistent goals](https://hermes-agent.nousresearch.com/docs/user-guide/features/goals)
- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
- [OpenAI conversation state](https://developers.openai.com/api/docs/guides/conversation-state)
- [OpenAI prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)

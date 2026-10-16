# 00: Overview

| Status | Last pass | Depends on |
|---|---|---|
| Draft | 0 | n/a |

> Every other doc must agree with this one. If a system doc conflicts with it, the overview wins until the user decides otherwise.
>
> Labels: **Decided** (in `DECISIONS.md`) · **Proposed** (Claude's suggestion) · **Open question**

---

## 1. One-line pitch
**Open question.** Fill this in once the open questions below are answered.

Working version (**Proposed**): *Collect, raise and battle your Implingz in a browser world where what you gather and win is yours to trade.*

## 2. What we know so far
- **Decided (D-001):** a web game built around the IMPLINGZ NFT collection.
- **Decided (D-002):** five systems: activities, resources, games, trade and skirmish.
- **From the current prototype** (this repo): a Three.js scene with a walking character, ore-vein rocks with collision, and jump and emote work in progress. This points to a third-person world where players walk around and gather. That is an observation, not a decision.

## 3. Design pillars
Pillars are the 3–4 rules every feature is judged against. If a feature doesn't serve one, it gets cut.

**Proposed** (needs your call):
1. **Your Impling matters.** Owning and raising a creature is the heart of the game.
2. **Fun before finance.** The game must be worth playing with the NFT/earning layer removed. If players only stay for money, the economy collapses when the price drops.
3. **Small, deep loops.** A few systems that feed each other, not many shallow ones. This keeps scope realistic for a small team.
4. **Fair to free players.** *(Depends on open question 2.)*

## 4. Core loop
The core loop is the cycle a player repeats every session. Each system doc must show where it sits in this loop.

**Proposed:**

```
 Activities ──► Resources ──► Upgrade / craft for your Impling
     ▲                                 │
     │                                 ▼
 Trade ◄──── rewards ◄──── Skirmish & Games
```

1. **Activities** (gathering, mining and so on) produce **resources**.
2. Resources are spent to **power up** Implingz, and to craft and to enter things.
3. Stronger Implingz do better in **skirmish** and **games**.
4. Skirmish and games give **rewards**: rarer resources, items, rank.
5. **Trade** lets players swap what they have for what they need. That gives every resource a value.

## 5. Systems map
| System | Its job in the loop | Doc |
|---|---|---|
| Activities | Turns time into resources | [01](01-activities.md) |
| Resources | The economy everything else runs on: sources and sinks | [02](02-resources.md) |
| Games | Variety, plus rewards that activities can't give | [03](03-games.md) |
| Trade | Moves value between players and gives resources a price | [04](04-trade.md) |
| Skirmish | The main way to test and show off your Impling | [05](05-skirmish.md) |

## 6. Target player and platform
**Open question.** See questions 4 and 5.

## 7. Scope guardrails
**Proposed:** things we will *not* do in the first version unless the user says otherwise:
- No open-world MMO. Small shared spaces or instanced areas only.
- No real-time action combat. Skirmish is turn-based.
- No more than one currency until the economy doc proves it needs a second.

---

## Open questions
These block Pass 2. Answer them in any order. Short answers are fine.

1. **What is an Impling NFT in the game?** Is it the creature you battle with in skirmish, or an avatar, land or item?
2. **Can people play without owning an NFT?** For example, a free starter Impling, or renting one.
3. **Is there an earning layer?** Can resources or items leave the game as tokens or NFTs, or is trading only inside the game? This decides how much anti-bot and anti-inflation design we need.
4. **Who is the target player?** NFT collectors, casual browser gamers or creature-collector fans?
5. **Platform and session length.** Desktop browser only, or mobile too? Do sessions last 5 minutes or 1 hour?
6. **Do you agree with the proposed pillars and core loop above?** Change, cut or add as you like.

## Pass history
| Pass | Change |
|---|---|
| 0 | First draft. Pitch, pillars, loop and guardrails proposed; open questions listed. |

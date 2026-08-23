---
name: exploratory-charter
description: >-
  Turns a feature plus a risk into an exploratory charter and a findings
  template. The thinking is human; this skill only keeps the format. Use when
  the user asks for an exploratory charter, session charter, exploratory
  testing notes, or a findings template for a feature and a risk.
---

# Exploratory charter

Think the new Skill — exploratory-charter: a tiny procedure that turns a feature + a risk into a charter and a findings template. The thinking is human; the skill just keeps the format.

Do not invent risks, oracles, or bugs. If feature or risk is missing, ask once, then stop.

## Procedure

1. Take **feature** and **risk** from the user (ticket key, page, or one sentence each).
2. Fill the charter. Leave blanks the human has not answered.
3. Hand back the empty findings template. Do not fill findings.
4. After the session, if the human pastes notes, copy them into the template only — do not rewrite their judgment.

## Charter

```markdown
# Charter

- Feature:
- Risk:
- Explore <feature> with <risk> to discover information about <risk>.
- Time box:
- Setup / data:
- Out of scope:
```

## Findings

```markdown
# Findings

| # | Type (bug / question / idea / praise) | What I saw | Why it matters | Evidence |
|---|----------------------------------------|------------|----------------|----------|
| 1 |                                        |            |                |          |

- Follow-ups:
```

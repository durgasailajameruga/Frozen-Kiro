# Ghosty Sprite System

## Sprite Sheet

- Source file: `assets/ghosty.png`
- Frame size: 32×32 px
- Layout: horizontal strip (all frames on a single row)
- Render scale: driven by `layout.runnerHeightRatio` from `game-config.json` (default 12% of canvas height)

---

## Animation States

| State  | Start Frame | Frame Count | Loop  | Trigger                        |
|--------|-------------|-------------|-------|--------------------------------|
| `idle` | 0           | 4           | yes   | Game in `idle` phase           |
| `run`  | 4           | 6           | yes   | Game in `running` phase, grounded |
| `jump` | 10          | 3           | no    | Runner becomes airborne        |
| `death`| 13          | 4           | no    | Game transitions to `gameover` |

### Frame Timing

- Default frame duration: 100ms per frame
- `jump` and `death` hold on their last frame when the sequence ends

---

## Hitbox

The hitbox is axis-aligned (AABB) and inset from the rendered sprite bounds to allow forgiving collision detection.

```
┌─────────────────────────┐
│      rendered sprite    │
│   ┌───────────────┐     │
│   │               │     │
│   │    hitbox     │     │
│   │               │     │
│   └───────────────┘     │
└─────────────────────────┘
```

### Hitbox Padding (configurable)

Padding is applied inward from each edge of the rendered sprite:

| Side   | Default padding |
|--------|-----------------|
| top    | 20%             |
| right  | 15%             |
| bottom | 5%              |
| left   | 15%             |

These are expressed as fractions of the rendered sprite dimensions so they scale correctly at any canvas size.

### Derived Hitbox Formula

Given rendered width `rw` and height `rh`:

```
hitbox.x      = runner.x + rw * paddingLeft
hitbox.y      = runner.y + rh * paddingTop
hitbox.width  = rw * (1 - paddingLeft - paddingRight)
hitbox.height = rh * (1 - paddingTop  - paddingBottom)
```

### Config Block (add to `game-config.json`)

```json
"runner": {
  "frameWidth": 32,
  "frameHeight": 32,
  "animationFrameMs": 100,
  "hitboxPadding": {
    "top": 0.20,
    "right": 0.15,
    "bottom": 0.05,
    "left": 0.15
  }
}
```

---

## Animation State Machine

```
idle ──[start]──► run ──[airborne]──► jump ──[grounded]──► run
                   │                                        │
                   └──────────────[collision]──► death ─────┘
                                                    (no loop, hold last frame)
```

---

## Notes

- If `ghosty.png` fails to load, the runner falls back to a filled rectangle of the same hitbox dimensions (see error handling in design doc)
- Frame index within a state resets to 0 on state entry
- The `death` animation plays once and freezes; it does not loop back to any other state

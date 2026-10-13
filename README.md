# 🎃 Scarecrow Farm Helper (`custom:scarecrow_helper`)
### *The 7 Chibi Farm Dwarfs — Bare Hands & Combat Whirlwind Edition (v1.9.0)*

An adorable, zero-maintenance autonomous agricultural companion suite for **Minecraft Bedrock Edition**.

**100% PURE VANILLA STABLE (NO EXPERIMENTS / BETA APIS NEEDED!)**

---

## 🌟 What's New & Upgraded in v1.9.0

- 👐 **Bare Hands (No On-Hand Items):**
  - Removed `rightItem` locator bone and `controller.render.item_default`.
  - Mobs now have completely free, unencumbered chibi hands with zero clipping or unwanted held tool rendering!

- 🏃‍♂️ **Authentic Villager-Style Waddle Shuffle:**
  - Procedural body wobble tilts side-to-side based on `Math.sin(query.anim_time * 700) * 7.0` with cute quick leg strides!
  - 100% stable movement playback evaluated through `query.modified_move_speed > 0.05`.

- 🌪️ **Spinning Whirlwind Combat Attack:**
  - When the Guard encounters monsters (Zombies, Skeletons, Spiders, Creepers), it executes a full **360° spinning whirlwind melee strike** with outstretched arms!

- 🎭 **Distinct Custom Job Working Animations:**
  - 🌾 **Farmer**: Tending & planting bend forward with reaching hands.
  - 🪓 **Forester**: Rhythmic overhead two-handed wood-chopping strike.
  - 🐑 **Rancher**: Rapid shearing snip motion.
  - 🌱 **Bonemealer**: Uplifting fertilizer scatter blessing with green particles.
  - 🎣 **Fisher**: Patient water casting hold pose.
  - 🐝 **Beekeeper**: Gentle swaying flower pollination dance.

- ⚡ **Autonomous Active Jobs for ALL 7 Dwarfs:**
  - 🌾 **Farmer**: Replanting and harvesting never stop (with automated starter seeds & refills).
  - 🪓 **Forester**: Scavenges dropped logs, sticks, apples, saplings, and produces periodic wood bundles.
  - 🐑 **Rancher**: Follows sheep herds (`minecraft:behavior.follow_mob`), auto-gathers wool, and tends livestock.
  - 🌱 **Bonemealer**: Emits periodic growth pulses with bone meal particles and sound effects.
  - 🎣 **Fisher**: Wanders to watersides (`minecraft:behavior.move_to_water`) and catches fish.
  - 🐝 **Beekeeper**: Follows bees and visits flowers, accelerates pollination, and harvests honeycomb.
  - 🛡️ **Guard**: Attacks hostile monsters using a spinning whirlwind strike (`damage: 6`).

- 🌅 **Day/Night Work & Rest Schedule:**
  - `minecraft:environment_sensor` triggers daytime work (`is_daytime: true`) and cozy nighttime resting (`is_daytime: false`), where dwarfs sit down cutely until dawn!
  - Work radius restricted to 16 blocks around their workstation.

- 🔊 **Dynamic Jumping & Movement Sound Effects:**
  - Soft straw rustle jump sound (`jump.cloth`), cushioned land impact (`fall.small`), and gentle footsteps (`step.cloth`).
  - Added `minecraft:jump.static` (power 0.42) for smooth garden hopping.

- 🏷️ **Clear Job Naming & Interactive Buttons:**
  - Interactive touch prompts with emoji titles (`Job: Farmer 🌾`, `Job: Forester 🪓`, etc.) + on-screen actionbar role announcements.

- 🧸 **0.8x Mini Chibi Scale:**
  - Scaled into a miniature **1-block-tall garden dwarf / fairy helper** with authentic Hay Bale straw weave & Carved Pumpkin styling!

- 🎩 **100% Solid Hat Back Fix:**
  - Full 360° UV texture mapping for all hat faces—no transparent gaps, inverted rendering, or Z-fighting!

- 🎒 **Hopper Auto-Siphon Storage:**
  - Place a **Hopper** underneath to auto-pull all harvested crops into chests without UI popup interruptions!

---

## 🛠️ Survival Crafting Recipe

```text
       [ Carved Pumpkin ]  (or Jack o'Lantern)
               |
         [ Hay Bale ]
```

Craft in any crafting table or your 2×2 inventory to receive your **Scarecrow Farm Helper** custom item!

---

## 🚀 Easy Installation

1. Download **`Scarecrow_Farm_Helper.mcaddon`**.
2. Tap the file to open with Minecraft Bedrock Edition (auto-imports both packs).
3. Activate **Scarecrow Farm Helper RP** and **BP** in your world.
4. Leave **Experiments OFF**! Craft your scarecrow item and enjoy!

---

## 📄 License & Credits

Created with ❤️ by **AllensCreations**.
Free to use and modify for Minecraft Bedrock worlds and servers!

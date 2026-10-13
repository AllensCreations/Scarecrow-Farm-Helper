# 🎃 Scarecrow Farm Helper (`custom:scarecrow_helper`)
### *The 7 Chibi Farm Dwarfs — Active Autonomous Jobs Edition (v1.8.0)*

An adorable, zero-maintenance autonomous agricultural companion suite for **Minecraft Bedrock Edition**.

**100% PURE VANILLA STABLE (NO EXPERIMENTS / BETA APIS NEEDED!)**

---

## 🌟 What's New & Upgraded in v1.8.0

- 🏃‍♂️ **Distance-Synced Walking Animation (FIXED):**
  - Uses `anim_time_update: query.modified_distance_moved * 35.0` to lock the leg swinging speed directly to how far the dwarf travels!
  - No more frozen/missing walk animation, micro-stuttering, or foot sliding.
  - The movement controller seamlessly switches to walking as soon as `query.ground_speed > 0.01`.

- ⚡ **Autonomous Active Jobs for ALL 7 Dwarfs:**
  - 🌾 **Farmer**: Equipped with starting seeds + auto-refill seed timer (`scarecrow:refill_seeds`) and green harvest particles so replanting **never stops**.
  - 🪓 **Forester**: Scavenges dropped logs, sticks, apples, saplings, and produces periodic wood bundles.
  - 🐑 **Rancher**: Follows sheep herds (`minecraft:behavior.follow_mob`), auto-gathers wool, and tends livestock.
  - 🌱 **Bonemealer**: Emits periodic growth pulses with bone meal particles and sound effects (`scarecrow:fertilize_pulse`) to speed up crop development.
  - 🎣 **Fisher**: Wanders to watersides (`minecraft:behavior.move_to_water`) and catches fish into their inventory.
  - 🐝 **Beekeeper**: Follows bees and visits flowers, accelerates pollination, and harvests honeycomb.
  - 🛡️ **Guard**: Attacks hostile monsters (Zombies, Skeletons, Spiders, Creepers) using an Iron Sword (`damage: 6`) to protect your crops and animals!

- 🌅 **Day/Night Work & Rest Schedule:**
  - Built-in `minecraft:environment_sensor` triggers daytime work (`is_daytime: true`) and cozy nighttime resting (`is_daytime: false`), where dwarfs sit down cutely until dawn!
  - Work radius restricted to 16 blocks around their workstation so they never wander away from your farm.

- 🔊 **Dynamic Jumping & Movement Sound Effects:**
  - Soft straw rustle jump sound (`jump.cloth`), cushioned land impact (`fall.small`), and gentle footsteps (`step.cloth`).
  - Added `minecraft:jump.static` (power 0.42) for smooth garden hopping.

- 🗡️ **Visually Holding Actual Vanilla Minecraft Items:**
  - Golden Hoe, Iron Axe, Shears, Bone Meal, Fishing Rod, Honeycomb, Iron Sword, Yellow Dandelion held natively in hand.

- 🏷️ **Clear Job Naming & Interactive Buttons:**
  - Interactive touch prompts with emoji titles + actionbar role assignment announcements.

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

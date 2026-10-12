import { world, system, ItemStack } from "@minecraft/server";

console.warn("[Scarecrow Farm Helper] The 7 Chibi Farm Dwarfs Script Engine v1.1.0 loaded");

// =========================================================================
// ROLE DEFINITIONS & METADATA
// =========================================================================

const ROLES = {
  0: { name: "Farmer", title: "§c[Farmer Dwarf]", desc: "Harvests mature crops & replants seeds", hat: "Red" },
  1: { name: "Forester", title: "§6[Forester Dwarf]", desc: "Collects wood, saplings & forest goods", hat: "Brown" },
  2: { name: "Rancher", title: "§3[Rancher Dwarf]", desc: "Tends animals, gathers wool & eggs", hat: "Cyan" },
  3: { name: "Bonemealer", title: "§a[Bonemealer Dwarf]", desc: "Nurtures crops with magical bone meal", hat: "Green" },
  4: { name: "Fisher", title: "§9[Fisher Dwarf]", desc: "Catches fresh fish near water ponds", hat: "Blue" },
  5: { name: "Beekeeper", title: "§e[Beekeeper Dwarf]", desc: "Tends bee nests & collects sweet honey", hat: "Yellow" },
  6: { name: "Guard", title: "§7[Guard Dwarf]", desc: "Protects farmsteads from pests & monsters", hat: "Grey" }
};

// Map storing active behavior state per scarecrow entity
// Key: entity.id -> { state: "idle"|"walking"|"harvesting"|"depositing"|"sitting", targetLoc, actionTicks, carriedDrops, idleTicks }
const dwarfMemory = new Map();

// =========================================================================
// 1. IN-WORLD SUMMONING RITUAL (Hay Bale + Carved Pumpkin)
// =========================================================================

function trySummonScarecrow(dim, pumpkinBlock, hayBlock) {
  try {
    const loc = {
      x: hayBlock.location.x + 0.5,
      y: hayBlock.location.y,
      z: hayBlock.location.z + 0.5
    };

    pumpkinBlock.setType("minecraft:air");
    hayBlock.setType("minecraft:air");

    try {
      dim.spawnParticle("minecraft:crop_growth_area_emitter", { x: loc.x, y: loc.y + 0.9, z: loc.z });
      dim.spawnParticle("minecraft:totem_particle", { x: loc.x, y: loc.y + 0.5, z: loc.z });
      dim.spawnParticle("minecraft:heart_particle", { x: loc.x, y: loc.y + 1.2, z: loc.z });
    } catch (e) {}

    try {
      dim.playSound("random.explode", loc, { volume: 0.6, pitch: 1.6 });
      dim.playSound("step.grass", loc, { volume: 1.2, pitch: 0.8 });
      dim.playSound("random.levelup", loc, { volume: 0.8, pitch: 1.5 });
    } catch (e) {}

    const scarecrow = dim.spawnEntity("custom:scarecrow_helper", loc);
    try {
      scarecrow.setProperty("custom:role", 0);
      scarecrow.setProperty("custom:state", 3); // Joy celebration on summon!
      system.runTimeout(() => {
        try {
          if (scarecrow.isValid()) scarecrow.setProperty("custom:state", 0);
        } catch (err) {}
      }, 25);
    } catch (e) {}

    return scarecrow;
  } catch (err) {
    console.error("[Scarecrow] Summon ritual error:", err);
    return null;
  }
}

world.afterEvents.playerPlaceBlock.subscribe((event) => {
  try {
    const block = event.block;
    const dim = event.dimension;
    const pumpkinTypes = ["minecraft:carved_pumpkin", "minecraft:lit_pumpkin"];

    // Case 1: Pumpkin placed on Hay Bale
    if (pumpkinTypes.includes(block.typeId)) {
      const below = dim.getBlock({
        x: block.location.x,
        y: block.location.y - 1,
        z: block.location.z
      });
      if (below && below.typeId === "minecraft:hay_block") {
        trySummonScarecrow(dim, block, below);
        return;
      }
    }

    // Case 2: Hay Bale placed under Pumpkin
    if (block.typeId === "minecraft:hay_block") {
      const above = dim.getBlock({
        x: block.location.x,
        y: block.location.y + 1,
        z: block.location.z
      });
      if (above && pumpkinTypes.includes(above.typeId)) {
        trySummonScarecrow(dim, above, block);
        return;
      }
    }
  } catch (err) {
    console.error("[Scarecrow] Place event error:", err);
  }
});

// =========================================================================
// 2. TOOL ASSIGNMENT & INTERACTION (The 7 Dwarfs System)
// =========================================================================

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  try {
    const entity = event.target;
    const player = event.player;
    if (entity.typeId !== "custom:scarecrow_helper") return;

    const equippable = player.getComponent("equippable");
    const mainHand = equippable?.getEquipment("Mainhand");
    const itemId = mainHand?.typeId ?? "";

    let assignedRole = null;

    if (itemId.includes("hoe") || itemId.includes("seed")) {
      assignedRole = 0; // Farmer
    } else if (itemId.includes("axe")) {
      assignedRole = 1; // Forester
    } else if (itemId.includes("shears") || itemId.includes("lead")) {
      assignedRole = 2; // Rancher
    } else if (itemId.includes("bone_meal") || itemId === "minecraft:dye") {
      assignedRole = 3; // Bonemealer
    } else if (itemId.includes("fishing_rod")) {
      assignedRole = 4; // Fisher
    } else if (itemId.includes("honeycomb") || itemId.includes("glass_bottle")) {
      assignedRole = 5; // Beekeeper
    } else if (itemId.includes("sword") || itemId.includes("shield")) {
      assignedRole = 6; // Guard
    }

    const currentRole = entity.getProperty("custom:role") ?? 0;
    const loc = entity.location;

    if (assignedRole !== null && assignedRole !== currentRole) {
      // Role Assigned!
      entity.setProperty("custom:role", assignedRole);
      entity.setProperty("custom:state", 3); // Joy jump!

      entity.dimension.spawnParticle("minecraft:totem_particle", { x: loc.x, y: loc.y + 0.8, z: loc.z });
      entity.dimension.spawnParticle("minecraft:heart_particle", { x: loc.x, y: loc.y + 1.2, z: loc.z });
      player.playSound("random.levelup", { volume: 0.9, pitch: 1.6 });

      const roleInfo = ROLES[assignedRole];
      player.onScreenDisplay.setActionBar(`${roleInfo.title} §aEquipped! §e${roleInfo.desc}`);

      // Reset joy state after 25 ticks
      system.runTimeout(() => {
        try {
          if (entity.isValid()) entity.setProperty("custom:state", 0);
        } catch (e) {}
      }, 25);
    } else {
      // Gentle greeting & hearts
      entity.dimension.spawnParticle("minecraft:heart_particle", { x: loc.x, y: loc.y + 1.2, z: loc.z });
      player.playSound("random.orb", { volume: 0.8, pitch: 1.8 });

      const roleInfo = ROLES[currentRole] ?? ROLES[0];
      player.onScreenDisplay.setActionBar(`${roleInfo.title} §a*Cute waddle* §e${roleInfo.desc} §7(Use tools to change role!)`);
    }
  } catch (err) {
    console.error("[Scarecrow] Interaction error:", err);
  }
});

// =========================================================================
// 3. STORAGE & CONTAINER DEPOSIT (Within 12 blocks)
// =========================================================================

function findNearestStorage(dim, originLoc, maxRadius = 12) {
  const ox = Math.floor(originLoc.x);
  const oy = Math.floor(originLoc.y);
  const oz = Math.floor(originLoc.z);

  let nearestContainer = null;
  let minDistanceSq = Infinity;

  for (let dy = -2; dy <= 3; dy++) {
    const y = oy + dy;
    for (let dx = -maxRadius; dx <= maxRadius; dx++) {
      for (let dz = -maxRadius; dz <= maxRadius; dz++) {
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq > maxRadius * maxRadius || distSq >= minDistanceSq) continue;

        const b = dim.getBlock({ x: ox + dx, y: y, z: oz + dz });
        if (!b) continue;

        const id = b.typeId;
        if (id.includes("chest") || id.includes("barrel") || id.includes("trapped_chest")) {
          const invComp = b.getComponent("inventory");
          if (invComp && invComp.container) {
            nearestContainer = b;
            minDistanceSq = distSq;
          }
        }
      }
    }
  }
  return nearestContainer;
}

function depositDrops(dim, storageBlock, drops, scarecrowLoc) {
  if (!drops || drops.length === 0) return;

  if (!storageBlock) {
    for (const drop of drops) {
      try {
        dim.spawnItem(new ItemStack(drop.typeId, drop.count), scarecrowLoc);
      } catch (e) {}
    }
    return;
  }

  try {
    const inv = storageBlock.getComponent("inventory")?.container;
    if (!inv) return;

    for (const drop of drops) {
      const stack = new ItemStack(drop.typeId, drop.count);
      const remainder = inv.addItem(stack);
      if (remainder && remainder.amount > 0) {
        dim.spawnItem(remainder, scarecrowLoc);
      }
    }

    const bLoc = {
      x: storageBlock.location.x + 0.5,
      y: storageBlock.location.y + 0.9,
      z: storageBlock.location.z + 0.5
    };

    try {
      dim.spawnParticle("minecraft:crop_growth_area_emitter", bLoc);
      dim.playSound("random.pop", bLoc, { volume: 0.8, pitch: 1.3 });
    } catch (e) {}
  } catch (err) {
    for (const drop of drops) {
      try {
        dim.spawnItem(new ItemStack(drop.typeId, drop.count), scarecrowLoc);
      } catch (e) {}
    }
  }
}

// =========================================================================
// 4. CROP HARVESTING & REPLANTING LOGIC
// =========================================================================

function checkCropMature(block) {
  try {
    const typeId = block.typeId;
    const perm = block.permutation;

    if (typeId.includes("wheat") || typeId.includes("carrot") || typeId.includes("potato") || typeId.includes("beetroot")) {
      return perm.getState("growth") === 7;
    }
    if (typeId.includes("nether_wart")) {
      return perm.getState("age") === 3;
    }
    if (typeId.includes("sweet_berry_bush")) {
      const g = perm.getState("growth");
      return g === 3 || g === 2;
    }
    if (typeId.includes("cocoa")) {
      return perm.getState("age") === 2;
    }
    return false;
  } catch (e) {
    return false;
  }
}

function harvestAndReplant(block) {
  try {
    const typeId = block.typeId;
    const perm = block.permutation;
    let drops = [];

    if (typeId.includes("wheat")) {
      block.setPermutation(perm.withState("growth", 0));
      drops.push({ typeId: "minecraft:wheat", count: 1 });
      drops.push({ typeId: "minecraft:wheat_seeds", count: Math.random() > 0.5 ? 2 : 1 });
    } else if (typeId.includes("carrot")) {
      block.setPermutation(perm.withState("growth", 0));
      drops.push({ typeId: "minecraft:carrot", count: 2 + Math.floor(Math.random() * 2) });
    } else if (typeId.includes("potato")) {
      block.setPermutation(perm.withState("growth", 0));
      drops.push({ typeId: "minecraft:potato", count: 2 + Math.floor(Math.random() * 2) });
      if (Math.random() < 0.05) {
        drops.push({ typeId: "minecraft:poisonous_potato", count: 1 });
      }
    } else if (typeId.includes("beetroot")) {
      block.setPermutation(perm.withState("growth", 0));
      drops.push({ typeId: "minecraft:beetroot", count: 1 });
      drops.push({ typeId: "minecraft:beetroot_seeds", count: 1 + Math.floor(Math.random() * 2) });
    } else if (typeId.includes("nether_wart")) {
      block.setPermutation(perm.withState("age", 0));
      drops.push({ typeId: "minecraft:nether_wart", count: 2 + Math.floor(Math.random() * 2) });
    } else if (typeId.includes("sweet_berry_bush")) {
      block.setPermutation(perm.withState("growth", 1));
      drops.push({ typeId: "minecraft:sweet_berries", count: 2 });
    } else if (typeId.includes("cocoa")) {
      block.setPermutation(perm.withState("age", 0));
      drops.push({ typeId: "minecraft:cocoa_beans", count: 2 + Math.floor(Math.random() * 2) });
    }

    return drops;
  } catch (err) {
    return [];
  }
}

// =========================================================================
// 5. SMOOTH PHYSICAL MOVEMENT HELPER
// =========================================================================

function stepTowards(entity, targetLoc, speed = 0.16) {
  const eLoc = entity.location;
  const dx = targetLoc.x - eLoc.x;
  const dz = targetLoc.z - eLoc.z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  if (dist < 0.05) return dist;

  // Face the target
  try {
    entity.teleport(eLoc, {
      facingLocation: { x: targetLoc.x, y: eLoc.y, z: targetLoc.z }
    });
  } catch (e) {}

  // Apply horizontal movement impulse
  try {
    entity.applyImpulse({
      x: (dx / dist) * speed,
      y: 0,
      z: (dz / dist) * speed
    });
  } catch (e) {}

  return dist;
}

// =========================================================================
// 6. MAIN AI ROUTINE TICK LOOP (Every 4 ticks = 0.2s for responsive walking)
// =========================================================================

system.runInterval(() => {
  const dimensions = ["overworld", "nether"];

  for (const dimName of dimensions) {
    let dim;
    try {
      dim = world.getDimension(dimName);
    } catch (e) {
      continue;
    }
    if (!dim) continue;

    let scarecrows;
    try {
      scarecrows = dim.getEntities({ type: "custom:scarecrow_helper" });
    } catch (e) {
      continue;
    }
    if (!scarecrows || scarecrows.length === 0) continue;

    for (const scarecrow of scarecrows) {
      if (!scarecrow.isValid()) {
        dwarfMemory.delete(scarecrow.id);
        continue;
      }

      const sLoc = scarecrow.location;
      const role = scarecrow.getProperty("custom:role") ?? 0;
      let mem = dwarfMemory.get(scarecrow.id);

      if (!mem) {
        mem = {
          state: "idle",
          targetLoc: null,
          targetBlock: null,
          actionTicks: 0,
          carriedDrops: [],
          idleTicks: 0
        };
        dwarfMemory.set(scarecrow.id, mem);
      }

      // -------------------------------------------------------------
      // STATE: DEPOSITING (Walk to storage & deposit)
      // -------------------------------------------------------------
      if (mem.carriedDrops.length > 0) {
        const storage = findNearestStorage(dim, sLoc, 12);
        if (storage) {
          const tLoc = {
            x: storage.location.x + 0.5,
            y: storage.location.y,
            z: storage.location.z + 0.5
          };
          const dist = stepTowards(scarecrow, tLoc, 0.18);

          if (dist <= 1.4) {
            depositDrops(dim, storage, mem.carriedDrops, sLoc);
            mem.carriedDrops = [];
            mem.state = "idle";
            mem.idleTicks = 0;

            // Joy celebration hop
            scarecrow.setProperty("custom:state", 3);
            system.runTimeout(() => {
              try {
                if (scarecrow.isValid()) scarecrow.setProperty("custom:state", 0);
              } catch (e) {}
            }, 18);
          }
          continue;
        } else {
          // No chest found, safely drop at feet
          depositDrops(dim, null, mem.carriedDrops, sLoc);
          mem.carriedDrops = [];
          mem.state = "idle";
        }
      }

      // -------------------------------------------------------------
      // STATE: HARVESTING (5-tick bow pause right at the plant)
      // -------------------------------------------------------------
      if (mem.state === "harvesting") {
        mem.actionTicks += 4; // incremented by 4 ticks each interval
        if (mem.actionTicks >= 5) {
          // 5 ticks complete: Gather the plant!
          if (mem.targetBlock) {
            const b = dim.getBlock(mem.targetBlock);
            if (b && checkCropMature(b)) {
              const drops = harvestAndReplant(b);
              mem.carriedDrops.push(...drops);

              const cLoc = { x: b.location.x + 0.5, y: b.location.y + 0.5, z: b.location.z + 0.5 };
              try {
                dim.spawnParticle("minecraft:crop_growth_area_emitter", cLoc);
                dim.playSound("step.grass", cLoc, { volume: 0.9, pitch: 1.1 });
              } catch (e) {}
            }
          }
          mem.state = "idle";
          mem.targetLoc = null;
          mem.targetBlock = null;
          mem.actionTicks = 0;
          scarecrow.setProperty("custom:state", 0);
        }
        continue;
      }

      // -------------------------------------------------------------
      // ROLE 0: FARMER (Search fully grown plant, walk there, 5t harvest)
      // -------------------------------------------------------------
      if (role === 0) {
        if (!mem.targetLoc) {
          // Search for nearest mature crop within 8 blocks
          const ox = Math.floor(sLoc.x);
          const oy = Math.floor(sLoc.y);
          const oz = Math.floor(sLoc.z);
          let nearestCrop = null;
          let minD = Infinity;

          for (let dy = -1; dy <= 2; dy++) {
            for (let dx = -8; dx <= 8; dx++) {
              for (let dz = -8; dz <= 8; dz++) {
                const b = dim.getBlock({ x: ox + dx, y: oy + dy, z: oz + dz });
                if (!b) continue;
                if (checkCropMature(b)) {
                  const d = dx * dx + dy * dy + dz * dz;
                  if (d < minD) {
                    minD = d;
                    nearestCrop = b;
                  }
                }
              }
            }
          }

          if (nearestCrop) {
            mem.targetBlock = { x: nearestCrop.location.x, y: nearestCrop.location.y, z: nearestCrop.location.z };
            mem.targetLoc = { x: nearestCrop.location.x + 0.5, y: nearestCrop.location.y, z: nearestCrop.location.z + 0.5 };
            mem.state = "walking";
            mem.idleTicks = 0;
            scarecrow.setProperty("custom:state", 0); // Stand up / walk
          } else {
            // No crops ready -> idle break / sitting!
            mem.idleTicks += 4;
            if (mem.idleTicks >= 40) {
              scarecrow.setProperty("custom:state", 1); // Sit and relax on the ground
            }
          }
        }

        if (mem.targetLoc && mem.state === "walking") {
          const dist = stepTowards(scarecrow, mem.targetLoc, 0.17);
          if (dist <= 1.2) {
            // Reached the mature crop! Start 5-tick harvest
            mem.state = "harvesting";
            mem.actionTicks = 0;
            scarecrow.setProperty("custom:state", 2); // Play harvest bow animation
          }
        }
        continue;
      }

      // -------------------------------------------------------------
      // ROLE 1: FORESTER (Gathers saplings, apples, wood items)
      // -------------------------------------------------------------
      if (role === 1) {
        const items = dim.getEntities({ location: sLoc, maxDistance: 8, type: "minecraft:item" });
        let targetItem = null;
        for (const item of items) {
          const itemComp = item.getComponent("item");
          const id = itemComp?.itemStack?.typeId ?? "";
          if (id.includes("sapling") || id.includes("log") || id.includes("wood") || id.includes("apple") || id.includes("stick")) {
            targetItem = item;
            break;
          }
        }

        if (targetItem && targetItem.isValid()) {
          const dist = stepTowards(scarecrow, targetItem.location, 0.17);
          if (dist <= 1.2) {
            const stack = targetItem.getComponent("item")?.itemStack;
            if (stack) mem.carriedDrops.push({ typeId: stack.typeId, count: stack.amount });
            targetItem.kill();
            scarecrow.setProperty("custom:state", 2);
            system.runTimeout(() => {
              if (scarecrow.isValid()) scarecrow.setProperty("custom:state", 0);
            }, 10);
          }
          mem.idleTicks = 0;
        } else {
          mem.idleTicks += 4;
          if (mem.idleTicks >= 40) scarecrow.setProperty("custom:state", 1);
        }
        continue;
      }

      // -------------------------------------------------------------
      // ROLE 2: RANCHER (Tends nearby sheep, gathers wool & eggs)
      // -------------------------------------------------------------
      if (role === 2) {
        // Collect nearby dropped eggs or wool
        const items = dim.getEntities({ location: sLoc, maxDistance: 8, type: "minecraft:item" });
        let targetItem = null;
        for (const item of items) {
          const id = item.getComponent("item")?.itemStack?.typeId ?? "";
          if (id.includes("egg") || id.includes("wool") || id.includes("feather")) {
            targetItem = item;
            break;
          }
        }

        if (targetItem && targetItem.isValid()) {
          const dist = stepTowards(scarecrow, targetItem.location, 0.17);
          if (dist <= 1.2) {
            const stack = targetItem.getComponent("item")?.itemStack;
            if (stack) mem.carriedDrops.push({ typeId: stack.typeId, count: stack.amount });
            targetItem.kill();
          }
          mem.idleTicks = 0;
        } else {
          // Check for nearby unsheared sheep
          const sheepList = dim.getEntities({ location: sLoc, maxDistance: 6, type: "minecraft:sheep" });
          let targetSheep = sheepList.find(s => s.isValid());
          if (targetSheep) {
            const dist = stepTowards(scarecrow, targetSheep.location, 0.15);
            if (dist <= 1.5 && Math.random() < 0.1) {
              mem.carriedDrops.push({ typeId: "minecraft:white_wool", count: 1 });
              targetSheep.dimension.spawnParticle("minecraft:heart_particle", targetSheep.location);
              targetSheep.dimension.playSound("mob.sheep.shear", targetSheep.location);
              scarecrow.setProperty("custom:state", 2);
              system.runTimeout(() => {
                if (scarecrow.isValid()) scarecrow.setProperty("custom:state", 0);
              }, 10);
            }
          } else {
            mem.idleTicks += 4;
            if (mem.idleTicks >= 40) scarecrow.setProperty("custom:state", 1);
          }
        }
        continue;
      }

      // -------------------------------------------------------------
      // ROLE 3: BONEMEALER (Nurtures growing crops with bonemeal)
      // -------------------------------------------------------------
      if (role === 3) {
        const ox = Math.floor(sLoc.x);
        const oy = Math.floor(sLoc.y);
        const oz = Math.floor(sLoc.z);
        let unripenedCrop = null;

        for (let dy = -1; dy <= 2; dy++) {
          for (let dx = -7; dx <= 7; dx++) {
            for (let dz = -7; dz <= 7; dz++) {
              const b = dim.getBlock({ x: ox + dx, y: oy + dy, z: oz + dz });
              if (!b) continue;
              const id = b.typeId;
              if (id.includes("wheat") || id.includes("carrot") || id.includes("potato") || id.includes("beetroot")) {
                const growth = b.permutation.getState("growth");
                if (typeof growth === "number" && growth < 7) {
                  unripenedCrop = b;
                  break;
                }
              }
            }
            if (unripenedCrop) break;
          }
          if (unripenedCrop) break;
        }

        if (unripenedCrop) {
          const tLoc = { x: unripenedCrop.location.x + 0.5, y: unripenedCrop.location.y, z: unripenedCrop.location.z + 0.5 };
          const dist = stepTowards(scarecrow, tLoc, 0.16);
          if (dist <= 1.3) {
            // Advance growth!
            const curG = unripenedCrop.permutation.getState("growth") ?? 0;
            const newG = Math.min(7, curG + 2);
            unripenedCrop.setPermutation(unripenedCrop.permutation.withState("growth", newG));

            dim.spawnParticle("minecraft:crop_growth_area_emitter", tLoc);
            dim.playSound("item.bonemeal.use", tLoc, { volume: 0.8, pitch: 1.2 });

            scarecrow.setProperty("custom:state", 2);
            system.runTimeout(() => {
              if (scarecrow.isValid()) scarecrow.setProperty("custom:state", 0);
            }, 10);
          }
          mem.idleTicks = 0;
        } else {
          mem.idleTicks += 4;
          if (mem.idleTicks >= 40) scarecrow.setProperty("custom:state", 1);
        }
        continue;
      }

      // -------------------------------------------------------------
      // ROLE 4: FISHER (Catches fish near water ponds)
      // -------------------------------------------------------------
      if (role === 4) {
        mem.actionTicks += 4;
        if (mem.actionTicks >= 80) { // every ~4 seconds
          mem.actionTicks = 0;
          // Catch fish!
          const fishTypes = ["minecraft:cod", "minecraft:salmon"];
          const fish = fishTypes[Math.floor(Math.random() * fishTypes.length)];
          mem.carriedDrops.push({ typeId: fish, count: 1 });

          dim.spawnParticle("minecraft:splash_particle", { x: sLoc.x, y: sLoc.y + 0.2, z: sLoc.z });
          dim.playSound("random.splash", sLoc, { volume: 0.8, pitch: 1.2 });

          scarecrow.setProperty("custom:state", 3);
          system.runTimeout(() => {
            if (scarecrow.isValid()) scarecrow.setProperty("custom:state", 0);
          }, 15);
        }
        continue;
      }

      // -------------------------------------------------------------
      // ROLE 5: BEEKEEPER (Gathers honey from beehives/nests)
      // -------------------------------------------------------------
      if (role === 5) {
        const ox = Math.floor(sLoc.x);
        const oy = Math.floor(sLoc.y);
        const oz = Math.floor(sLoc.z);
        let readyHive = null;

        for (let dy = -1; dy <= 3; dy++) {
          for (let dx = -7; dx <= 7; dx++) {
            for (let dz = -7; dz <= 7; dz++) {
              const b = dim.getBlock({ x: ox + dx, y: oy + dy, z: oz + dz });
              if (!b) continue;
              if (b.typeId.includes("beehive") || b.typeId.includes("bee_nest")) {
                const honey = b.permutation.getState("honey_level");
                if (honey === 5) {
                  readyHive = b;
                  break;
                }
              }
            }
            if (readyHive) break;
          }
          if (readyHive) break;
        }

        if (readyHive) {
          const tLoc = { x: readyHive.location.x + 0.5, y: readyHive.location.y, z: readyHive.location.z + 0.5 };
          const dist = stepTowards(scarecrow, tLoc, 0.16);
          if (dist <= 1.4) {
            readyHive.setPermutation(readyHive.permutation.withState("honey_level", 0));
            mem.carriedDrops.push({ typeId: "minecraft:honeycomb", count: 2 });

            dim.spawnParticle("minecraft:heart_particle", tLoc);
            dim.playSound("block.beehive.shear", tLoc, { volume: 0.8, pitch: 1.1 });

            scarecrow.setProperty("custom:state", 2);
            system.runTimeout(() => {
              if (scarecrow.isValid()) scarecrow.setProperty("custom:state", 0);
            }, 10);
          }
          mem.idleTicks = 0;
        } else {
          mem.idleTicks += 4;
          if (mem.idleTicks >= 40) scarecrow.setProperty("custom:state", 1);
        }
        continue;
      }

      // -------------------------------------------------------------
      // ROLE 6: GUARD (Repels monsters & pests from farm)
      // -------------------------------------------------------------
      if (role === 6) {
        const monsters = dim.getEntities({ location: sLoc, maxDistance: 10, families: ["monster"] });
        const targetMonster = monsters.find(m => m.isValid());

        if (targetMonster) {
          const mLoc = targetMonster.location;
          const dist = stepTowards(scarecrow, mLoc, 0.20);
          if (dist <= 2.0) {
            // Push back & strike!
            const dx = mLoc.x - sLoc.x;
            const dz = mLoc.z - sLoc.z;
            const d = Math.max(0.1, Math.sqrt(dx * dx + dz * dz));
            try {
              targetMonster.applyImpulse({ x: (dx / d) * 0.6, y: 0.25, z: (dz / d) * 0.6 });
              targetMonster.applyDamage(3);
            } catch (e) {}

            dim.spawnParticle("minecraft:crit_particle", mLoc);
            dim.playSound("random.burp", sLoc, { volume: 0.8, pitch: 1.8 });

            scarecrow.setProperty("custom:state", 3);
            system.runTimeout(() => {
              if (scarecrow.isValid()) scarecrow.setProperty("custom:state", 0);
            }, 10);
          }
          mem.idleTicks = 0;
        } else {
          mem.idleTicks += 4;
          if (mem.idleTicks >= 40) scarecrow.setProperty("custom:state", 1);
        }
        continue;
      }
    }
  }
}, 4);

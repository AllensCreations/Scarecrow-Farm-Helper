import { world, system, ItemStack } from "@minecraft/server";

console.warn("[Scarecrow Farm Helper] Script engine loaded v1.0.0");

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

    // Remove the blocks cleanly
    pumpkinBlock.setType("minecraft:air");
    hayBlock.setType("minecraft:air");

    // Burst of magical farming particles & sounds
    try {
      dim.spawnParticle("minecraft:crop_growth_area_emitter", { x: loc.x, y: loc.y + 0.9, z: loc.z });
      dim.spawnParticle("minecraft:totem_particle", { x: loc.x, y: loc.y + 0.5, z: loc.z });
      dim.spawnParticle("minecraft:heart_particle", { x: loc.x, y: loc.y + 1.2, z: loc.z });
    } catch (e) {}

    try {
      dim.playSound("random.explode", loc, { volume: 0.6, pitch: 1.6 });
      dim.playSound("step.grass", loc, { volume: 1.2, pitch: 0.8 });
      dim.playSound("mob.chicken.plop", loc, { volume: 1.0, pitch: 1.2 });
    } catch (e) {}

    // Spawn the cute Scarecrow entity
    const scarecrow = dim.spawnEntity("custom:scarecrow_helper", loc);
    return scarecrow;
  } catch (err) {
    console.error("[Scarecrow] Error during summon ritual:", err);
    return null;
  }
}

world.afterEvents.playerPlaceBlock.subscribe((event) => {
  try {
    const block = event.block;
    const dim = event.dimension;
    const pumpkinTypes = ["minecraft:carved_pumpkin", "minecraft:lit_pumpkin"];

    // Case 1: Player places Carved Pumpkin on top of Hay Bale
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

    // Case 2: Player places Hay Bale under Carved Pumpkin
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
// 2. INTERACTION & PERSONALITY (Hearts & Greetings)
// =========================================================================

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  try {
    const entity = event.target;
    const player = event.player;
    if (entity.typeId === "custom:scarecrow_helper") {
      const loc = entity.location;
      entity.dimension.spawnParticle("minecraft:heart_particle", {
        x: loc.x,
        y: loc.y + 1.2,
        z: loc.z
      });
      player.playSound("random.orb", { volume: 0.8, pitch: 1.8 });
      player.onScreenDisplay.setActionBar("§6[Scarecrow Helper] §a*Happy rustling* §eTending crops & chests nearby!");
    }
  } catch (e) {}
});

// =========================================================================
// 3. CROP DETECTION, HARVESTING & REPLANTING
// =========================================================================

function harvestAndReplant(block) {
  try {
    const typeId = block.typeId;
    const perm = block.permutation;
    let drops = [];

    if (typeId.includes("wheat")) {
      const growth = perm.getState("growth");
      if (growth === 7) {
        block.setPermutation(perm.withState("growth", 0));
        drops.push({ typeId: "minecraft:wheat", count: 1 });
        drops.push({ typeId: "minecraft:wheat_seeds", count: Math.random() > 0.5 ? 2 : 1 });
      }
    } else if (typeId.includes("carrot")) {
      const growth = perm.getState("growth");
      if (growth === 7) {
        block.setPermutation(perm.withState("growth", 0));
        drops.push({ typeId: "minecraft:carrot", count: 2 + Math.floor(Math.random() * 2) });
      }
    } else if (typeId.includes("potato")) {
      const growth = perm.getState("growth");
      if (growth === 7) {
        block.setPermutation(perm.withState("growth", 0));
        drops.push({ typeId: "minecraft:potato", count: 2 + Math.floor(Math.random() * 2) });
        if (Math.random() < 0.05) {
          drops.push({ typeId: "minecraft:poisonous_potato", count: 1 });
        }
      }
    } else if (typeId.includes("beetroot")) {
      const growth = perm.getState("growth");
      if (growth === 7) {
        block.setPermutation(perm.withState("growth", 0));
        drops.push({ typeId: "minecraft:beetroot", count: 1 });
        drops.push({ typeId: "minecraft:beetroot_seeds", count: 1 + Math.floor(Math.random() * 2) });
      }
    } else if (typeId.includes("nether_wart")) {
      const age = perm.getState("age");
      if (age === 3) {
        block.setPermutation(perm.withState("age", 0));
        drops.push({ typeId: "minecraft:nether_wart", count: 2 + Math.floor(Math.random() * 2) });
      }
    } else if (typeId.includes("sweet_berry_bush")) {
      const growth = perm.getState("growth");
      if (growth === 3 || growth === 2) {
        block.setPermutation(perm.withState("growth", 1));
        drops.push({ typeId: "minecraft:sweet_berries", count: growth === 3 ? 2 + Math.floor(Math.random() * 2) : 1 });
      }
    } else if (typeId.includes("cocoa")) {
      const age = perm.getState("age");
      if (age === 2) {
        block.setPermutation(perm.withState("age", 0));
        drops.push({ typeId: "minecraft:cocoa_beans", count: 2 + Math.floor(Math.random() * 2) });
      }
    }

    return drops;
  } catch (err) {
    console.error("[Scarecrow] Harvest error:", err);
    return [];
  }
}

// =========================================================================
// 4. STORAGE AUTO-DEPOSIT (Chests & Barrels within 12 blocks)
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
        if (distSq > maxRadius * maxRadius || distSq >= minDistanceSq) {
          continue;
        }

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
    // Drop at scarecrow's feet safely if no storage nearby
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
// 5. PERIODIC FARM ROUTINE LOOP (Tends crops every 40 ticks = 2s)
// =========================================================================

system.runInterval(() => {
  const dimensions = ["overworld", "nether"];

  for (const dimName of dimensions) {
    try {
      const dim = world.getDimension(dimName);
      if (!dim) continue;

      const scarecrows = dim.getEntities({ type: "custom:scarecrow_helper" });
      if (!scarecrows || scarecrows.length === 0) continue;

      for (const scarecrow of scarecrows) {
        if (!scarecrow.isValid()) continue;

        const sLoc = scarecrow.location;
        const ox = Math.floor(sLoc.x);
        const oy = Math.floor(sLoc.y);
        const oz = Math.floor(sLoc.z);

        const cropRadius = 6;
        let harvestedDrops = [];
        let matureCropFound = false;

        // Search for mature crops within 6 blocks horizontally, -1 to +2 vertically
        searchLoop:
        for (let dy = -1; dy <= 2; dy++) {
          const y = oy + dy;
          for (let dx = -cropRadius; dx <= cropRadius; dx++) {
            for (let dz = -cropRadius; dz <= cropRadius; dz++) {
              const b = dim.getBlock({ x: ox + dx, y: y, z: oz + dz });
              if (!b) continue;

              const id = b.typeId;
              const isCrop = id.includes("wheat") ||
                             id.includes("carrot") ||
                             id.includes("potato") ||
                             id.includes("beetroot") ||
                             id.includes("nether_wart") ||
                             id.includes("sweet_berry_bush") ||
                             id.includes("cocoa");

              if (isCrop) {
                const drops = harvestAndReplant(b);
                if (drops.length > 0) {
                  matureCropFound = true;
                  harvestedDrops.push(...drops);

                  // Particles & sound at crop location
                  const cLoc = {
                    x: b.location.x + 0.5,
                    y: b.location.y + 0.4,
                    z: b.location.z + 0.5
                  };
                  try {
                    dim.spawnParticle("minecraft:crop_growth_area_emitter", cLoc);
                    dim.playSound("step.grass", cLoc, { volume: 0.9, pitch: 1.1 });
                  } catch (e) {}

                  // Limit to harvesting 2 crops per 2s cycle to maintain natural pacing
                  if (harvestedDrops.length >= 2) {
                    break searchLoop;
                  }
                }
              }
            }
          }
        }

        // If crops were harvested, find nearest chest/barrel and auto-deposit!
        if (matureCropFound && harvestedDrops.length > 0) {
          const storage = findNearestStorage(dim, sLoc, 12);
          depositDrops(dim, storage, harvestedDrops, sLoc);
        }
      }
    } catch (e) {
      // Dimension might not be loaded
    }
  }
}, 40);

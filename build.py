import os
import shutil
import zipfile

PROJECT_DIR = "/root/scarecrow-farm-helper"
BUILD_DIR = os.path.join(PROJECT_DIR, "build")
BP_DIR = os.path.join(PROJECT_DIR, "behavior_pack")
RP_DIR = os.path.join(PROJECT_DIR, "resource_pack")

os.makedirs(BUILD_DIR, exist_ok=True)
os.makedirs("/root/Downloads", exist_ok=True)
os.makedirs("/sdcard/Download", exist_ok=True)

bp_pack = os.path.join(BUILD_DIR, "Scarecrow_Farm_Helper_BP.mcpack")
rp_pack = os.path.join(BUILD_DIR, "Scarecrow_Farm_Helper_RP.mcpack")
addon_pack = os.path.join(BUILD_DIR, "Scarecrow_Farm_Helper.mcaddon")

def zip_dir(dir_path, output_path):
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(dir_path):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, dir_path)
                zipf.write(full_path, rel_path)
    print(f"Created: {output_path} ({os.path.getsize(output_path)} bytes)")

# 1. Build BP and RP mcpacks
zip_dir(BP_DIR, bp_pack)
zip_dir(RP_DIR, rp_pack)

# 2. Build mcaddon containing both packs
with zipfile.ZipFile(addon_pack, "w", zipfile.ZIP_DEFLATED) as addon:
    # Also include the packs directly or as subdirectories for maximum Bedrock compatibility
    for root, dirs, files in os.walk(BP_DIR):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.join("behavior_pack", os.path.relpath(full_path, BP_DIR))
            addon.write(full_path, rel_path)
    for root, dirs, files in os.walk(RP_DIR):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.join("resource_pack", os.path.relpath(full_path, RP_DIR))
            addon.write(full_path, rel_path)

print(f"Created Addon: {addon_pack} ({os.path.getsize(addon_pack)} bytes)")

# 3. Copy outputs to project root, /root/Downloads, and /sdcard/Download
dist_targets = [
    PROJECT_DIR,
    "/root/Downloads",
    "/sdcard/Download"
]

for target in dist_targets:
    if os.path.exists(target):
        shutil.copy2(addon_pack, os.path.join(target, "Scarecrow_Farm_Helper.mcaddon"))
        shutil.copy2(bp_pack, os.path.join(target, "Scarecrow_Farm_Helper_BP.mcpack"))
        shutil.copy2(rp_pack, os.path.join(target, "Scarecrow_Farm_Helper_RP.mcpack"))
        print(f"Copied packages to: {target}")

print("Packaging complete!")

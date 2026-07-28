"""Prepare a supplied Blender packaging scene for the Packworkz web studio.

Usage:
  blender -b source.blend --python export-packaging-model.py -- PRESET output.glb
"""

import sys

import bpy


args = sys.argv[sys.argv.index("--") + 1:]
preset, output_path = args


def material(name: str, color: tuple[float, float, float, float], metallic: float = 0.0, roughness: float = 0.55, alpha: float = 1.0):
    item = bpy.data.materials.new(name)
    item.diffuse_color = color
    item.use_nodes = True
    shader = item.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Metallic IOR Level" if "Metallic IOR Level" in shader.inputs else "Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Alpha"].default_value = alpha
    if alpha < 1:
        item.surface_render_method = "DITHERED"
    return item


artwork = material("PW_ARTWORK", (0.08, 0.32, 0.39, 1), roughness=0.55)
cap = material("PW_CAP", (0.035, 0.045, 0.06, 1), roughness=0.3)
glass = material("PW_GLASS", (0.75, 0.82, 0.88, 0.2), roughness=0.12, alpha=0.24)
metal = material("PW_METAL", (0.18, 0.2, 0.23, 1), metallic=0.72, roughness=0.2)
cream = material("PW_FILL", (0.88, 0.82, 0.7, 1), roughness=0.75)

for item in list(bpy.context.scene.objects):
    if item.type != "MESH" or item.name.lower() == "backdrop" or item.hide_render:
        bpy.data.objects.remove(item, do_unlink=True)

meshes = [item for item in bpy.context.scene.objects if item.type == "MESH"]
for item in meshes:
    item.hide_set(False)
    item.hide_render = False
    item.select_set(True)
    item.data.materials.clear()
    lower_name = item.name.lower()

    role = "accessory"
    selected_material = cap
    if preset in {"pouch", "coffee"} or (preset == "tube" and lower_name == "base") or (preset == "jar" and lower_name == "jar white"):
        role = "artwork"
        selected_material = artwork
    elif "glass" in lower_name:
        selected_material = glass
    elif "chrome" in lower_name:
        selected_material = metal
    elif lower_name == "cream":
        selected_material = cream

    item.data.materials.append(selected_material)
    item["packworkz_role"] = role

    polygon_count = len(item.data.polygons)
    target = 18_000 if role == "artwork" else 8_000
    if polygon_count > target * 1.25:
        modifier = item.modifiers.new("Packworkz web optimization", "DECIMATE")
        modifier.ratio = max(0.04, target / polygon_count)
        modifier.use_collapse_triangulate = True
        bpy.context.view_layer.objects.active = item
        bpy.ops.object.modifier_apply(modifier=modifier.name)

bpy.ops.object.select_all(action="DESELECT")
for item in meshes:
    item.select_set(True)

bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_yup=True,
    export_materials="EXPORT",
    export_extras=True,
    export_cameras=False,
    export_lights=False,
)

print(f"PACKWORKZ_EXPORT {preset} {output_path}")

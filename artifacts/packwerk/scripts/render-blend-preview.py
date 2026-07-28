"""Render a neutral catalogue preview for a Blender packaging asset."""

import math
import sys

import bpy
from mathutils import Vector


def look_at(camera: bpy.types.Object, target: Vector) -> None:
    camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()


output_path = sys.argv[sys.argv.index("--") + 1]

for item in list(bpy.context.scene.objects):
    if item.type != "MESH" or item.name.lower() == "backdrop":
        bpy.data.objects.remove(item, do_unlink=True)

meshes = [item for item in bpy.context.scene.objects if item.type == "MESH"]
corners = [item.matrix_world @ Vector(corner) for item in meshes for corner in item.bound_box]
minimum = Vector((min(point.x for point in corners), min(point.y for point in corners), min(point.z for point in corners)))
maximum = Vector((max(point.x for point in corners), max(point.y for point in corners), max(point.z for point in corners)))
center = (minimum + maximum) / 2
extent = maximum - minimum
radius = max(extent) * 0.72

camera_data = bpy.data.cameras.new("Packworkz preview camera")
camera = bpy.data.objects.new("Packworkz preview camera", camera_data)
bpy.context.collection.objects.link(camera)
camera.location = center + Vector((radius * 1.65, -radius * 2.3, radius * 1.05))
camera.data.lens = 58
look_at(camera, center + Vector((0, 0, extent.z * 0.03)))
bpy.context.scene.camera = camera

for name, energy, size, offset in (
    ("Key", 1000, radius * 1.7, (radius * 2.2, -radius * 2.0, radius * 3.2)),
    ("Fill", 650, radius * 2.0, (-radius * 2.4, -radius * 0.8, radius * 1.8)),
    ("Rim", 850, radius * 1.4, (radius * 0.4, radius * 2.4, radius * 2.4)),
):
    light_data = bpy.data.lights.new(name, "AREA")
    light_data.energy = energy
    light_data.shape = "DISK"
    light_data.size = size
    light = bpy.data.objects.new(name, light_data)
    bpy.context.collection.objects.link(light)
    light.location = center + Vector(offset)
    look_at(light, center)

floor_data = bpy.data.meshes.new("Preview floor")
floor = bpy.data.objects.new("Preview floor", floor_data)
bpy.context.collection.objects.link(floor)
floor_data.from_pydata(
    [(-radius * 5, -radius * 5, minimum.z - radius * 0.04), (radius * 5, -radius * 5, minimum.z - radius * 0.04),
     (radius * 5, radius * 5, minimum.z - radius * 0.04), (-radius * 5, radius * 5, minimum.z - radius * 0.04)],
    [],
    [(0, 1, 2, 3)],
)
floor_material = bpy.data.materials.new("Preview floor")
floor_material.diffuse_color = (0.76, 0.79, 0.82, 1)
floor.data.materials.append(floor_material)

scene = bpy.context.scene
try:
    scene.render.engine = "BLENDER_EEVEE_NEXT"
except TypeError:
    scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 700
scene.render.resolution_y = 700
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = False
scene.render.filepath = output_path
scene.world.color = (0.055, 0.065, 0.08)
scene.view_settings.look = "Medium High Contrast"
scene.render.image_settings.color_mode = "RGBA"
scene.render.resolution_percentage = 100
scene.camera.data.dof.use_dof = False

bpy.ops.render.render(write_still=True)

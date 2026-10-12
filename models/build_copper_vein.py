"""Builds a stylised, low-poly copper ore vein.

Run from the repo root (Blender 4.2+):
    blender --background --factory-startup --python models/build_copper_vein.py -- [--render preview.png]

Writes:
    models/copper_vein.glb    one mesh, three flat-coloured materials, origin at the bottom centre
    models/copper_vein.blend  the same scene
and, with --render, preview.png (lit) and preview_wire.png (clay with edges).

The vein is about 0.85 m tall and 1 m wide. Boulders are convex hulls of jittered
points, flattened by a few cut planes for the chiselled look. Upward faces get the
Vein_Top colour and the rest Vein_Side, so the two-tone read needs no texture.
The seed is fixed, so every run builds the same rock.
"""

import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEED = 7
TOP_FACING = 0.5

COLOURS = {
    "Vein_Side": ("#80858e", 0.0, 0.9),
    "Vein_Top": ("#d2a75a", 0.0, 0.85),
    "Vein_Copper": ("#e2733a", 0.55, 0.35),
}

# (centre, half-size) in metres, Blender Z-up.
BOULDERS = [
    ((0.00, 0.00, 0.12), (0.50, 0.40, 0.24)),
    ((-0.06, 0.08, 0.40), (0.30, 0.26, 0.40)),
    ((0.31, -0.04, 0.16), (0.26, 0.24, 0.26)),
    ((-0.33, -0.03, 0.13), (0.24, 0.26, 0.22)),
    ((0.01, 0.05, 0.64), (0.22, 0.20, 0.19)),
    ((0.10, -0.28, 0.08), (0.20, 0.14, 0.13)),
    ((0.20, 0.22, 0.30), (0.20, 0.18, 0.22)),
]
PEBBLES = [
    ((-0.55, -0.22, 0.03), 0.07),
    ((0.52, -0.30, 0.03), 0.06),
    ((-0.20, -0.42, 0.025), 0.05),
    ((0.58, 0.12, 0.03), 0.055),
]
# Cluster sites as directions from the vein centre; nuggets are dropped onto the rock there.
COPPER_SITES = [
    ((0.2, -1.0, 0.25), 4),
    ((-0.8, -0.6, 0.3), 3),
    ((0.9, -0.4, 0.15), 3),
    ((0.3, -0.7, 0.9), 3),
    ((-0.6, -0.5, 1.2), 2),
    ((0.9, 0.5, 0.5), 3),
    ((-0.9, 0.4, 0.2), 2),
]


def args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    return argv[argv.index("--render") + 1] if "--render" in argv else None


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def material(name):
    hex_colour, metallic, roughness = COLOURS[name]
    m = bpy.data.materials.new(name)
    if not m.use_nodes:
        m.use_nodes = True
    bsdf = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    h = hex_colour.lstrip("#")
    rgb = [srgb_to_linear(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4)]
    bsdf.inputs["Base Color"].default_value = (*rgb, 1)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    m.diffuse_color = (*rgb, 1)
    return m


def random_direction(rng):
    while True:
        v = Vector((rng.gauss(0, 1), rng.gauss(0, 1), rng.gauss(0, 1)))
        if v.length > 1e-4:
            return v.normalized()


def hull_rock(bm, rng, centre, size, points=40, side_cuts=4, ground=True, jitter=(0.94, 1.03)):
    """Adds one faceted rock to bm and returns its faces."""
    centre, size = Vector(centre), Vector(size)
    spin = Matrix.Rotation(rng.uniform(0, math.tau), 3, "Z")

    cuts = [(Vector((rng.uniform(-0.25, 0.25), rng.uniform(-0.25, 0.25), 1)).normalized(),
             rng.uniform(0.72, 0.88))]
    for i in range(side_cuts):
        a = math.tau * (i + rng.uniform(0.1, 0.9)) / side_cuts
        cuts.append((Vector((math.cos(a), math.sin(a), rng.uniform(-0.2, 0.45))).normalized(),
                     rng.uniform(0.78, 0.92)))

    verts = []
    for _ in range(points):
        p = random_direction(rng) * rng.uniform(*jitter)
        p = Vector((p.x * size.x, p.y * size.y, p.z * size.z))
        for n, frac in cuts:
            reach = Vector((n.x * size.x, n.y * size.y, n.z * size.z)).length * frac
            d = p.dot(n)
            if d > reach:
                p -= n * (d - reach)
        p = spin @ p + centre
        if ground and p.z < 0:
            p.z = 0
        verts.append(bm.verts.new(p))

    result = bmesh.ops.convex_hull(bm, input=verts)
    loose = {v for v in result["geom_interior"] + result["geom_unused"] if isinstance(v, bmesh.types.BMVert)}
    bmesh.ops.delete(bm, geom=list(loose), context="VERTS")
    faces = [f for f in result["geom"] if isinstance(f, bmesh.types.BMFace)]
    bmesh.ops.remove_doubles(bm, verts=list({v for f in faces for v in f.verts}), dist=0.004)
    faces = [f for f in faces if f.is_valid]
    bmesh.ops.dissolve_limit(bm, angle_limit=math.radians(2),
                             verts=list({v for f in faces for v in f.verts}),
                             edges=list({e for f in faces for e in f.edges}))
    return [f for f in bm.faces if f.is_valid and f.tag is False]


def build_rocks(rng):
    bm = bmesh.new()
    for centre, size in BOULDERS:
        hull_rock(bm, rng, centre, size)
        for f in bm.faces:
            f.tag = True
    for centre, r in PEBBLES:
        hull_rock(bm, rng, centre, (r * 1.2, r, r * 0.8), points=16, side_cuts=2)
        for f in bm.faces:
            f.tag = True
    for f in bm.faces:
        f.tag = False
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    # The ground hides the flat undersides.
    bottom = [f for f in bm.faces if f.normal.z < -0.98 and all(v.co.z < 0.002 for v in f.verts)]
    bmesh.ops.delete(bm, geom=bottom, context="FACES")
    return bm


def build_copper(rng, rocks):
    tree = BVHTree.FromBMesh(rocks)
    bm = bmesh.new()
    target = Vector((0, 0, 0.35))
    for direction, count in COPPER_SITES:
        d = Vector(direction).normalized()
        hit, normal, _, _ = tree.ray_cast(target + d * 2.0, -d)
        if hit is None:
            continue
        tangent = normal.cross(Vector((0, 0, 1)))
        if tangent.length < 1e-3:
            tangent = Vector((1, 0, 0))
        tangent.normalize()
        bitangent = normal.cross(tangent)
        for i in range(count):
            r = rng.uniform(0.038, 0.058) * (1.3 if i == 0 else 1.0)
            offset = (tangent * rng.uniform(-1, 1) + bitangent * rng.uniform(-1, 1)) * 0.065 * (i > 0)
            probe = hit + offset + normal * 0.3
            sub_hit, sub_normal, _, _ = tree.ray_cast(probe, -normal)
            base, n = (sub_hit, sub_normal) if sub_hit is not None else (hit, normal)
            centre = base + n * r * 0.1
            if centre.z < r * 0.6:
                continue
            size = (r * rng.uniform(0.95, 1.2), r * rng.uniform(0.95, 1.2), r * rng.uniform(0.85, 1.1))
            hull_rock(bm, rng, centre, size, points=14, side_cuts=2, ground=False, jitter=(0.9, 1.02))
            for f in bm.faces:
                f.tag = True
    for f in bm.faces:
        f.tag = False
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def build_vein(scene):
    rng = random.Random(SEED)
    mats = {name: material(name) for name in COLOURS}

    rocks = build_rocks(rng)
    copper = build_copper(rng, rocks)

    me = bpy.data.meshes.new("CopperVein")
    for name in ("Vein_Side", "Vein_Top", "Vein_Copper"):
        me.materials.append(mats[name])
    for f in rocks.faces:
        f.material_index = 1 if f.normal.z > TOP_FACING else 0
    copper_mesh = bpy.data.meshes.new("tmp")
    copper.to_mesh(copper_mesh)
    copper.free()
    for poly in copper_mesh.polygons:
        poly.material_index = 2
    rocks.from_mesh(copper_mesh)
    bpy.data.meshes.remove(copper_mesh)
    rocks.to_mesh(me)
    rocks.free()
    for poly in me.polygons:
        poly.use_smooth = False

    ob = bpy.data.objects.new("CopperVein", me)
    scene.collection.objects.link(ob)
    return ob


def export_glb(ob, path):
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", use_selection=True,
                              export_apply=True, export_yup=True)


def triangles(ob):
    return sum(len(p.vertices) - 2 for p in ob.data.polygons)


def setup_render(scene):
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 64
    scene.cycles.device = "CPU"
    scene.render.resolution_x, scene.render.resolution_y = 1280, 860
    world = bpy.data.worlds.new("World")
    scene.world = world
    if not world.use_nodes:
        world.use_nodes = True
    bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = (0.02, 0.028, 0.04, 1)
    bg.inputs["Strength"].default_value = 1.0

    for name, rot, energy, colour in (("Key", (45, 0, 25), 4.0, (1.0, 0.95, 0.88)),
                                      ("Rim", (65, 0, -150), 2.5, (0.75, 0.85, 1.0)),
                                      ("Fill", (75, 0, 110), 0.8, (1, 1, 1))):
        light = bpy.data.objects.new(name, bpy.data.lights.new(name, "SUN"))
        light.data.energy = energy
        light.data.color = colour
        light.rotation_euler = [math.radians(a) for a in rot]
        scene.collection.objects.link(light)

    ground_mat = bpy.data.materials.new("PreviewGround")
    if not ground_mat.use_nodes:
        ground_mat.use_nodes = True
    bsdf = next(n for n in ground_mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (0.008, 0.01, 0.016, 1)
    bsdf.inputs["Roughness"].default_value = 1.0
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=6)
    me = bpy.data.meshes.new("PreviewGround")
    bm.to_mesh(me)
    bm.free()
    me.materials.append(ground_mat)
    scene.collection.objects.link(bpy.data.objects.new("PreviewGround", me))

    cam = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera"))
    cam.data.lens = 60
    cam.location = (1.35, -2.55, 1.35)
    cam.rotation_euler = (Vector((0, 0, 0.36)) - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.collection.objects.link(cam)
    scene.camera = cam


def render(scene, path):
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def render_wire(scene, path):
    clay = bpy.data.materials.new("Clay")
    if not clay.use_nodes:
        clay.use_nodes = True
    bsdf = next(n for n in clay.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (0.5, 0.5, 0.52, 1)
    bsdf.inputs["Roughness"].default_value = 0.7

    layer = scene.view_layers[0]
    layer.material_override = clay
    scene.render.use_freestyle = True
    layer.use_freestyle = True
    fs = layer.freestyle_settings
    fs.crease_angle = math.radians(179.9)
    lineset = fs.linesets[0] if len(fs.linesets) else fs.linesets.new("Edges")
    lineset.select_by_visibility = True
    lineset.select_by_edge_types = True
    lineset.select_crease = True
    lineset.select_border = True
    lineset.select_silhouette = True
    if lineset.linestyle is None:
        lineset.linestyle = bpy.data.linestyles.new("Edges")
    lineset.linestyle.thickness = 1.0
    lineset.linestyle.color = (0.08, 0.08, 0.09)
    render(scene, path)
    layer.material_override = None
    scene.render.use_freestyle = False


def main():
    preview = args()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene

    ob = build_vein(scene)
    export_glb(ob, os.path.join(REPO, "models", "copper_vein.glb"))

    if preview:
        preview = os.path.abspath(preview)
        setup_render(scene)
        render(scene, preview)
        stem, ext = os.path.splitext(preview)
        render_wire(scene, stem + "_wire" + ext)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(REPO, "models", "copper_vein.blend"), compress=True)
    print("built CopperVein,", triangles(ob), "triangles,", len(ob.data.vertices), "vertices")


main()

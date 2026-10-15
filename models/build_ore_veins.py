"""Builds the stylised ore veins and cave boulders.

Run from the repo root (Blender 4.2+):
    blender --background --factory-startup --python models/build_ore_veins.py

Writes models/ore_veins.glb. Each top-level object has its origin at the
bottom centre, 1 unit = 1 m:
    Vein_Spire_Nugget, Vein_Spire_Crystal   tall cluster of leaning rock shards
    Vein_Mound_Nugget, Vein_Mound_Crystal   low heap of rounded rocks
    Boulder_0 .. Boulder_3                   rock only, about 1 m across
Every vein holds a "Rock" mesh and an "Ore" mesh, so the game can colour each
per tier. Rock and ore are built from convex hulls (big flat facets) with
bevelled edges and hardened normals. The painted shading lives in the "Col"
vertex colours: lighter at the top, a slightly different tone per facet, and a
light stroke on every bevel. Materials are white, so the game's colour
multiplies the painting.
"""

import math
import os
import random

import bmesh
import bpy
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, "models", "ore_veins.glb")


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name):
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    col = nodes.new("ShaderNodeVertexColor")
    col.layer_name = "Col"
    mat.node_tree.links.new(col.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.9
    return mat


def hull(name, points):
    bm = bmesh.new()
    for p in points:
        bm.verts.new(p)
    result = bmesh.ops.convex_hull(bm, input=bm.verts[:])
    loose = {v for v in result["geom_interior"] + result["geom_unused"] if isinstance(v, bmesh.types.BMVert)}
    bmesh.ops.delete(bm, geom=list(loose), context="VERTS")
    # Merge nearly coplanar triangles into the big facets the style wants.
    bmesh.ops.dissolve_limit(bm, angle_limit=math.radians(9), verts=bm.verts[:], edges=bm.edges[:])
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def bevel_and_paint(obj, width, height, rng, low, high, edge, segments=2):
    """Bevels the edges, then paints the face corners. `low`..`high` is the
    shade from the base of the vein (height 0) to `height`; `edge` brightens
    the bevel faces. Values are sRGB, at most 1."""
    obj.data.materials.append(material("Rock" if obj.name.startswith("Rock") else "Ore"))
    obj.data.materials.append(material("Edge"))
    for poly in obj.data.polygons:
        poly.use_smooth = True
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    mod.angle_limit = math.radians(20)
    mod.harden_normals = True
    mod.material = 1
    depsgraph = bpy.context.evaluated_depsgraph_get()
    mesh = bpy.data.meshes.new_from_object(obj.evaluated_get(depsgraph), preserve_all_data_layers=True, depsgraph=depsgraph)
    obj.modifiers.clear()
    obj.data = mesh

    attr = mesh.color_attributes.new("Col", "BYTE_COLOR", "CORNER")
    for poly in mesh.polygons:
        t = min(max(poly.center.z / height, 0.0), 1.0)
        v = (low + (high - low) * t ** 0.8) * rng.uniform(0.92, 1.04)
        v += max(0.0, poly.normal.z) * 0.07
        if poly.material_index == 1:
            v += edge
        v = min(v, 1.0)
        # Shadowed, low parts lean blue-purple; lit tops stay neutral.
        k = 1 - t
        rgb = (v * (1 - 0.1 * k), v * (1 - 0.07 * k), v)
        lin = tuple(to_linear(c) for c in rgb) + (1.0,)
        for li in poly.loop_indices:
            attr.data[li].color = lin
        poly.material_index = 0
    mesh.materials.pop(index=1)
    return obj


def join(objs, name):
    with bpy.context.temp_override(active_object=objs[0], object=objs[0], selected_objects=objs, selected_editable_objects=objs):
        bpy.ops.object.join()
    obj = objs[0]
    obj.name = name
    obj.data.name = name
    return obj


def shard_points(rng, base, h, r, lean, spin):
    """A tapered prism: wide foot, a slightly narrower middle, a chiselled top."""
    pts = []
    sides = rng.randint(5, 6)
    for ring, (z, rr, jitter) in enumerate([(-0.03, 1.0, 0.12), (0.5, 0.88, 0.12), (0.82, 0.55, 0.15)]):
        for i in range(sides):
            a = (i + rng.uniform(-0.2, 0.2) + ring * 0.5) / sides * math.tau
            rad = r * rr * rng.uniform(1 - jitter, 1 + jitter)
            pts.append(Vector((math.cos(a) * rad, math.sin(a) * rad, z * h * rng.uniform(0.95, 1.05))))
    pts.append(Vector((r * rng.uniform(-0.25, 0.25), r * rng.uniform(-0.25, 0.25), h)))
    rot = Matrix.Rotation(spin, 4, "Z") @ Matrix.Rotation(lean, 4, "Y")
    return [base + (rot @ p) for p in pts]


def boulder_points(rng, base, rx, ry, rz, n=18):
    pts = []
    for _ in range(n):
        u = rng.uniform(-1, 1)
        a = rng.uniform(0, math.tau)
        s = math.sqrt(1 - u * u)
        p = Vector((math.cos(a) * s * rx, math.sin(a) * s * ry, (u * 0.5 + 0.5) * rz - 0.03))
        pts.append(base + p * rng.uniform(0.9, 1.05))
    return pts


def nugget_points(rng, size):
    """A chunky octahedron, slightly squashed, like the Stylized Ore insets."""
    pts = [
        Vector((size, 0, 0)),
        Vector((-size, 0, 0)),
        Vector((0, size * 0.85, 0)),
        Vector((0, -size * 0.85, 0)),
        Vector((0, 0, size * 0.9)),
        Vector((0, 0, -size * 0.45)),
    ]
    return [
        p * rng.uniform(0.85, 1.15)
        + Vector((rng.uniform(-0.08, 0.08), rng.uniform(-0.08, 0.08), rng.uniform(-0.04, 0.04))) * size
        for p in pts
    ]


def crystal_points(rng, length, r):
    """A short hexagonal gem: fat body, small tip. Not a long spike."""
    pts = []
    for z, rr in [(-0.28, 0.72), (0.18, 1.0), (0.62, 0.78)]:
        for i in range(6):
            a = (i + rng.uniform(-0.04, 0.04)) / 6 * math.tau
            pts.append(Vector((math.cos(a) * r * rr, math.sin(a) * r * rr, z * length)))
    pts.append(Vector((rng.uniform(-0.05, 0.05) * r, rng.uniform(-0.05, 0.05) * r, length)))
    return pts


def build_rock(name, parts, height, rng):
    pieces = []
    for i, pts in enumerate(parts):
        obj = hull(f"Rock_{name}_{i}", pts)
        pieces.append(bevel_and_paint(obj, 0.022, height, rng, 0.56, 0.97, 0.16))
    return join(pieces, f"Rock_{name}")


def add_ore(name, rock, kind, count, height, rng, size):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    bvh = BVHTree.FromObject(rock, depsgraph)
    placed = []
    chunks = []
    tries = 0
    while len(placed) < count and tries < 600:
        tries += 1
        az = rng.uniform(0, math.tau)
        z = rng.uniform(0.12, 0.92) * height
        origin = Vector((math.cos(az) * 2.5, math.sin(az) * 2.5, z + rng.uniform(0, 0.25)))
        aim = Vector((0, 0, z * 0.7))
        hit, normal, _, _ = bvh.ray_cast(origin, (aim - origin).normalized())
        if hit is None or normal.z < -0.05:
            continue
        if any((hit - p).length < size * 3.4 for p in placed):
            continue
        placed.append(hit)
        axis = (normal + Vector((0, 0, 0.35))).normalized()
        rot = axis.to_track_quat("Z", "Y").to_matrix().to_4x4() @ Matrix.Rotation(rng.uniform(0, math.tau), 4, "Z")
        s = size * rng.uniform(0.85, 1.45)
        if kind == "Crystal":
            length = s * 1.7
            local = crystal_points(rng, length, s * 0.72)
            sink = length * 0.28
        else:
            local = nugget_points(rng, s)
            sink = s * 0.38
        centre = hit - axis * sink
        obj = hull(f"Ore_{name}_{len(placed)}", [centre + (rot @ p) for p in local])
        chunks.append(bevel_and_paint(obj, 0.006, height, rng, 0.8, 0.94, 0.12, segments=1))
    return join(chunks, f"Ore_{name}")


def spire_parts(rng):
    parts = [shard_points(rng, Vector((0, 0, 0)), 0.86, 0.2, rng.uniform(-0.05, 0.05), rng.uniform(0, math.tau))]
    n = 4
    for i in range(n):
        a = (i + rng.uniform(-0.15, 0.15)) / n * math.tau
        d = rng.uniform(0.15, 0.21)
        base = Vector((math.cos(a) * d, math.sin(a) * d, 0))
        h = rng.uniform(0.42, 0.66)
        lean = math.radians(rng.uniform(8, 17))
        parts.append(shard_points(rng, base, h, rng.uniform(0.12, 0.16), lean, a))
    for i in range(2):
        a = rng.uniform(0, math.tau)
        base = Vector((math.cos(a) * 0.32, math.sin(a) * 0.32, 0))
        s = rng.uniform(0.08, 0.11)
        parts.append(boulder_points(rng, base, s, s * 0.9, s * 1.1, 12))
    return parts


def mound_parts(rng):
    parts = [boulder_points(rng, Vector((0, 0, 0)), 0.3, 0.26, 0.46)]
    n = 5
    for i in range(n):
        a = (i + rng.uniform(-0.2, 0.2)) / n * math.tau
        d = rng.uniform(0.24, 0.3)
        base = Vector((math.cos(a) * d, math.sin(a) * d, 0))
        s = rng.uniform(0.13, 0.19)
        parts.append(boulder_points(rng, base, s * 1.2, s, s * rng.uniform(1.1, 1.5)))
    parts.append(shard_points(rng, Vector((0.05, -0.04, 0.2)), 0.42, 0.11, math.radians(12), rng.uniform(0, math.tau)))
    return parts


def vein(shape, kind, seed):
    rng = random.Random(seed)
    name = f"Vein_{shape}_{kind}"
    parts = spire_parts(rng) if shape == "Spire" else mound_parts(rng)
    height = 0.86 if shape == "Spire" else 0.62
    rock = build_rock(name, parts, height, rng)
    ore = add_ore(name, rock, kind, 7 if shape == "Spire" else 6, height, rng, 0.07 if kind == "Crystal" else 0.08)
    root = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(root)
    rock.parent = root
    ore.parent = root
    rock.name, ore.name = "Rock", "Ore"
    return root


def boulder(i, seed):
    rng = random.Random(seed)
    parts = [boulder_points(rng, Vector((0, 0, 0)), 0.5, 0.42, rng.uniform(0.45, 0.6), 16)]
    if i % 2:
        a = rng.uniform(0, math.tau)
        parts.append(boulder_points(rng, Vector((math.cos(a) * 0.38, math.sin(a) * 0.38, 0)), 0.24, 0.2, 0.3, 12))
    rock = build_rock(f"Boulder_{i}", parts, 0.6, rng)
    root = bpy.data.objects.new(f"Boulder_{i}", None)
    bpy.context.scene.collection.objects.link(root)
    rock.parent = root
    rock.name = "Rock"
    return root


def export():
    kwargs = dict(filepath=OUT, export_format="GLB", export_apply=True, export_yup=True)
    try:
        bpy.ops.export_scene.gltf(**kwargs, export_vertex_color="ACTIVE")
    except TypeError:
        bpy.ops.export_scene.gltf(**kwargs, export_colors=True)


def main():
    reset()
    # Names must be unique in Blender, so each vein's Rock/Ore become Rock.001 and
    # so on; the exporter keeps those names and the game matches on the prefix.
    vein("Spire", "Nugget", 11)
    vein("Spire", "Crystal", 12)
    vein("Mound", "Nugget", 21)
    vein("Mound", "Crystal", 22)
    for i in range(4):
        boulder(i, 31 + i)
    for mat in bpy.data.materials:
        if mat.name == "Edge":
            bpy.data.materials.remove(mat)
    export()
    print("Wrote", OUT)


main()

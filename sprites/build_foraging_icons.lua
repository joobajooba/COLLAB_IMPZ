-- Draws the foraging inventory icons: a plant_<name>.png and a bundle_<name>.png per tier,
-- 48x48 pixel art in the style of the mining icons (dark outline, lit from the top left).
-- Run from the repo root:
--   aseprite -b --script-param out=sprites/items --script sprites/build_foraging_icons.lua
-- Add --script-param preview=<file.png> to also write a 4x contact sheet.

local OUT = app.params.out or "sprites/items"
local PREVIEW = app.params.preview
local N = 48
local PI = math.pi

---------------------------------------------------------------- colours

local function hex(h)
  h = h:gsub("#", "")
  return { tonumber(h:sub(1, 2), 16), tonumber(h:sub(3, 4), 16), tonumber(h:sub(5, 6), 16) }
end
local function ramp(t)
  local r = {}
  for i, h in ipairs(t) do r[i] = hex(h) end
  return r
end
local function mix(a, b, k)
  return { a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k }
end
local function lum(c) return c[1] * 0.3 + c[2] * 0.59 + c[3] * 0.11 end
local function clamp(v, a, b) if v < a then return a elseif v > b then return b end return v end

local INK = hex("#120a18")
local WHITE = hex("#ffffff")
local STAR, STAR2 = hex("#ffd84a"), hex("#fff6b0")
local GLOW = { hex("#4a2a8a"), hex("#7a48c8"), hex("#b088f4") }

local R = {
  leaf      = ramp { "#1f4a24", "#2f6e2e", "#46943a", "#6bbd4a", "#a5e06a" },
  stem      = ramp { "#24401a", "#3a6324", "#538a33", "#74ad46", "#9dcf66" },
  darkleaf  = ramp { "#132a1a", "#1f4226", "#305e36", "#457c46", "#64a05a" },
  marigold  = ramp { "#8a2e0c", "#c4500f", "#ec7a1a", "#ffa630", "#ffd36a" },
  marigoldIn= ramp { "#a83c0c", "#dc6414", "#f7922a", "#ffbc4a", "#ffe08a" },
  seedhead  = ramp { "#3a1a08", "#5a2c10", "#7e441c", "#a0622c", "#c48440" },
  bluebell  = ramp { "#1c2470", "#2c3ca8", "#4462d8", "#6e92f0", "#a8c4ff" },
  root      = ramp { "#33200f", "#55361c", "#78512c", "#9c7044", "#c09462" },
  bone      = ramp { "#6a5a48", "#9a8670", "#c4b298", "#e2d4bc", "#fff4e0" },
  sun       = ramp { "#8a4a06", "#c87a0a", "#f0a818", "#ffd040", "#fff28a" },
  sunIn     = ramp { "#c87a0a", "#f0a818", "#ffd040", "#fff28a", "#ffffff" },
  berry     = ramp { "#1a0e2a", "#2e1848", "#4a2a70", "#6e4498", "#a27ad0" },
  nsStem    = ramp { "#1c1a22", "#2e2a38", "#443c52", "#5c526c", "#786c88" },
  frost     = ramp { "#4e5a8a", "#7c88c0", "#aab4e6", "#d4dcff", "#ffffff" },
  ice       = ramp { "#2a6a8a", "#3c96b8", "#6cc4e0", "#a8ecff", "#ffffff" },
  frostStem = ramp { "#24484a", "#356a68", "#4e908a", "#74b8ae", "#a8e0d4" },
  cap       = ramp { "#4a0a0e", "#7a1218", "#ac1e22", "#d83a30", "#f2705a" },
  gills     = ramp { "#3a1a1a", "#5a2a26", "#7a3e34", "#9a5444", "#b86c56" },
  stalk     = ramp { "#7a6a58", "#a8947c", "#cdb89c", "#e8d8be", "#fff6e4" },
  void      = ramp { "#0c0814", "#1a1028", "#2a1a40", "#3e2860", "#5a3c88" },
  voidStem  = ramp { "#0e0a16", "#1c1428", "#2c2040", "#3e2e58", "#544074" },
  moss      = ramp { "#0a1030", "#14224e", "#1e3674", "#2c4e9a", "#4a72c4" },
  twine     = ramp { "#5a3a1a", "#7e5628", "#a4783c", "#c89c58", "#e8c27c" },
  dry       = ramp { "#4a3a1e", "#6e5830", "#94784a", "#b89c66", "#dcc48a" },
}

-- a dried look for bundle foliage: a little greyer and warmer
local function dried(r)
  local out = {}
  for i, c in ipairs(r) do
    local g = lum(c)
    out[i] = mix(mix(c, { g, g, g }, 0.15), { 150, 110, 60 }, 0.08)
  end
  return out
end

---------------------------------------------------------------- canvas

local LX, LY = -0.6, -0.8 -- light from the top left
local px = {}

local function key(x, y) return y * N + x end
local function inb(x, y) return x >= 0 and y >= 0 and x < N and y < N end
local function get(x, y) if inb(x, y) then return px[key(x, y)] end end
local function set(x, y, c)
  x, y = math.floor(x), math.floor(y)
  if inb(x, y) then px[key(x, y)] = c end
end
local function pick(r, t) return r[clamp(math.floor(t * #r) + 1, 1, #r)] end
local function gy(y) return (24 - y) / 48 * 0.16 end

-- writes a shape's pixels; where it meets something already drawn, its border gets a dark line
local function commit(m, r, o)
  local out = {}
  for k, c in pairs(m) do
    local x, y = k % N, k // N
    if o.edge ~= false then
      for _, d in ipairs { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } } do
        local nx, ny = x + d[1], y + d[2]
        if inb(nx, ny) and not m[key(nx, ny)] and px[key(nx, ny)] then
          c = o.edgeC or mix(r[1], INK, 0.45)
          break
        end
      end
    end
    out[k] = c
  end
  for k, c in pairs(out) do px[k] = c end
  return out
end

local function ellipse(cx, cy, rx, ry, r, o)
  o = o or {}
  local m = {}
  for y = math.floor(cy - ry - 1), math.ceil(cy + ry + 1) do
    for x = math.floor(cx - rx - 1), math.ceil(cx + rx + 1) do
      local nx, ny = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
      local d2 = nx * nx + ny * ny
      if inb(x, y) and d2 <= 1 and (not o.clip or o.clip(x, y)) then
        local t = 0.5 + 0.42 * (nx * LX + ny * LY) + gy(y) + (o.lift or 0)
        if d2 > 0.72 then t = t - 0.12 end
        m[key(x, y)] = pick(r, t)
      end
    end
  end
  return commit(m, r, o)
end

-- a leaf, petal or thorn from base (x0,y0) to tip (x1,y1), w = half width at its widest
local PROFILE = {
  leaf    = function(u) return math.sin(PI * u ^ 0.7) end,
  round   = function(u) return math.sin(PI * u ^ 1.4) ^ 0.6 end,
  crystal = function(u) return u < 0.35 and u / 0.35 or (1 - u) / 0.65 end,
  thorn   = function(u) return 1 - u end,
}
local function leaf(x0, y0, x1, y1, w, r, o)
  o = o or {}
  local dx, dy = x1 - x0, y1 - y0
  local len = math.sqrt(dx * dx + dy * dy)
  local ux, uy = dx / len, dy / len
  local nx, ny = -uy, ux
  local lit = (nx * LX + ny * LY) >= 0 and 1 or -1
  local prof = PROFILE[o.shape or "leaf"]
  local m = {}
  for y = math.floor(math.min(y0, y1) - w - 1), math.ceil(math.max(y0, y1) + w + 1) do
    for x = math.floor(math.min(x0, x1) - w - 1), math.ceil(math.max(x0, x1) + w + 1) do
      local qx, qy = x + 0.5 - x0, y + 0.5 - y0
      local u = (qx * ux + qy * uy) / len
      local v = qx * nx + qy * ny
      if inb(x, y) and u >= 0 and u <= 1 then
        local hw = w * prof(u)
        if o.saw then hw = hw * (0.78 + 0.22 * ((u * o.saw) % 1)) end
        if hw > 0.35 and math.abs(v) <= hw then
          local side = (v * lit >= 0) and 1 or -1
          local t = 0.52 + (o.contrast or 0.2) * side + gy(y) + (o.lift or 0)
          if math.abs(v) > hw - 1 then t = t - 0.14 end
          local c = pick(r, t)
          if o.vein ~= false and math.abs(v) < 0.55 and u > 0.08 and u < 0.85 then
            c = o.veinC or pick(r, side > 0 and 0.42 or 0.18)
          end
          m[key(x, y)] = c
        end
      end
    end
  end
  return commit(m, r, o)
end

-- a tapered stroke along a quadratic curve p0 -> p2 bent towards p1, radius r0 -> r1
local function bez(p0, p1, p2, t)
  local a, b, c = (1 - t) ^ 2, 2 * (1 - t) * t, t * t
  return a * p0[1] + b * p1[1] + c * p2[1], a * p0[2] + b * p1[2] + c * p2[2]
end
local function stroke(p0, p1, p2, r0, r1, r, o)
  o = o or {}
  local S, x0, y0, x1, y1 = {}, 99, 99, -99, -99
  for i = 0, 48 do
    local t = i / 48
    local x, y = bez(p0, p1, p2, t)
    local rr = r0 + (r1 - r0) * t
    S[#S + 1] = { x, y, rr }
    x0, y0 = math.min(x0, x - rr), math.min(y0, y - rr)
    x1, y1 = math.max(x1, x + rr), math.max(y1, y + rr)
  end
  local m = {}
  for y = math.floor(y0) - 1, math.ceil(y1) + 1 do
    for x = math.floor(x0) - 1, math.ceil(x1) + 1 do
      local best, bs = 1e9, nil
      for _, s in ipairs(S) do
        local d = math.sqrt((x + 0.5 - s[1]) ^ 2 + (y + 0.5 - s[2]) ^ 2) - s[3]
        if d < best then best, bs = d, s end
      end
      if inb(x, y) and best <= 0 then
        local ox, oy = (x + 0.5 - bs[1]) / bs[3], (y + 0.5 - bs[2]) / bs[3]
        local t = 0.5 + 0.42 * (ox * LX + oy * LY) + gy(y) + (o.lift or 0)
        if bs[3] > 1.6 and best > -0.9 then t = t - 0.12 end
        m[key(x, y)] = pick(r, t)
      end
    end
  end
  return commit(m, r, o)
end

-- point and outward normal on a stroke's edge, for thorns
local function edgeOf(p0, p1, p2, r0, r1, t, side)
  local x, y = bez(p0, p1, p2, t)
  local tx = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1])
  local ty = 2 * (1 - t) * (p1[2] - p0[2]) + 2 * t * (p2[2] - p1[2])
  local l = math.sqrt(tx * tx + ty * ty)
  local nx, ny = -ty / l * side, tx / l * side
  local rr = (r0 + (r1 - r0) * t) * 0.7
  return x + nx * rr, y + ny * rr, nx, ny, tx / l, ty / l
end

local function sparkle(x, y, s, c, core)
  for i = 1, s do
    set(x + i, y, c); set(x - i, y, c); set(x, y + i, c); set(x, y - i, c)
  end
  set(x, y, core or c)
end

local function spiral(cx, cy, rmax, turns, c, a0)
  for i = 0, 400 do
    local t = i / 400
    local a = t * turns * 2 * PI + (a0 or 0)
    set(cx + math.cos(a) * rmax * t, cy + math.sin(a) * rmax * t, c)
  end
end

-- small curl, like the wisps around the void ore
local function wisp(x, y, c)
  set(x, y, c); set(x + 1, y, c); set(x + 2, y + 1, c); set(x + 2, y + 2, c)
  set(x + 1, y + 3, c); set(x, y + 3, c); set(x - 1, y + 2, c); set(x, y + 1, c)
end

local seed = 1
local function rnd()
  seed = (seed * 1103515245 + 12345) % 2147483648
  return seed / 2147483648
end

local function outline()
  local add = {}
  for y = 0, N - 1 do
    for x = 0, N - 1 do
      if not px[key(x, y)] then
        local best
        for _, d in ipairs { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } } do
          local c = get(x + d[1], y + d[2])
          if c and (not best or lum(c) < lum(best)) then best = c end
        end
        if best then add[key(x, y)] = mix(best, INK, 0.78) end
      end
    end
  end
  for k, c in pairs(add) do px[k] = c end
end

---------------------------------------------------------------- plants

local function stemWithLeaves(r, leafR)
  stroke({ 24, 47 }, { 23, 40 }, { 24, 31 }, 1.5, 1.2, r)
  leaf(24, 42, 12, 35, 4, leafR or R.leaf)
  leaf(24, 40, 36, 33, 4, leafR or R.leaf)
end

local PLANTS = {}

PLANTS.nettle = function()
  stroke({ 23, 46 }, { 21, 26 }, { 25, 7 }, 1.6, 0.9, R.stem)
  local L = {
    { 22, 37, 7, 31, 5 }, { 23, 35, 39, 28, 5 },
    { 23, 26, 10, 19, 4.5 }, { 23, 24, 37, 16, 4.5 },
    { 24, 15, 15, 7, 3.6 }, { 24, 14, 33, 6, 3.6 },
    { 25, 11, 25, 2, 3 },
  }
  for _, l in ipairs(L) do leaf(l[1], l[2], l[3], l[4], l[5], R.leaf, { saw = 7 }) end
end

PLANTS.marigold = function()
  stemWithLeaves(R.stem)
  local cx, cy = 24, 18
  for i = 0, 11 do
    local a = i / 12 * 2 * PI + 0.13
    leaf(cx, cy, cx + math.cos(a) * 15, cy + math.sin(a) * 14, 3.8, R.marigold, { shape = "round", vein = false })
  end
  for i = 0, 7 do
    local a = i / 8 * 2 * PI + 0.4
    leaf(cx, cy, cx + math.cos(a) * 10, cy + math.sin(a) * 9.5, 3.6, R.marigoldIn, { shape = "round", vein = false })
  end
  ellipse(cx, cy, 4.2, 4.2, R.seedhead)
  set(cx - 2, cy - 2, R.seedhead[5]); set(cx - 1, cy - 2, R.seedhead[4])
end

PLANTS.bluebell = function()
  leaf(15, 46, 6, 24, 2.6, R.leaf)
  leaf(16, 46, 26, 27, 2.4, R.leaf)
  local p0, p1, p2 = { 15, 46 }, { 13, 6 }, { 38, 10 }
  stroke(p0, p1, p2, 1.3, 0.8, R.stem)
  for i, t in ipairs { 0.52, 0.74, 0.95 } do
    local x, y = bez(p0, p1, p2, t)
    local drop = ({ 3, 5, 3 })[i]
    stroke({ x, y }, { x + 1, y + drop / 2 }, { x + 1, y + drop }, 0.7, 0.7, R.stem)
    local bx, by = x + 1, y + drop
    ellipse(bx, by + 5, 3.8, 5, R.bluebell)
    ellipse(bx, by + 9.4, 5, 1.7, R.bluebell, { lift = 0.1 })
    for dx = -2, 2 do set(bx + dx, by + 10, R.bluebell[1]) end
    set(bx - 5, by + 10, R.bluebell[3]); set(bx + 4, by + 10, R.bluebell[3]); set(bx - 1, by + 11, R.bluebell[3])
    set(bx - 2, by + 2, R.bluebell[5])
  end
end

PLANTS.thornroot = function()
  leaf(24, 9, 17, 3, 3, R.leaf)
  leaf(24, 9, 31, 2, 3, R.leaf)
  local roots = {
    { { 24, 8 }, { 21, 20 }, { 24, 30 }, 3.0, 4.6 },
    { { 23, 29 }, { 14, 34 }, { 9, 44 }, 3.6, 1.0 },
    { { 25, 30 }, { 27, 38 }, { 25, 46 }, 3.4, 0.9 },
    { { 25, 29 }, { 34, 30 }, { 40, 39 }, 3.0, 0.9 },
  }
  for _, s in ipairs(roots) do stroke(s[1], s[2], s[3], s[4], s[5], R.root) end
  -- root hairs at the tips
  stroke({ 9, 44 }, { 7, 45 }, { 5, 46 }, 0.5, 0.5, R.root)
  stroke({ 40, 39 }, { 42, 40 }, { 43, 42 }, 0.5, 0.5, R.root)
  -- knots
  set(22, 17, R.root[1]); set(23, 17, R.root[1]); set(23, 18, R.root[2])
  set(25, 24, R.root[1]); set(25, 25, R.root[2])
  -- thorns on the edges of the roots
  local T = { { 1, 0.3, 1 }, { 1, 0.62, -1 }, { 1, 0.85, 1 }, { 2, 0.35, -1 }, { 2, 0.6, 1 },
              { 3, 0.5, -1 }, { 4, 0.35, -1 }, { 4, 0.7, 1 } }
  for _, t in ipairs(T) do
    local s = roots[t[1]]
    local x, y, nx, ny, tx, ty = edgeOf(s[1], s[2], s[3], s[4], s[5], t[2], t[3])
    leaf(x, y, x + nx * 5 + tx * 1.5, y + ny * 5 + ty * 1.5, 1.8, R.bone, { shape = "thorn", vein = false })
  end
end

PLANTS.sunpetal = function()
  stemWithLeaves(R.stem)
  local cx, cy = 24, 19
  for i = 0, 7 do
    local a = i / 8 * 2 * PI - PI / 2
    leaf(cx, cy, cx + math.cos(a) * 15, cy + math.sin(a) * 15, 4.4, R.sun, { vein = false })
  end
  for i = 0, 7 do
    local a = (i + 0.5) / 8 * 2 * PI - PI / 2
    leaf(cx, cy, cx + math.cos(a) * 9.5, cy + math.sin(a) * 9.5, 3.6, R.sunIn, { vein = false })
  end
  ellipse(cx, cy, 4, 4, R.sunIn, { lift = 0.15 })
  set(cx - 1, cy - 1, WHITE); set(cx - 2, cy - 1, WHITE); set(cx - 1, cy - 2, WHITE)
  sparkle(6, 6, 2, R.sun[5], WHITE)
  sparkle(42, 9, 2, R.sun[5], WHITE)
  sparkle(42, 33, 1, R.sun[5], WHITE)
  sparkle(6, 31, 1, R.sun[5], WHITE)
end

PLANTS.nightshade = function()
  stroke({ 12, 46 }, { 11, 20 }, { 30, 9 }, 1.4, 0.9, R.nsStem)
  leaf(12, 38, 2, 30, 4, R.darkleaf)
  leaf(12, 29, 3, 19, 3.6, R.darkleaf)
  leaf(22, 12, 40, 15, 3.8, R.darkleaf)
  stroke({ 19, 14 }, { 26, 17 }, { 27, 24 }, 0.8, 0.7, R.nsStem)
  local B = { { 24, 27, 4 }, { 31, 27, 4 }, { 21, 34, 3.6 }, { 33, 34, 3.6 }, { 27, 33, 4.2 }, { 27, 40, 3.4 } }
  for _, b in ipairs(B) do
    ellipse(b[1], b[2], b[3], b[3], R.berry)
    set(b[1] - 2, b[2] - 2, R.berry[5]); set(b[1] - 1, b[2] - 2, mix(R.berry[5], WHITE, 0.4))
  end
  for _, d in ipairs { { 26, 23 }, { 27, 23 }, { 28, 23 }, { 25, 24 }, { 29, 24 } } do set(d[1], d[2], R.darkleaf[3]) end
  -- flower: purple star with a yellow cone
  local fx, fy = 33, 7
  for i = 0, 4 do
    local a = i / 5 * 2 * PI - PI / 2
    leaf(fx, fy, fx + math.cos(a) * 5.5, fy + math.sin(a) * 5.5, 2.2, R.berry, { vein = false, lift = 0.15 })
  end
  ellipse(fx, fy, 1.7, 1.7, R.sun, { lift = 0.1 })
end

PLANTS.frostbloom = function()
  stemWithLeaves(R.frostStem, R.frostStem)
  set(12, 35, WHITE); set(13, 35, R.frost[4]); set(36, 33, WHITE); set(35, 33, R.frost[4])
  local cx, cy = 24, 19
  for i = 0, 5 do
    local a = i / 6 * 2 * PI - PI / 2
    leaf(cx, cy, cx + math.cos(a) * 16, cy + math.sin(a) * 15, 5.2, R.frost, { shape = "crystal", contrast = 0.26 })
  end
  for i = 0, 5 do
    local a = (i + 0.5) / 6 * 2 * PI - PI / 2
    leaf(cx, cy, cx + math.cos(a) * 10, cy + math.sin(a) * 10, 3.8, R.frost, { shape = "crystal", contrast = 0.26, lift = 0.08 })
  end
  ellipse(cx, cy, 3.4, 3.4, R.ice)
  set(cx - 1, cy - 1, WHITE)
  sparkle(6, 8, 1, R.frost[4], WHITE)
  sparkle(42, 6, 2, R.frost[4], WHITE)
  sparkle(42, 32, 1, R.frost[4], WHITE)
  set(5, 28, WHITE); set(40, 41, WHITE)
end

PLANTS.bloodcap = function()
  ellipse(24, 43, 6, 3, R.stalk)
  stroke({ 24, 43 }, { 23, 35 }, { 24, 27 }, 4.6, 3.4, R.stalk)
  ellipse(24, 27, 17, 3.4, R.gills)
  ellipse(24, 26, 19, 16, R.cap, { clip = function(x, y) return y <= 26 end })
  local onCap = function(x, y) return get(x, y) ~= nil and y < 26 end
  for _, s in ipairs { { 17, 15, 2.8, 2.1 }, { 28, 11, 3.2, 2.3 }, { 34, 19, 2.3, 1.8 }, { 11, 22, 1.9, 1.5 },
                       { 23, 20, 1.9, 1.6 }, { 38, 24, 1.5, 1.2 }, { 20, 9, 1.4, 1.1 } } do
    ellipse(s[1], s[2], s[3], s[4], R.stalk, { clip = onCap, lift = 0.1 })
  end
  -- a small one in front
  stroke({ 38, 46 }, { 38, 43 }, { 38, 40 }, 1.7, 1.3, R.stalk)
  ellipse(38, 40, 5, 1.2, R.gills)
  ellipse(38, 40, 5.6, 4.6, R.cap, { clip = function(x, y) return y <= 40 end })
  set(36, 37, R.stalk[4]); set(37, 37, R.stalk[4]); set(40, 38, R.stalk[3])
end

PLANTS.voidlily = function()
  stemWithLeaves(R.voidStem, R.void)
  local cx, cy = 24, 20
  for i = 0, 2 do
    local a = -PI / 2 + PI / 3 + i * 2 * PI / 3
    leaf(cx, cy, cx + math.cos(a) * 14, cy + math.sin(a) * 13, 5.6, R.void, { veinC = GLOW[1] })
  end
  for i = 0, 2 do
    local a = -PI / 2 + i * 2 * PI / 3
    leaf(cx, cy, cx + math.cos(a) * 16, cy + math.sin(a) * 15, 5.6, R.void, { veinC = GLOW[1], lift = 0.1 })
  end
  ellipse(cx, cy, 6, 6, R.void, { lift = -0.1 })
  spiral(cx, cy, 5.5, 2.2, GLOW[2])
  set(cx, cy, GLOW[3])
  for _, s in ipairs { { -6, -9 }, { 0, -11 }, { 6, -9 } } do
    stroke({ cx, cy - 3 }, { cx + s[1] / 2, cy + s[2] / 2 - 2 }, { cx + s[1], cy + s[2] }, 0.5, 0.5, R.void, { lift = 0.3, edge = false })
    set(cx + s[1], cy + s[2], GLOW[3])
  end
  wisp(5, 5, GLOW[2]); wisp(41, 6, GLOW[2]); wisp(41, 40, GLOW[1])
end

PLANTS.starmoss = function()
  seed = 7
  local keys = {}
  local function bump(x, y, rx, ry, first)
    for k in pairs(ellipse(x, y, rx, ry, R.moss, { edge = not first, edgeC = R.moss[2] })) do keys[k] = true end
  end
  bump(24, 37, 20, 8, true)
  bump(12, 31, 8, 7); bump(36, 30, 8, 7); bump(24, 27, 10, 8)
  bump(18, 22, 6, 5); bump(30, 22, 6, 5)
  -- fuzzy moss texture
  for k in pairs(keys) do
    local c = px[k]
    for i, rc in ipairs(R.moss) do
      if c == rc then
        local v = rnd()
        if v < 0.2 then px[k] = R.moss[math.min(i + 1, 5)] elseif v < 0.3 then px[k] = R.moss[math.max(i - 1, 1)] end
        break
      end
    end
  end
  -- glowing sprouts
  for _, s in ipairs { { 17, 18, 15, 12 }, { 30, 18, 32, 11 }, { 24, 20, 24, 14 } } do
    stroke({ s[1], s[2] }, { (s[1] + s[3]) / 2, s[2] - 3 }, { s[3], s[4] }, 0.5, 0.5, R.moss, { lift = 0.25, edge = false })
    set(s[3], s[4], STAR2)
  end
  sparkle(15, 31, 2, STAR, STAR2)
  sparkle(31, 25, 2, STAR, STAR2)
  sparkle(27, 38, 1, STAR, STAR2)
  for _, d in ipairs { { 9, 36 }, { 21, 26 }, { 37, 34 }, { 33, 40 }, { 19, 41 }, { 41, 31 }, { 23, 32 }, { 12, 29 } } do
    set(d[1], d[2], STAR)
  end
end

---------------------------------------------------------------- bundles

-- one bundle shape for every tier: dried stems tied with twine, foliage in the tier's colour
-- accent(spots, top) gets a point on each foliage leaf and the top of the fan
local function bundle(fol, accent)
  local A, B = { 10, 42 }, { 26, 21 }
  local ax, ay = B[1] - A[1], B[2] - A[2]
  local al = math.sqrt(ax * ax + ay * ay)
  local ux, uy = ax / al, ay / al
  local nx, ny = -uy, ux
  local axis = math.atan(uy, ux)
  -- stems, fanning out from the cut ends
  for i = -3, 3 do
    local bx, by = A[1] + nx * i * 1.5, A[2] + ny * i * 1.5
    local tx, ty = B[1] + nx * i * 2.6, B[2] + ny * i * 2.6
    stroke({ bx, by }, { (bx + tx) / 2, (by + ty) / 2 }, { tx, ty }, 1.1, 0.9, R.dry)
  end
  for i = -3, 3 do set(A[1] + nx * i * 1.5 - ux, A[2] + ny * i * 1.5 - uy, R.dry[5]) end
  -- foliage: a wide fan of leaves, outer ones first, then a short inner layer on top
  local f = dried(fol)
  local spots = {}
  local function frond(i, len, w, lift)
    local sx, sy = B[1] + nx * i * 2.6 - ux * 3, B[2] + ny * i * 2.6 - uy * 3
    local a = axis + i * 0.28
    local ex, ey = sx + math.cos(a) * len, sy + math.sin(a) * len
    leaf(sx, sy, ex, ey, w, f, { shape = "round", lift = lift })
    spots[#spots + 1] = { math.floor(sx + (ex - sx) * 0.7), math.floor(sy + (ey - sy) * 0.7) }
  end
  for _, i in ipairs { -3, 3, -2, 2, -1, 1, 0 } do frond(i, 12, 3.4, 0) end
  for _, i in ipairs { -1.5, 1.5, -0.5, 0.5 } do frond(i, 8, 3, 0.08) end
  -- twine band with a knot and two loose ends
  local cx, cy = A[1] + ax * 0.4, A[2] + ay * 0.4
  local band = stroke({ cx - nx * 6.5, cy - ny * 6.5 }, { cx, cy }, { cx + nx * 6.5, cy + ny * 6.5 }, 2.4, 2.4, R.twine)
  for k, c in pairs(band) do
    local x, y = k % N, k // N
    if (x - y) % 3 == 0 and (c == R.twine[3] or c == R.twine[4] or c == R.twine[5]) then px[k] = R.twine[2] end
  end
  local kx, ky = cx + nx * 6, cy + ny * 6
  stroke({ kx, ky + 1 }, { kx - 1, ky + 4 }, { kx - 3, ky + 7 }, 0.6, 0.6, R.twine)
  stroke({ kx + 1, ky + 1 }, { kx + 3, ky + 3 }, { kx + 4, ky + 6 }, 0.6, 0.6, R.twine)
  ellipse(kx, ky, 2.2, 2.2, R.twine, { lift = 0.1 })
  if accent then accent(spots, { math.floor(B[1] + ux * 9), math.floor(B[2] + uy * 9) }) end
end

local function onFoliage(spots, fn)
  for _, s in ipairs(spots) do fn(s[1], s[2]) end
end

local BUNDLES = {
  nettle = function() bundle(R.leaf) end,
  marigold = function() bundle(R.marigold) end,
  bluebell = function() bundle(R.bluebell) end,
  thornroot = function() bundle(R.root) end,
  sunpetal = function()
    bundle(R.sun, function(spots)
      onFoliage(spots, function(x, y) set(x, y, WHITE) end)
      sparkle(42, 5, 2, R.sun[5], WHITE)
      sparkle(6, 22, 1, R.sun[5], WHITE)
    end)
  end,
  nightshade = function()
    bundle(R.berry, function(spots, top)
      for _, p in ipairs { { top[1] - 2, top[2] + 2 }, { top[1] + 2, top[2] + 3 }, { top[1], top[2] + 5 } } do
        ellipse(p[1], p[2], 1.8, 1.8, R.berry, { lift = 0.15 })
        set(p[1] - 1, p[2] - 1, R.berry[5])
      end
    end)
  end,
  frostbloom = function()
    bundle(R.frost, function(spots)
      onFoliage(spots, function(x, y) set(x, y, WHITE) end)
      sparkle(42, 5, 2, R.frost[4], WHITE)
    end)
  end,
  bloodcap = function()
    bundle(R.cap, function(spots)
      onFoliage(spots, function(x, y) set(x, y, R.stalk[4]); set(x + 1, y, R.stalk[3]) end)
    end)
  end,
  voidlily = function()
    bundle(R.void, function(spots, top)
      spiral(top[1], top[2] + 2, 3.5, 1.6, GLOW[2])
      wisp(41, 4, GLOW[2]); wisp(6, 20, GLOW[1])
    end)
  end,
  starmoss = function()
    bundle(R.moss, function(spots, top)
      onFoliage(spots, function(x, y) set(x, y, STAR) end)
      sparkle(top[1], top[2] + 2, 1, STAR, STAR2)
    end)
  end,
}

---------------------------------------------------------------- output

local ORDER = { "nettle", "marigold", "bluebell", "thornroot", "sunpetal",
                "nightshade", "frostbloom", "bloodcap", "voidlily", "starmoss" }

local function toImage()
  local img = Image(N, N, ColorMode.RGB)
  for k, c in pairs(px) do
    img:drawPixel(k % N, k // N, app.pixelColor.rgba(
      clamp(math.floor(c[1] + 0.5), 0, 255), clamp(math.floor(c[2] + 0.5), 0, 255),
      clamp(math.floor(c[3] + 0.5), 0, 255), 255))
  end
  return img
end

local function render(fn, name)
  px = {}
  fn()
  outline()
  local img = toImage()
  img:saveAs(OUT .. "/" .. name .. ".png")
  return img
end

local made = {}
for _, id in ipairs(ORDER) do
  made[#made + 1] = { render(PLANTS[id], "plant_" .. id), render(BUNDLES[id], "bundle_" .. id) }
end

if PREVIEW then
  local S, PAD = 4, 8
  local cell = N * S + PAD
  local sheet = Image(2 * cell + PAD, #made * cell + PAD, ColorMode.RGB)
  local bg = app.pixelColor.rgba(181, 181, 181, 255)
  for y = 0, sheet.height - 1 do for x = 0, sheet.width - 1 do sheet:drawPixel(x, y, bg) end end
  for row, pair in ipairs(made) do
    for col, img in ipairs(pair) do
      local ox, oy = PAD + (col - 1) * cell, PAD + (row - 1) * cell
      for y = 0, N - 1 do
        for x = 0, N - 1 do
          local p = img:getPixel(x, y)
          if app.pixelColor.rgbaA(p) > 0 then
            for dy = 0, S - 1 do for dx = 0, S - 1 do sheet:drawPixel(ox + x * S + dx, oy + y * S + dy, p) end end
          end
        end
      end
    end
  end
  sheet:saveAs(PREVIEW)
end

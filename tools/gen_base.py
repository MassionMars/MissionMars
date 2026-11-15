#!/usr/bin/env python3
"""Generates the isometric Mars base scene (hub.html #mars-base-svg).
Projection: x runs right-down, y left-down, z up. Light comes from the upper right."""
import math, random, re, sys, json
random.seed(7)
S = 32.0
SX = S * math.cos(math.radians(30)); SY = S * .5
OX, OY = 800.0, 440.0
INK = "#2a1912"

def P(x, y, z=0.0): return (OX + (x - y) * SX, OY + (x + y) * SY - z * S)
def pts(l): return " ".join("%.1f,%.1f" % p for p in l)
def f(v): return ("%.2f" % v).rstrip("0").rstrip(".")

out = []
shout = []
defs = []
def add(s): out.append(s)

def poly(l, fill, stroke=INK, sw=2.2, extra=""):
    return '<polygon points="%s" fill="%s" stroke="%s" stroke-width="%s" stroke-linejoin="round" %s/>' % (pts(l), fill, stroke, sw, extra)

# face-local coordinate systems -------------------------------------------------
def LFm(Y, zref):  # left face, plane y=Y ; local (u = x, v = zref - z)
    return "matrix(%.4f %.4f 0 %.4f %.2f %.2f)" % (SX, SY, S, OX - Y * SX, OY + Y * SY - zref * S)
def RFm(Xp, y1, zref):  # right face, plane x=Xp ; local (u = y1 - y, v = zref - z)
    return "matrix(%.4f %.4f 0 %.4f %.2f %.2f)" % (SX, -SY, S, OX + (Xp - y1) * SX, OY + (Xp + y1) * SY - zref * S)
def TFm(zt):  # top face z=zt ; local (u = x, v = y)  -> x axis right-down, y axis left-down
    return "matrix(%.4f %.4f %.4f %.4f %.2f %.2f)" % (SX, SY, -SX, SY, OX, OY - zt * S)

def circle_support(cx, cy, r, mtx, t):
    """screen points of a circle (in local coords) that bound its sweep along screen vector t"""
    a, b, c, d, e, f_ = mtx
    nx, ny = -t[1], t[0]
    best = None; lo = None; hi = None
    for i in range(720):
        th = i * math.pi / 360
        lx, ly = cx + r * math.cos(th), cy + r * math.sin(th)
        X, Y = a * lx + c * ly + e, b * lx + d * ly + f_
        dv = X * nx + Y * ny
        if hi is None or dv > hi[0]: hi = (dv, (X, Y))
        if lo is None or dv < lo[0]: lo = (dv, (X, Y))
    return lo[1], hi[1]

# ------------------------------------------------------------------ defs ---
def D(s): defs.append(s)

D('''
<linearGradient id="skyG" gradientUnits="userSpaceOnUse" x1="0" y1="-60" x2="0" y2="430"><stop offset="0" stop-color="#160c2b"/><stop offset=".22" stop-color="#2f1840"/><stop offset=".48" stop-color="#6b2f55"/><stop offset=".74" stop-color="#b4503f"/><stop offset=".9" stop-color="#e3874f"/><stop offset="1" stop-color="#f0a765"/></linearGradient>
<linearGradient id="gndG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0804f"/><stop offset=".35" stop-color="#cc6a40"/><stop offset="1" stop-color="#9c3f22"/></linearGradient>
<radialGradient id="sunG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffef5"/><stop offset=".35" stop-color="#ffe9c4" stop-opacity=".9"/><stop offset=".75" stop-color="#ffb784" stop-opacity=".3"/><stop offset="1" stop-color="#ff9a68" stop-opacity="0"/></radialGradient>
<radialGradient id="hazeG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcfa0" stop-opacity=".5"/><stop offset="1" stop-color="#ffcfa0" stop-opacity="0"/></radialGradient>
<linearGradient id="mtnFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d4a6a"/><stop offset="1" stop-color="#c46a52"/></linearGradient>
<linearGradient id="mtnNear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8583f"/><stop offset="1" stop-color="#d1774c"/></linearGradient>
<filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".9 .75" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.3 -.42"/></filter>
<filter id="rough" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".012 .05" numOctaves="4" seed="11" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .35  0 0 0 0 .13  0 0 0 0 .07  .0 .0 .0 1.6 -.55"/></filter>
<filter id="rough2" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".07" numOctaves="3" seed="3" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 .75  0 0 0 0 .55  0 0 0 1.4 -.62"/></filter>
<filter id="blurS" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
<filter id="blurM" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
<linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d6f4ff" stop-opacity=".62"/><stop offset=".5" stop-color="#8fd0ea" stop-opacity=".3"/><stop offset="1" stop-color="#e6fbff" stop-opacity=".5"/></linearGradient>
<linearGradient id="winG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe9ff"/><stop offset=".55" stop-color="#5aa6d2"/><stop offset="1" stop-color="#2b5f8c"/></linearGradient>
<linearGradient id="winGg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4fbe0"/><stop offset=".55" stop-color="#6fcf9a"/><stop offset="1" stop-color="#2f8a6a"/></linearGradient>
<linearGradient id="aoV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a0f06" stop-opacity=".38"/></linearGradient>
<linearGradient id="solG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b86b0"/><stop offset=".5" stop-color="#34577f"/><stop offset="1" stop-color="#1f3858"/></linearGradient>
<linearGradient id="cylG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff7e8"/><stop offset=".35" stop-color="#ece0cd"/><stop offset=".72" stop-color="#bfae99"/><stop offset="1" stop-color="#8d7b69"/></linearGradient>
<linearGradient id="metalG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7edf2"/><stop offset="1" stop-color="#9aa6b2"/></linearGradient>
<linearGradient id="craterIn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6e2c18"/><stop offset=".55" stop-color="#a14a2a"/><stop offset="1" stop-color="#d27a4e"/></linearGradient>
<radialGradient id="craterGlow" cx=".6" cy=".62" r=".6"><stop offset="0" stop-color="#e59a68" stop-opacity=".85"/><stop offset="1" stop-color="#e59a68" stop-opacity="0"/></radialGradient>
<linearGradient id="rockL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ec9a70"/><stop offset="1" stop-color="#b8583a"/></linearGradient>
<linearGradient id="rockD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a64d30"/><stop offset="1" stop-color="#5e2414"/></linearGradient>
<pattern id="pReg" width="1" height=".16" patternUnits="userSpaceOnUse"><rect width="1" height=".16" fill="#c9805c"/><rect width="1" height=".05" fill="#e19a76" opacity=".7"/><rect y=".12" width="1" height=".04" fill="#7a3a22" opacity=".55"/></pattern>
<pattern id="pPanel" width="2" height="1" patternUnits="userSpaceOnUse"><rect width="2" height="1" fill="#f1e8dc"/><rect width="2" height=".035" fill="#bdae9c"/><rect width=".035" height="1" fill="#bdae9c"/><circle cx=".12" cy=".12" r=".028" fill="#9a8c7c"/><circle cx="1.88" cy=".12" r=".028" fill="#9a8c7c"/><circle cx=".12" cy=".88" r=".028" fill="#9a8c7c"/><circle cx="1.88" cy=".88" r=".028" fill="#9a8c7c"/><rect x="1" width=".02" height="1" fill="#cdbfae"/></pattern>
<pattern id="pSteel" width=".22" height="1" patternUnits="userSpaceOnUse"><rect width=".22" height="1" fill="#6c7886"/><rect width=".04" height="1" fill="#8d99a7"/><rect x=".11" width=".02" height="1" fill="#566170"/></pattern>
<pattern id="pCorr" width=".26" height="1" patternUnits="userSpaceOnUse"><rect width=".26" height="1" fill="#e6d8c2"/><rect width=".07" height="1" fill="#fff6e6"/><rect x=".17" width=".09" height="1" fill="#b3a28a"/></pattern>
<pattern id="pHaz" width=".7" height=".7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width=".7" height=".7" fill="#f5b21b"/><rect width=".35" height=".7" fill="#2a1912"/></pattern>
<pattern id="pPlate" width="1.2" height=".6" patternUnits="userSpaceOnUse"><rect width="1.2" height=".6" fill="#8b98a6"/><rect width="1.2" height=".03" fill="#5e6a78"/><rect width=".03" height=".6" fill="#5e6a78"/><circle cx=".08" cy=".08" r=".02" fill="#d6dde4"/><circle cx="1.12" cy=".52" r=".02" fill="#d6dde4"/></pattern>
<pattern id="pTile" width=".5" height=".5" patternUnits="userSpaceOnUse"><rect width=".5" height=".5" fill="#cfc2b0"/><rect width=".5" height=".02" fill="#9a8a76"/><rect width=".02" height=".5" fill="#9a8a76"/></pattern>
<pattern id="pSolar" width=".5" height=".5" patternUnits="userSpaceOnUse"><rect width=".5" height=".5" fill="url(#solG)"/><rect width=".5" height=".03" fill="#b8d2ea" opacity=".7"/><rect width=".03" height=".5" fill="#b8d2ea" opacity=".7"/></pattern>
''')

# ------------------------------------------------------------------ helpers
def shadow(x0, x1, y0, y1, h, dx=0.0, dy=1.0, op=.34):
    k = h * 0.55
    a = [P(x0, y0), P(x1, y0), P(x1, y1), P(x0, y1)]
    b = [P(x0 + dx * k, y0 + dy * k), P(x1 + dx * k, y0 + dy * k), P(x1 + dx * k, y1 + dy * k), P(x0 + dx * k, y1 + dy * k)]
    allp = a + b
    # convex hull
    allp = sorted(set(allp))
    def cross(o, a_, b_): return (a_[0] - o[0]) * (b_[1] - o[1]) - (a_[1] - o[1]) * (b_[0] - o[0])
    lower = []
    for p in allp:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0: lower.pop()
        lower.append(p)
    upper = []
    for p in reversed(allp):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0: upper.pop()
        upper.append(p)
    hull = lower[:-1] + upper[:-1]
    shout.append('<polygon points="%s" fill="#2a0e06" opacity="%s" filter="url(#blurS)"/>' % (pts(hull), op))

def face_left(x0, x1, y1, z0, z1, base, inner, name=""):
    """left face (plane y=y1): base polygon, then local group with `inner` drawn in (u=x, v=z1-z)"""
    pl = [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)]
    add(poly(pl, base, sw=2.4))
    w, h = x1 - x0, z1 - z0
    add('<g transform="%s"><g transform="translate(%s 0)">%s<rect width="%s" height="%s" fill="url(#aoV)"/></g></g>' % (LFm(y1, z1), f(-x0), inner(x0, w, h), f(x1 + 0), f(h)) if False else
        '<g transform="%s" vector-effect="non-scaling-stroke">%s<rect x="%s" width="%s" height="%s" fill="url(#aoV)"/></g>' % (LFm(y1, z1), inner(x0, w, h), f(x0), f(w), f(h)))
    add(poly(pl, "none", sw=2.4))

def face_right(x1, y0, y1, z0, z1, base, inner):
    pl = [P(x1, y1, z0), P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1)]
    add(poly(pl, base, sw=2.4))
    w, h = y1 - y0, z1 - z0
    add('<g transform="%s">%s<rect width="%s" height="%s" fill="url(#aoV)"/><rect width="%s" height="%s" fill="#2a0e06" opacity=".16"/></g>' % (RFm(x1, y1, z1), inner(0, w, h), f(w), f(h), f(w), f(h)))
    add(poly(pl, "none", sw=2.4))

def top_face(x0, x1, y0, y1, z, fill, inner=None):
    pl = [P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)]
    add(poly(pl, fill, sw=2.4))
    if inner:
        add('<g transform="%s">%s</g>' % (TFm(z), inner(x0, x1, y0, y1)))
        add(poly(pl, "none", sw=2.4))

def rect(x, y, w, h, fill, stroke="none", sw=0, extra=""):
    return '<rect x="%s" y="%s" width="%s" height="%s" fill="%s" stroke="%s" stroke-width="%s" %s/>' % (f(x), f(y), f(w), f(h), fill, stroke, sw, extra)

NS = 'vector-effect="non-scaling-stroke"'
def wrect(x, y, w, h, fill="url(#winG)", sw=2, r=0.04):
    """a framed window in face-local units"""
    return ('<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="#2a1912"/>' % (f(x - .06), f(y - .06), f(w + .12), f(h + .12), r) +
            '<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="%s"/>' % (f(x), f(y), f(w), f(h), r, fill) +
            '<path d="M%s %s L%s %s L%s %s Z" fill="#fff" opacity=".28"/>' % (f(x), f(y + h * .75), f(x), f(y), f(x + w * .55), f(y)) +
            '<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="none" stroke="#f4efe6" stroke-width="2.2" %s/>' % (f(x), f(y), f(w), f(h), r, NS))

# --------------------------------------------------------------- the scene
W0, W1 = -2400, 4000
add('<rect id="sky-rect" x="%d" y="-1400" width="%d" height="1850" fill="url(#skyG)"/>' % (W0, W1 - W0))
add('<rect id="sky-dusk-overlay" x="0" y="0" width="1600" height="430" fill="#000" opacity="0" pointer-events="none"/>')

# stars: twinkling, a few big ones
stars = []
for i in range(120):
    x = random.uniform(-500, 2100); y = random.uniform(-300, 300)
    r = random.choice([.9, 1.1, 1.3, 1.6, 2.2]); d = random.uniform(0, 6); du = random.uniform(2.5, 6)
    stars.append('<circle cx="%.0f" cy="%.0f" r="%s" fill="#fff6e8" class="tw" style="animation-delay:-%.1fs;animation-duration:%.1fs"/>' % (x, y, r, d, du))
add('<g id="sky-stars" opacity=".9">%s</g>' % "".join(stars))
# drifting haze + moon + shooting stars
add('<g id="sky-haze" class="drift" opacity=".5"><ellipse cx="220" cy="250" rx="360" ry="34" fill="url(#hazeG)"/><ellipse cx="980" cy="205" rx="430" ry="28" fill="url(#hazeG)"/><ellipse cx="1500" cy="290" rx="300" ry="30" fill="url(#hazeG)"/></g>')
add('<g class="moon"><circle cx="0" cy="0" r="12" fill="#cdb7aa"/><circle cx="-4" cy="-3" r="4" fill="#a89080"/><circle cx="5" cy="4" r="3" fill="#b9a091"/><circle cx="0" cy="0" r="12" fill="none" stroke="#2a1912" stroke-width="1.6" opacity=".45"/></g>')
add('<g class="shoot s1"><path d="M0 0 L-70 -26" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/><circle r="3" fill="#fff"/></g><g class="shoot s2"><path d="M0 0 L-60 -22" stroke="#ffe3c2" stroke-width="2" stroke-linecap="round" opacity=".8"/><circle r="2.6" fill="#ffe3c2"/></g>')
add('<g id="main-sun-group" transform="translate(1255, 96)"><g class="sun-glow"><circle r="86" fill="url(#sunG)"/><circle r="17" fill="#fffdf2"/></g></g>')

# mountains: two ridges with lit/shadow facets
def ridge(seed, base, amp, step, n0=-1500, n1=3100):
    rnd = random.Random(seed); xs = list(range(n0, n1, step)); y = []
    for i, x in enumerate(xs):
        y.append(base - rnd.uniform(0.25, 1) * amp * (1 + .5 * math.sin(i * .5 + seed)))
    return xs, y
xs, ys = ridge(3, 392, 110, 90)
far = [(xs[0], 430)] + list(zip(xs, ys)) + [(xs[-1], 430)]
add('<polygon points="%s" fill="url(#mtnFar)" stroke="%s" stroke-width="2" stroke-linejoin="round" opacity=".95"/>' % (pts(far), "#3a1a2c"))
facets = []
for i in range(len(xs) - 1):
    if i % 2 == 0:
        facets.append('<polygon points="%d,%.0f %d,%.0f %d,430 %d,430" fill="#2a0f24" opacity=".16"/>' % (xs[i], ys[i], xs[i + 1], ys[i + 1], xs[i + 1] - 20, xs[i] - 20))
    else:
        facets.append('<polygon points="%d,%.0f %d,%.0f %d,430 %d,430" fill="#ffc9a0" opacity=".1"/>' % (xs[i], ys[i], xs[i + 1], ys[i + 1], xs[i + 1] - 20, xs[i] - 20))
add("".join(facets))
add('<rect x="%d" y="300" width="%d" height="130" fill="url(#hazeG)" opacity=".35"/>' % (W0, W1 - W0))
xs2, ys2 = ridge(9, 412, 62, 70)
near = [(xs2[0], 460)] + list(zip(xs2, ys2)) + [(xs2[-1], 460)]
add('<polygon points="%s" fill="url(#mtnNear)" stroke="%s" stroke-width="2.4" stroke-linejoin="round"/>' % (pts(near), INK))
fac2 = []
for i in range(len(xs2) - 1):
    if i % 3 == 0:
        fac2.append('<polygon points="%d,%.0f %d,%.0f %d,462 %d,462" fill="#4a1a0e" opacity=".2"/>' % (xs2[i], ys2[i], xs2[i + 1], ys2[i + 1], xs2[i + 1] - 14, xs2[i] - 14))
    elif i % 3 == 1:
        fac2.append('<polygon points="%d,%.0f %d,%.0f %d,462 %d,462" fill="#ffd2a8" opacity=".12"/>' % (xs2[i], ys2[i], xs2[i + 1], ys2[i + 1], xs2[i + 1] - 14, xs2[i] - 14))
add("".join(fac2))

# ground
HOR = 405
gpath = "M %d %d " % (W0, HOR) + " ".join("L %d %.0f" % (x, HOR - 6 + 8 * math.sin(x * .004)) for x in range(W0, W1, 200)) + " L %d %d L %d 2600 L %d 2600 Z" % (W1, HOR, W1, W0)
add('<clipPath id="gClip2"><path d="%s"/></clipPath>' % gpath)
add('<path d="%s" fill="url(#gndG)" stroke="%s" stroke-width="2.4"/>' % (gpath, INK))
add('<g id="ground-detail" clip-path="url(#gClip2)" pointer-events="none"><rect x="%d" y="%d" width="%d" height="2200" fill="#000" filter="url(#rough)" opacity=".5"/><rect x="%d" y="%d" width="%d" height="2200" fill="#fff" filter="url(#rough2)" opacity=".13"/>' % (W0, HOR, W1 - W0, W0, HOR, W1 - W0))
# dune ripples and tracks
rip = []
rnd = random.Random(5)
for i in range(46):
    x = rnd.uniform(-900, 2400); y = rnd.uniform(430, 1180); L = rnd.uniform(120, 360)
    k = (y - 400) / 800
    rip.append('<path d="M%.0f %.0f q%.0f %.0f %.0f 0 t%.0f 0" fill="none" stroke="%s" stroke-width="%.1f" opacity="%.2f" stroke-linecap="round"/>' % (x, y, L / 4, -6 - 6 * k, L / 2, L / 2, rnd.choice(["#7d3118", "#ffcba0"]), 1.2 + 1.6 * k, .22 + .12 * rnd.random()))
add("".join(rip))
add('</g>')

# craters (textured, with rim light, inner shadow, rubble)
def crater(cx, cy, rx, ry, seed):
    rnd = random.Random(seed)
    g = ['<g class="crater">']
    g.append('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="#3a170c" opacity=".28" filter="url(#blurS)"/>' % (cx - rx * .12, cy + ry * .22, rx * 1.18, ry * 1.1))
    # raised rim
    g.append('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="#e0895c" stroke="%s" stroke-width="2.4"/>' % (cx, cy, rx * 1.1, ry * 1.12, INK))
    g.append('<path d="M%.0f %.0f A%.0f %.0f 0 0 1 %.0f %.0f" fill="none" stroke="#ffd2a6" stroke-width="3.4" opacity=".8" stroke-linecap="round"/>' % (cx - rx * .95, cy - ry * .4, rx * 1.1, ry * 1.12, cx + rx * .82, cy - ry * .72))
    # inside
    g.append('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="url(#craterIn)" stroke="%s" stroke-width="2.2"/>' % (cx + rx * .03, cy + ry * .05, rx * .9, ry * .86, INK))
    g.append('<clipPath id="cc%d"><ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f"/></clipPath>' % (seed, cx + rx * .03, cy + ry * .05, rx * .9, ry * .86))
    g.append('<g clip-path="url(#cc%d)"><ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="#1f0a04" opacity=".5"/><ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="url(#craterGlow)"/>' % (seed, cx - rx * .28, cy - ry * .28, rx * .85, ry * .72, cx + rx * .35, cy + ry * .4, rx * .6, ry * .5))
    for k in range(14):
        a = rnd.uniform(0, 6.28); rr = rnd.uniform(.1, .75)
        g.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="%s" opacity=".55"/>' % (cx + math.cos(a) * rx * rr, cy + math.sin(a) * ry * rr, rnd.uniform(2, 6), rnd.uniform(1, 3), rnd.choice(["#2c0f06", "#e9a577"])))
    g.append('</g>')
    # rubble on the rim
    for k in range(7):
        a = rnd.uniform(3.4, 6.1); px = cx + math.cos(a) * rx * 1.02; py = cy + math.sin(a) * ry * 1.04 + 2
        g.append(rock(px, py, rnd.uniform(4, 9), seed * 10 + k, False))
    g.append('</g>')
    return "".join(g)

def rock(x, y, r, seed, shadow_=True):
    rnd = random.Random(seed)
    n = 7; p = []
    for i in range(n):
        a = i * 6.283 / n + rnd.uniform(-.25, .25); rr = r * rnd.uniform(.72, 1.12)
        p.append((x + math.cos(a) * rr, y + math.sin(a) * rr * .62 - r * .32))
    top = [p[0], p[1], p[2], p[3]]
    s = '<g class="rock">'
    if shadow_: s += '<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#2a0e06" opacity=".32"/>' % (x - r * .2, y + r * .05, r * 1.15, r * .34)
    s += '<polygon points="%s" fill="url(#rockD)" stroke="%s" stroke-width="%.1f" stroke-linejoin="round"/>' % (pts(p), INK, max(1.2, r * .09))
    s += '<polygon points="%s" fill="url(#rockL)" opacity=".92"/>' % pts([p[5], p[6], p[0], p[1], (x + r * .05, y - r * .1)])
    s += '<path d="M%.1f %.1f L%.1f %.1f" stroke="#ffd9b3" stroke-width="%.1f" opacity=".75" stroke-linecap="round"/>' % (p[6][0], p[6][1], p[0][0] + r * .1, p[0][1], max(1, r * .08))
    s += '</g>'
    return s

# distant rocks + far craters
add(crater(190, 470, 90, 22, 21)); add(crater(1460, 455, 80, 20, 22))
for i in range(11):
    add(rock(random.uniform(-300, 1900), random.uniform(418, 445), random.uniform(5, 11), 100 + i))
add(rock(60, 470, 20, 301)); add(rock(1560, 445, 24, 302))

# ------------------------------------------------------------ base layout
H = 3.0     # wall height
Gx0, Gx1, Gy0, Gy1 = 0, 10, 15, 25      # greenhouse
Mx0, Mx1, My0, My1 = 1, 9, 3, 11        # medbay
Lx0, Lx1, Ly0, Ly1 = 0, 10, -9, -1      # lab
Cx0, Cx1 = 3.6, 6.4                     # corridor width
BASE = []

# shared platform (regolith pad) under everything
pad = [P(-1.5, -10.5), P(12.5, -10.5), P(12.5, 26.5), P(-1.5, 26.5)]
add('<polygon points="%s" fill="#bf6a46" stroke="%s" stroke-width="2.2" stroke-linejoin="round" opacity=".92"/>' % (pts(pad), INK))
add('<polygon points="%s" fill="#000" filter="url(#rough)" opacity=".28" />' % pts(pad))
padz = [P(-1.5, 26.5, 0), P(12.5, 26.5, 0), P(12.5, 26.5, -.3), P(-1.5, 26.5, -.3)]
add(poly([P(-1.5, 26.5), P(12.5, 26.5), P(12.5, 26.5, -.35), P(-1.5, 26.5, -.35)], "#8e4528", sw=2))
add(poly([P(12.5, 26.5), P(12.5, -10.5), P(12.5, -10.5, -.35), P(12.5, 26.5, -.35)], "#74361f", sw=2))
# pad paving stripes (guide lines)
for yy in (26.5 - 0.0,):
    pass
add('<g transform="%s" opacity=".45">%s</g>' % (TFm(0), "".join('<line x1="%s" y1="-10" x2="%s" y2="26" stroke="#f5d9b5" stroke-width="2" %s stroke-dasharray="6 7"/>' % (xx, xx, NS) for xx in (5,))))

PADEND = len(out)
# corridor
def corridor(y0, y1, name):
    z0, z1 = 0, 2.1
    shadow(Cx0, Cx1, y0, y1, 2.1)
    # right face (x=Cx1) ribbed with windows, then left face, then roof
    face_right(Cx1, y0, y1, z0, z1, "#e6d8c2", lambda u0, w, h: rect(0, 0, w, h, "url(#pCorr)") +
               "".join(wrect(.55 + i * 1.0, .55, .62, .6) for i in range(int(w - .6))) + rect(0, h - .22, w, .22, "#8f7a64") + rect(0, 0, w, .16, "#f6ecda"))
    face_left(Cx0, Cx1, y1, z0, z1, "#efe3cf", lambda x0, w, h: rect(x0, 0, w, h, "url(#pCorr)") + rect(x0, h - .22, w, .22, "#8f7a64") + rect(x0, 0, w, .16, "#f6ecda"))
    # roof: arched look = two shaded slopes
    rz = z1
    top_face(Cx0, Cx1, y0, y1, rz, "#f3e8d6", lambda a, b, c, d: rect(a, c, b - a, d - c, "url(#pTile)", extra='opacity=".7"') + rect(a + (b - a) * .5 - .08, c, .16, d - c, "#bfae96") + rect(a, c, b - a, .12, "#d9cab4"))
    # tube rings
    for k in range(1, int(y1 - y0)):
        yy = y0 + k
        add('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#7a6853" stroke-width="2" opacity=".6"/>' % (*P(Cx0, yy, rz), *P(Cx1, yy, rz)))

# --- order of drawing (back to front) --------------------------------------
def lab():
    z1 = 3.3
    shadow(Lx0, Lx1, Ly0, Ly1, z1 + 1)
    # right face (x=Lx1) faces the airlock
    face_right(Lx1, Ly0, Ly1, 0, z1, "#56626f", lambda u0, w, h: rect(0, 0, w, h, "url(#pSteel)") + rect(0, h - .55, w, .55, "url(#pReg)") +
               wrect(.6, .5, 2.3, 1.5) + wrect(3.4, .5, 2.3, 1.5) + wrect(6.2, .5, 1.6, 1.5, "url(#winG)") + rect(0, 0, w, .18, "#9aa6b3") +
               rect(w - .12, 0, .12, h, "#3c4651"))
    # left face (y=Ly1) front of the lab, partly hidden by the corridor/medbay; show windows + emblem
    def lf(x0, w, h):
        s = rect(x0, 0, w, h, "url(#pSteel)") + rect(x0, h - .55, w, .55, "url(#pReg)") + rect(x0, 0, w, .18, "#9aa6b3")
        s += wrect(x0 + .5, .55, 2.2, 1.55) + wrect(x0 + 7.2, .55, 2.2, 1.55)
        # emblem plate (microscope)
        s += '<rect x="%s" y=".5" width="1.7" height="1.7" rx=".16" fill="#f4efe6" stroke="%s" stroke-width="2.4" %s/>' % (f(x0 + 4.2), INK, NS)
        s += '<g transform="translate(%s 1.35)" stroke="%s" stroke-width="2.4" fill="none" stroke-linecap="round"><path %s d="M-.3 .45 H.38 M-.1 .45 V.18 M.1 -.45 L.3 .1 M-.12 -.5 L.08 -.1 M.2 .0 Q.55 .15 .3 .42"/></g>' % (f(x0 + 5.05), INK, NS)
        return s
    face_left(Lx0, Lx1, Ly1, 0, z1, "#6a7684", lf)
    # roof with glass strip and equipment
    top_face(Lx0, Lx1, Ly0, Ly1, z1, "#8794a3", lambda a, b, c, d: rect(a, c, b - a, d - c, "url(#pPlate)") + rect(a + .4, c + .4, b - a - .8, 1.8, "#2a1912") + rect(a + .5, c + .5, b - a - 1, 1.6, "url(#winG)") + rect(a + .5, c + .5, b - a - 1, .2, "#e8f6ff", extra='opacity=".7"'))
    # roof: dish + mast + vents
    cx, cy = P(2.2, -6.6, z1)
    add('<ellipse cx="%.0f" cy="%.0f" rx="22" ry="8" fill="#2a0e06" opacity=".3"/>' % (cx, cy + 3))
    add('<rect x="%.0f" y="%.0f" width="8" height="24" fill="#cdd5dc" stroke="%s" stroke-width="2"/>' % (cx - 4, cy - 22, INK))
    add('<g class="dish"><ellipse cx="%.0f" cy="%.0f" rx="28" ry="16" fill="#f3f6f8" stroke="%s" stroke-width="2.4" transform="rotate(-24 %.0f %.0f)"/><ellipse cx="%.0f" cy="%.0f" rx="20" ry="10" fill="#c3ccd4" transform="rotate(-24 %.0f %.0f)"/><line x1="%.0f" y1="%.0f" x2="%.0f" y2="%.0f" stroke="%s" stroke-width="2.4"/><circle cx="%.0f" cy="%.0f" r="4" fill="#ff5a4a" stroke="%s" stroke-width="1.6"/></g>' % (cx, cy - 34, INK, cx, cy - 34, cx, cy - 34, cx, cy - 34, cx, cy - 34, cx + 12, cy - 54, INK, cx + 12, cy - 54, INK))
    mx, my = P(8.3, -7.6, z1)
    add('<line x1="%.0f" y1="%.0f" x2="%.0f" y2="%.0f" stroke="%s" stroke-width="3"/><circle cx="%.0f" cy="%.0f" r="5" fill="#ff5a4a" stroke="%s" stroke-width="2" class="beacon"/>' % (mx, my, mx, my - 76, INK, mx, my - 76, INK))
    for k, (vx, vy) in enumerate([(6.2, -3.2), (7.6, -3.2)]):
        bx, by = P(vx, vy, z1)
        add('<g><polygon points="%s" fill="#dfe5ea" stroke="%s" stroke-width="2"/><ellipse cx="%.0f" cy="%.0f" rx="13" ry="6" fill="#4a5560" stroke="%s" stroke-width="1.6"/><g class="ac-fan" style="transform-origin:%.0fpx %.0fpx"><path d="M%.0f %.0f h24 M%.0f %.0f v-12" stroke="#cdd5dc" stroke-width="2.4" transform="translate(-12 0)"/></g></g>' % (pts([P(vx - .5, vy - .5, z1 + .5), P(vx + .5, vy - .5, z1 + .5), P(vx + .5, vy + .5, z1 + .5), P(vx - .5, vy + .5, z1 + .5)]), INK, bx, by - 16, INK, bx, by - 16, bx, by - 16, bx, by - 16))

def lab_wrap():
    add('<g id="comp-lab" class="CompartmentHitbox" onclick="openDepartment(\'lab\')" onmouseenter="syncPinHover(\'lab\', true)" onmouseleave="syncPinHover(\'lab\', false)">')
    lab()
    add('</g>')

def airlock():
    # cylinder along +x attached to the lab's right face (x = Lx1), axis y=-5, z=1.7, radius 1.45
    ay, az, R = -4.9, 1.7, 1.75
    x_start, x_end = Lx1, 17.2
    mR = RFm(x_end, 0, 0)  # placeholder, we use local coords of the plane at x=const with u=-y, v=-z
    def cap_matrix(xp):  # local (u=-y... ) use u=(y_ref - y), v=(z_ref - z) with y_ref=ay+R*2? keep simple: u=y1-y, v=zref-z
        return (SX, -SY, 0, S, OX + (xp - 0) * SX - 0 * SX, OY + (xp + 0) * SY)  # y1=0, zref=0
    # local coords: u = -y, v = -z  -> circle center (u=-ay, v=-az)
    cu, cv = -ay, -az
    m_end = cap_matrix(x_end); m_st = cap_matrix(x_start)
    t = (SX * (x_end - x_start), SY * (x_end - x_start))
    (lo1, hi1) = circle_support(cu, cv, R, m_st, t)
    (lo2, hi2) = circle_support(cu, cv, R, m_end, t)
    shadow(x_start, x_end, ay - R, ay + R, 2.2, op=.36)
    # ground platform + steps
    add(poly([P(Lx1, ay - 2.4, 0), P(x_end + 1.2, ay - 2.4, 0), P(x_end + 1.2, ay + 2.4, 0), P(Lx1, ay + 2.4, 0)], "#a85a3a", sw=2, extra='opacity=".0"'))
    body = [lo1, lo2, hi2, hi1]
    add('<polygon points="%s" fill="url(#cylG)" stroke="%s" stroke-width="2.6" stroke-linejoin="round"/>' % (pts(body), INK))
    # ribs: ellipse arcs
    ribs = []
    nrib = 7
    for k in range(1, nrib + 1):
        xp = x_start + (x_end - x_start) * k / (nrib + 1.0)
        mm = cap_matrix(xp)
        arc = []
        for j in range(0, 31):
            th = math.radians(-50 + 190 * j / 30.0)
            arc.append("%.3f,%.3f" % (cu - R * math.cos(th), cv - R * math.sin(th)))
        ribs.append('<g transform="matrix(%.4f %.4f 0 %.4f %.2f %.2f)"><polyline points="%s" fill="none" stroke="#7a6853" stroke-width="2.4" opacity=".5" %s/></g>' % (mm[0], mm[1], mm[3], mm[4], mm[5], " ".join(arc), NS))
    add("".join(ribs))
    # hazard band + light strip along the body (lower part)
    # end cap
    add('<g transform="matrix(%.4f %.4f 0 %.4f %.2f %.2f)">' % (m_end[0], m_end[1], m_end[3], m_end[4], m_end[5]))
    add('<circle cx="%.3f" cy="%.3f" r="%.3f" fill="#d9ccb9" stroke="%s" stroke-width="2.6" %s/>' % (cu, cv, R, INK, NS))
    add('<circle cx="%.3f" cy="%.3f" r="%.3f" fill="#f2e8d8" stroke="#8c7c68" stroke-width="2" %s/>' % (cu, cv, R * .86, NS))
    # hatch frame with hazard ring
    add('<circle cx="%.3f" cy="%.3f" r="%.3f" fill="url(#pHaz)" stroke="%s" stroke-width="2" %s/>' % (cu, cv, R * .74, INK, NS))
    add('<circle cx="%.3f" cy="%.3f" r="%.3f" fill="#f7f1e6" stroke="%s" stroke-width="2.4" %s/>' % (cu, cv, R * .6, INK, NS))
    # door (left leaf open slightly) 
    add('<rect x="%.3f" y="%.3f" width="%.3f" height="%.3f" rx=".16" fill="#7ea3bd" stroke="%s" stroke-width="2.4" %s/>' % (cu - R * .4, cv - R * .5, R * .8, R * 1.0, INK, NS))
    add('<rect x="%.3f" y="%.3f" width="%.3f" height="%.3f" rx=".1" fill="url(#winG)" stroke="%s" stroke-width="2" %s/>' % (cu - R * .27, cv - R * .38, R * .54, R * .36, INK, NS))
    add('<line x1="%.3f" y1="%.3f" x2="%.3f" y2="%.3f" stroke="%s" stroke-width="2.4" %s/>' % (cu, cv - R * .5, cu, cv + R * .5, INK, NS))
    add('<circle cx="%.3f" cy="%.3f" r=".1" fill="#f5b21b" stroke="%s" stroke-width="1.6" %s/><circle cx="%.3f" cy="%.3f" r=".1" fill="#f5b21b" stroke="%s" stroke-width="1.6" %s/>' % (cu - .22, cv + R * .12, INK, NS, cu + .22, cv + R * .12, INK, NS))
    # status lamps on the frame
    add('<circle cx="%.3f" cy="%.3f" r=".12" fill="#4ade80" stroke="%s" stroke-width="1.6" class="lamp" %s/><circle cx="%.3f" cy="%.3f" r=".12" fill="#fbbf24" stroke="%s" stroke-width="1.6" %s/>' % (cu + R * .72, cv - R * .05, INK, NS, cu + R * .72, cv + R * .25, INK, NS))
    add('</g>')
    # steps / ramp in front of the hatch, rail posts
    for k in range(3):
        xs_ = x_end + .15 + k * .55
        add(poly([P(xs_, ay - 1.0, .22 * (3 - k)), P(xs_ + .55, ay - 1.0, .22 * (3 - k)), P(xs_ + .55, ay + 1.0, .22 * (3 - k)), P(xs_, ay + 1.0, .22 * (3 - k))], "#9aa6b2", sw=2))
    for k in range(3):
        xs_ = x_end + .15 + k * .55
        add(poly([P(xs_ + .55, ay + 1.0, 0), P(xs_ + .55, ay + 1.0, .22 * (3 - k)), P(xs_ + .55, ay - 1.0, .22 * (3 - k)), P(xs_ + .55, ay - 1.0, 0)], "#6c7886", sw=2))
    # floodlight on a bracket
    lx, ly = P(x_end - 1.2, ay - R - .05, az + R * .0)
    add('<g class="lamp2"><line x1="%.0f" y1="%.0f" x2="%.0f" y2="%.0f" stroke="%s" stroke-width="3"/><rect x="%.0f" y="%.0f" width="16" height="9" rx="3" fill="#f4efe6" stroke="%s" stroke-width="2"/><rect x="%.0f" y="%.0f" width="9" height="5" fill="#fff59d"/></g>' % (lx, ly, lx, ly - 14, INK, lx - 8, ly - 23, INK, lx - 4, ly - 21))

# --- medbay
def medbay():
    z1 = 3.0
    shadow(Mx0, Mx1, My0, My1, z1 + 1)
    def rf(u0, w, h):
        s = rect(0, 0, w, h, "url(#pPanel)") + rect(0, h - .4, w, .4, "url(#pReg)") + rect(0, 0, w, .2, "#d6c9b8")
        s += wrect(.5, .55, 1.7, 1.3, "url(#winG)") + wrect(w - 2.2, .55, 1.7, 1.3, "url(#winG)")
        s += rect(w / 2 - .5, .45, 1.0, 1.4, "#cfd9e2", INK, 2.2, NS)
        return s
    face_right(Mx1, My0, My1, 0, z1, "#efe6d8", rf)
    def lf(x0, w, h):
        s = rect(x0, 0, w, h, "url(#pPanel)") + rect(x0, h - .4, w, .4, "url(#pReg)") + rect(x0, 0, w, .2, "#d6c9b8")
        s += wrect(x0 + .45, .6, 1.6, 1.3) + wrect(x0 + w - 2.05, .6, 1.6, 1.3)
        # red-cross plate
        s += '<rect x="%s" y=".35" width="1.9" height="1.9" rx=".18" fill="#f9f5ee" stroke="%s" stroke-width="2.4" %s/>' % (f(x0 + w / 2 - .95), INK, NS)
        s += '<path d="M%s .62 h.44 v.5 h.5 v.44 h-.5 v.5 h-.44 v-.5 h-.5 v-.44 h.5z" fill="#e0372d" stroke="%s" stroke-width="1.8" %s/>' % (f(x0 + w / 2 - .22), INK, NS)
        return s
    face_left(Mx0, Mx1, My1, 0, z1, "#f6eee1", lf)
    glass_roof(Mx0, Mx1, My0, My1, z1, 1.5, "#f3ece0", med=True)

def glass_roof(x0, x1, y0, y1, z, h, frame, med=False):
    ix0, ix1, iy0, iy1 = x0 + 1.5, x1 - 1.5, y0 + 1.5, y1 - 1.5
    zt = z + h
    # roof deck
    top_face(x0, x1, y0, y1, z, frame, lambda a, b, c, d: rect(a, c, b - a, d - c, "url(#pTile)", extra='opacity=".55"'))
    # interior seen from above
    top_face(x0 + .7, x1 - .7, y0 + .7, y1 - .7, z - .05, "#6b4a35")
    fl = (lambda a, b, c, d: rect(a, c, b - a, d - c, "#e9f5ee" if med else "#7a5a40"))
    # back slopes (translucent)
    bs = [[P(x0, y0, z), P(x1, y0, z), P(ix1, iy0, zt), P(ix0, iy0, zt)], [P(x0, y0, z), P(x0, y1, z), P(ix0, iy1, zt), P(ix0, iy0, zt)]]
    if not med:
        # raised beds with cabbages and radishes seen through the glass
        add('<g transform="%s">' % TFm(z - .05))
        for r in range(4):
            yy = y0 + 1.6 + r * 1.8
            add('<rect x="%s" y="%s" width="%s" height=".95" rx=".12" fill="#5b3a26" stroke="%s" stroke-width="1.8" %s/><rect x="%s" y="%s" width="%s" height=".7" rx=".1" fill="#3d2518"/>' % (f(x0 + 1.2), f(yy), f(x1 - x0 - 2.4), INK, NS, f(x0 + 1.3), f(yy + .1), f(x1 - x0 - 2.6)))
            for c in range(7):
                cx = x0 + 1.9 + c * 1.05
                if (c + r) % 2 == 0:
                    add('<g transform="translate(%s %s)"><circle r=".42" fill="#7bd36a" stroke="%s" stroke-width="1.6" %s/><circle r=".26" fill="#a6ec8a"/><path d="M-.3 .0 q.3 -.3 .6 0 M-.2 .18 q.2 -.2 .4 0" fill="none" stroke="#3d8c3b" stroke-width="1.2" %s/></g>' % (f(cx), f(yy + .48), INK, NS, NS))
                else:
                    add('<g transform="translate(%s %s)"><path d="M-.18 -.05 q.18 -.55 .36 0 q-.18 .12 -.36 0z M-.05 -.1 q.05 -.5 .12 0" fill="#58b64f" stroke="%s" stroke-width="1.3" %s/><circle cy=".02" r=".25" fill="#e5384f" stroke="%s" stroke-width="1.4" %s/></g>' % (f(cx), f(yy + .48), INK, NS, INK, NS))
        add('</g>')
        add('<polygon points="%s" fill="url(#hydroGlow)" opacity=".0"/>' % pts(bs[0]))
    else:
        add('<g transform="%s">%s</g>' % (TFm(z - .05), rect(x0 + 1.2, y0 + 1.4, 2.0, 5.5, "#cfe3f0", INK, 1.8, NS) + rect(x0 + 4.2, y0 + 2.2, 1.4, 2.8, "#f3a6a0", INK, 1.8, NS) + rect(x0 + 4.0, y0 + 5.4, 3.2, 1.8, "#7cc4e8", INK, 1.8, NS) + '<circle cx="%s" cy="%s" r=".5" fill="#e0372d"/>' % (f(x0 + 5), f(y0 + 3.2))))
    for b in bs:
        add('<polygon points="%s" fill="url(#glassG)" stroke="%s" stroke-width="2" opacity=".55"/>' % (pts(b), INK))
    # front slopes
    fs = [[P(x0, y1, z), P(x1, y1, z), P(ix1, iy1, zt), P(ix0, iy1, zt)], [P(x1, y1, z), P(x1, y0, z), P(ix1, iy0, zt), P(ix1, iy1, zt)]]
    for i, b in enumerate(fs):
        add('<polygon points="%s" fill="url(#glassG)" stroke="%s" stroke-width="2.4" stroke-linejoin="round"/>' % (pts(b), INK))
        # mullions
        n = 7 if i == 0 else 7
        for k in range(1, n):
            t = k / float(n)
            if i == 0:
                a_, b_ = P(x0 + (x1 - x0) * t, y1, z), P(ix0 + (ix1 - ix0) * t, iy1, zt)
            else:
                a_, b_ = P(x1, y1 + (y0 - y1) * t, z), P(ix1, iy1 + (iy0 - iy1) * t, zt)
            add('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#f4efe6" stroke-width="1.8" opacity=".9"/>' % (*a_, *b_))
        for k in (1, 2):
            t = k / 3.0
            if i == 0:
                a_, b_ = P(x0 + (ix0 - x0) * t, y1 + (iy1 - y1) * t, z + h * t), P(x1 + (ix1 - x1) * t, y1 + (iy1 - y1) * t, z + h * t)
            else:
                a_, b_ = P(x1 + (ix1 - x1) * t, y1 + (iy1 - y1) * t, z + h * t), P(x1 + (ix1 - x1) * t, y0 + (iy0 - y0) * t, z + h * t)
            add('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#f4efe6" stroke-width="1.6" opacity=".85"/>' % (*a_, *b_))
        # specular streak
        pass
    add('<polygon points="%s" fill="url(#glassG)" stroke="%s" stroke-width="2.4" stroke-linejoin="round"/>' % (pts([P(ix0, iy0, zt), P(ix1, iy0, zt), P(ix1, iy1, zt), P(ix0, iy1, zt)]), INK))
    add('<path d="M%.1f %.1f L%.1f %.1f" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/>' % (*P(ix0 + 1, iy1 - .4, zt), *P(ix0 + 3, iy1 - 1.8, zt)))

def greenhouse():
    z1 = 2.6
    shadow(Gx0, Gx1, Gy0, Gy1, z1 + 1.6)
    def rfn(u0, w, h):
        s = rect(0, 0, w, h, "url(#pReg)") + rect(0, 0, w, .22, "#f1e0cc")
        # glazing band
        s += rect(.3, .55, w - .6, h - 1.0, "#2a1912") 
        n = int((w - .6) / 1.4)
        ww = (w - .9) / n
        for i in range(n):
            s += rect(.45 + i * ww, .7, ww - .12, h - 1.3, "url(#winGg)") + '<path d="M%s %s l%s %s" stroke="#fff" stroke-width="2" opacity=".5" %s/>' % (f(.45 + i * ww + .12), f(h - .7), f(ww * .4), f(-(h - 1.3) * .6), NS)
        # leaf logo plate
        return s + rect(0, h - .35, w, .35, "#8a4a30")
    face_right(Gx1, Gy0, Gy1, 0, z1, "#cf8662", rfn)
    def lfn(x0, w, h):
        s = rect(x0, 0, w, h, "url(#pReg)") + rect(x0, 0, w, .22, "#f1e0cc")
        s += rect(x0 + 3.0, .55, w - 3.3, h - 1.0, "#2a1912")
        n = int((w - 3.3) / 1.4); ww = (w - 3.6) / n
        for i in range(n):
            s += rect(x0 + 3.15 + i * ww, .7, ww - .12, h - 1.3, "url(#winGg)") + '<path d="M%s %s l%s %s" stroke="#fff" stroke-width="2" opacity=".5" %s/>' % (f(x0 + 3.15 + i * ww + .12), f(h - .7), f(ww * .4), f(-(h - 1.3) * .6), NS)
        # door
        s += rect(x0 + .5, .5, 1.9, h - .5, "#dfe5ea", INK, 2.4, NS) + rect(x0 + .75, .75, 1.4, 1.0, "url(#winG)", INK, 1.8, NS) + '<circle cx="%s" cy="%s" r=".09" fill="#f5b21b" %s/>' % (f(x0 + 2.0), f(h - 1.0), NS)
        s += rect(x0, h - .35, w, .35, "#8a4a30")
        return s
    face_left(Gx0, Gx1, Gy1, 0, z1, "#d99471", lfn)
    # leaf emblem sign on the glass-free corner
    glass_roof(Gx0, Gx1, Gy0, Gy1, z1, 1.9, "#e6d0b8")
    # roof sign
    sx_, sy_ = P(Gx1 - 1.1, Gy1 - 1.0, z1 + .0)

def c_wrap(key, fn):
    add('<g id="comp-%s" class="CompartmentHitbox" onclick="openDepartment(\'%s\')" onmouseenter="syncPinHover(\'%s\', true)" onmouseleave="syncPinHover(\'%s\', false)">' % (key, key, key, key))
    fn()
    add('</g>')

# ---- props helpers
def tank(x, y, r=.8, h=2.2, col="#d9e1e8", band="#e0372d"):
    cx, cy = P(x, y, 0); cx2, cy2 = P(x, y, h)
    rx = r * SX * 1.25; ry = r * SY * 1.25
    add('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#2a0e06" opacity=".3" transform="translate(-10 4)"/>' % (cx, cy + 2, rx * 1.1, ry))
    add('<path d="M%.1f %.1f L%.1f %.1f A%.1f %.1f 0 0 1 %.1f %.1f L%.1f %.1f A%.1f %.1f 0 0 0 %.1f %.1f Z" fill="url(#cylG)" stroke="%s" stroke-width="2.2"/>' % (cx - rx, cy2, cx - rx, cy, rx, ry, cx + rx, cy, cx + rx, cy2, rx, ry, cx - rx, cy2, INK))
    add('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#f4efe6" stroke="%s" stroke-width="2.2"/>' % (cx, cy2, rx, ry, INK))
    add('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="none" stroke="%s" stroke-width="5" opacity=".9" transform="translate(0 %.1f)"/>' % (cx, cy, rx, ry, band, -(cy - cy2) * .35))

def crate(x, y, w=1.3, d=1.3, h=1.0, col=("#c9a97a", "#a98657", "#8b6a42")):
    shadow(x, x + w, y, y + d, h, op=.3)
    add(poly([P(x + w, y + d, 0), P(x + w, y, 0), P(x + w, y, h), P(x + w, y + d, h)], col[2], sw=2))
    add(poly([P(x, y + d, 0), P(x + w, y + d, 0), P(x + w, y + d, h), P(x, y + d, h)], col[1], sw=2))
    add(poly([P(x, y, h), P(x + w, y, h), P(x + w, y + d, h), P(x, y + d, h)], col[0], sw=2))
    add('<path d="M%.1f %.1f L%.1f %.1f M%.1f %.1f L%.1f %.1f" stroke="%s" stroke-width="1.6" opacity=".6"/>' % (*P(x, y + d, h * .5), *P(x + w, y + d, h * .5), *P(x + w, y + d, 0), *P(x + w, y + d, h), INK))

def solar(x, y, w=3.4, d=2.0):
    shadow(x, x + w, y, y + d, 1.2, op=.26)
    # stand
    for dx_ in (.3, w - .3):
        add('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="3.2"/>' % (*P(x + dx_, y + d * .5, 0), *P(x + dx_, y + d * .5, .8), INK))
    a = [P(x, y, 1.35), P(x + w, y, 1.35), P(x + w, y + d, .55), P(x, y + d, .55)]
    add('<polygon points="%s" fill="#cfd8e0" stroke="%s" stroke-width="2.4" stroke-linejoin="round"/>' % (pts(a), INK))
    add('<polygon points="%s" fill="url(#solG)" stroke="%s" stroke-width="1.8" stroke-linejoin="round" transform="translate(0 -1.2)"/>' % (pts([P(x + .08, y + .08, 1.33), P(x + w - .08, y + .08, 1.33), P(x + w - .08, y + d - .08, .57), P(x + .08, y + d - .08, .57)]), INK))
    # cell grid
    for i in range(1, 6):
        t = i / 6.0
        add('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#a9c6e3" stroke-width="1.2" opacity=".75" transform="translate(0 -1.2)"/>' % (*P(x + w * t, y + .08, 1.33), *P(x + w * t, y + d - .08, .57)))
    for j in range(1, 3):
        t = j / 3.0
        add('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#a9c6e3" stroke-width="1.2" opacity=".75" transform="translate(0 -1.2)"/>' % (*P(x + .08, y + d * t, 1.33 - .78 * t), *P(x + w - .08, y + d * t, 1.33 - .78 * t)))
    add('<polygon points="%s" fill="#fff" opacity=".18" transform="translate(0 -1.2)"/>' % pts([P(x + .08, y + .08, 1.33), P(x + w * .55, y + .08, 1.33), P(x + w * .3, y + d - .08, .57), P(x + .08, y + d - .08, .57)]))

def rover(x, y):
    """six-wheel rover with rocker suspension, mast, solar tray, arm and lights; built from iso boxes"""
    # sizes: body 3.0 (x) by 1.8 (y)
    bx0, bx1, by0, by1 = x, x + 3.2, y, y + 1.9
    shadow(bx0 - .2, bx1 + .2, by0 - .2, by1 + .3, 1.4, op=.4)
    # far-side wheels (right side x=bx1 plane is away) draw first: wheels are discs in plane y = const; far side y=by0
    def wheel(cx, cy_plane, z, rad=.55):
        # disc in the plane y=cy_plane (left-face orientation): local (u=x, v=z0-z) with z0=0
        pass
    def wheels(yp, dark):
        for k, wx in enumerate((bx0 + .35, bx0 + 1.6, bx1 - .35)):
            add('<g transform="%s"><circle cx="%s" cy="-.5" r=".5" fill="#2b2522" stroke="%s" stroke-width="2.2" %s/><circle cx="%s" cy="-.5" r=".34" fill="#6b625b" stroke="%s" stroke-width="1.6" %s/><circle cx="%s" cy="-.5" r=".12" fill="#b9b0a6"/>%s</g>' % (LFm(yp, 0), f(wx), INK, NS, f(wx), INK, NS, f(wx), "".join('<line x1="%s" y1="-.5" x2="%s" y2="-.5" stroke="#3a322d" stroke-width="2" transform="rotate(%d %s -.5)" %s/>' % (f(wx - .34), f(wx + .34), a, f(wx), NS) for a in (0, 60, 120))))
    wheels(by0, True)
    # rocker links on the far side
    # body
    z0, z1 = .75, 1.7
    add(poly([P(bx1, by1, z0), P(bx1, by0, z0), P(bx1, by0, z1), P(bx1, by1, z1)], "#a8a39a", sw=2.2))
    add('<g transform="%s">%s</g>' % (RFm(bx1, by1, z1), rect(0, 0, 1.9, .95, "#9a958c") + rect(.15, .15, .7, .5, "#d9d4ca", INK, 1.6, NS) + rect(1.0, .15, .7, .5, "#d9d4ca", INK, 1.6, NS) + '<circle cx="1.5" cy=".78" r=".07" fill="#f5b21b"/>'))
    add(poly([P(bx0, by1, z0), P(bx1, by1, z0), P(bx1, by1, z1), P(bx0, by1, z1)], "#e9e4da", sw=2.4))
    add('<g transform="%s">%s</g>' % (LFm(by1, z1), rect(bx0, 0, bx1 - bx0, .95, "#ece7dd") + rect(bx0, .66, bx1 - bx0, .12, "#e0763c") + rect(bx0, .78, bx1 - bx0, .17, "#7a746b") +
         "".join(rect(bx0 + .25 + i * .75, .12, .6, .42, "#f7f4ec", "#8a8378", 1.4, NS) for i in range(4)) + '<circle cx="%s" cy=".3" r=".12" fill="#4ade80" stroke="%s" stroke-width="1.4" %s/>' % (f(bx1 - .22), INK, NS) +
         '<text x="%s" y=".62" font-size=".22" font-weight="900" fill="#e0763c" font-family="MMSans,Arial">DUNE</text>' % f(bx0 + .3)))
    add(poly([P(bx0, by0, z1), P(bx1, by0, z1), P(bx1, by1, z1), P(bx0, by1, z1)], "#f3efe6", sw=2.4))
    # solar tray on top (tilted)
    add(poly([P(bx0 + .3, by0 + .2, z1 + .22), P(bx0 + 1.9, by0 + .2, z1 + .22), P(bx0 + 1.9, by1 - .2, z1 + .22), P(bx0 + .3, by1 - .2, z1 + .22)], "url(#pSolar)", sw=2))
    # science box + camera mast
    mx, my = P(bx1 - .5, by0 + .55, z1)
    add('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="3.4"/><rect x="%.1f" y="%.1f" width="22" height="13" rx="3" fill="#f3efe6" stroke="%s" stroke-width="2.2"/><circle cx="%.1f" cy="%.1f" r="4.2" fill="#2a1912"/><circle cx="%.1f" cy="%.1f" r="1.6" fill="#7dd3fc"/><circle cx="%.1f" cy="%.1f" r="3.2" fill="#e0763c" stroke="%s" stroke-width="1.6"/>' % (mx, my, mx, my - 36, INK, mx - 8, my - 50, INK, mx + 3, my - 43, mx + 4, my - 44, mx - 2, my - 40, INK))
    # antenna
    ax_, ay_ = P(bx0 + .5, by1 - .3, z1)
    add('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="2.6"/><circle cx="%.1f" cy="%.1f" r="3.4" fill="#ff5a4a" class="beacon" stroke="%s" stroke-width="1.4"/>' % (ax_, ay_, ax_ + 4, ay_ - 34, INK, ax_ + 4, ay_ - 34, INK))
    # robotic arm in front
    px, py = P(bx0 + .1, by1 + .05, z0 + .1)
    add('<g class="arm"><path d="M%.1f %.1f L%.1f %.1f L%.1f %.1f" fill="none" stroke="%s" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M%.1f %.1f L%.1f %.1f L%.1f %.1f" fill="none" stroke="#e9e4da" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="%.1f" cy="%.1f" r="4.4" fill="#e0763c" stroke="%s" stroke-width="1.8"/><path d="M%.1f %.1f l-7 7 M%.1f %.1f l3 9" stroke="%s" stroke-width="3" stroke-linecap="round"/></g>' % (px, py, px - 36, py - 6, px - 62, py + 32, INK, px, py, px - 36, py - 6, px - 62, py + 32, px - 36, py - 6, INK, px - 62, py + 32, px - 62, py + 32, INK))
    # headlights
    hx, hy = P(bx0, by1, z0 + .45)
    add('<circle cx="%.1f" cy="%.1f" r="4.2" fill="#fff59d" stroke="%s" stroke-width="1.6" class="lamp"/>' % (hx + 2, hy, INK))
    wheels(by1, False)
    # rocker linkage over near wheels
    for k, (wx0, wx1) in enumerate(((bx0 + .35, bx0 + 1.6), (bx0 + 1.6, bx1 - .35))):
        add('<g transform="%s"><path d="M%s -.5 L%s -.9 L%s -.5" fill="none" stroke="#575049" stroke-width="3" stroke-linejoin="round" %s/></g>' % (LFm(by1 + .02, 0), f(wx0), f((wx0 + wx1) / 2), f(wx1), NS))

MARK = len(out)
# ---- draw order: back to front -------------------------------------------------
# lab + airlock (back), corridor 2, medbay, corridor 1, greenhouse (front)
# props at the back
tank(-1.9, -7.2); tank(-1.9, -5.7, col="#e8edf1", band="#2d6cdf")
c_wrap("lab", lab)
c_wrap("airlock", airlock)
corridor(Ly1, My0, "c2")
c_wrap("medbay", medbay)
corridor(My1, Gy0, "c1")
c_wrap("greenhouse", greenhouse)

# front of greenhouse: crates and the cable runs
crate(-1.0, 26.2 - 1.4, 1.2, 1.2, .9); crate(.4, 26.2 - 1.6, 1.0, 1.0, 1.3, ("#9fb4c6", "#7e97ad", "#647c91"))

# solar field on the right
for r in range(2):
    for c in range(3):
        solar(14.5 + c * 4.2, 8.0 + r * 3.6)
# cables
add('<path d="M%.1f %.1f Q%.1f %.1f %.1f %.1f" fill="none" stroke="#2a1912" stroke-width="3" opacity=".75"/>' % (*P(11, 6.2, .1), *P(12.8, 8.4, .1), *P(14.4, 10, .1)))
add('<path d="M%.1f %.1f Q%.1f %.1f %.1f %.1f" fill="none" stroke="#2a1912" stroke-width="3" opacity=".75"/>' % (*P(11, 14, .1), *P(13, 15, .1), *P(14.4, 12.5, .1)))
# power box
crate(11.4, 11.3, 1.6, 1.3, 1.5, ("#dfe5ea", "#b9c3cc", "#98a3ae"))
rover(24.2, 11.0)

# rocks near the base (foreground)
fg = [(-3.5, 21, 14), (-3, 15, 9), (14, 20, 10), (13, 24, 15), (24, 12, 11), (27, 4, 8), (8, 29, 12), (3, 30, 10), (14.5, 5, 7), (-3.2, 3, 12), (22, 24, 9)]
for i, (gx, gy, rr) in enumerate(fg):
    px, py = P(gx, gy)
    add(rock(px, py, rr, 400 + i))
# foreground craters
cx, cy = P(5.0, 31.2); add(crater(cx - 20, cy + 4, 135, 40, 31))
cx, cy = P(22.0, 29); add(crater(cx, cy - 4, 120, 36, 32))
cx, cy = P(-6, 12); add(crater(cx, cy, 78, 24, 33))
for i in range(30):
    gx, gy = random.uniform(-9, 31), random.uniform(-8, 33)
    if -2 < gx < 13 and -11 < gy < 27: continue
    px, py = P(gx, gy)
    add('<ellipse cx="%.0f" cy="%.0f" rx="%.1f" ry="%.1f" fill="url(#rockD)" opacity=".8" stroke="%s" stroke-width="1"/>' % (px, py, random.uniform(2, 5), random.uniform(1, 2.4), INK))

add('<rect id="scene-evening-tint" x="0" y="0" width="1600" height="1200" fill="#000" opacity="0" pointer-events="none"/>')

out[PADEND:PADEND] = ['<g id="shadows">%s</g>' % "".join(shout)]
svg = ('<svg id="mars-base-svg" viewBox="0 0 1600 1200" class="w-full h-full block" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">'
       '<defs>%s</defs>%s</svg>' % ("".join(defs), "".join(out)))
open(sys.argv[1] if len(sys.argv) > 1 else "/tmp/base.svg", "w").write(svg)

# pin anchors (percent of the 1600x1200 box)
def pct(p): return (p[0] / 16.0, p[1] / 12.0)
pins = {"greenhouse": pct(P(5, 20, 4.9)), "medbay": pct(P(5, 7, 4.4)), "lab": pct(P(5, -5, 5.2)), "airlock": pct(P(15.5, -4.9, 3.4))}
print(json.dumps(pins))

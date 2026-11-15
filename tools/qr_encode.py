"""Small QR encoder: byte mode, error correction M, versions 1-6.

Enough for short links like https://name.github.io/mission-mars/#info=101.
Keep in sync with site/assets/vendor/qrcode.js (same algorithm, same masks).
"""

EC = {1: (10, [(1, 16)]), 2: (16, [(1, 28)]), 3: (26, [(1, 44)]),
      4: (18, [(2, 32)]), 5: (24, [(2, 43)]), 6: (16, [(4, 27)])}
ALIGN = {1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34]}


def _gf_tables():
    exp, log, x = [0] * 512, [0] * 256, 1
    for i in range(255):
        exp[i] = x
        log[x] = i
        x <<= 1
        if x & 0x100:
            x ^= 0x11D
    for i in range(255, 512):
        exp[i] = exp[i - 255]
    return exp, log


EXP, LOG = _gf_tables()


def _mul(a, b):
    return 0 if a == 0 or b == 0 else EXP[LOG[a] + LOG[b]]


def _rs_remainder(data, n):
    gen = [1]
    for i in range(n):
        nxt = [0] * (len(gen) + 1)
        for j, c in enumerate(gen):
            nxt[j] ^= c
            nxt[j + 1] ^= _mul(c, EXP[i])
        gen = nxt
    rem = [0] * n
    for b in data:
        f = b ^ rem[0]
        rem = rem[1:] + [0]
        for i in range(n):
            rem[i] ^= _mul(gen[i + 1], f)
    return rem


def _codewords(data, ver):
    ecc_len, groups = EC[ver]
    total = sum(n * d for n, d in groups)
    if len(data) > total - 2:
        raise ValueError("text too long for QR version %d" % ver)
    bits = "0100" + format(len(data), "08b") + "".join(format(b, "08b") for b in data)
    bits += "0" * min(4, total * 8 - len(bits))
    bits += "0" * (-len(bits) % 8)
    cw = [int(bits[i:i + 8], 2) for i in range(0, len(bits), 8)]
    pad = [0xEC, 0x11]
    while len(cw) < total:
        cw.append(pad[(len(cw) - len(bits) // 8) % 2])
    blocks, pos = [], 0
    for n, d in groups:
        for _ in range(n):
            blocks.append(cw[pos:pos + d])
            pos += d
    eccs = [_rs_remainder(b, ecc_len) for b in blocks]
    out = []
    for i in range(max(len(b) for b in blocks)):
        out += [b[i] for b in blocks if i < len(b)]
    for i in range(ecc_len):
        out += [e[i] for e in eccs]
    return out


def _penalty(m):
    n = len(m)
    score = 0
    pats = ([1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1])
    for lines in (m, [list(c) for c in zip(*m)]):
        for line in lines:
            run = 1
            for i in range(1, n):
                if line[i] == line[i - 1]:
                    run += 1
                else:
                    score += run - 2 if run >= 5 else 0
                    run = 1
            score += run - 2 if run >= 5 else 0
            for i in range(n - 10):
                if line[i:i + 11] in pats:
                    score += 40
    for y in range(n - 1):
        for x in range(n - 1):
            if m[y][x] == m[y][x + 1] == m[y + 1][x] == m[y + 1][x + 1]:
                score += 3
    dark = sum(map(sum, m))
    score += (-(-abs(dark * 20 - n * n * 10) // (n * n)) - 1) * 10
    return score


MASKS = [lambda x, y: (x + y) % 2 == 0, lambda x, y: y % 2 == 0, lambda x, y: x % 3 == 0,
         lambda x, y: (x + y) % 3 == 0, lambda x, y: (x // 3 + y // 2) % 2 == 0,
         lambda x, y: x * y % 2 + x * y % 3 == 0, lambda x, y: (x * y % 2 + x * y % 3) % 2 == 0,
         lambda x, y: ((x + y) % 2 + x * y % 3) % 2 == 0]


def encode(text):
    data = text.encode("utf-8")
    ver = next((v for v in range(1, 7) if len(data) <= sum(n * d for n, d in EC[v][1]) - 2), None)
    if ver is None:
        raise ValueError("text too long for QR")
    cw = _codewords(data, ver)
    size = 17 + 4 * ver
    mod = [[0] * size for _ in range(size)]
    fn = [[False] * size for _ in range(size)]

    def put(x, y, v):
        mod[y][x] = 1 if v else 0
        fn[y][x] = True

    def finder(cx, cy):
        for dy in range(-4, 5):
            for dx in range(-4, 5):
                x, y = cx + dx, cy + dy
                if 0 <= x < size and 0 <= y < size:
                    d = max(abs(dx), abs(dy))
                    put(x, y, d not in (2, 4))

    finder(3, 3), finder(size - 4, 3), finder(3, size - 4)
    for i in range(size):
        if not fn[6][i]:
            put(i, 6, i % 2 == 0)
        if not fn[i][6]:
            put(6, i, i % 2 == 0)
    pos = ALIGN[ver]
    for cy in pos:
        for cx in pos:
            if (cx, cy) in ((6, 6), (6, pos[-1]), (pos[-1], 6)):
                continue
            for dy in range(-2, 3):
                for dx in range(-2, 3):
                    put(cx + dx, cy + dy, max(abs(dx), abs(dy)) != 1)
    for i in range(9):
        fn[8][i] = fn[i][8] = True
    for i in range(8):
        fn[8][size - 1 - i] = fn[size - 1 - i][8] = True
    put(8, size - 8, True)

    bits = [(c >> (7 - j)) & 1 for c in cw for j in range(8)]
    i = 0
    right = size - 1
    while right >= 1:
        if right == 6:
            right = 5
        for vert in range(size):
            for j in range(2):
                x = right - j
                y = size - 1 - vert if ((right + 1) & 2) == 0 else vert
                if not fn[y][x] and i < len(bits):
                    mod[y][x] = bits[i]
                    i += 1
        right -= 2

    def with_mask(k):
        m = [row[:] for row in mod]
        for y in range(size):
            for x in range(size):
                if not fn[y][x] and MASKS[k](x, y):
                    m[y][x] ^= 1
        d = k
        rem = d
        for _ in range(10):
            rem = (rem << 1) ^ ((rem >> 9) * 0x537)
        f = ((d << 10) | rem) ^ 0x5412

        def setf(x, y, b):
            m[y][x] = (f >> b) & 1
        for b in range(6):
            setf(8, b, b)
        setf(8, 7, 6), setf(8, 8, 7), setf(7, 8, 8)
        for b in range(9, 15):
            setf(14 - b, 8, b)
        for b in range(8):
            setf(size - 1 - b, 8, b)
        for b in range(8, 15):
            setf(8, size - 15 + b, b)
        m[size - 8][8] = 1
        return m

    return min((with_mask(k) for k in range(8)), key=_penalty)


def to_svg(text, fg="#12080f", bg="#f4e7d4", quiet=2):
    m = encode(text)
    n = len(m) + quiet * 2
    cells = "".join("M%d %dh1v1h-1z" % (x + quiet, y + quiet)
                    for y, row in enumerate(m) for x, v in enumerate(row) if v)
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" shape-rendering="crispEdges">'
            '<rect width="%d" height="%d" fill="%s"/><path d="%s" fill="%s"/></svg>') % (n, n, n, n, bg, cells, fg)

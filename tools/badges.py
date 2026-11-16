import sys
from pathlib import Path
from xml.sax.saxutils import escape

DARK = "1b1d22"
GREEN = "6fdc5f"
FONT = "Verdana,Geneva,DejaVu Sans,sans-serif"
SOCIAL_FONT = "Helvetica Neue,Helvetica,Arial,sans-serif"
STYLES = ["flat", "flat-square", "plastic", "for-the-badge", "social"]

REGULAR = [318, 401, 460, 838, 636, 950, 780, 275, 390, 390, 500, 838, 318, 361, 318, 337, 636, 636, 636, 636, 636, 636, 636, 636, 636, 636, 337, 337, 838, 838, 838, 531, 1000, 684, 686, 698, 770, 632, 575, 775, 752, 295, 295, 656, 557, 863, 748, 787, 603, 787, 695, 635, 611, 732, 684, 989, 685, 611, 685, 390, 337, 390, 838, 500, 500, 613, 635, 550, 635, 615, 352, 635, 634, 278, 278, 579, 278, 974, 634, 612, 635, 635, 411, 521, 392, 634, 592, 818, 592, 592, 525, 636, 337, 636, 838]
BOLD = [348, 456, 521, 838, 696, 1002, 872, 306, 457, 457, 523, 838, 380, 415, 380, 365, 696, 696, 696, 696, 696, 696, 696, 696, 696, 696, 400, 400, 838, 838, 838, 580, 1000, 774, 762, 734, 830, 683, 683, 821, 837, 372, 372, 775, 637, 995, 837, 850, 733, 850, 770, 720, 682, 812, 774, 1103, 771, 724, 725, 457, 365, 457, 838, 500, 500, 675, 716, 593, 716, 678, 435, 716, 712, 343, 343, 665, 343, 1042, 712, 687, 716, 716, 493, 595, 478, 712, 652, 924, 645, 652, 582, 712, 365, 712, 838]

HELVETICA_BOLD = [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584]

ICONS = {
    "c": "M16.5921 9.1962s-.354-3.298-3.627-3.39c-3.2741-.09-4.9552 2.474-4.9552 6.14 0 3.6651 1.858 6.5972 5.0451 6.5972 3.184 0 3.5381-3.665 3.5381-3.665l6.1041.365s.36 3.31-2.196 5.836c-2.552 2.5241-5.6901 2.9371-7.8762 2.9201-2.19-.017-5.2261.034-8.1602-2.97-2.938-3.0101-3.436-5.9302-3.436-8.8002 0-2.8701.556-6.6702 4.047-9.5502C7.444.72 9.849 0 12.254 0c10.0422 0 10.7172 9.2602 10.7172 9.2602z",
    "dotnet": "M24 8.77h-2.468v7.565h-1.425V8.77h-2.462V7.53H24zm-6.852 7.565h-4.821V7.53h4.63v1.24h-3.205v2.494h2.953v1.234h-2.953v2.604h3.396zm-6.708 0H8.882L4.78 9.863a2.896 2.896 0 0 1-.258-.51h-.036c.032.189.048.592.048 1.21v5.772H3.157V7.53h1.659l3.965 6.32c.167.261.275.442.323.54h.024c-.04-.233-.06-.629-.06-1.185V7.529h1.372zm-8.703-.693a.868.829 0 0 1-.869.829.868.829 0 0 1-.868-.83.868.829 0 0 1 .868-.828.868.829 0 0 1 .869.829Z",
    "python": "M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z",
    "openjdk": "M11.915 0 11.7.215C9.515 2.4 7.47 6.39 6.046 10.483c-1.064 1.024-3.633 2.81-3.711 3.551-.093.87 1.746 2.611 1.55 3.235-.198.625-1.304 1.408-1.014 1.939.1.188.823.011 1.277-.491a13.389 13.389 0 0 0-.017 2.14c.076.906.27 1.668.643 2.232.372.563.956.911 1.667.911.397 0 .727-.114 1.024-.264.298-.149.571-.33.91-.5.68-.34 1.634-.666 3.53-.604 1.903.062 2.872.39 3.559.704.687.314 1.15.664 1.925.664.767 0 1.395-.336 1.807-.9.412-.563.631-1.33.72-2.24.06-.623.055-1.32 0-2.066.454.45 1.117.604 1.213.424.29-.53-.816-1.314-1.013-1.937-.198-.624 1.642-2.366 1.549-3.236-.08-.748-2.707-2.568-3.748-3.586C16.428 6.374 14.308 2.394 12.13.215zm.175 6.038a2.95 2.95 0 0 1 2.943 2.942 2.95 2.95 0 0 1-2.943 2.943A2.95 2.95 0 0 1 9.148 8.98a2.95 2.95 0 0 1 2.942-2.942zM8.685 7.983a3.515 3.515 0 0 0-.145.997c0 1.951 1.6 3.55 3.55 3.55 1.95 0 3.55-1.598 3.55-3.55 0-.329-.046-.648-.132-.951.334.095.64.208.915.336a42.699 42.699 0 0 1 2.042 5.829c.678 2.545 1.01 4.92.846 6.607-.082.844-.29 1.51-.606 1.94-.315.431-.713.651-1.315.651-.593 0-.932-.27-1.673-.61-.741-.338-1.825-.694-3.792-.758-1.974-.064-3.073.293-3.821.669-.375.188-.659.373-.911.5s-.466.2-.752.2c-.53 0-.876-.209-1.16-.64-.285-.43-.474-1.101-.545-1.948-.141-1.693.176-4.069.823-6.614a43.155 43.155 0 0 1 1.934-5.783c.348-.167.749-.31 1.192-.425zm-3.382 4.362a.216.216 0 0 1 .13.031c-.166.56-.323 1.116-.463 1.665a33.849 33.849 0 0 0-.547 2.555 3.9 3.9 0 0 0-.2-.39c-.58-1.012-.914-1.642-1.16-2.08.315-.24 1.679-1.755 2.24-1.781zm13.394.01c.562.027 1.926 1.543 2.24 1.783-.246.438-.58 1.068-1.16 2.08a4.428 4.428 0 0 0-.163.309 32.354 32.354 0 0 0-.562-2.49 40.579 40.579 0 0 0-.482-1.652.216.216 0 0 1 .127-.03z",
    "godotengine": "M9.5598.683c-1.096.244-2.1812.5831-3.1983 1.0951.023.8981.081 1.7582.199 2.6323-.395.253-.81.47-1.178.766-.375.288-.7581.564-1.0971.9011-.6781-.448-1.3962-.869-2.1352-1.2411C1.3532 5.6934.608 6.6186 0 7.6546c.458.7411.936 1.4352 1.4521 2.0942h.014v6.3565c.012 0 .023 0 .035.003l3.8963.376c.204.02.364.184.378.3891l.12 1.7201 3.3994.242.234-1.587c.03-.206.207-.358.415-.358h4.1114c.208 0 .385.152.415.358l.234 1.587 3.3993-.242.12-1.72a.4196.4196 0 01.378-.3891l3.8954-.376c.012 0 .023-.003.035-.003v-.5071h.002V9.7498h.014c.516-.659.994-1.3531 1.4521-2.0942-.608-1.036-1.3541-1.9611-2.1512-2.8192-.739.372-1.4571.793-2.1352 1.2411-.339-.337-.721-.613-1.096-.901-.369-.296-.7841-.5131-1.1781-.7661.117-.8741.175-1.7342.199-2.6323-1.0171-.512-2.1012-.851-3.1983-1.095-.438.736-.838 1.533-1.1871 2.3121-.414-.069-.829-.094-1.2461-.099h-.016c-.417.005-.832.03-1.2461.099-.349-.779-.749-1.576-1.1881-2.3121l.001-.001zM6.4765 9.9889c1.2971 0 2.3492 1.0511 2.3492 2.3482s-1.052 2.3482-2.3492 2.3482c-1.296 0-2.3482-1.051-2.3482-2.3482 0-1.297 1.0511-2.3482 2.3482-2.3482zm11.049 0c1.296 0 2.3482 1.0511 2.3482 2.3482s-1.0511 2.3482-2.3482 2.3482-2.3492-1.051-2.3492-2.3482c0-1.297 1.051-2.3482 2.3492-2.3482zm-10.824.9301c-.861 0-1.559.698-1.559 1.5591s.698 1.5582 1.559 1.5582c.8611 0 1.5592-.698 1.5592-1.5582 0-.86-.697-1.559-1.5591-1.559zm10.598 0c-.8611 0-1.5582.698-1.5582 1.5591s.697 1.5582 1.5581 1.5582c.8611 0 1.5592-.698 1.5592-1.5582 0-.86-.697-1.559-1.5592-1.559zm-5.2985.453c.417 0 .757.308.757.6871v2.1622c0 .379-.339.687-.757.687s-.756-.308-.756-.687V12.059c0-.379.339-.687.756-.687zM1.4601 16.9464c.002.377.006.789.006.871 0 3.7014 4.6944 5.4795 10.5269 5.5005h.014c5.8325-.02 10.5259-1.7991 10.5259-5.5004 0-.084.005-.495.007-.871l-3.5023.338-.121 1.729a.421.421 0 01-.389.3901l-4.1814.296a.4203.4203 0 01-.415-.358l-.238-1.6141h-3.3863l-.238 1.6141a.4192.4192 0 01-.4451.357l-4.1513-.296c-.208-.015-.375-.181-.389-.389l-.12-1.7292-3.5044-.337z",
}

BADGES = [
    ("made-with-goome", "made with", "goome", GREEN, DARK, "flat-square", None),
] + [
    (f"made-with-goome-{style}", "made with", "goome", GREEN, DARK, style, None)
    for style in STYLES
] + [
    ("c99", "", "C99", GREEN, GREEN, "flat-square", "c"),
    ("vscode-190", "VS Code", "1.90+", GREEN, GREEN, "flat-square", None),
    ("jetbrains-2024-3", "JetBrains", "2024.3+", GREEN, GREEN, "flat-square", None),
    ("langs-c-csharp-python-java", "", "C \u00b7 C# \u00b7 Python \u00b7 Java", DARK, GREEN, "flat-square", None),
    ("license-gpl-3", "license", "GPL-3.0", DARK, GREEN, "flat-square", None),
    ("c", "", "C", GREEN, GREEN, "flat-square", "c"),
    ("csharp-net8-netstandard21", "C#", ".NET 8+ | netstandard2.1", GREEN, GREEN, "flat-square", "dotnet"),
    ("csharp-net8-plus", "C#", ".NET 8+", GREEN, GREEN, "flat-square", "dotnet"),
    ("csharp-net8", "C#", ".NET 8", DARK, GREEN, "flat-square", None),
    ("python-38", "Python", "3.8+", GREEN, GREEN, "flat-square", "python"),
    ("java-17", "Java", "17+", GREEN, GREEN, "flat-square", "openjdk"),
    ("java-22", "Java", "22+", GREEN, GREEN, "flat-square", "openjdk"),
    ("godot-44", "Godot", "4.4+", GREEN, GREEN, "flat-square", "godotengine"),
    ("one-file-goome-h", "one file", "goome.h", DARK, GREEN, "flat-square", None),
    ("one-file-goome-py", "one file", "goome.py", DARK, GREEN, "flat-square", None),
    ("ctypes-no-deps", "ctypes", "no deps", DARK, GREEN, "flat-square", None),
    ("no-jni-glue", "no JNI glue", "FFM + LWJGL", DARK, GREEN, "flat-square", None),
    ("gdextension-plain-c", "GDExtension", "plain C", DARK, GREEN, "flat-square", None),
    ("docs-site", "docs", "goome-ui.github.io/docs", DARK, GREEN, "flat-square", None),
    ("template-use-me", "template", "use me", DARK, GREEN, "flat-square", None),
    ("dependencies-none", "dependencies", "none", DARK, GREEN, "flat-square", None),
    ("ui-kit-built-in", "UI kit", "built in", DARK, GREEN, "flat-square", None),
    ("members-only", "members", "only", DARK, GREEN, "flat-square", None),
    ("prs-go-to-dev", "PRs go to", "dev", DARK, GREEN, "flat-square", None),
    ("2fa-required", "2FA", "required", DARK, GREEN, "flat-square", None),
] + [
    (f"join-{team}", "join", team, GREEN, DARK, "for-the-badge", None)
    for team in ["c", "csharp", "python", "java", "godot", "docs", "maintainers"]
]

GRADIENTS = {
    "flat": '<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/>'
            '<stop offset="1" stop-opacity=".1"/></linearGradient>',
    "plastic": '<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#fff" stop-opacity=".7"/>'
               '<stop offset=".1" stop-color="#aaa" stop-opacity=".1"/><stop offset=".9" stop-color="#000" stop-opacity=".3"/>'
               '<stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>',
}


def text_width(text, size, table=REGULAR):
    total = 0
    for ch in text:
        code = ord(ch)
        total += table[code - 32] if 32 <= code < 127 else 640
    return total * size / 1000


def ink(color):
    r, g, b = (int(color[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return DARK if 0.299 * r + 0.587 * g + 0.114 * b > 0.5 else "fff"


def logo_svg(name, x, y, color):
    return (f'<path transform="translate({x} {y}) scale(0.58333)" fill="#{color}" '
            f'd="{ICONS[name]}"/>')


def text_svg(text, center, baseline, width, color, extra=""):
    return (f'<text x="{center:g}" y="{baseline:g}" fill="#{color}"{extra} '
            f'textLength="{width:g}">{escape(text)}</text>')


def wrap(width, height, title, body):
    title = escape(title)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width:g}" height="{height}" '
            f'role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n')


def render_social(label, message, logo):
    label = label[:1].upper() + label[1:]
    label_w = round(text_width(label, 11, HELVETICA_BOLD), 1)
    message_w = round(text_width(message, 11, HELVETICA_BOLD), 1)
    logo_w = 14 + (3 if label else 0) if logo else 0
    box = round(label_w + logo_w + 10)
    bubble = round(message_w + 8) if message else 0
    main_x = box + 6.5
    width = box + 1 + (bubble + 6 if message else 0)
    body = ('<linearGradient id="a" x2="0" y2="100%"><stop offset="0" stop-color="#fcfcfc" stop-opacity="0"/>'
            '<stop offset="1" stop-opacity=".1"/></linearGradient>'
            f'<g stroke="#d5d5d5"><rect stroke="none" fill="#fcfcfc" x=".5" y=".5" width="{box}" height="19" rx="2"/>')
    if message:
        body += (f'<rect x="{main_x:g}" y=".5" width="{bubble}" height="19" rx="2" fill="#fafafa"/>'
                 f'<rect x="{box + 6}" y="7.5" width=".5" height="5" stroke="#fafafa"/>'
                 f'<path d="M{main_x:g} 6.5l-3 3v1l3 3" fill="#fafafa"/>')
    body += (f'</g><rect stroke="#d5d5d5" fill="url(#a)" x=".5" y=".5" width="{box}" height="19" rx="2"/>'
             f'<g fill="#333" text-anchor="middle" font-family="{SOCIAL_FONT}" text-rendering="geometricPrecision" '
             'font-weight="700" font-size="11">')
    if logo:
        body += logo_svg(logo, 5, 3, "333")
    if label:
        center = 5.5 + logo_w + label_w / 2
        body += text_svg(label, center, 15, label_w, "fff", ' aria-hidden="true"')
        body += text_svg(label, center, 14, label_w, "333")
    if message:
        center = main_x + bubble / 2
        body += text_svg(message, center, 15, message_w, "fff", ' aria-hidden="true"')
        body += text_svg(message, center, 14, message_w, "333")
    body += "</g>"
    return wrap(width, 20, f"{label}: {message}" if label else message, body)


def render(label, message, color, label_color, style, logo):
    if style == "social":
        return render_social(label, message, logo)
    big = style == "for-the-badge"
    if big:
        label, message = label.upper(), message.upper()
        size, height, pad, baseline, spacing, gap, logo_x = 10, 28, 12, 17.5, 1.25, 6, 9
    elif style == "plastic":
        size, height, pad, baseline, spacing, gap, logo_x = 11, 18, 5, 13, 0, 3, 5
    else:
        size, height, pad, baseline, spacing, gap, logo_x = 11, 20, 5, 14, 0, 3, 5

    def measure(text, bold):
        return round(text_width(text, size, BOLD if bold else REGULAR) + spacing * max(len(text) - 1, 0), 1)

    label_w = measure(label, False) if label else 0
    message_w = measure(message, big)
    logo_w = 14 if logo else 0

    if label:
        left = round(pad * 2 + logo_w + (gap if logo else 0) + label_w)
    elif logo:
        left = round(logo_x + logo_w + pad - 2)
    else:
        left = 0
    right = round(pad * 2 + message_w)
    width = left + right

    shapes = []
    if left:
        shapes.append(f'<rect width="{left}" height="{height}" fill="#{label_color}"/>')
    shapes.append(f'<rect x="{left}" width="{right}" height="{height}" fill="#{color}"/>')

    shadow = style in GRADIENTS
    if shadow:
        radius = 4 if style == "plastic" else 3
        shapes.append(f'<rect width="{width}" height="{height}" fill="url(#s)"/>')
        body = (GRADIENTS[style] + f'<clipPath id="r"><rect width="{width}" height="{height}" rx="{radius}" fill="#fff"/></clipPath>'
                f'<g clip-path="url(#r)">{"".join(shapes)}</g>')
    else:
        body = f'<g shape-rendering="crispEdges">{"".join(shapes)}</g>'

    def text(value, center, value_w, bg, bold):
        fg = ink(bg)
        extra = ' font-weight="bold"' if bold else ""
        out = ""
        if shadow:
            shade = "010101" if fg == "fff" else "ccc"
            out += text_svg(value, center, baseline + 1, value_w, shade, f' fill-opacity=".3" aria-hidden="true"{extra}')
        return out + text_svg(value, center, baseline, value_w, fg, extra)

    body += f'<g font-family="{FONT}" font-size="{size}" text-anchor="middle" text-rendering="geometricPrecision">'
    if logo:
        body += logo_svg(logo, logo_x, (height - 14) // 2, ink(label_color))
    if label:
        start = logo_x + logo_w + gap if logo else pad
        body += text(label, start + label_w / 2, label_w, label_color, False)
    body += text(message, left + right / 2, message_w, color, big)
    body += "</g>"
    return wrap(width, height, f"{label}: {message}" if label else message, body)


def main():
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "assets" / "badges"
    out.mkdir(parents=True, exist_ok=True)
    for name, label, message, color, label_color, style, logo in BADGES:
        (out / f"{name}.svg").write_text(render(label, message, color, label_color, style, logo))
    print(f"{len(BADGES)} badges in {out}")


if __name__ == "__main__":
    main()

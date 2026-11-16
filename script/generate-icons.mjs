// Generates every app icon from app/static/logos/logo.svg.
//
// Renders with the Edge or Chrome installed on the machine, through Playwright.
// Assets.car for macOS 26 can only be compiled on a Mac, see
// script/compile-macos-icons.sh.

import { chromium } from 'playwright'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const staticRoot = join(root, 'app', 'static')
const logos = join(staticRoot, 'logos')
const logo = readFileSync(join(logos, 'logo.svg'), 'utf8')

const ProdColor = '#1F6F5B'
const channels = { prod: ProdColor, dev: '#B06010' }

const IcoSizes = [16, 24, 32, 48, 64, 128, 256]
const IcnsTypes = [
  ['icp4', 16],
  ['icp5', 32],
  ['icp6', 64],
  ['ic07', 128],
  ['ic08', 256],
  ['ic09', 512],
  ['ic10', 1024],
  ['ic11', 32],
  ['ic12', 64],
  ['ic13', 256],
  ['ic14', 512],
]

/** The logo with the background of a release channel. */
const logoFor = color => logo.replaceAll(ProdColor, color)

/** The white fork on its own, on the 1024 canvas of Icon Composer. */
const glyph = logo
  .replace(/<rect[^>]*\/>\s*/, '')
  .replace(/<!--[\s\S]*?-->\s*/, '')
  .replace(/width="256" height="256"/, 'width="1024" height="1024"')

async function launch() {
  for (const channel of ['msedge', 'chrome']) {
    try {
      return await chromium.launch({ channel })
    } catch {}
  }
  return chromium.launch()
}

/**
 * Render an SVG to a PNG of the given size, leaving `inset` pixels of
 * transparent space around it.
 */
async function render(page, svg, size, inset = 0) {
  const inner = size - 2 * inset
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(
    `<body style="margin:0;background:transparent"><img src="${src}" style="position:absolute;left:${inset}px;top:${inset}px;width:${inner}px;height:${inner}px"></body>`
  )
  await page.locator('img').evaluate(img => img.decode())
  return page.screenshot({
    omitBackground: true,
    clip: { x: 0, y: 0, width: size, height: size },
  })
}

function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach(({ size, png }, i) => {
    const entry = 6 + 16 * i
    header.writeUInt8(size >= 256 ? 0 : size, entry)
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1)
    header.writeUInt16LE(1, entry + 4)
    header.writeUInt16LE(32, entry + 6)
    header.writeUInt32LE(png.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += png.length
  })
  return Buffer.concat([header, ...images.map(i => i.png)])
}

function icns(entries) {
  const chunks = entries.map(({ type, png }) => {
    const head = Buffer.alloc(8)
    head.write(type, 0, 'ascii')
    head.writeUInt32BE(png.length + 8, 4)
    return Buffer.concat([head, png])
  })
  const head = Buffer.alloc(8)
  head.write('icns', 0, 'ascii')
  head.writeUInt32BE(8 + chunks.reduce((n, c) => n + c.length, 0), 4)
  return Buffer.concat([head, ...chunks])
}

/** An Icon Composer document: a solid background with the fork on top. */
function iconComposerDocument(color) {
  const [r, g, b] = [1, 3, 5].map(i =>
    (parseInt(color.slice(i, i + 2), 16) / 255).toFixed(5)
  )
  const white = { solid: 'srgb:1.00000,1.00000,1.00000,1.00000' }
  return {
    fill: { solid: `srgb:${r},${g},${b},1.00000` },
    groups: [
      {
        layers: [
          {
            'fill-specializations': [
              { value: white },
              { appearance: 'dark', value: white },
            ],
            'image-name': 'fork.svg',
            name: 'fork',
          },
        ],
        name: 'foreground',
        shadow: { kind: 'neutral', opacity: 0.5 },
        translucency: { enabled: true, value: 0.5 },
      },
    ],
    'supported-platforms': { squares: 'shared' },
  }
}

const browser = await launch()
const page = await browser.newPage()

for (const [channel, color] of Object.entries(channels)) {
  const svg = logoFor(color)
  const dir = join(logos, channel)

  const icoImages = []
  for (const size of IcoSizes) {
    icoImages.push({ size, png: await render(page, svg, size) })
  }
  writeFileSync(join(dir, 'icon-logo.ico'), ico(icoImages))

  // macOS icons leave a margin around the shape, 100 of 1024 on each side.
  const icnsEntries = []
  for (const [type, size] of IcnsTypes) {
    const inset = Math.round((size * 100) / 1024)
    icnsEntries.push({ type, png: await render(page, svg, size, inset) })
  }
  writeFileSync(join(dir, 'icon-logo-legacy.icns'), icns(icnsEntries))

  const document = join(dir, 'icon-logo.icon')
  rmSync(document, { recursive: true, force: true })
  mkdirSync(join(document, 'Assets'), { recursive: true })
  writeFileSync(join(document, 'Assets', 'fork.svg'), glyph)
  writeFileSync(
    join(document, 'icon.json'),
    JSON.stringify(iconComposerDocument(color), null, 2) + '\n'
  )

  console.log(`Wrote the ${channel} icons`)
}

const prod = logoFor(ProdColor)
for (const path of ['logo-64x64@2x.png', 'windows-logo-64x64@2x.png']) {
  writeFileSync(join(staticRoot, 'common', path), await render(page, prod, 128))
}
writeFileSync(
  join(staticRoot, 'linux', 'icon-logo.png'),
  await render(page, prod, 512)
)
console.log('Wrote the app and Linux icons')

await browser.close()

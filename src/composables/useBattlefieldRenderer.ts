import { Assets, Container, Sprite, type Application, type Texture } from 'pixi.js'
import { ref, watch, type Ref } from 'vue'

import grassTopUrl from '@/assets/tilemaps/tile-grass-top.svg'
import riserUrl from '@/assets/tilemaps/tile-riser.svg'
import waterTopUrl from '@/assets/tilemaps/tile-water-top.svg'
import type { BattlefieldGrid } from '@/model/battlefieldGrid'
import { gridToScreen, HEIGHT_STEP, TILE_WIDTH } from '@/utils/isometricProjection'

const HALF_WIDTH = TILE_WIDTH / 2

type TileTextures = {
  grassTop: Texture
  waterTop: Texture
  riser: Texture
}

function createTopFaceSprite(height: number, textures: TileTextures): Sprite {
  const sprite = new Sprite(height <= 0 ? textures.waterTop : textures.grassTop)
  sprite.anchor.set(0.5)
  return sprite
}

// The riser art is authored for the south-facing cliff edge; the east face reuses the same
// texture mirrored horizontally, per the graphic-designer's design report.
function createRiserSprite(face: 'south' | 'east', step: number, textures: TileTextures): Sprite {
  const sprite = new Sprite(textures.riser)
  const y = step * HEIGHT_STEP

  if (face === 'south') {
    sprite.position.set(-HALF_WIDTH, y)
    return sprite
  }

  sprite.scale.x = -1
  sprite.position.set(HALF_WIDTH, y)
  return sprite
}

function buildCell(
  grid: BattlefieldGrid,
  row: number,
  col: number,
  textures: TileTextures,
): Container {
  const height = grid.getHeightAt(row, col)
  const cell = new Container()
  cell.zIndex = row + col

  const southDrop = grid.isInBounds(row + 1, col)
    ? Math.max(0, height - grid.getHeightAt(row + 1, col))
    : 0
  const eastDrop = grid.isInBounds(row, col + 1)
    ? Math.max(0, height - grid.getHeightAt(row, col + 1))
    : 0

  for (let step = 0; step < southDrop; step++) {
    cell.addChild(createRiserSprite('south', step, textures))
  }

  for (let step = 0; step < eastDrop; step++) {
    cell.addChild(createRiserSprite('east', step, textures))
  }

  cell.addChild(createTopFaceSprite(height, textures))

  const { x, y } = gridToScreen(row, col, height)
  cell.position.set(x, y)

  return cell
}

async function buildBattlefield(
  instance: Application,
  grid: BattlefieldGrid,
  worldContainer: Ref<Container | null>,
) {
  const [grassTop, waterTop, riser] = await Promise.all([
    Assets.load(grassTopUrl),
    Assets.load(waterTopUrl),
    Assets.load(riserUrl),
  ])
  const textures: TileTextures = { grassTop, waterTop, riser }

  const world = new Container({ sortableChildren: true })

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      world.addChild(buildCell(grid, row, col, textures))
    }
  }

  instance.stage.addChild(world)
  worldContainer.value = world

  // The tilemap is built after an async texture load, which can otherwise leave the
  // canvas showing a stale pre-build frame until the next ticker-driven render happens
  // to coincide with one; render immediately so the battlefield appears without delay.
  instance.render()
}

/**
 * Builds the static battlefield tilemap from a BattlefieldGrid and adds it to the Pixi
 * stage once the Application is ready. Each cell renders as its own Container (stacked
 * risers plus a top-face tile), added to one "world" Container sorted back-to-front by
 * `row + col` so farther cells paint before nearer ones.
 */
export function useBattlefieldRenderer(app: Ref<Application | null>, grid: BattlefieldGrid) {
  const worldContainer = ref<Container | null>(null) as Ref<Container | null>

  watch(
    app,
    (instance) => {
      if (!instance) return

      void buildBattlefield(instance, grid, worldContainer)
    },
    { immediate: true },
  )

  return { worldContainer }
}

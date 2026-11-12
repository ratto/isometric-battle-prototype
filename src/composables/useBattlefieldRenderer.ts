import { Container, Graphics, type Application } from 'pixi.js'
import { ref, watch, type Ref } from 'vue'

import type { BattlefieldGrid } from '@/model/battlefieldGrid'
import { gridToScreen, HEIGHT_STEP, TILE_HEIGHT, TILE_WIDTH } from '@/utils/isometricProjection'

const WATER_TOP_COLOR = 0x3a6ea5
const GRASS_TOP_COLOR = 0x4a7c3c
const SOUTH_RISER_COLOR = 0x3f3226
const EAST_RISER_COLOR = 0x4f3f2f

const HALF_WIDTH = TILE_WIDTH / 2
const HALF_HEIGHT = TILE_HEIGHT / 2

function createTopFaceTile(height: number): Graphics {
  const color = height <= 0 ? WATER_TOP_COLOR : GRASS_TOP_COLOR

  return new Graphics()
    .poly([0, -HALF_HEIGHT, HALF_WIDTH, 0, 0, HALF_HEIGHT, -HALF_WIDTH, 0])
    .fill({ color })
}

// A riser is one height unit (`HEIGHT_STEP` px tall) of cliff face, extruded straight down
// in screen space from a tile's south or east edge toward a lower neighbor.
function createRiserTile(face: 'south' | 'east'): Graphics {
  const graphic = new Graphics()

  if (face === 'south') {
    graphic
      .poly([
        -HALF_WIDTH,
        0,
        0,
        HALF_HEIGHT,
        0,
        HALF_HEIGHT + HEIGHT_STEP,
        -HALF_WIDTH,
        HEIGHT_STEP,
      ])
      .fill({ color: SOUTH_RISER_COLOR })
    return graphic
  }

  graphic
    .poly([0, HALF_HEIGHT, HALF_WIDTH, 0, HALF_WIDTH, HEIGHT_STEP, 0, HALF_HEIGHT + HEIGHT_STEP])
    .fill({ color: EAST_RISER_COLOR })
  return graphic
}

function buildCell(grid: BattlefieldGrid, row: number, col: number): Container {
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
    const riser = createRiserTile('south')
    riser.position.set(0, step * HEIGHT_STEP)
    cell.addChild(riser)
  }

  for (let step = 0; step < eastDrop; step++) {
    const riser = createRiserTile('east')
    riser.position.set(0, step * HEIGHT_STEP)
    cell.addChild(riser)
  }

  cell.addChild(createTopFaceTile(height))

  const { x, y } = gridToScreen(row, col, height)
  cell.position.set(x, y)

  return cell
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

      const world = new Container({ sortableChildren: true })

      for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {
          world.addChild(buildCell(grid, row, col))
        }
      }

      instance.stage.addChild(world)
      worldContainer.value = world
    },
    { immediate: true },
  )

  return { worldContainer }
}

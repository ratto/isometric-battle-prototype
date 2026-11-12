export const TILE_WIDTH = 64
export const TILE_HEIGHT = 32
export const HEIGHT_STEP = 16

export type ScreenPosition = {
  x: number
  y: number
}

/**
 * Projects a grid cell (row, col, height) onto screen-space pixel coordinates for a
 * standard 2:1 isometric diamond grid. Increasing `col` moves right-and-down on screen,
 * increasing `row` moves left-and-down; increasing `height` moves the cell up on screen.
 */
export function gridToScreen(row: number, col: number, height: number): ScreenPosition {
  return {
    x: (col - row) * (TILE_WIDTH / 2),
    y: (col + row) * (TILE_HEIGHT / 2) - height * HEIGHT_STEP,
  }
}

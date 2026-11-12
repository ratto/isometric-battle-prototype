export class BattlefieldGrid {
  private readonly heights: readonly (readonly number[])[]

  constructor(heights: readonly (readonly number[])[]) {
    if (heights.length === 0 || heights[0].length === 0) {
      throw new Error('BattlefieldGrid requires a non-empty height matrix')
    }

    this.heights = heights
  }

  get rows(): number {
    return this.heights.length
  }

  get cols(): number {
    return this.heights[0].length
  }

  isInBounds(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols
  }

  getHeightAt(row: number, col: number): number {
    return this.heights[row][col]
  }
}

// Transcribed from docs/heightmap-grid-24x24.md: +0 is water level, positive values are
// elevations (hills/ramps going up), negative values are depressions (ramps going down).
const FOREST_CLEARING_HEIGHTMAP: readonly (readonly number[])[] = [
  [2, 2, 1, 0, -1, -2, -2, -2, -2, -2, -1, 0, 1, 2, 3, 3, 4, 4, 3, 3, 3, 2, 2, 1],
  [2, 2, 1, 0, -1, -1, -2, -2, -2, -1, 0, 1, 2, 3, 3, 4, 4, 3, 3, 3, 2, 2, 1, 1],
  [2, 2, 1, 0, -1, -1, -2, -1, -1, 0, 1, 1, 2, 3, 3, 4, 4, 3, 3, 3, 2, 2, 1, 1],
  [2, 2, 1, 0, -1, -1, -1, -1, -1, 0, 1, 2, 3, 3, 3, 4, 4, 3, 3, 2, 2, 1, 1, 1],
  [3, 2, 1, 0, -1, -1, -1, -1, 0, 0, 1, 2, 3, 3, 4, 4, 3, 3, 3, 2, 1, 1, 1, 1],
  [3, 2, 1, 0, -1, -1, -1, -1, 0, 1, 1, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1, 1, 1, 1],
  [3, 2, 1, 0, -1, -1, -1, 0, 0, 1, 2, 2, 3, 4, 4, 4, 3, 3, 2, 2, 1, 1, 1, 1],
  [2, 1, 1, 0, -1, -1, -1, 0, 0, 1, 2, 3, 3, 4, 4, 4, 3, 3, 2, 1, 1, 1, 1, 1],
  [2, 1, 0, 0, -1, -1, -1, 0, 1, 1, 2, 3, 4, 4, 4, 4, 3, 2, 2, 1, 1, 1, 1, 1],
  [2, 1, 0, -1, -1, -1, -1, 0, 1, 2, 3, 4, 4, 4, 4, 4, 3, 2, 1, 1, 0, 0, 1, 1],
  [1, 0, 0, -1, -1, -1, 0, 0, 1, 3, 3, 4, 5, 4, 4, 3, 2, 2, 1, 0, 0, 0, 0, 0],
  [1, 0, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 5, 4, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  [1, 0, -1, -1, -1, 0, 0, 2, 3, 4, 5, 5, 5, 4, 3, 2, 1, 0, 0, -1, -1, -1, 0, 0],
  [0, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 5, 5, 4, 3, 2, 1, 0, -1, -1, -1, -1, -1, -1],
  [0, -1, -1, -1, 0, 1, 2, 3, 4, 5, 5, 5, 4, 3, 2, 1, 0, -1, -1, -1, -1, -1, -1, -1],
  [0, -1, -1, -1, 0, 1, 2, 4, 4, 5, 5, 4, 3, 2, 1, 0, -1, -2, -2, -2, -2, -2, -2, -2],
  [0, -1, -1, 0, 1, 2, 3, 4, 5, 5, 4, 4, 2, 1, 0, -1, -2, -2, -2, -2, -2, -2, -2, -2],
  [0, -1, 0, 0, 1, 2, 3, 4, 4, 4, 4, 3, 1, 0, -1, -2, -2, -3, -3, -2, -2, -2, -2, -1],
  [0, 0, 0, 1, 2, 3, 4, 4, 4, 4, 3, 2, 0, -1, -2, -2, -3, -3, -3, -2, -2, -2, -1, -1],
  [0, 0, 0, 1, 2, 3, 4, 4, 3, 3, 2, 1, 0, -2, -2, -3, -3, -3, -3, -2, -2, -1, 0, 0],
  [0, 0, 0, 1, 2, 3, 3, 3, 3, 2, 1, 0, -1, -2, -3, -3, -3, -3, -2, -2, -1, 0, 1, 2],
  [0, 0, 0, 1, 2, 3, 3, 2, 2, 1, 0, -1, -2, -2, -3, -3, -3, -2, -2, -1, 0, 1, 2, 3],
  [-1, 0, 0, 1, 2, 2, 2, 2, 1, 0, -1, -1, -2, -3, -3, -3, -2, -2, -1, 0, 1, 2, 3, 4],
  [-1, 0, 0, 1, 1, 2, 2, 1, 1, 0, -1, -2, -2, -2, -2, -2, -2, -1, 0, 1, 2, 3, 4, 5],
]

export const forestClearingGrid = new BattlefieldGrid(FOREST_CLEARING_HEIGHTMAP)

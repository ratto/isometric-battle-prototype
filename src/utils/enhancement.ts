export type EnhancementPolarity = 'positive' | 'negative'

export interface Enhancement {
  id: string
  name: string
  groupKey: string
  polarity: EnhancementPolarity
  cost: number
  effect: string
}

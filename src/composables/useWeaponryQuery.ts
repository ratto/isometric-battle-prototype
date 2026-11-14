import { ref, type Ref } from 'vue'

import type { Weapon } from '@/utils/weapon'
import { loadWeaponryDatabase, queryAllWeapons } from '@/utils/weaponryDatabase'

let cachedWeapons: Weapon[] | undefined
let loadPromise: Promise<Weapon[]> | undefined

function loadWeapons(): Promise<Weapon[]> {
  if (cachedWeapons) return Promise.resolve(cachedWeapons)
  if (!loadPromise) {
    loadPromise = loadWeaponryDatabase().then((db) => {
      cachedWeapons = queryAllWeapons(db)
      return cachedWeapons
    })
  }
  return loadPromise
}

export interface UseWeaponryQueryResult {
  weapons: Ref<Weapon[]>
  loading: Ref<boolean>
  error: Ref<unknown>
}

/**
 * Loads sql.js + the seeded game-data.sqlite file in the browser (once per page
 * session, cached at module scope) and exposes every WEAPONRY row reactively.
 */
export function useWeaponryQuery(): UseWeaponryQueryResult {
  const weapons = ref<Weapon[]>(cachedWeapons ?? [])
  const loading = ref(cachedWeapons === undefined)
  const error = ref<unknown>(null)

  if (cachedWeapons === undefined) {
    loadWeapons()
      .then((loadedWeapons) => {
        weapons.value = loadedWeapons
      })
      .catch((caughtError: unknown) => {
        error.value = caughtError
      })
      .finally(() => {
        loading.value = false
      })
  }

  return { weapons, loading, error }
}

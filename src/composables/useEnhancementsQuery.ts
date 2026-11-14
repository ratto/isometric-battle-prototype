import { ref, type Ref } from 'vue'

import type { Enhancement } from '@/utils/enhancement'
import { queryAllEnhancements } from '@/utils/enhancementDatabase'
import { loadGameDatabase } from '@/utils/sqliteDatabase'

let cachedEnhancements: Enhancement[] | undefined
let loadPromise: Promise<Enhancement[]> | undefined

function loadEnhancements(): Promise<Enhancement[]> {
  if (cachedEnhancements) return Promise.resolve(cachedEnhancements)
  if (!loadPromise) {
    loadPromise = loadGameDatabase().then((db) => {
      cachedEnhancements = queryAllEnhancements(db)
      return cachedEnhancements
    })
  }
  return loadPromise
}

export interface UseEnhancementsQueryResult {
  enhancements: Ref<Enhancement[]>
  loading: Ref<boolean>
  error: Ref<unknown>
}

/**
 * Loads sql.js + the seeded game-data.sqlite file in the browser (once per page
 * session, cached at module scope) and exposes every ENHANCEMENTS row reactively.
 */
export function useEnhancementsQuery(): UseEnhancementsQueryResult {
  const enhancements = ref<Enhancement[]>(cachedEnhancements ?? [])
  const loading = ref(cachedEnhancements === undefined)
  const error = ref<unknown>(null)

  if (cachedEnhancements === undefined) {
    loadEnhancements()
      .then((loadedEnhancements) => {
        enhancements.value = loadedEnhancements
      })
      .catch((caughtError: unknown) => {
        error.value = caughtError
      })
      .finally(() => {
        loading.value = false
      })
  }

  return { enhancements, loading, error }
}

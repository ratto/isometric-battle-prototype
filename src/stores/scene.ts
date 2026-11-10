import { ref } from 'vue'
import { defineStore } from 'pinia'

export type AppScene = 'initial-menu' | 'battle'

export const useSceneStore = defineStore('scene', () => {
  const activeScene = ref<AppScene>('initial-menu')

  function setActiveScene(scene: AppScene) {
    activeScene.value = scene
  }

  return { activeScene, setActiveScene }
})

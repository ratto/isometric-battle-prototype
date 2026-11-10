<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue'
import gsap from 'gsap'

const titleRef = useTemplateRef('titleRef')
let pulseTween: gsap.core.Tween | undefined

onMounted(() => {
  pulseTween = gsap.to(titleRef.value, {
    scale: 1.06,
    duration: 1.25,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  })
})

onUnmounted(() => {
  pulseTween?.kill()
})
</script>

<template>
  <h1 ref="titleRef" class="text-2xl tracking-widest text-slate-100 uppercase">
    Turn Based Prototype
  </h1>
</template>

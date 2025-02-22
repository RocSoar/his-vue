<script setup lang="ts">
import {computed} from 'vue'

const props = defineProps({
  prefix: {
    type: String,
    default: 'icon'
  },
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: '1em',
  },
  color: {
    type: String,
    default: 'currentColor',
  },
  className: {
    type: String,
    default: '',
  },
})

const symbolId = computed(() => `#${props.prefix}-${props.name}`)

const svgClass = computed(() =>
    props.className ? `svg-icon ${props.className}` : 'svg-icon');
</script>

<template>
  <svg aria-hidden="true" :class="svgClass" :style="{ width: size, height: size }">
    <use :xlink:href="symbolId" :fill="color"/>
  </svg>
</template>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
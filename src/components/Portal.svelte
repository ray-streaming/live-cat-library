<script lang="ts">
  import Viewport from 'svelte-viewport-info'
  import { windowOrientation } from '../store'
  import { onMount } from 'svelte'

  export let host: HTMLElement

  let rootRef: HTMLDivElement
  const handlerOrientation = () => {
    Viewport.Orientation && windowOrientation.set(Viewport.Orientation)
  }
  handlerOrientation()

  onMount(() => {
    const resizeObserver = new ResizeObserver(() => {
      rootRef.style.width = `${host.clientWidth}px`
      rootRef.style.height = `${host.clientHeight}px`
    })
    resizeObserver.observe(host)
    return () => resizeObserver.unobserve(host)
  })
</script>

<svelte:window on:orientationchangeend={() => handlerOrientation()} />
<div id="live-cat-library" bind:this={rootRef}>
  <slot />
</div>

<style>
  :global(#live-cat-library *, #live-cat-library *:before, #live-cat-library *:after) {
    box-sizing: border-box;
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
  }
  #live-cat-library {
    font-family: 'Source Han Sans CN', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
      'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji',
      'Segoe UI Emoji', 'Segoe UI Symbol';
    text-rendering: optimizeLegibility;
    -ms-overflow-style: scrollbar;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 99999;
    background-color: black;
    transform-origin: top left;
  }
</style>

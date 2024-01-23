<script lang="ts">
  import { onMount } from 'svelte'

  export let x = 0
  export let y = 0

  let dragging = false
  let offsetX = 0
  let offsetY = 0
  let node: HTMLDivElement
  const mousemoveHandler = (event: MouseEvent) => {
    if (dragging) {
      x = event.clientX - offsetX
      y = event.clientY - offsetY
    }
  }

  const mouseupHandler = () => {
    dragging = false
  }

  onMount(() => {
    node.addEventListener('mousedown', (event: MouseEvent) => {
      dragging = true
      offsetX = event.clientX - x
      offsetY = event.clientY - y
    })

    document.addEventListener('mousemove', mousemoveHandler)
    document.addEventListener('mouseup', mouseupHandler)

    return () => {
      document.removeEventListener('mousemove', mousemoveHandler)
      document.removeEventListener('mouseup', mouseupHandler)
    }
  })
</script>

<div
  bind:this={node}
  style="position: absolute; top: {y}px; left: {x}px;
  cursor: {dragging ? 'grabbing' : 'grab'}; user-select: none;"
>
  <slot />
</div>

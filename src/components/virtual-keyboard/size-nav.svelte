<script lang="ts">
  import { onMount } from 'svelte'
  import type { KeyboardSizeType } from './virtual-keyboard'

  export let defaultSize: KeyboardSizeType
  export let changeKeyboardSize: (type: KeyboardSizeType) => void
  export let onRef: (ref: HTMLDivElement) => void
  let sizeNavRef: HTMLDivElement
  const keyboardSizeOption: { type: KeyboardSizeType; label: string }[] = [
    { type: 'large', label: '大' },
    { type: 'medium', label: '中' },
    { type: 'small', label: '小' },
  ]
  onMount(() => {
    onRef(sizeNavRef)
  })
</script>

<div class="size-nav" bind:this={sizeNavRef}>
  <div class="size-nav-tip">键盘大小:</div>
  {#each keyboardSizeOption as size}
    <span
      class="size-item"
      aria-hidden="true"
      class:active={defaultSize === size.type}
      on:click|stopPropagation={() => {
        defaultSize = size.type
        changeKeyboardSize(size.type)
      }}>{size.label}</span
    >
  {/each}
</div>

<style>
  .size-nav {
    border-radius: 5px;
    overflow: hidden;
    display: none;
    position: absolute;
    top: 5px;
    transform: translateX(-50%);
    left: 50%;
    background-color: #ececec;
  }
  .size-nav .size-nav-tip {
    padding: 5px 10px;
    font-size: 0.6em;
  }
  .size-nav .size-item {
    font-size: 0.6em;
    padding: 5px 10px;
  }
  .size-nav .size-item.active {
    background-color: #86c2ee;
    color: #fff;
  }
</style>

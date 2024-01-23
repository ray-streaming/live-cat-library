<svelte:options accessors={true} />
<script lang="ts">
  import { onMount } from 'svelte'
  import { keyboardSizeOption, type KeyboardSizeType } from './virtual-keyboard-config'

  export let width: number
  export let defaultSize: KeyboardSizeType
  export let changeKeyboardSize: (type: KeyboardSizeType) => void
  export let onRef: (ref: HTMLDivElement) => void
  let sizeNavRef: HTMLDivElement

  onMount(() => {
    onRef(sizeNavRef)
  })
</script>

<div class="simple-keyboard-size-nav" style="width:{width}px">
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
</div>

<style>
  .simple-keyboard-size-nav {
    position: absolute;
  }
  .size-nav {
    border-radius: 4px;
    overflow: hidden;
    display: none;
    position: absolute;
    top: 5px;
    transform: translateX(-50%);
    left: 50%;
    background-color: #e5ebf4;
    color: rgba(168, 173, 178, 1);
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
    background-color: rgba(41, 115, 199, 1);
    color: #fff;
  }
</style>

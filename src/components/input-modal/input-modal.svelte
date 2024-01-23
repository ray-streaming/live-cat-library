<script lang="ts">
  import { onMount } from 'svelte'
  import InputEnter from '../icons/input-enter.svelte'
  import InputCancel from '../icons/input-cancel.svelte'
  let inputRef: HTMLInputElement
  export let onTextInput: (text: string) => void
  export let onCancel: () => void
  function handleEnterText() {
    const text = inputRef.value
    if (text) {
      onTextInput(text)
      inputRef.value = ''
      inputRef.focus()
    }
  }
  onMount(() => {
    inputRef.focus()
  })
</script>

<div class="inputBoxContainer">
  <input
    class="inputBox"
    bind:this={inputRef}
    on:mousemove|stopPropagation
    on:keydown|stopPropagation
    on:keypress|stopPropagation={(e) => e.key === 'Enter' && handleEnterText()}
  />
  <div class="buttonWrap">
    <div aria-hidden="true" class="button enter" on:click={handleEnterText}>
      <InputEnter />
      <span>输入</span>
    </div>
    <div aria-hidden="true" class="button cancel" on:click={onCancel}>
      <InputCancel />
      <span>关闭</span>
    </div>
  </div>
</div>

<style>
  .inputBoxContainer {
    padding: 8px 12px;
    display: inline-flex;
    background: rgba(234.91, 240.9, 249.9, 0.9);
    border-radius: 4px;
    border: 1px solid white;
    align-items: center;
    justify-content: center;
    --button-active-color: rgba(41, 115, 199, 1);
    --button-hover-color: rgba(104, 171, 248, 1);
    --button-normal-color: rgba(51, 142, 246, 1);
    --button-cancel-color: rgba(184, 190, 198, 1);
  }

  .inputBox {
    width: 500px;
    height: 24px;
    line-height: 24px;
    outline: none;
    border-radius: 2px;
    border: 1px solid var(--button-normal-color);
  }

  .buttonWrap {
    display: flex;
    margin-left: 10px;
  }

  .button {
    display: flex;
    align-items: center;
    padding: 0 6px;
    font-size: 14px;
    font-family: PingFang SC;
    font-weight: 400;
    line-height: 24px;
    border-radius: 2px;
    max-height: 24px;
  }
  .button:last-of-type {
    margin-left: 8px;
  }
  .button span {
    white-space: nowrap;
  }
  .button.enter {
    color: rgba(255, 255, 255, 1);
    background-color: var(--button-normal-color);
  }
  .button.enter:hover {
    background-color: var(--button-hover-color);
  }
  .button.enter:active {
    background-color: var(--button-active-color);
  }

  .button.cancel {
    color: rgba(140, 140, 140, 1);
    border: 1px solid var(--button-cancel-color);
    background-color: rgba(255, 255, 255, 1);
  }
  .button.cancel:hover {
    color: var(--button-hover-color);
    border: 1px solid var(--button-hover-color);
    background-color: rgba(245, 245, 245, 1);
  }

  :global(.button.cancel:hover svg path) {
    stroke: var(--button-hover-color);
  }

  .button.cancel:active {
    color: var(--button-active-color);
    border: 1px solid var(--button-active-color);
    background-color: rgba(245, 245, 245, 1);
  }

  :global(.button.cancel:active svg path) {
    stroke: var(--button-active-color);
  }
</style>

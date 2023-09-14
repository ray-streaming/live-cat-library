<script lang="ts">
  import { onMount } from 'svelte'

  let inputRef: HTMLInputElement
  export let onTextInput: (text: string) => void
  function handleEnterText() {
    const text = inputRef.value
    if (text) {
      onTextInput(text)
      inputRef.value = ''
      inputRef.focus()
    }
  }
  function handleCloseBox() {}

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
    <button class="button" on:click={handleEnterText}>输入</button>
    <!-- <button class="button" on:click={handleCloseBox}>关闭</button> -->
  </div>
</div>

<style>
  .inputBoxContainer {
    padding: 0 10px;
    height: 40px;
    display: flex;
    background: rgba(255, 255, 255, 0.88);
    box-shadow: 0px 3px 7px 3px rgba(9, 18, 32, 0.34), 0px 0px 4px 1px rgba(12, 50, 94, 0.35);
    border-radius: 4px;
    border: 1px solid #ffffff;
    align-items: center;
    justify-content: center;
  }

  .inputBox {
    width: 546px;
    height: 24px;
    line-height: 24px;
    outline: none;
    border-radius: 3px;
    border: 1px solid #acbac0ff;
  }
  .buttonWrap {
    display: flex;
    margin-left: 10px;
  }
  .button {
    color: #338ef6ff;
    text-align: center;
    border: 1px solid #409bf5;
    padding: 2px 6px;
    cursor: pointer;
    font-size: 16px;
    background-color: rgba(56, 144, 244, 0.15);
  }
  .button:last-of-type {
    color: #748ca3ff;
    position: relative;
    border: 1px solid #748ca3;
    background-color: none;
    margin-left: 5px;
  }
</style>

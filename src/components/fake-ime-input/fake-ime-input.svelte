<script lang="ts">
  import { TextInput, Keyboard } from 'live-cat'
  import FakeInput from '../icons/fake-input.svelte'
  import { onMount } from 'svelte'
  let inputRef: HTMLInputElement
  let imeRef: HTMLDivElement
  export let onEvent: (e: ArrayBuffer) => void = () => {}
  export let onRef: (ref: HTMLDivElement) => void

  let inputFlag = true
  const handleChange = (event: any) => {
    setTimeout(() => {
      if (inputFlag) {
        sendText(event.target.value)
        inputRef.value = ''
      }
    }, 0)
  }

  const handleCompositionStart = () => {
    inputFlag = false
  }

  const handleCompositionEnd = () => {
    inputFlag = true
  }

  function sendText(text: string) {
    onEvent(new TextInput(text).dumps())
  }

  function onKeyCode(code: string) {
    if (code === 'Backspace')
      onEvent(new Keyboard(8, false, false, false, false, false, false, true).dumps())
  }
  onMount(() => {
    onRef(imeRef)
  })
</script>

<div
  aria-hidden="true"
  class="fake-ime-mobile-container"
  on:click|stopPropagation={() => {
    inputRef.focus()
    imeRef.style.display = 'none'
  }}
  bind:this={imeRef}
>
  <div class="fake-ime-content">
    <FakeInput />
    <p>请您再次点击屏幕唤出系统输入法</p>
  </div>
</div>

<input
  class="fake-input"
  type="text"
  bind:this={inputRef}
  on:compositionstart={handleCompositionStart}
  on:compositionupdate={handleCompositionStart}
  on:compositionend={handleCompositionEnd}
  on:input={handleChange}
  on:keydown={(e) => {
    onKeyCode(e.key)
  }}
/>

<style>
  .fake-ime-mobile-container {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: none;
    align-items: center;
    width: 100%;
    height: 100%;
    flex-flow: column-reverse;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
  }
  .fake-ime-mobile-container .fake-ime-content {
    display: flex;
    flex-flow: column;
    align-items: center;
  }
  .fake-ime-mobile-container p {
    margin: 12px 0 36px 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 1);
  }
  .fake-input {
    position: absolute;
    left: -80%;
    top: -80%;
    width: 0;
    opacity: 0;
  }
</style>

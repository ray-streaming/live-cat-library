<script lang="ts">
  import { Connection, TextInput, Keyboard } from 'live-cat'
  import Draggable from '../draggable/draggable.svelte'
  import InputModal from '../input-modal/input-modal.svelte'
  import { isTouch } from '../../utils'
  import { dataChannelMsgSorter, EventType } from '../../utils/extend-adapter'
  import { onMount } from 'svelte'
  export let connection: Connection
  let inputRef: HTMLInputElement
  const languageOptions = [
    { label: '英文', value: 'en' },
    { label: '中文', value: 'cn' },
  ]
  let language = 'en'
  let showIme = false
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
    connection.dc.readyState === 'open' && connection.send(new TextInput(text).dumps(), true)
  }

  function onKeyCode(code: string) {
    if (code === 'Backspace')
      connection.send(new Keyboard(8, false, false, false, false, false, false, true).dumps(), true)
  }
  onMount(() => {
    connection.dc.addEventListener('message', (msg) => {
      if (dataChannelMsgSorter(msg.data) === EventType.CaretVisible) {
        const res = !!new DataView(msg.data).getUint8(1)
        showIme = res
      }
    })
  })
</script>

<div>
  {#if showIme}
    {#if isTouch()}
      <div
        aria-hidden="true"
        class="mobile-container"
        on:click|once|stopPropagation={() => {
          inputRef.focus()
          showIme = false
        }}
      >
        <p>请您再次点击屏幕唤出系统输入法</p>
      </div>
    {:else}
      <div>
        <div class="container">
          <div class="label">切换中/英文输入法</div>
          <div class="select">
            {#each languageOptions as lang}
              <div
                aria-hidden="true"
                class="item"
                class:selected={language === lang.value}
                on:click={() => {
                  language = lang.value
                }}
              >
                {lang.label}
              </div>
            {/each}
          </div>
          <!-- <div class="button">确认</div> -->
        </div>
        {#if language === 'cn'}
          <Draggable x={600} y={500}>
            <InputModal onTextInput={(text) => sendText(text)} />
          </Draggable>
        {/if}
      </div>
    {/if}
  {/if}
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
</div>

<style>
  .container {
    position: absolute;
    top: 10px;
    border-radius: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    padding: 5px 30px;
    border: 1px solid #afa9a9;
    background-color: rgb(255, 255, 255, 0.6);
  }
  .mobile-container {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    border: 1px solid #afa9a9;
    background-color: rgb(255, 255, 255, 0.3);
    width: 100%;
    height: 100%;
    flex-flow: column-reverse;
  }
  .mobile-container p {
    margin-bottom: 30px;
  }

  .fake-input {
    position: absolute;
    left: -80%;
    top: -80%;
    width: 0;
    opacity: 0;
  }
  .label {
    font-weight: bold;
  }

  .select {
    display: flex;
    margin: 0px 10px;
    align-items: center;
  }
  .item {
    border-radius: 15px;
    padding: 0 30px;
    text-align: center;
    cursor: pointer;
    height: 30px;
    line-height: 30px;
    background: transparent;
    color: rgb(32, 33, 36);
  }
  .item.selected {
    background: rgb(230, 240, 255);
    color: rgb(51, 142, 246);
  }

  .button {
    padding: 0px 30px;
    font-size: inherit;
    height: 30px;
    line-height: 30px;
    box-sizing: border-box;
    color: white;
    border: 0px solid transparent;
    background-color: rgb(52, 142, 245);
    border-radius: 5px;
    cursor: pointer;
  }
</style>

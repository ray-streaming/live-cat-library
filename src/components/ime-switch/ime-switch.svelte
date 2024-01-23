<script lang="ts">
  import { TextInput } from 'live-cat'
  import Draggable from '../draggable/draggable.svelte'
  import InputModal from '../input-modal/input-modal.svelte'
  import ImeLangBg from '../icons/ime-lang-bg.svelte'
  import ImeLangCn from '../icons/ime-lang-cn.svelte'
  import ImeLangEn from '../icons/ime-lang-en.svelte'
  import { onMount } from 'svelte'
  let imeRef: HTMLDivElement

  export let onEvent: (e: ArrayBuffer) => void = () => {}
  export let onRef: (ref: HTMLDivElement) => void

  const languageOptions = [
    { value: 'en', title: '英文输入' },
    { value: 'cn', title: '中文输入' },
  ]
  let language = 'en'
  function sendText(text: string) {
    onEvent(new TextInput(text).dumps())
  }

  onMount(() => {
    onRef(imeRef)
  })
</script>

<div class="ime-container" bind:this={imeRef}>
  <Draggable x={80} y={80}>
    <div class="ime-lang-bg">
      <ImeLangBg height={29} />
    </div>
    <div class="ime-lang-options">
      {#each languageOptions as lang}
        <div
          aria-hidden="true"
          class="ime-lang-type"
          class:selected={language === lang.value}
          title={lang.title}
          on:click={() => {
            language = lang.value
          }}
        >
          {#if lang.value === 'cn'}
            <ImeLangCn />
          {:else}
            <ImeLangEn />
          {/if}
        </div>
      {/each}
    </div>
  </Draggable>

  {#if language === 'cn'}
    <Draggable x={600} y={500}>
      <InputModal
        onTextInput={(text) => sendText(text)}
        onCancel={() => (imeRef.style.display = 'none')}
      />
    </Draggable>
  {/if}
</div>

<style>
  .ime-container {
    position: absolute;
    display: none;
  }
  .ime-lang-options {
    position: absolute;
    display: flex;
    box-sizing: border-box;
    width: 52px;
    height: 32px;
    align-items: center;
    justify-content: center;
  }

  .ime-lang-bg {
    position: absolute;
  }
  :global(.ime-lang-type svg:hover path) {
    fill: rgba(51, 142, 246, 1);
  }
  :global(.ime-lang-type.selected svg path) {
    fill: rgba(51, 142, 246, 1);
  }
  :global(.ime-lang-type.selected svg) {
    background: #fff;
  }
</style>

<svelte:options accessors={true} />

<script lang="ts">
  import { LandscapeType } from '../../client/interface'
  import ModalBase from '../modal-base/modal-base.svelte'
  export let show: boolean = false
  export let displayMode: LandscapeType = LandscapeType.CONTAIN
  export let changeDisplayMode: (mode: LandscapeType) => void
  let tempDisplayMode: LandscapeType = displayMode
  const displayModeOptions = [
    { type: LandscapeType.CONTAIN, label: '自适应' },
    { type: LandscapeType.FILL, label: '拉伸' },
    { type: LandscapeType.COVER, label: '裁剪' },
  ]
</script>

<ModalBase
  {show}
  title="显示模式"
  onClose={() => {
    tempDisplayMode = displayMode
    show = false
  }}
  onCancel={() => {
    tempDisplayMode = displayMode
    show = false
  }}
  onConfirm={() => {
    displayMode = tempDisplayMode
    changeDisplayMode(tempDisplayMode)
    show = false
  }}
>
  <div class="optionContainer">
    {#each displayModeOptions as mode}
      <div
        class="optionLabel"
        aria-hidden="true"
        class:active={tempDisplayMode === mode.type}
        on:click|stopPropagation={() => {
          tempDisplayMode = mode.type
        }}
      >
        {mode.label}
      </div>
    {/each}
  </div>
</ModalBase>

<style>
  .optionContainer {
    display: flex;
    padding: 20px 0;
  }

  .optionLabel {
    width: 86px;
    height: 40px;
    line-height: 40px;
    border-radius: 4px;
    cursor: pointer;
    background-color: rgba(255, 255, 255, 0.24);
    text-align: center;
    margin-right: 12px;
  }
  .optionLabel.active {
    cursor: auto;
    color: #338ef6;
    background-color: #d7e6ff;
  }
</style>

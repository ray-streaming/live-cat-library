<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { Keyboard as KeyboardEvent, TextInput } from 'live-cat'
  import Keyboard from 'simple-keyboard'
  import layout from 'simple-keyboard-layouts/build/layouts/chinese'
  import { allLayoutKey, defaultLayout, displayDefault } from './virtual-keyboard-config'
  import type { KeyboardSizeType, languageType } from './virtual-keyboard'

  export let onEvent: (e: ArrayBuffer) => void = () => {}
  export let defaultSize: KeyboardSizeType
  export let defalutLanguage: languageType
  export let onRef: (ref: HTMLDivElement) => void
  export let onKeyboard: (ins: Keyboard) => void
  export let onClose: () => void
  const KeyValueMapCode = new Map<string, number>([
    ['{bksp}', 8],
    ['{tab}', 9],
    ['{enter}', 13],
    ['{lock}', 20],
    ['{space}', 32],
    ['{shift}', 160],
  ])

  const ChineseRegEx = /[\u4e00-\u9fa5]/
  const EnglishRegEx = /^[A-Za-z]+$/
  const ExcludeNormalRegEx = /{.*}/

  let keyboardRef: HTMLDivElement
  let keyboard: Keyboard
  const CnConfig = { ...layout, layout: defaultLayout, display: displayDefault }
  const EnConfig = {
    ...layout,
    layoutCandidates: null,
    layout: defaultLayout,
    display: displayDefault,
  }
  $: isCn = displayDefault['{change}'] === '英文'
  onMount(() => {
    keyboard = new Keyboard({
      buttonTheme: [
        {
          class: defaultSize,
          buttons: allLayoutKey,
        },
      ],
      onKeyReleased: (button) => {
        addExtendKeyEvent(button)
      },
      onChange: (input) => onChange(input),
      onKeyPress: (button, event) => onKeyPress(button, event),
      ...(defalutLanguage === 'cn' ? CnConfig : EnConfig),
    })
    onKeyboard(keyboard)
    onRef(keyboardRef)
  })

  onDestroy(() => {
    keyboard.destroy()
  })

  const onChange = (input: string) => {
    const endWord = input.slice(input.length - 1, input.length)
    if (isCn && ChineseRegEx.test(endWord)) {
      onEvent(new TextInput(endWord).dumps())
    }
  }

  const onKeyPress = (button: string, event?: MouseEvent | undefined) => {
    // 点击关闭
    if (button === '{close}') {
      onClose()
      return false
    } else if (button === '{change}') {
      // 切换中英文输入法
      if (keyboard.options.layoutCandidates !== null) {
        displayDefault['{change}'] = '中文'
        // 切换至英文
        keyboard.setOptions(EnConfig)
      } else {
        // 切换至中文
        displayDefault['{change}'] = '英文'
        keyboard.setOptions(CnConfig)
      }
    } else if (KeyValueMapCode.get(button)) {
      onEvent(
        new KeyboardEvent(
          KeyValueMapCode.get(button)!,
          false,
          false,
          false,
          false,
          false,
          false,
          true,
        ).dumps(),
      )
    }
    if (button === '{shift}' || button === '{lock}') handleShift()

    //过滤非普通按键，
    if (!ExcludeNormalRegEx.test(button)) {
      //中文模式下，禁止发送字母
      if (!isCn || (isCn && !EnglishRegEx.test(button))) {
        onEvent(new TextInput(button).dumps())
      }
    }
    return
  }

  const handleShift = () => {
    let currentLayout = keyboard.options.layoutName
    let shiftToggle = currentLayout === 'default' ? 'shift' : 'default'
    keyboard.setOptions({
      layoutName: shiftToggle,
    })
  }
  const addExtendKeyEvent = (button: string) => {
    if (KeyValueMapCode.get(button)) {
      onEvent(
        new KeyboardEvent(
          KeyValueMapCode.get(button)!,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ).dumps(),
      )
    }
  }
</script>

<div class="simple-keyboard-container" bind:this={keyboardRef}>
  <div class="simple-keyboard" />
</div>

<style global>
  @import '../../../node_modules/simple-keyboard/build/css/index.css';
  .simple-keyboard-container {
    position: absolute;
    z-index: 9999;
    bottom: 0;
    width: 100%;
    display: none;
  }
  .simple-keyboard-container .simple-keyboard {
    max-width: 850px;
  }
  .hg-theme-default .hg-button.medium {
    height: 25px;
    font-size: 0.8em;
  }
  .hg-theme-default .hg-button.small {
    height: 20px;
    font-size: 0.6em;
  }
  .hg-theme-default .hg-button.large {
    height: 40px;
    font-size: 1em;
  }
</style>

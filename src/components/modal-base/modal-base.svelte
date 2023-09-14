<script lang="ts">
  export let show = false
  export let minWidth = 500
  export let title = ''
  export let closeIcon = true
  export let hideCancel = false
  export let onConfirm = () => {}
  export let onClose = () => {}
  export let okText = '确认'
  export let cancelText = '取消'
</script>

<div class="transition" style="display:{show ? 'block' : 'none'};opacity:{show ? 1 : 0}">
  <div class="container" style="min-width:{minWidth}px">
    {#if !!title || closeIcon}
      <div class="header">
        <h5 class="title">{title}</h5>
        {#if closeIcon}
          <span aria-hidden="true" on:click={onClose} class="close-icon" />
        {/if}
      </div>
    {/if}
    <div class="content"><slot /></div>
    <div class="action">
      {#if !hideCancel}
        <div aria-hidden="true" on:click={onClose} class="button-base outlined-button">
          {cancelText}
        </div>
      {/if}
      {#if onConfirm}
        <div aria-hidden="true" on:click={onConfirm} class="button-base contained-button">
          {okText}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .transition {
    position: fixed;
    inset: 0px;
    background-color: rgba(0, 0, 0, 0.3);
    transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1) 0s;
    z-index: 999;
  }
  .container {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 5px;
    background-color: white;
    border: 1px solid #f3f6f7;
    box-sizing: border-box;
  }
  .header {
    font-weight: 500;
    position: relative;
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
  }
  .header::after {
    content: '';
    display: block;
    clear: both;
    width: 100%;
    height: 1px;
    background-color: #e7e9f0;
    position: absolute;
    bottom: 0;
    left: 0;
  }

  .title {
    float: left;
    margin: 0;
    font-size: 14px;
    font-weight: bold;
  }

  .close-icon {
    float: right;
    width: 20px;
    height: 20px;
    position: relative;
    cursor: pointer;
    transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1) 0s;
  }
  .close-icon::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    height: 20px;
    width: 2px;
    background-color: #202124;
    border-radius: 2px;
    transform: translate(-50%, -50%) rotate(45deg);
  }
  .close-icon::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    height: 20px;
    width: 2px;
    background-color: #202124;
    border-radius: 2px;
    transform: translate(-50%, -50%) rotate(-45deg);
  }
  .close-icon:hover {
    transform: rotate(180deg);
  }

  .content {
    padding: 20px;
  }
  .action {
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    justify-content: flex-end;
    position: relative;
    font-size: 14px;
  }
  .action::before {
    content: '';
    display: block;
    clear: both;
    width: 100%;
    height: 1px;
    background-color: #e7e9f0;
    position: absolute;
    top: 0;
    left: 0;
  }
  .button-base {
    cursor: pointer;
    text-decoration: none;
    width: 60px;
    height: 32px;
    display: inline-block;
    text-align: center;
    white-space: nowrap;
    user-select: none;
    border-radius: 2px;
    font-weight: 400;
    padding: 0px 15px;
    font-size: inherit;
    line-height: 32px;
    box-sizing: border-box;
  }
  .outlined-button {
    color: #202124;
    border: 1px solid #f2f3f5;
    background-color: #f2f3f5;
  }
  .outlined-button:hover {
    opacity: 0.9;
  }

  .contained-button {
    color: white;
    border: 0 solid transparent;
    background-color: #348ef5;
    margin-left: 10px;
  }
  .contained-button:hover {
    background-color: #007bf7;
  }
</style>

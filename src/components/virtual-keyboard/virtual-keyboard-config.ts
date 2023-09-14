export const displayDefault = {
  '{bksp}': '回退',
  '{lock}': 'caps',
  '{enter}': '回车',
  '{tab}': 'tab',
  '{shift}': 'shift',
  '{change}': '英文',
  '{space}': ' ',
  '{close}': '关闭',
}
export const defaultLayout = {
  // 默认布局
  default: [
    '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
    '{tab} q w e r t y u i o p [ ] \\',
    "{lock} a s d f g h j k l ; ' {enter}",
    '{shift} z x c v b n m , . /',
    '{change} {space} {close}',
  ],
  // shift布局
  shift: [
    '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
    '{tab} Q W E R T Y U I O P { } |',
    '{lock} A S D F G H J K L : " {enter}',
    '{shift} Z X C V B N M < > ?',
    '{change} {space} {close}',
  ],
}
export const allLayoutKey = `\` 1 2 3 4 5 6 7 8 9 0 - = {bksp} {tab} q w e r t y u i o p [ ] \\ {lock} a s d f g h j k l ; ' {enter} {shift} z x c v b n m , . / {change} {space} {close} ~ ! @ # $ % ^ & * ( ) _ + Q W E R T Y U I O P { } | A S D F G H J K L : " Z X C V B N M < > ? `

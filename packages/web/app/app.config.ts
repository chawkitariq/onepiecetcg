export default defineAppConfig({
  duel: {
    highlight: {
      base: 'duel-highlight',
      states: {
        interactive: 'duel-highlight--interactive',
        selected: 'duel-highlight--selected',
        source: 'duel-highlight--source',
        targetable: 'duel-highlight--targetable',
        dropTarget: 'duel-highlight--drop-target',
        invalid: 'duel-highlight--invalid'
      }
    }
  },
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate'
    }
  }
})

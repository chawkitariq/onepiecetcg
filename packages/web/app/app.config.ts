export default defineAppConfig({
  duel: {
    feedback: {
      base: 'duel-feedback',
      surfaces: {
        card: 'duel-feedback--card',
        banner: 'duel-feedback--banner',
        floating: 'duel-feedback--floating'
      },
      families: {
        impact: 'duel-feedback--impact',
        gain: 'duel-feedback--gain',
        status: 'duel-feedback--status',
        error: 'duel-feedback--error',
        narration: 'duel-feedback--narration'
      }
    },
    highlight: {
      base: 'duel-highlight',
      states: {
        interactive: 'duel-highlight--interactive',
        preview: 'duel-highlight--preview',
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

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'motion-v/nuxt',
    '@vueuse/nuxt',
    '@nuxt/test-utils/module'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:3000',
      colyseusEndpoint: process.env.NUXT_PUBLIC_COLYSEUS_ENDPOINT ?? 'ws://localhost:3000'
    }
  },

  routeRules: {},

  compatibilityDate: '2026-06-30',

  typescript: {
    tsConfig: {
      compilerOptions: {
        experimentalDecorators: true,
        useDefineForClassFields: false
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})

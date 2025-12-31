<script setup lang="ts">
import ResearchPanel from './components/ResearchPanel.vue'
import { ChatKit, useChatKit } from '@xpert-ai/chatkit-vue'
import { type ChatKitOptions, type ClientToolMessageInput, filterPlaygroundOptions, type SupportedLocale } from '@xpert-ai/chatkit-types'

// ============================================================================
// Playground config - copied from https://chatkit.studio/playground
// Only whitelisted options take effect: theme, composer, startScreen, api
// Other options (e.g., threadItemActions.feedback) are automatically filtered out
// ============================================================================
const playgroundConfig: Partial<ChatKitOptions> = {
  locale: 'zh' as SupportedLocale,
  theme: {
    colorScheme: 'light',
    radius: 'round',
    density: 'spacious',
    color: {
      grayscale: {
        hue: 38,
        tint: 5,
        shade: 3
      },
      accent: {
        primary: '#f9b11f',
        level: 3
      }
    },
    typography: {
      baseSize: 16,
      fontFamily: 'Inter, sans-serif',
      fontSources: [
        {
          family: 'Inter',
          src: 'https://rsms.me/inter/font-files/Inter-Regular.woff2',
          weight: 400,
          style: 'normal'
        }
      // ...and 3 more font sources
      ]
    }
  },
  composer: {
    attachments: {
      enabled: true,
      maxCount: 5,
      maxSize: 10485760
    },
    tools: [
      {
        id: 'search_docs',
        label: 'Search docs',
        shortLabel: 'Docs',
        placeholderOverride: 'Search documentation',
        icon: 'book-open',
        pinned: false
      }
    ]
  },
  startScreen: {
    greeting: '',
    prompts: [
      {
        icon: 'circle-question',
        label: 'What is ChatKit?',
        prompt: 'What is ChatKit?'
      }
    ]
  }
}

// Filter playground config (keep only whitelisted items)
const filteredPlaygroundConfig = filterPlaygroundOptions(playgroundConfig)

const xpertApiUrl = (import.meta.env.VITE_XPERTAI_API_URL as string | undefined) ?? ''
const backendOrigin = (import.meta.env.VITE_CHATKIT_BACKEND as string | undefined) ?? ''
const assistantId = (import.meta.env.VITE_CHATKIT_XPERT_ID as string | undefined) ?? ''
const frameUrl = (import.meta.env.VITE_CHATKIT_TARGET as string | undefined) ?? ''

const chatkitOptions: Partial<ChatKitOptions> = {
  ...filteredPlaygroundConfig,
  frameUrl
}

const chatkit = useChatKit({
  ...chatkitOptions,
  api: {
    apiUrl: xpertApiUrl,
    xpertId: assistantId,
    getClientSecret: async () => {
      const createSessionUrl = backendOrigin
        ? `${backendOrigin.replace(/\/$/, '')}/api/create-session`
        : '/api/create-session'

      const response = await fetch(createSessionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(assistantId ? { assistantId } : {})
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      if (!data.client_secret) {
        throw new Error('Missing client_secret in response')
      }

      return data.client_secret
    }
  },
  onClientTool: async ({ name, params, id, tool_call_id }): Promise<ClientToolMessageInput> => {
    console.log(`Client tool invoked: ${name}`, params, id, tool_call_id)
    return {
      tool_call_id: tool_call_id || id,
      name: name,
      status: 'success',
      content: `You invoked the "${name}" tool with parameters: ${JSON.stringify(params)}`
    }
  },
  onError: (error) => {
    console.error('Failed to create session:', error)
  },
  onEffect: ({ name, data }) => {
    console.log(`Effect triggered: ${name}`, data)
  },
  widgets: {
    async onAction(action: {
            type: string;
            payload?: Record<string, unknown>;
        }, widgetItem: {
            id: string;
        }) {
      console.log('Widget action received:', action, widgetItem)
    },
  }
})

const sendResearchPrompt = async (text: string) => {
  if (!text.trim()) return
  await chatkit.sendUserMessage({ text })
  chatkit.focusComposer()
}
</script>

<template>
  <div class="app-shell">
    <div class="left-panel">
      <ResearchPanel :assistantId="assistantId" @send="sendResearchPrompt" />
    </div>
    <ChatKit :control="chatkit.control" class="chat-panel" />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  text-align: left;
}

.left-panel {
  flex: 1;
  padding: 24px;
  border-right: 1px solid rgba(15, 23, 42, 0.12);
  overflow: auto;
  background: radial-gradient(circle at top left, rgba(225, 143, 45, 0.08), transparent 55%),
    radial-gradient(circle at bottom right, rgba(47, 127, 127, 0.1), transparent 50%),
    #f6f1e7;
}

.chat-panel {
  flex: 0 0 500px;
  min-width: 360px;
  background: #ffffff;
}
@media (max-width: 1024px) {
  .app-shell {
    flex-direction: column;
  }

  .left-panel {
    border-right: 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .chat-panel {
    flex: 1 1 auto;
    min-width: 0;
  }
}
</style>

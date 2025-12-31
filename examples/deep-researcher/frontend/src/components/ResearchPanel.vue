<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type ScenarioId = 'market' | 'tech' | 'competitor'
type FieldType = 'text' | 'textarea' | 'select'

type ScenarioField = {
  key: string
  label: string
  placeholder: string
  type?: FieldType
  rows?: number
  options?: string[]
  helper?: string
}

type ScenarioConfig = {
  id: ScenarioId
  title: string
  summary: string
  accent: string
  outline: string[]
  fields: ScenarioField[]
}

const props = defineProps<{ assistantId: string }>()
const emit = defineEmits<{ (event: 'send', text: string): void }>()

const scenarios: ScenarioConfig[] = [
  {
    id: 'market',
    title: 'Market Research',
    summary: 'Sizing, demand signals, pricing, and growth levers.',
    accent: '#e18f2d',
    outline: [
      'Executive summary',
      'Market landscape and segmentation',
      'Demand drivers and buyer behavior',
      'Pricing benchmarks and willingness to pay',
      'Risks, opportunities, and recommendations',
      'Sources'
    ],
    fields: [
      {
        key: 'topic',
        label: 'Research topic',
        placeholder: 'e.g., AI customer support platforms'
      },
      {
        key: 'industry',
        label: 'Industry scope',
        placeholder: 'SaaS, retail, healthcare, fintech'
      },
      {
        key: 'region',
        label: 'Geography focus',
        placeholder: 'North America, EU, APAC, Global'
      },
      {
        key: 'timeframe',
        label: 'Time horizon',
        placeholder: '2024-2028'
      },
      {
        key: 'questions',
        label: 'Key questions',
        placeholder: 'TAM/SAM/SOM, adoption trends, main channels',
        type: 'textarea',
        rows: 3
      },
      {
        key: 'constraints',
        label: 'Constraints & assumptions',
        placeholder: 'Budget cap, public sources only, etc.',
        type: 'textarea',
        rows: 2
      }
    ]
  },
  {
    id: 'tech',
    title: 'Tech Selection',
    summary: 'Compare stacks, evaluate trade-offs, choose a winner.',
    accent: '#2f7f7f',
    outline: [
      'Executive summary',
      'Use case and requirements',
      'Candidate comparison matrix',
      'Integration and risk assessment',
      'Recommendation and migration plan',
      'Sources'
    ],
    fields: [
      {
        key: 'useCase',
        label: 'Use case',
        placeholder: 'e.g., real-time analytics pipeline'
      },
      {
        key: 'requirements',
        label: 'Functional requirements',
        placeholder: 'Ingestion, storage, analytics, alerting',
        type: 'textarea',
        rows: 3
      },
      {
        key: 'constraints',
        label: 'Non-functional constraints',
        placeholder: 'Latency, compliance, cost ceiling, team skills',
        type: 'textarea',
        rows: 2
      },
      {
        key: 'candidates',
        label: 'Candidate technologies',
        placeholder: 'List stacks or vendors to compare',
        type: 'textarea',
        rows: 2
      },
      {
        key: 'integration',
        label: 'Current environment',
        placeholder: 'Cloud provider, data stack, security posture'
      },
      {
        key: 'decision',
        label: 'Decision criteria',
        placeholder: 'Performance, total cost, vendor lock-in'
      }
    ]
  },
  {
    id: 'competitor',
    title: 'Competitive Analysis',
    summary: 'Map rivals, positioning, and differentiation gaps.',
    accent: '#d35b5b',
    outline: [
      'Executive summary',
      'Category definition and buyer needs',
      'Competitor landscape and positioning map',
      'Pricing and packaging comparison',
      'Differentiation opportunities',
      'Sources'
    ],
    fields: [
      {
        key: 'category',
        label: 'Product category',
        placeholder: 'e.g., workflow automation platforms'
      },
      {
        key: 'segment',
        label: 'Target segment',
        placeholder: 'SMB, mid-market, enterprise'
      },
      {
        key: 'competitors',
        label: 'Key competitors',
        placeholder: 'List primary rivals to analyze',
        type: 'textarea',
        rows: 2
      },
      {
        key: 'differentiation',
        label: 'Differentiation focus',
        placeholder: 'UX, distribution, integrations, pricing model',
        type: 'textarea',
        rows: 2
      },
      {
        key: 'pricing',
        label: 'Pricing band',
        placeholder: 'Monthly ARPU, enterprise contracts, freemium'
      },
      {
        key: 'channels',
        label: 'Go-to-market channels',
        placeholder: 'PLG, outbound, partners, marketplace'
      }
    ]
  }
]

const activeScenarioId = ref<ScenarioId>('market')

const formState = reactive<Record<ScenarioId, Record<string, string>>>({
  market: {
    topic: '',
    industry: '',
    region: '',
    timeframe: '',
    questions: '',
    constraints: ''
  },
  tech: {
    useCase: '',
    requirements: '',
    constraints: '',
    candidates: '',
    integration: '',
    decision: ''
  },
  competitor: {
    category: '',
    segment: '',
    competitors: '',
    differentiation: '',
    pricing: '',
    channels: ''
  }
})

const settings = reactive({
  depth: 3,
  sources: 10,
  tone: 'Executive'
})

const samples: Record<ScenarioId, Record<string, string>> = {
  market: {
    topic: 'AI customer support platforms for SaaS teams',
    industry: 'B2B SaaS',
    region: 'North America + Western Europe',
    timeframe: '2024-2027',
    questions: 'Market size, adoption signals, pricing benchmarks, top growth segments',
    constraints: 'Use public sources only; focus on enterprise buyers'
  },
  tech: {
    useCase: 'Real-time analytics pipeline for product telemetry',
    requirements: 'Event ingestion, stream processing, batch analytics, alerting',
    constraints: 'Sub-5s latency, SOC2 compliance, budget under $200k/year',
    candidates: 'Kafka + Flink, Kinesis + Lambda, Redpanda + ClickHouse',
    integration: 'AWS, Snowflake, existing Python data stack',
    decision: 'Latency, total cost, operational complexity, scalability'
  },
  competitor: {
    category: 'Workflow automation platforms',
    segment: 'Mid-market operations teams',
    competitors: 'Zapier, Make, Workato, Relay',
    differentiation: 'AI-assisted workflow builder, compliance-ready templates',
    pricing: '$30-$300 per user per month',
    channels: 'PLG + partner ecosystem'
  }
}

const activeScenario = computed(() => {
  return scenarios.find((scenario) => scenario.id === activeScenarioId.value) ?? scenarios[0]
})

const activeFields = computed(() => activeScenario.value.fields)
const activeValues = computed(() => formState[activeScenarioId.value])

const summaryLabel = computed(() => {
  if (settings.depth >= 4) return 'Deep dive'
  if (settings.depth >= 2) return 'Balanced'
  return 'Quick scan'
})

const normalizeValue = (value: string) => {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : 'Not specified'
}

const promptPreview = computed(() => {
  const scenario = activeScenario.value
  const values = activeValues.value
  const fieldLines = scenario.fields
    .map((field) => `- ${field.label}: ${normalizeValue(values[field.key] ?? '')}`)
    .join('\n')

  const outlineLines = scenario.outline.map((item, index) => `${index + 1}. ${item}`).join('\n')

  return `You are the XpertAI Deep Researcher. Use web search for credible sources and cite them.\n\nScenario: ${
    scenario.title
  }\nResearch brief:\n${fieldLines}\n\nResearch settings:\n- Depth: ${settings.depth}/5 (${summaryLabel.value})\n- Target sources: ${
    settings.sources
  }+\n- Tone: ${settings.tone}\n\nOutput requirements:\n- Deliver a long-form report (1500-2500 words)\n- Use markdown headings and clear sectioning\n- Include the following structure:\n${outlineLines}\n- Provide inline citations in [source] format and a Sources section with links.`
})

const applySample = () => {
  const values = formState[activeScenarioId.value]
  const sample = samples[activeScenarioId.value]
  Object.entries(sample).forEach(([key, value]) => {
    values[key] = value
  })
}

const clearForm = () => {
  const values = formState[activeScenarioId.value]
  Object.keys(values).forEach((key) => {
    values[key] = ''
  })
}

const sendPrompt = () => {
  emit('send', promptPreview.value)
}
</script>

<template>
  <section class="research-panel">
    <header class="panel-hero">
      <div class="hero-copy">
        <p class="eyebrow">XpertAI Research Studio</p>
        <h1>Deep Researcher</h1>
        <p class="hero-subtitle">
          Scenario-driven research briefs that generate full-length reports through ChatKit.
        </p>
      </div>
      <div class="hero-meta">
        <div class="meta-card">
          <span class="meta-label">Assistant</span>
          <span class="meta-value">{{ props.assistantId || 'Not set' }}</span>
        </div>
        <div class="meta-card">
          <span class="meta-label">Web Search</span>
          <span class="meta-value">Enabled</span>
        </div>
        <div class="meta-card">
          <span class="meta-label">Output</span>
          <span class="meta-value">Long-form report</span>
        </div>
      </div>
    </header>

    <section class="panel-section">
      <div class="section-head">
        <div>
          <h2>Scenario</h2>
          <p>Pick a research workflow template to shape the brief.</p>
        </div>
      </div>
      <div class="scenario-grid">
        <button
          v-for="scenario in scenarios"
          :key="scenario.id"
          class="scenario-card"
          :class="{ active: scenario.id === activeScenarioId }"
          :style="{ '--accent': scenario.accent }"
          type="button"
          @click="activeScenarioId = scenario.id"
        >
          <span class="scenario-title">{{ scenario.title }}</span>
          <span class="scenario-summary">{{ scenario.summary }}</span>
        </button>
      </div>
    </section>

    <section class="panel-section">
      <div class="section-head">
        <div>
          <h2>Research inputs</h2>
          <p>Provide context so the agent can scope the investigation.</p>
        </div>
        <div class="section-actions">
          <button class="ghost" type="button" @click="applySample">Use sample</button>
          <button class="ghost" type="button" @click="clearForm">Clear</button>
        </div>
      </div>
      <div class="form-grid">
        <div v-for="field in activeFields" :key="field.key" class="form-field">
          <label :for="field.key">{{ field.label }}</label>
          <textarea
            v-if="field.type === 'textarea'"
            :id="field.key"
            v-model="activeValues[field.key]"
            :placeholder="field.placeholder"
            :rows="field.rows ?? 2"
          />
          <select
            v-else-if="field.type === 'select'"
            :id="field.key"
            v-model="activeValues[field.key]"
          >
            <option v-for="option in field.options" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
          <input
            v-else
            :id="field.key"
            v-model="activeValues[field.key]"
            type="text"
            :placeholder="field.placeholder"
          />
          <span v-if="field.helper" class="helper">{{ field.helper }}</span>
        </div>
      </div>
    </section>

    <section class="panel-section settings">
      <div class="section-head">
        <div>
          <h2>Research settings</h2>
          <p>Dial the investigation depth and output style.</p>
        </div>
        <div class="settings-badge">{{ summaryLabel }}</div>
      </div>
      <div class="settings-grid">
        <div class="setting-card">
          <div class="setting-label">Depth</div>
          <input v-model.number="settings.depth" type="range" min="1" max="5" step="1" />
          <div class="setting-value">{{ settings.depth }}/5</div>
        </div>
        <div class="setting-card">
          <div class="setting-label">Sources</div>
          <input v-model.number="settings.sources" type="range" min="6" max="18" step="1" />
          <div class="setting-value">{{ settings.sources }}+</div>
        </div>
        <div class="setting-card">
          <div class="setting-label">Tone</div>
          <select v-model="settings.tone">
            <option>Executive</option>
            <option>Analytical</option>
            <option>Investor</option>
            <option>Product</option>
          </select>
          <div class="setting-value">Narrative tone</div>
        </div>
      </div>
    </section>

    <section class="panel-section output">
      <div class="section-head">
        <div>
          <h2>Report outline</h2>
          <p>The long-form report follows this structure.</p>
        </div>
      </div>
      <div class="output-grid">
        <ul class="outline-list">
          <li v-for="item in activeScenario.outline" :key="item">{{ item }}</li>
        </ul>
        <div class="prompt-card">
          <div class="prompt-header">
            <span>Prompt preview</span>
            <span class="prompt-note">Sent to ChatKit</span>
          </div>
          <pre class="prompt-preview">{{ promptPreview }}</pre>
        </div>
      </div>
    </section>

    <section class="panel-section actions">
      <button class="primary" type="button" @click="sendPrompt">Generate report</button>
      <div class="action-hint">
        The report will arrive in the chat stream with sources and citations.
      </div>
    </section>
  </section>
</template>

<style scoped>
.research-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: #1f2937;
}

.panel-hero {
  position: relative;
  padding: 28px;
  border-radius: 24px;
  background: linear-gradient(135deg, #f4e6cf 0%, #fef7ec 45%, #e4f0ef 100%);
  border: 1px solid rgba(15, 23, 42, 0.08);
  overflow: hidden;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
}

.panel-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(225, 143, 45, 0.2), transparent 55%),
    radial-gradient(circle at bottom left, rgba(47, 127, 127, 0.2), transparent 50%);
  pointer-events: none;
}

.hero-copy {
  position: relative;
  z-index: 1;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.7rem;
  font-weight: 600;
  color: #6b4f2a;
  margin: 0 0 12px;
}

h1 {
  font-family: 'Fraunces', serif;
  font-size: clamp(2rem, 2vw + 1.6rem, 2.7rem);
  margin: 0 0 8px;
}

.hero-subtitle {
  margin: 0;
  max-width: 520px;
  color: #3f3f46;
  font-size: 1rem;
}

.hero-meta {
  position: relative;
  z-index: 1;
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.meta-card {
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #6b7280;
}

.meta-value {
  font-size: 0.95rem;
  font-weight: 600;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 4px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.section-head h2 {
  font-family: 'Fraunces', serif;
  font-size: 1.4rem;
  margin: 0 0 4px;
}

.section-head p {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.section-actions {
  display: flex;
  gap: 10px;
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}

.scenario-card {
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 16px;
  padding: 16px;
  background: #fffaf2;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  position: relative;
  overflow: hidden;
}

.scenario-card::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 4px;
  background: var(--accent);
  opacity: 0.6;
}

.scenario-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.1);
}

.scenario-card.active {
  border-color: var(--accent);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

.scenario-title {
  font-weight: 600;
  font-size: 1rem;
}

.scenario-summary {
  font-size: 0.9rem;
  color: #6b7280;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.form-field input,
.form-field textarea,
.form-field select {
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  padding: 10px 12px;
  background: #ffffff;
  font-size: 0.95rem;
  color: #1f2937;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus {
  outline: none;
  border-color: #d97706;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.2);
}

.helper {
  font-size: 0.75rem;
  color: #9ca3af;
}

.settings {
  padding: 18px;
  border-radius: 18px;
  background: #fff6ea;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.settings-badge {
  padding: 6px 12px;
  border-radius: 999px;
  background: #fdf2e3;
  color: #92400e;
  font-size: 0.75rem;
  font-weight: 600;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.setting-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.setting-label {
  font-size: 0.85rem;
  font-weight: 600;
}

.setting-value {
  font-size: 0.8rem;
  color: #6b7280;
}

.output-grid {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(220px, 1.4fr);
  gap: 16px;
}

.outline-list {
  margin: 0;
  padding: 16px 18px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 0.92rem;
}

.outline-list li::before {
  content: '•';
  color: #d97706;
  margin-right: 8px;
}

.prompt-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #fdfbf7;
  border: 1px dashed rgba(120, 113, 108, 0.4);
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #6b7280;
}

.prompt-note {
  font-weight: 600;
}

.prompt-preview {
  margin: 0;
  white-space: pre-wrap;
  font-size: 0.78rem;
  line-height: 1.4;
  color: #1f2937;
  max-height: 220px;
  overflow: auto;
}

.actions {
  align-items: center;
  text-align: center;
  gap: 10px;
}

.primary {
  border: none;
  padding: 12px 24px;
  border-radius: 999px;
  background: linear-gradient(135deg, #d97706, #e18f2d);
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(217, 119, 6, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(217, 119, 6, 0.28);
}

.ghost {
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: transparent;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.85rem;
  cursor: pointer;
  color: #374151;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.ghost:hover {
  border-color: #d97706;
  color: #92400e;
}

.action-hint {
  font-size: 0.85rem;
  color: #6b7280;
}

.research-panel > * {
  animation: floatUp 0.5s ease both;
}

.research-panel > *:nth-child(2) {
  animation-delay: 0.04s;
}

.research-panel > *:nth-child(3) {
  animation-delay: 0.08s;
}

.research-panel > *:nth-child(4) {
  animation-delay: 0.12s;
}

.research-panel > *:nth-child(5) {
  animation-delay: 0.16s;
}

.research-panel > *:nth-child(6) {
  animation-delay: 0.2s;
}

@keyframes floatUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .panel-hero {
    padding: 24px;
  }

  .output-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .panel-hero {
    padding: 20px;
  }
}
</style>

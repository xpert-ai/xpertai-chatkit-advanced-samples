<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import MarkdownView from './MarkdownView.vue'
import { renderMarkdown } from '../utils/markdown'

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

type ReportItem = {
  id: string
  title: string
  content: string
  createdAt: string
}

const props = defineProps<{
  assistantId: string
  reportPayload?: { title: string; content: string } | null
}>()
const emit = defineEmits<{ (event: 'send', text: string): void; (event: 'close-report'): void }>()

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
const reports = ref<ReportItem[]>([])
const currentReportId = ref<string | null>(null)
const reportSequence = ref(0)

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
  tone: 'Executive',
  output: 'long'
})

const outputOptions = [
  {
    id: 'brief',
    label: 'Brief',
    words: '600-900',
    summary: 'Executive summary + key findings'
  },
  {
    id: 'standard',
    label: 'Standard',
    words: '1200-1800',
    summary: 'Balanced narrative + analysis'
  },
  {
    id: 'long',
    label: 'Long-form',
    words: '1800-2500',
    summary: 'Deep coverage with sources'
  },
  {
    id: 'deep',
    label: 'Deep dive',
    words: '2500-3500',
    summary: 'Full exploration + implications'
  }
]

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

const outputProfile = computed(() => {
  return outputOptions.find((option) => option.id === settings.output) ?? outputOptions[2]
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
  }+\n- Tone: ${settings.tone}\n- Output: ${outputProfile.value.label} (${outputProfile.value.words} words)\n\nOutput requirements:\n- Deliver a ${outputProfile.value.label.toLowerCase()} report (~${outputProfile.value.words} words)\n- Use markdown headings and clear sectioning\n- Include the following structure:\n${outlineLines}\n- Provide inline citations in [source] format and a Sources section with links. When you use information from a source, you MUST:

1. Add an inline citation immediately after the sentence that uses the source.
   - Inline citation format: [source: SOURCE_ID]
   - Example: The Eiffel Tower was completed in 1889. [source: wikipedia_eiffel]

2. At the end of the answer, add a section titled exactly:
   Sources

3. In the Sources section, list all sources used in the answer.
   - Use a markdown bullet list
   - Each item must include:
     - The same SOURCE_ID used in inline citations
     - A clickable markdown link

   Format:
   - SOURCE_ID: https://example.com

4. Every inline citation MUST have a matching entry in the Sources section.
5. Do NOT list sources that are not cited inline.
6. Do NOT invent sources or URLs.

Follow this structure strictly.
`
})

const currentReport = computed(() => {
  return reports.value.find((report) => report.id === currentReportId.value) ?? null
})

const isReportOpen = computed(() => currentReportId.value !== null)
const reportHtml = computed(() => renderMarkdown(currentReport.value?.content ?? ''))

watch(
  () => props.reportPayload,
  (payload) => {
    if (!payload) return
    reportSequence.value += 1
    const report: ReportItem = {
      id: `report-${Date.now()}-${reportSequence.value}`,
      title: payload.title || 'Research Report',
      content: payload.content || '',
      createdAt: new Date().toLocaleString()
    }
    reports.value.unshift(report)
    currentReportId.value = report.id
  },
  { immediate: true }
)

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

const closeReport = () => {
  currentReportId.value = null
  emit('close-report')
}

const openReport = (reportId: string) => {
  currentReportId.value = reportId
}

const copyReportMarkdown = () => {
  if (!currentReport.value?.content.trim()) return
  navigator.clipboard.writeText(currentReport.value.content)
}

const downloadReportPdf = () => {
  if (!currentReport.value?.content.trim()) return
  const reportWindow = window.open('', '_blank')
  if (!reportWindow) return
  reportWindow.opener = null

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const safeTitle = escapeHtml(currentReport.value?.title || 'Research Report')
  const contentHtml = reportHtml.value

  reportWindow.addEventListener('load', () => {
    reportWindow.print()
  })

  reportWindow.document.open()
  reportWindow.document.write(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <style>
      body {
        font-family: "Space Grotesk", Arial, sans-serif;
        margin: 32px;
        color: #111827;
      }
      h1, h2, h3, h4 {
        font-family: "Fraunces", Georgia, serif;
      }
      p {
        line-height: 1.7;
      }
      pre {
        background: #111827;
        color: #e5e7eb;
        padding: 12px;
        border-radius: 10px;
        overflow-x: auto;
      }
      code {
        font-family: "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, monospace;
      }
      a {
        color: #0f4c5c;
      }
      blockquote {
        border-left: 3px solid #d97706;
        padding: 8px 12px;
        background: #fff7ed;
        border-radius: 8px;
      }
    </style>
  </head>
  <body>
    <h1>${safeTitle}</h1>
    ${contentHtml}
  </body>
</html>`)
  reportWindow.document.close()
  reportWindow.focus()
  window.setTimeout(() => {
    reportWindow.print()
  }, 250)
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
          <span class="meta-value">{{ outputProfile.label }}</span>
        </div>
      </div>
    </header>

    <section class="panel-section reports">
      <div class="section-head">
        <div>
          <h2>Reports</h2>
          <p>Generated reports stay here until the page is refreshed.</p>
        </div>
      </div>
      <div v-if="reports.length" class="report-grid">
        <button
          v-for="report in reports"
          :key="report.id"
          class="report-card"
          type="button"
          @click="openReport(report.id)"
        >
          <div class="report-card-title">{{ report.title }}</div>
          <div class="report-card-meta">{{ report.createdAt }}</div>
        </button>
      </div>
      <div v-else class="report-empty-state">No reports yet. Generate one to see it here.</div>
    </section>

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
        <div class="setting-card">
          <div class="setting-label">Output</div>
          <select v-model="settings.output">
            <option v-for="option in outputOptions" :key="option.id" :value="option.id">
              {{ option.label }} ({{ option.words }})
            </option>
          </select>
          <div class="setting-value">{{ outputProfile.summary }}</div>
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

  <div v-if="isReportOpen" class="report-modal" @click.stop>
    <div class="report-dialog" role="dialog" aria-modal="true" @click.stop>
      <div class="report-header">
        <div>
          <p class="report-label">Report preview</p>
          <h3>{{ currentReport?.title || 'Research Report' }}</h3>
        </div>
        <div class="report-actions">
          <button class="ghost" type="button" @click="copyReportMarkdown">Copy Markdown</button>
          <button class="ghost" type="button" @click="downloadReportPdf">Download PDF</button>
          <button class="close-button" type="button" @click="closeReport">X</button>
        </div>
      </div>
      <div class="report-body">
        <MarkdownView v-if="currentReport?.content" :content="currentReport.content" />
        <p v-else class="report-empty">No report content.</p>
      </div>
    </div>
  </div>
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

.reports {
  margin-top: 10px;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.report-card {
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #ffffff;
  border-radius: 16px;
  padding: 14px 16px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.report-card:hover {
  border-color: #d97706;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.report-card-title {
  font-weight: 600;
  font-size: 0.98rem;
  color: #1f2937;
}

.report-card-meta {
  font-size: 0.75rem;
  color: #6b7280;
}

.report-empty-state {
  padding: 16px;
  border-radius: 14px;
  border: 1px dashed rgba(120, 113, 108, 0.4);
  background: #fdfbf7;
  color: #6b7280;
  font-size: 0.9rem;
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

.report-modal {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
  overflow-y: auto;
}

.report-dialog {
  width: min(960px, 100%);
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 80px);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px 0;
}

.report-header h3 {
  margin: 4px 0 0;
  font-family: 'Fraunces', serif;
  font-size: 1.6rem;
}

.report-label {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #6b7280;
}

.report-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-button {
  border: 1px solid rgba(15, 23, 42, 0.2);
  background: #ffffff;
  color: #1f2937;
  border-radius: 10px;
  width: 36px;
  height: 36px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.close-button:hover {
  border-color: #111827;
}

.report-body {
  padding: 20px 24px 28px;
  overflow-y: auto;
}

.report-empty {
  margin: 0;
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

  .report-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

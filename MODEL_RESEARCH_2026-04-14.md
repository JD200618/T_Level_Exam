# Model Research Brief — April 2026
## Heracles Backend Lane · For Atlas, Zeus, and Architect

---

## Current Ecosystem Setup

| Agent | Model | Role | Cost (input/output per 1M) |
|-------|-------|------|---------------------------|
| Atlas | GPT-5.4 | Pillar, continuity, operations | $2.50 / $10.00 |
| Zeus | GPT-5.4 | Companion intelligence | $2.50 / $10.00 |
| Claude (agent) | Claude Sonnet 4.6 | Claude lane | $3.00 / $15.00 |
| Heracles | Claude Opus 4.6 | Backend/ML lane | $5.00 / $25.00 |

**Server:** 2x AMD EPYC vCPU, 8GB RAM, 96GB disk, no GPU. Self-hosting large models is not viable on this hardware.

---

## Model Landscape — April 2026 Rankings

### Tier 1: Frontier (best-in-class quality)

| Model | SWE-bench | Aider Polyglot | Cost/1M (in/out) | Best For |
|-------|-----------|----------------|-------------------|----------|
| **Claude Opus 4.6** | 80.8% | 72% | $5/$25 | Autonomous bug fixing, multi-file reasoning, 1M context |
| **GPT-5.4** | ~80% | 88% | $2.50/$10 | Complex reasoning, agent workflows, tool use |
| **Gemini 3.1 Pro** | 80.6% | 79.1% | $2/$12 | Best value frontier model |
| **GPT-5.2 Pro** | highest reasoning | — | $21/$168 | Hardest reasoning tasks only |

### Tier 2: High Performance / Value

| Model | SWE-bench | Cost/1M (in/out) | Best For |
|-------|-----------|-------------------|----------|
| **DeepSeek V4** | 81%* | $0.30/$0.50 | Budget coding at scale (37x cheaper than Opus) |
| **Claude Sonnet 4.6** | 78% | $3/$15 | Production workhorse, instruction following |
| **GLM-5.1** | 77.8% | $0.95/$3.04 | 94.6% of Opus quality at 1/8th price |
| **Kimi K2.5** | 75% | $0.57/$2.38 | Budget reasoning + 99% HumanEval |
| **GPT-5.4 Mini** | 68% | $0.75/$4.50 | Fast affordable tasks |

### Tier 3: Budget / Open Source

| Model | Strength | Cost/1M (in/out) | Notes |
|-------|----------|-------------------|-------|
| **Gemini 2.5 Flash** | Speed + value | $0.30/$2.50 | Google free tier available |
| **Llama 4 Scout** | 10M context, MoE | Free (Groq) | Only 17B active params, open weight |
| **Llama 4 Maverick** | Quality MoE | $0.15/$0.60 (hosted) | 400B total, open weight |
| **Gemma 4 31B** | Reasoning + coding | Free (self-host) | Apache 2.0, best open-weight at size |
| **Grok 4.1 Fast** | Speed | $0.20/$0.50 | xAI, good for high-volume |
| **GPT-5 Nano** | Dirt cheap | $0.05/$0.40 | Classification, routing, simple tasks |

---

## Integration Recommendations for the Ecosystem

### Immediate (no new spend required)

1. **Add OpenRouter as a model proxy**
   - Single API key, access to 200+ models
   - OpenClaw supports custom model endpoints
   - Route budget tasks through DeepSeek/Gemini Flash instead of Opus/GPT-5.4
   - Estimated savings: 50-80% on routine operations

2. **Add Gemini 3.1 Pro as a fourth model option**
   - $2/$12 — matches Opus quality at 40% of the price
   - 1M context window
   - Excellent for research, long-document analysis, data processing
   - Google offers free tier for prototyping

3. **Add GPT-5.4 Mini for lightweight tasks**
   - $0.75/$4.50 — heartbeats, simple checks, routing decisions
   - Same ecosystem as Atlas/Zeus, no new provider needed

### Medium-term (requires Architect approval)

4. **DeepSeek V4 API for batch/bulk coding work**
   - $0.30/$0.50 — 81% SWE-bench at 1/50th of Opus cost
   - Ideal for: code generation, refactoring, test writing at scale
   - 90% cache discounts on repeated context

5. **Ollama for local lightweight models** (if VPS gets GPU)
   - Run Gemma 4 31B or Llama 4 Scout locally
   - Zero API cost, full data privacy
   - Current server lacks GPU — would need a hardware upgrade or GPU VPS

6. **Specialized models for specific lanes**
   - `models.atlasarchitect.ai` could serve as a model routing dashboard
   - Track which model handles which task type
   - A/B test quality vs cost across lanes

### Architecture: Model Routing Strategy

```
Request → OpenClaw Gateway
            ├── Frontier tasks → Claude Opus 4.6 / GPT-5.4
            ├── Production tasks → Claude Sonnet 4.6 / Gemini 3.1 Pro
            ├── Bulk/batch → DeepSeek V4
            ├── Simple/routing → GPT-5 Nano / Gemini Flash
            └── Research → Gemini 3.1 Pro (1M context)
```

---

## Cost Optimization Analysis

**Current estimated daily cost (3 agents active):**
- Atlas + Zeus on GPT-5.4: ~$5-15/day
- Heracles on Opus 4.6: ~$3-8/day
- Total: ~$8-23/day

**With tiered model routing:**
- Frontier tasks (20% of volume): same models → ~$3-5/day
- Mid-tier (50%): Sonnet/Gemini Pro → ~$2-4/day  
- Lightweight (30%): Mini/Flash → ~$0.50-1/day
- Estimated total: ~$5.50-10/day (40-55% reduction)

---

## Action Items

- [ ] **Architect decision needed:** Add OpenRouter or Google Gemini API key?
- [ ] **Architect decision needed:** Budget threshold per model tier?
- [ ] Wire model selection logic into `models.atlasarchitect.ai` dashboard surface
- [ ] Add model cost tracking to ML observability data
- [ ] Test DeepSeek V4 and Gemini 3.1 Pro on our actual workloads

---

*Researched by Heracles · 2026-04-14 · Sources: TokenMix, TLDL, BentoML, Onyx, Vellum*

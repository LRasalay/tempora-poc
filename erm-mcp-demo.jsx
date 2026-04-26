import { useState, useEffect, useRef, useCallback } from "react";

// ─── Simulated ERM Microservice Data ───────────────────────────────
const CONTROLS = [
  { id: "CTRL-2024-00142", name: "Payment Authorization Verification", status: "Active", effectiveness: "Effective", businessLine: "Card Technology", requirement_ids: ["REQ-2024-0087", "REQ-2024-0023"], lastTestDate: "2026-03-15", testResult: "Pass", owner: "Maria Chen", frequency: "Quarterly", processId: "PRC-001" },
  { id: "CTRL-2024-00088", name: "Transaction Monitoring - AML", status: "Active", effectiveness: "Partially Effective", businessLine: "Commercial Banking", requirement_ids: ["REQ-2024-0087"], lastTestDate: "2026-02-28", testResult: "Fail", owner: "James Wright", frequency: "Monthly", processId: "PRC-002" },
  { id: "CTRL-2024-00201", name: "Access Control - Privileged Users", status: "Active", effectiveness: "Effective", businessLine: "Enterprise IT", requirement_ids: ["REQ-2024-0023", "REQ-2024-0112"], lastTestDate: "2026-03-01", testResult: "Pass", owner: "Priya Patel", frequency: "Quarterly", processId: "PRC-003" },
  { id: "CTRL-2024-00319", name: "Data Loss Prevention - PII", status: "Active", effectiveness: "Needs Improvement", businessLine: "Card Technology", requirement_ids: ["REQ-2024-0112"], lastTestDate: "2026-01-20", testResult: "Fail", owner: "David Kim", frequency: "Monthly", processId: "PRC-001" },
  { id: "CTRL-2024-00455", name: "Vendor Risk Assessment", status: "Active", effectiveness: "Effective", businessLine: "Third Party Risk", requirement_ids: ["REQ-2024-0198"], lastTestDate: "2026-03-22", testResult: "Pass", owner: "Sarah Lopez", frequency: "Annual", processId: "PRC-004" },
  { id: "CTRL-2024-00567", name: "Change Management Approval", status: "Active", effectiveness: "Effective", businessLine: "Enterprise IT", requirement_ids: ["REQ-2024-0023"], lastTestDate: "2026-04-01", testResult: "Pass", owner: "Tom Anderson", frequency: "Per-occurrence", processId: "PRC-003" },
];

const EVENTS = [
  { id: "EVT-2026-0341", title: "Unauthorized Access Attempt - Payments API", severity: "High", date: "2026-04-18", system: "Card Technology", status: "Open", controlIds: ["CTRL-2024-00142", "CTRL-2024-00201"], impact: "Potential exposure of 2,400 cardholder records", riskId: "RISK-2024-0023", lossAmount: 0, nearMiss: true },
  { id: "EVT-2026-0298", title: "AML Alert Backlog Exceeded Threshold", severity: "Medium", date: "2026-03-22", system: "Commercial Banking", status: "Under Review", controlIds: ["CTRL-2024-00088"], impact: "450 alerts exceeded 48-hour SLA", riskId: "RISK-2024-0015", lossAmount: 0, nearMiss: false },
  { id: "EVT-2026-0315", title: "PII Data Found in Unencrypted S3 Bucket", severity: "Critical", date: "2026-04-02", system: "Cloud Infrastructure", status: "Remediated", controlIds: ["CTRL-2024-00319"], impact: "SSN data for 12,000 customers exposed internally", riskId: "RISK-2024-0023", lossAmount: 85000, nearMiss: false },
  { id: "EVT-2026-0287", title: "Vendor SOC 2 Report Gap Identified", severity: "Low", date: "2026-03-10", system: "Third Party Risk", status: "Closed", controlIds: ["CTRL-2024-00455"], impact: "Payment processor missing Type II report for 2025", riskId: "RISK-2024-0042", lossAmount: 0, nearMiss: false },
  { id: "EVT-2026-0356", title: "Failed Payment Batch - Duplicate Authorization", severity: "Medium", date: "2026-04-20", system: "Card Technology", status: "Open", controlIds: ["CTRL-2024-00142"], impact: "3,200 duplicate charges totaling $1.2M processed", riskId: "RISK-2024-0058", lossAmount: 1200000, nearMiss: false },
];

const REQUIREMENTS = [
  { id: "REQ-2024-0087", title: "OCC 2024-15: Enhanced Transaction Monitoring", source: "OCC", status: "Active", effectiveDate: "2025-07-01", controlCount: 2, description: "Requirements for real-time transaction monitoring and suspicious activity reporting" },
  { id: "REQ-2024-0023", title: "PCI DSS v4.0 - Access Control", source: "PCI Council", status: "Active", effectiveDate: "2025-03-31", controlCount: 3, description: "Multi-factor authentication and privileged access management requirements" },
  { id: "REQ-2024-0112", title: "GLBA Safeguards Rule - Data Protection", source: "FTC/Federal", status: "Active", effectiveDate: "2025-06-09", controlCount: 2, description: "Requirements for safeguarding customer financial information" },
  { id: "REQ-2024-0198", title: "OCC Heightened Standards - Third Party Risk", source: "OCC", status: "Active", effectiveDate: "2025-01-01", controlCount: 1, description: "Enhanced due diligence requirements for critical third-party service providers" },
];

const RISKS = [
  { id: "RISK-2024-0023", title: "Unauthorized Data Access & Exfiltration", category: "Information Security", inherentRating: "Critical", residualRating: "High", trend: "Increasing", owner: "CISO Office", mitigationPlanId: "MIT-2024-0023", appetite: "Low", currentExposure: "Above Appetite" },
  { id: "RISK-2024-0015", title: "BSA/AML Compliance Failure", category: "Regulatory Compliance", inherentRating: "High", residualRating: "Medium", trend: "Stable", owner: "BSA Officer", mitigationPlanId: "MIT-2024-0015", appetite: "Very Low", currentExposure: "Within Appetite" },
  { id: "RISK-2024-0042", title: "Third-Party Service Disruption", category: "Operational", inherentRating: "Medium", residualRating: "Low", trend: "Decreasing", owner: "TPRM Office", mitigationPlanId: "MIT-2024-0042", appetite: "Medium", currentExposure: "Within Appetite" },
  { id: "RISK-2024-0058", title: "Process Execution Failure - Payments", category: "Operational", inherentRating: "High", residualRating: "Medium", trend: "Increasing", owner: "Card Technology", mitigationPlanId: "MIT-2024-0058", appetite: "Low", currentExposure: "Above Appetite" },
];

const MITIGATION_PLANS = [
  { id: "MIT-2024-0023", riskId: "RISK-2024-0023", status: "In Progress", completionTarget: "2026-09-30", percentComplete: 45, actions: ["Deploy zero-trust architecture for payment systems", "Implement real-time DLP monitoring", "Conduct red team assessment", "Upgrade IAM to support phishing-resistant MFA"], owner: "CISO Office" },
  { id: "MIT-2024-0015", riskId: "RISK-2024-0015", status: "On Track", completionTarget: "2026-06-30", percentComplete: 72, actions: ["Upgrade AML transaction monitoring engine", "Reduce alert review SLA to 24 hours", "Hire 15 additional BSA analysts"], owner: "BSA Officer" },
  { id: "MIT-2024-0042", riskId: "RISK-2024-0042", status: "On Track", completionTarget: "2026-12-31", percentComplete: 30, actions: ["Establish backup providers for critical services", "Implement real-time vendor health monitoring", "Update contracts with enhanced SLA terms"], owner: "TPRM Office" },
  { id: "MIT-2024-0058", riskId: "RISK-2024-0058", status: "In Progress", completionTarget: "2026-08-31", percentComplete: 25, actions: ["Implement dual-authorization for batch payments", "Deploy real-time reconciliation engine", "Add circuit-breaker for duplicate detection", "Conduct end-to-end process resilience testing"], owner: "Card Technology" },
];

const ASSESSMENTS = [
  { id: "ASMT-2026-Q1-142", controlId: "CTRL-2024-00142", type: "Control Test", period: "2026-Q1", status: "Completed", result: "Satisfactory", assessor: "Internal Audit", findings: 0, date: "2026-03-15" },
  { id: "ASMT-2026-Q1-088", controlId: "CTRL-2024-00088", type: "Control Test", period: "2026-Q1", status: "Completed", result: "Unsatisfactory", assessor: "Internal Audit", findings: 3, date: "2026-02-28" },
  { id: "ASMT-2026-Q1-201", controlId: "CTRL-2024-00201", type: "Control Test", period: "2026-Q1", status: "Completed", result: "Satisfactory", assessor: "Internal Audit", findings: 1, date: "2026-03-01" },
  { id: "ASMT-2026-Q1-319", controlId: "CTRL-2024-00319", type: "Control Test", period: "2026-Q1", status: "Completed", result: "Unsatisfactory", assessor: "External Auditor", findings: 4, date: "2026-01-20" },
];

const RCSAS = [
  {
    id: "RCSA-2026-CT-001", businessLine: "Card Technology", cycle: "2026 Annual",
    status: "In Progress", dueDate: "2026-06-30", completionPct: 65,
    owner: "Maria Chen", lastUpdated: "2026-04-15",
    riskIds: ["RISK-2024-0023", "RISK-2024-0058"],
    controlIds: ["CTRL-2024-00142", "CTRL-2024-00319"],
    inherentRiskRating: "Critical", residualRiskRating: "High",
    controlEffectivenessOverall: "Partially Effective",
    keyFindings: [
      { finding: "DLP control gaps in cloud-native payment services", severity: "High", controlId: "CTRL-2024-00319", status: "Open" },
      { finding: "Payment auth control not tested against API-based attack vectors", severity: "Medium", controlId: "CTRL-2024-00142", status: "Open" },
      { finding: "Insufficient segregation of duties in batch processing", severity: "High", controlId: null, status: "Remediation In Progress" },
    ],
    selfAssessedRisks: [
      { risk: "Emerging API attack vectors not covered by existing controls", likelihood: "High", impact: "Critical", trend: "Increasing" },
      { risk: "Cloud migration creating temporary control coverage gaps", likelihood: "Medium", impact: "High", trend: "Stable" },
      { risk: "Duplicate payment processing from batch failures", likelihood: "Medium", impact: "High", trend: "Increasing" },
    ],
    actionItems: [
      { action: "Expand DLP coverage to containerized microservices", owner: "David Kim", dueDate: "2026-07-15", status: "Not Started" },
      { action: "Commission API-specific penetration test for payments", owner: "Maria Chen", dueDate: "2026-05-31", status: "In Progress" },
      { action: "Implement maker-checker for batch payment approvals", owner: "Tom Anderson", dueDate: "2026-06-15", status: "In Progress" },
    ]
  },
  {
    id: "RCSA-2026-CB-001", businessLine: "Commercial Banking", cycle: "2026 Annual",
    status: "Completed", dueDate: "2026-03-31", completionPct: 100,
    owner: "James Wright", lastUpdated: "2026-03-28",
    riskIds: ["RISK-2024-0015"],
    controlIds: ["CTRL-2024-00088"],
    inherentRiskRating: "High", residualRiskRating: "Medium",
    controlEffectivenessOverall: "Partially Effective",
    keyFindings: [
      { finding: "AML monitoring engine generates excessive false positives (42% rate)", severity: "High", controlId: "CTRL-2024-00088", status: "Remediation In Progress" },
      { finding: "Alert disposition documentation inconsistent across analysts", severity: "Medium", controlId: "CTRL-2024-00088", status: "Remediation In Progress" },
    ],
    selfAssessedRisks: [
      { risk: "Regulatory scrutiny increasing on transaction monitoring effectiveness", likelihood: "High", impact: "High", trend: "Increasing" },
      { risk: "Staffing gaps in BSA/AML team", likelihood: "Medium", impact: "Medium", trend: "Stable" },
    ],
    actionItems: [
      { action: "Tune AML monitoring rules to reduce false positive rate below 25%", owner: "James Wright", dueDate: "2026-06-30", status: "In Progress" },
      { action: "Standardize alert disposition templates and training", owner: "BSA Team Lead", dueDate: "2026-05-15", status: "In Progress" },
    ]
  },
  {
    id: "RCSA-2026-IT-001", businessLine: "Enterprise IT", cycle: "2026 Annual",
    status: "Completed", dueDate: "2026-03-31", completionPct: 100,
    owner: "Priya Patel", lastUpdated: "2026-03-25",
    riskIds: ["RISK-2024-0023"],
    controlIds: ["CTRL-2024-00201", "CTRL-2024-00567"],
    inherentRiskRating: "High", residualRiskRating: "Low",
    controlEffectivenessOverall: "Effective",
    keyFindings: [
      { finding: "Service account rotation policy not enforced for 12 legacy systems", severity: "Medium", controlId: "CTRL-2024-00201", status: "Open" },
    ],
    selfAssessedRisks: [
      { risk: "Legacy system access controls incompatible with zero-trust rollout", likelihood: "Medium", impact: "Medium", trend: "Decreasing" },
    ],
    actionItems: [
      { action: "Migrate legacy systems to centralized IAM by Q3", owner: "Priya Patel", dueDate: "2026-09-30", status: "In Progress" },
    ]
  },
];

const PLAS = [
  {
    id: "PLA-2026-001", processId: "PRC-001", processName: "Payment Processing & Authorization",
    cycle: "2026 Annual", status: "In Progress", dueDate: "2026-06-30",
    completionPct: 55, owner: "Maria Chen", lastUpdated: "2026-04-20",
    controlIds: ["CTRL-2024-00142", "CTRL-2024-00319"],
    riskIds: ["RISK-2024-0023", "RISK-2024-0058"],
    overallRating: "Needs Improvement", processMaturity: "Level 3 - Defined",
    dimensions: [
      { name: "Process Design", rating: "Satisfactory", score: 3.5, maxScore: 5 },
      { name: "Control Effectiveness", rating: "Needs Improvement", score: 2.5, maxScore: 5 },
      { name: "Technology & Automation", rating: "Satisfactory", score: 3.0, maxScore: 5 },
      { name: "People & Training", rating: "Satisfactory", score: 3.5, maxScore: 5 },
      { name: "Monitoring & Reporting", rating: "Needs Improvement", score: 2.0, maxScore: 5 },
      { name: "Incident Response", rating: "Unsatisfactory", score: 1.5, maxScore: 5 },
    ],
    keyIssues: [
      { issue: "Batch payment processing lacks circuit-breaker for duplicate detection", severity: "Critical", linkedEvent: "EVT-2026-0356", status: "Open" },
      { issue: "Payment API exception handling does not cover OAuth token replay attacks", severity: "High", linkedEvent: "EVT-2026-0341", status: "Open" },
      { issue: "Manual reconciliation creates 24-hour blind spot for duplicate charges", severity: "High", linkedEvent: null, status: "Remediation Planned" },
    ],
    recommendations: [
      "Deploy real-time duplicate detection with sub-second latency",
      "Build incident response playbook covering all Tier 1 failure modes",
      "Automate reconciliation to reduce detection window from 24hrs to < 15 min",
      "Add API gateway rate limiting and token replay protection",
    ]
  },
  {
    id: "PLA-2026-002", processId: "PRC-002", processName: "AML Transaction Monitoring",
    cycle: "2026 Annual", status: "Completed", dueDate: "2026-03-31",
    completionPct: 100, owner: "James Wright", lastUpdated: "2026-03-28",
    controlIds: ["CTRL-2024-00088"], riskIds: ["RISK-2024-0015"],
    overallRating: "Needs Improvement", processMaturity: "Level 3 - Defined",
    dimensions: [
      { name: "Process Design", rating: "Satisfactory", score: 3.0, maxScore: 5 },
      { name: "Control Effectiveness", rating: "Needs Improvement", score: 2.0, maxScore: 5 },
      { name: "Technology & Automation", rating: "Needs Improvement", score: 2.5, maxScore: 5 },
      { name: "People & Training", rating: "Satisfactory", score: 3.0, maxScore: 5 },
      { name: "Monitoring & Reporting", rating: "Satisfactory", score: 3.5, maxScore: 5 },
      { name: "Incident Response", rating: "Satisfactory", score: 3.0, maxScore: 5 },
    ],
    keyIssues: [
      { issue: "False positive rate at 42% exceeds 25% target", severity: "High", linkedEvent: "EVT-2026-0298", status: "Remediation In Progress" },
      { issue: "5 open BSA analyst positions creating backlog pressure", severity: "Medium", linkedEvent: null, status: "Hiring In Progress" },
    ],
    recommendations: [
      "Deploy ML-based transaction scoring to reduce false positives below 25%",
      "Accelerate BSA analyst hiring to close staffing gap by Q2",
    ]
  },
  {
    id: "PLA-2026-003", processId: "PRC-003", processName: "Identity & Access Management",
    cycle: "2026 Annual", status: "Completed", dueDate: "2026-03-31",
    completionPct: 100, owner: "Priya Patel", lastUpdated: "2026-03-20",
    controlIds: ["CTRL-2024-00201", "CTRL-2024-00567"], riskIds: ["RISK-2024-0023"],
    overallRating: "Satisfactory", processMaturity: "Level 4 - Managed",
    dimensions: [
      { name: "Process Design", rating: "Strong", score: 4.5, maxScore: 5 },
      { name: "Control Effectiveness", rating: "Satisfactory", score: 3.5, maxScore: 5 },
      { name: "Technology & Automation", rating: "Satisfactory", score: 3.5, maxScore: 5 },
      { name: "People & Training", rating: "Strong", score: 4.0, maxScore: 5 },
      { name: "Monitoring & Reporting", rating: "Satisfactory", score: 3.5, maxScore: 5 },
      { name: "Incident Response", rating: "Satisfactory", score: 3.5, maxScore: 5 },
    ],
    keyIssues: [
      { issue: "12 legacy systems not yet onboarded to centralized IAM", severity: "Medium", linkedEvent: null, status: "Remediation In Progress" },
    ],
    recommendations: ["Complete legacy IAM migration per RCSA timeline", "Deploy phishing-resistant MFA for remaining service accounts"],
  },
];

// ─── MCP Tool Definitions ──────────────────────────────────────────
const MCP_TOOLS = {
  "erm-controls-mcp/search_controls": (p) => { let r = CONTROLS; if (p.keyword) r = r.filter(c => (c.name+c.id+c.businessLine).toLowerCase().includes(p.keyword.toLowerCase())); if (p.requirement_id) r = r.filter(c => c.requirement_ids.includes(p.requirement_id)); if (p.process_id) r = r.filter(c => c.processId === p.process_id); return r; },
  "erm-controls-mcp/get_control_detail": (p) => CONTROLS.find(c => c.id === p.control_id) || null,
  "erm-events-mcp/search_events": (p) => { let r = EVENTS; if (p.keyword) r = r.filter(e => (e.title+e.system).toLowerCase().includes(p.keyword.toLowerCase())); if (p.severity) r = r.filter(e => e.severity === p.severity); if (p.control_id) r = r.filter(e => e.controlIds.includes(p.control_id)); if (p.risk_id) r = r.filter(e => e.riskId === p.risk_id); return r; },
  "erm-events-mcp/get_event_detail": (p) => EVENTS.find(e => e.id === p.event_id) || null,
  "erm-requirements-mcp/search_requirements": (p) => { let r = REQUIREMENTS; if (p.keyword) r = r.filter(x => (x.title+x.source+x.description).toLowerCase().includes(p.keyword.toLowerCase())); return r; },
  "erm-requirements-mcp/get_requirement_detail": (p) => REQUIREMENTS.find(r => r.id === p.requirement_id) || null,
  "erm-requirements-mcp/list_mapped_controls": (p) => CONTROLS.filter(c => c.requirement_ids.includes(p.requirement_id)),
  "erm-risk-mcp/search_risks": (p) => { let r = RISKS; if (p.keyword) r = r.filter(x => (x.title+x.category).toLowerCase().includes(p.keyword.toLowerCase())); return r; },
  "erm-risk-mcp/get_risk_detail": (p) => RISKS.find(r => r.id === p.risk_id) || null,
  "erm-mitigation-mcp/get_plan_detail": (p) => MITIGATION_PLANS.find(m => m.id === p.plan_id) || null,
  "erm-mitigation-mcp/get_plan_by_risk": (p) => MITIGATION_PLANS.find(m => m.riskId === p.risk_id) || null,
  "erm-assessments-mcp/search_assessments": (p) => { let r = ASSESSMENTS; if (p.control_id) r = r.filter(a => a.controlId === p.control_id); if (p.period) r = r.filter(a => a.period === p.period); return r; },
  "erm-assessments-mcp/get_assessment_detail": (p) => ASSESSMENTS.find(a => a.id === p.assessment_id) || null,
  "erm-rcsa-mcp/search_rcsas": (p) => { let r = RCSAS; if (p.business_line) r = r.filter(x => x.businessLine.toLowerCase().includes(p.business_line.toLowerCase())); if (p.status) r = r.filter(x => x.status === p.status); if (p.cycle) r = r.filter(x => x.cycle === p.cycle); return r; },
  "erm-rcsa-mcp/get_rcsa_detail": (p) => RCSAS.find(r => r.id === p.rcsa_id) || null,
  "erm-rcsa-mcp/get_rcsa_findings": (p) => { const r = RCSAS.find(x => x.id === p.rcsa_id); return r ? r.keyFindings : []; },
  "erm-rcsa-mcp/get_rcsa_actions": (p) => { const r = RCSAS.find(x => x.id === p.rcsa_id); return r ? r.actionItems : []; },
  "erm-rcsa-mcp/get_rcsa_by_risk": (p) => RCSAS.filter(r => r.riskIds.includes(p.risk_id)),
  "erm-rcsa-mcp/get_rcsa_by_control": (p) => RCSAS.filter(r => r.controlIds.includes(p.control_id)),
  "erm-pla-mcp/search_plas": (p) => { let r = PLAS; if (p.process_id) r = r.filter(x => x.processId === p.process_id); if (p.status) r = r.filter(x => x.status === p.status); if (p.rating) r = r.filter(x => x.overallRating === p.rating); return r; },
  "erm-pla-mcp/get_pla_detail": (p) => PLAS.find(x => x.id === p.pla_id) || null,
  "erm-pla-mcp/get_pla_dimensions": (p) => { const x = PLAS.find(a => a.id === p.pla_id); return x ? x.dimensions : []; },
  "erm-pla-mcp/get_pla_issues": (p) => { const x = PLAS.find(a => a.id === p.pla_id); return x ? x.keyIssues : []; },
  "erm-pla-mcp/get_pla_by_risk": (p) => PLAS.filter(x => x.riskIds.includes(p.risk_id)),
};

// ─── Scenarios ─────────────────────────────────────────────────────
const SCENARIOS = [
  {
    label: "RCSA Assessment Review",
    query: "Show me the RCSA status for Card Technology — what risks did they self-identify and what action items are open?",
    icon: "📋", category: "RCSA",
    steps: [
      { tool: "erm-rcsa-mcp/search_rcsas", params: { business_line: "Card Technology" }, description: "Searching RCSAs for Card Technology..." },
      { tool: "erm-rcsa-mcp/get_rcsa_detail", params: { rcsa_id: "RCSA-2026-CT-001" }, description: "Loading RCSA details..." },
      { tool: "erm-rcsa-mcp/get_rcsa_findings", params: { rcsa_id: "RCSA-2026-CT-001" }, description: "Pulling RCSA findings..." },
      { tool: "erm-rcsa-mcp/get_rcsa_actions", params: { rcsa_id: "RCSA-2026-CT-001" }, description: "Loading action items..." },
      { tool: "erm-events-mcp/search_events", params: { keyword: "Card Technology" }, description: "Cross-referencing with recent events..." },
      { tool: "erm-risk-mcp/get_risk_detail", params: { risk_id: "RISK-2024-0023" }, description: "Pulling linked risk RISK-2024-0023..." },
      { tool: "erm-risk-mcp/get_risk_detail", params: { risk_id: "RISK-2024-0058" }, description: "Pulling linked risk RISK-2024-0058..." },
    ],
    synthesis: `## RCSA Review: Card Technology — RCSA-2026-CT-001

**Cycle:** 2026 Annual | **Status:** In Progress (65%) | **Due:** June 30, 2026
**Owner:** Maria Chen | **Last Updated:** April 15, 2026

### Self-Assessment Ratings

**Inherent Risk:** 🔴 Critical → **Residual Risk:** 🔴 High
**Control Effectiveness:** ⚠️ Partially Effective

### Self-Identified Risks

| Risk | Likelihood | Impact | Trend |
|------|-----------|--------|-------|
| Emerging API attack vectors not covered by existing controls | High | Critical | 📈 Increasing |
| Cloud migration creating temporary control coverage gaps | Medium | High | ➡️ Stable |
| Duplicate payment processing from batch failures | Medium | High | 📈 Increasing |

### Key Findings

| Finding | Severity | Control | Status |
|---------|----------|---------|--------|
| DLP control gaps in cloud-native payment services | 🔴 High | CTRL-2024-00319 | Open |
| Payment auth not tested against API-based attack vectors | 🟡 Medium | CTRL-2024-00142 | Open |
| Insufficient segregation of duties in batch processing | 🔴 High | — | Remediation In Progress |

### ⚠️ RCSA-to-Event Correlation

The RCSA's self-identified risks are being validated by real events:

- **API attack vector risk** → Confirmed by EVT-2026-0341 (unauthorized payments API access, April 18)
- **Batch processing risk** → Confirmed by EVT-2026-0356 (duplicate auth, $1.2M impact, April 20)

This is a strong signal that the RCSA is accurately capturing emerging risks, but remediation is lagging behind event occurrence.

### Open Action Items

| Action | Owner | Due | Status |
|--------|-------|-----|--------|
| Expand DLP coverage to containerized microservices | David Kim | July 15 | ⬜ Not Started |
| Commission API-specific penetration test for payments | Maria Chen | May 31 | 🔄 In Progress |
| Implement maker-checker for batch payment approvals | Tom Anderson | June 15 | 🔄 In Progress |

### Linked Risk Posture

Both linked risks are **above appetite**:
- RISK-2024-0023 (Data Access): High, increasing — ⛔ Above Appetite
- RISK-2024-0058 (Process Execution): Medium, increasing — ⛔ Above Appetite

### Recommendation

1. **Escalate the DLP action item** — "Not Started" with July 15 deadline is at risk given event frequency
2. **Accelerate the pen test** — API attack vector confirmed by live event; don't wait for May 31
3. **Flag to Risk Committee** — both linked risks above appetite with RCSA findings still open`
  },
  {
    label: "PLA Process Deep-Dive",
    query: "Run me through the Process Level Assessment for Payment Processing — what dimensions are weak and how do they connect to recent events?",
    icon: "🔬", category: "PLA",
    steps: [
      { tool: "erm-pla-mcp/search_plas", params: { process_id: "PRC-001" }, description: "Loading PLA for Payment Processing..." },
      { tool: "erm-pla-mcp/get_pla_detail", params: { pla_id: "PLA-2026-001" }, description: "Getting PLA details..." },
      { tool: "erm-pla-mcp/get_pla_dimensions", params: { pla_id: "PLA-2026-001" }, description: "Loading dimension scores..." },
      { tool: "erm-pla-mcp/get_pla_issues", params: { pla_id: "PLA-2026-001" }, description: "Pulling key issues..." },
      { tool: "erm-events-mcp/search_events", params: { risk_id: "RISK-2024-0058" }, description: "Finding related events..." },
      { tool: "erm-events-mcp/search_events", params: { risk_id: "RISK-2024-0023" }, description: "Finding info sec events..." },
      { tool: "erm-rcsa-mcp/get_rcsa_by_control", params: { control_id: "CTRL-2024-00142" }, description: "Cross-referencing RCSA findings..." },
      { tool: "erm-mitigation-mcp/get_plan_by_risk", params: { risk_id: "RISK-2024-0058" }, description: "Checking mitigation plan..." },
    ],
    synthesis: `## Process Level Assessment: Payment Processing & Authorization

**PLA-2026-001** | **Process:** PRC-001 | **Tier:** Tier 1 - Critical
**Status:** In Progress (55%) | **Due:** June 30, 2026
**Overall Rating:** ⚠️ Needs Improvement | **Maturity:** Level 3 - Defined

### Dimension Scorecard

| Dimension | Rating | Score | Assessment |
|-----------|--------|-------|------------|
| Process Design | ✅ Satisfactory | 3.5 / 5 | Exception handling paths incomplete |
| Control Effectiveness | ⚠️ Needs Improvement | 2.5 / 5 | DLP gap; API test coverage missing |
| Technology & Automation | ✅ Satisfactory | 3.0 / 5 | Core automated; batch reconciliation manual |
| People & Training | ✅ Satisfactory | 3.5 / 5 | Cross-training needed for batch ops |
| Monitoring & Reporting | ⚠️ Needs Improvement | 2.0 / 5 | No real-time duplicate detection |
| Incident Response | 🔴 Unsatisfactory | 1.5 / 5 | No batch failure playbook — exposed by EVT-2026-0356 |

### Critical Pattern: Event ↔ PLA ↔ RCSA Correlation

**Incident Response (1.5/5)** — Lowest-scoring dimension, directly exposed by EVT-2026-0356 ($1.2M duplicate charges). No playbook existed for batch failure scenarios. The RCSA independently flagged "insufficient SoD in batch processing."

**Monitoring & Reporting (2.0/5)** — Manual reconciliation creates 24hr detection blind spot. EVT-2026-0356 went undetected for hours because there was no real-time duplicate detection.

**Control Effectiveness (2.5/5)** — RCSA flagged CTRL-2024-00142 wasn't tested for API vectors. EVT-2026-0341 then proved exactly this gap.

### Key Issues

| Issue | Severity | Linked Event | Status |
|-------|----------|-------------|--------|
| Batch processing lacks duplicate detection circuit-breaker | 🔴 Critical | EVT-2026-0356 | Open |
| Payment API exception handling misses OAuth token replay | 🔴 High | EVT-2026-0341 | Open |
| Manual reconciliation = 24hr detection blind spot | 🔴 High | — | Remediation Planned |

### Mitigation Plan: MIT-2024-0058 (25% complete, target Aug 2026)

- ⬜ Implement dual-authorization for batch payments
- ⬜ Deploy real-time reconciliation engine
- ⬜ Add circuit-breaker for duplicate detection
- ⬜ Conduct end-to-end process resilience testing

### Recommendations

1. **Treat Incident Response as a P0** — build batch failure playbook within 2 weeks
2. **Deploy duplicate detection before full reconciliation** — hash-based circuit-breaker ships faster
3. **Merge PLA and RCSA action items** — avoid duplicate tracking across assessments
4. **Escalate MIT-2024-0058** — 25% complete with $1.2M loss already realized`
  },
  {
    label: "Cross-Assessment Correlation",
    query: "Compare RCSA findings with PLA results for Card Technology — are the self-assessments consistent and where are the blind spots?",
    icon: "🔗", category: "RCSA + PLA",
    steps: [
      { tool: "erm-rcsa-mcp/get_rcsa_detail", params: { rcsa_id: "RCSA-2026-CT-001" }, description: "Loading Card Tech RCSA..." },
      { tool: "erm-rcsa-mcp/get_rcsa_findings", params: { rcsa_id: "RCSA-2026-CT-001" }, description: "Getting RCSA findings..." },
      { tool: "erm-pla-mcp/get_pla_detail", params: { pla_id: "PLA-2026-001" }, description: "Loading Payment Processing PLA..." },
      { tool: "erm-pla-mcp/get_pla_dimensions", params: { pla_id: "PLA-2026-001" }, description: "Getting PLA dimensions..." },
      { tool: "erm-pla-mcp/get_pla_issues", params: { pla_id: "PLA-2026-001" }, description: "Getting PLA issues..." },
      { tool: "erm-events-mcp/search_events", params: { keyword: "Card Technology" }, description: "Loading recent events for validation..." },
      { tool: "erm-assessments-mcp/search_assessments", params: { control_id: "CTRL-2024-00142" }, description: "Checking control test results..." },
      { tool: "erm-assessments-mcp/search_assessments", params: { control_id: "CTRL-2024-00319" }, description: "Checking DLP control test results..." },
    ],
    synthesis: `## Cross-Assessment Correlation: Card Technology

**RCSA:** RCSA-2026-CT-001 (65% complete) | **PLA:** PLA-2026-001 (55% complete)

### Consistency Analysis

| Theme | RCSA View | PLA View | Consistent? |
|-------|-----------|----------|-------------|
| DLP Gaps | ✅ Identified as High finding | ✅ Drives Control Effectiveness 2.5/5 | 🟢 Yes |
| API Attack Vectors | ✅ Self-identified as emerging risk | ✅ Captured in key issues | 🟢 Yes |
| Batch Processing | ✅ "Insufficient SoD" finding | ✅ Incident Response 1.5/5 | 🟢 Yes |
| Monitoring Blind Spot | ❌ Not explicitly captured | ✅ Monitoring 2.0/5 — 24hr gap | 🔴 Gap |
| Process Design | ❌ Not assessed | ✅ Exception handling incomplete | 🟡 RCSA scope |

### 🔍 Blind Spots Identified

**Blind Spot 1: Monitoring & Detection Gap**
PLA identified a 24-hour detection blind spot from manual reconciliation. The RCSA did **not** capture this — it focused on control-level gaps but missed process-level monitoring. EVT-2026-0356 ($1.2M) went undetected for hours precisely because of this.

**Blind Spot 2: Incident Response Readiness**
PLA scored Incident Response at 1.5/5 (Unsatisfactory). The RCSA frames batch issues as a SoD control issue, not incident response preparedness. The PLA correctly identified **no playbook** existed.

**Blind Spot 3: Control Test vs. Reality Mismatch**
CTRL-2024-00142 passed Q1 testing (Satisfactory, 0 findings). Yet both RCSA and PLA flagged gaps — and EVT-2026-0341 confirmed them. The **control testing methodology** has a blind spot: it tests known scenarios but misses emerging vectors.

### Assessment vs. Reality

| Source | Card Tech Risk Posture |
|--------|----------------------|
| Control Tests (Q1) | CTRL-00142: ✅ Pass, CTRL-00319: ❌ Fail |
| RCSA Self-Assessment | ⚠️ Partially Effective |
| PLA Process Assessment | ⚠️ Needs Improvement |
| Actual Events (April) | 🔴 3 events, $1.2M+ losses, above appetite |

### Recommendations

1. **Harmonize RCSA and PLA scope** — RCSA must capture process-level risks (monitoring, incident response)
2. **Update control test methodology** — incorporate RCSA/PLA findings as test cases
3. **Create unified Card Tech remediation tracker** — merge RCSA + PLA + mitigation plan action items
4. **Recommend 2L challenge** — gap between "identified risk" and "materialized event" suggests 1L needs stronger 2L oversight on remediation timelines`
  },
  {
    label: "Event → Full Stack Trace",
    query: "EVT-2026-0356 just hit — $1.2M in duplicate charges. Trace through controls, RCSA, PLA, and mitigation status.",
    icon: "🚨", category: "Full Stack",
    steps: [
      { tool: "erm-events-mcp/get_event_detail", params: { event_id: "EVT-2026-0356" }, description: "Loading event details..." },
      { tool: "erm-controls-mcp/get_control_detail", params: { control_id: "CTRL-2024-00142" }, description: "Checking payment auth control..." },
      { tool: "erm-assessments-mcp/search_assessments", params: { control_id: "CTRL-2024-00142" }, description: "Pulling control test history..." },
      { tool: "erm-rcsa-mcp/get_rcsa_by_control", params: { control_id: "CTRL-2024-00142" }, description: "Finding related RCSA..." },
      { tool: "erm-pla-mcp/get_pla_detail", params: { pla_id: "PLA-2026-001" }, description: "Loading Payment Processing PLA..." },
      { tool: "erm-pla-mcp/get_pla_dimensions", params: { pla_id: "PLA-2026-001" }, description: "Getting PLA dimension scores..." },
      { tool: "erm-risk-mcp/get_risk_detail", params: { risk_id: "RISK-2024-0058" }, description: "Pulling process execution risk..." },
      { tool: "erm-mitigation-mcp/get_plan_by_risk", params: { risk_id: "RISK-2024-0058" }, description: "Checking mitigation plan..." },
    ],
    synthesis: `## Full-Stack Event Trace: EVT-2026-0356

**Event:** Failed Payment Batch — Duplicate Authorization
**Severity:** 🟡 Medium | **Date:** April 20, 2026 | **Status:** Open
**Impact:** 3,200 duplicate charges totaling **$1.2M** | **Actual loss event**

### Layer-by-Layer Analysis

**1. Control Layer — CTRL-2024-00142 (Payment Auth)**
Last Test: March 15 → ✅ Pass (Satisfactory, 0 findings)
**Disconnect:** Tested effective 5 weeks before the event. Test didn't cover duplicate batch scenarios.

**2. RCSA Layer — RCSA-2026-CT-001**
- ✅ Finding: "Insufficient SoD in batch processing" — High, Remediation In Progress
- ✅ Self-identified risk: "Duplicate payment processing from batch failures"
- **Verdict:** 1L correctly identified this risk. Remediation didn't complete before materialization.

**3. PLA Layer — PLA-2026-001**
- Incident Response: **1.5/5 (Unsatisfactory)** — "No playbook for batch failure scenarios"
- Monitoring: **2.0/5** — "No real-time duplicate detection; 24hr reporting delay"
- Key Issue: "Batch processing lacks circuit-breaker" — Critical, linked to this event
- **Verdict:** PLA accurately predicted the failure mode.

**4. Risk Layer — RISK-2024-0058**
Inherent: High → Residual: Medium → Trend: 📈 Increasing → ⛔ Above Appetite

**5. Mitigation — MIT-2024-0058 (25% complete)**
- ⬜ Circuit-breaker for duplicate detection ← **Would have prevented this**
- ⬜ Dual-authorization for batch payments
- ⬜ Real-time reconciliation engine
- ⬜ End-to-end process resilience testing

### Timeline: Warnings → Event

| When | Signal | Source |
|------|--------|--------|
| March 2026 | "Insufficient SoD in batch processing" | RCSA finding |
| March 2026 | Incident Response scored 1.5/5 | PLA dimension |
| March 2026 | "Duplicate processing" self-identified | RCSA risk |
| April 2026 | MIT-2024-0058 at 25% | Mitigation plan |
| **April 20** | **$1.2M duplicate charges** | **Live event** |

### Recommendations

1. **Deploy emergency duplicate detection** (hash-based) — days, not weeks
2. **Compress MIT-2024-0058** from Aug to June — $1.2M loss justifies acceleration
3. **Upgrade RCSA risk likelihood** from "Medium" to "High" — it materialized
4. **Build incident response playbook** immediately — PLA's 1.5/5 validated by this event
5. **Post-incident:** The warnings existed across RCSA, PLA, and mitigation — they weren't connected fast enough. This is the case for MCP-enabled AI monitoring.`
  },
  {
    label: "Executive Risk Rollup",
    query: "Which risks are above appetite? Cross-reference with RCSA findings and PLA ratings across all business lines.",
    icon: "📊", category: "Executive",
    steps: [
      { tool: "erm-risk-mcp/search_risks", params: { keyword: "" }, description: "Loading all active risks..." },
      { tool: "erm-rcsa-mcp/search_rcsas", params: { cycle: "2026 Annual" }, description: "Loading all 2026 RCSAs..." },
      { tool: "erm-pla-mcp/search_plas", params: {}, description: "Loading all PLAs..." },
      { tool: "erm-events-mcp/search_events", params: { keyword: "" }, description: "Pulling recent events..." },
      { tool: "erm-mitigation-mcp/get_plan_by_risk", params: { risk_id: "RISK-2024-0023" }, description: "Mitigation: Data Access risk..." },
      { tool: "erm-mitigation-mcp/get_plan_by_risk", params: { risk_id: "RISK-2024-0058" }, description: "Mitigation: Process Execution risk..." },
      { tool: "erm-controls-mcp/search_controls", params: { keyword: "" }, description: "Loading control effectiveness..." },
    ],
    synthesis: `## Executive Risk Dashboard — Multi-Assessment Rollup

### Risk Appetite Status

| Risk | Residual | Trend | Appetite | RCSA Rating | PLA Rating |
|------|----------|-------|----------|-------------|------------|
| RISK-2024-0023 — Data Access | 🔴 High | 📈 Up | ⛔ ABOVE | Partially Effective | Needs Improvement |
| RISK-2024-0058 — Process Execution | 🟡 Medium | 📈 Up | ⛔ ABOVE | Partially Effective | Needs Improvement |
| RISK-2024-0015 — BSA/AML | 🟡 Medium | ➡️ Stable | ✅ Within | Partially Effective | Needs Improvement |
| RISK-2024-0042 — Third-Party | 🟢 Low | 📉 Down | ✅ Within | — | — |

### RCSA Completion Status

| Business Line | RCSA | Status | Control Rating |
|--------------|------|--------|---------------|
| Card Technology | RCSA-2026-CT-001 | 🔄 65% In Progress | Partially Effective |
| Commercial Banking | RCSA-2026-CB-001 | ✅ Completed | Partially Effective |
| Enterprise IT | RCSA-2026-IT-001 | ✅ Completed | Effective |

### PLA Process Health

| Process | PLA Rating | Maturity | Weakest Dimension |
|---------|-----------|----------|------------------|
| Payment Processing | ⚠️ Needs Improvement | Level 3 | Incident Response (1.5/5) |
| AML Monitoring | ⚠️ Needs Improvement | Level 3 | Control Effectiveness (2.0/5) |
| Identity & Access Mgmt | ✅ Satisfactory | Level 4 | Technology (3.5/5) |

### Controls with Gaps

| Control | Effectiveness | Test Result | Findings |
|---------|--------------|-------------|----------|
| CTRL-00319 — DLP | 🔴 Needs Improvement | ❌ Fail | 4 |
| CTRL-00088 — AML | ⚠️ Partially Effective | ❌ Fail | 3 |

### April Event Activity

**$1.285M** in realized/potential losses concentrated in Card Technology:
- EVT-2026-0315: PII exposure ($85K)
- EVT-2026-0356: Duplicate charges ($1.2M)
- EVT-2026-0341: Unauthorized API access (near miss)

### Key Takeaways for Risk Committee

1. **Two risks above appetite** with increasing trends — both in Card Technology
2. **RCSA and PLA align** on risk themes but RCSA missed monitoring blind spot that PLA caught
3. **Mitigation plans behind pace** — MIT-2024-0023 (45%) and MIT-2024-0058 (25%) need acceleration
4. **Control tests paint an overly optimistic picture** — CTRL-00142 passed testing but failed in production
5. **Recommendation:** Commission targeted 2L review of Card Technology and accelerate both mitigation plans`
  },
  {
    label: "2L Oversight: RCSA vs PLA",
    query: "Are our RCSA self-assessments consistent with PLA findings? Flag any business lines where 1L is under-reporting risk.",
    icon: "⚖️", category: "2L Oversight",
    steps: [
      { tool: "erm-rcsa-mcp/search_rcsas", params: { cycle: "2026 Annual" }, description: "Loading all 2026 RCSAs..." },
      { tool: "erm-pla-mcp/search_plas", params: {}, description: "Loading all PLAs..." },
      { tool: "erm-pla-mcp/get_pla_dimensions", params: { pla_id: "PLA-2026-001" }, description: "Payment Processing PLA dimensions..." },
      { tool: "erm-pla-mcp/get_pla_dimensions", params: { pla_id: "PLA-2026-002" }, description: "AML Monitoring PLA dimensions..." },
      { tool: "erm-pla-mcp/get_pla_dimensions", params: { pla_id: "PLA-2026-003" }, description: "IAM PLA dimensions..." },
      { tool: "erm-events-mcp/search_events", params: { keyword: "" }, description: "Loading events for validation..." },
    ],
    synthesis: `## 2L Oversight: RCSA vs PLA Consistency Analysis

### Alignment Matrix

| Business Line | RCSA Rating | PLA Rating | Consistent? | Concern |
|--------------|-------------|------------|-------------|---------|
| Card Technology | Partially Effective | Needs Improvement | 🟡 Partial | 🔴 High |
| Commercial Banking | Partially Effective | Needs Improvement | 🟢 Aligned | 🟡 Medium |
| Enterprise IT | Effective | Satisfactory | 🟢 Aligned | 🟢 Low |

### 🔴 Card Technology — Inconsistency Detected

**RCSA says:** Partially Effective, 3 findings, action items in progress
**PLA says:** Needs Improvement, Incident Response 1.5/5 (Unsatisfactory)
**Events say:** 3 events in April, $1.2M+ in losses

**1L is under-reporting process-level risk:**
- RCSA missed the monitoring blind spot (24hr manual reconciliation) that PLA scored 2.0/5
- RCSA did not assess incident response readiness — PLA found it Unsatisfactory
- RCSA's "Medium likelihood" for duplicate processing was too optimistic — event materialized within weeks

### 🟢 Commercial Banking — Well Aligned

Both assessments converge on AML monitoring engine needing ML-based scoring. 1L self-assessment is honest and actionable.

### 🟢 Enterprise IT — Well Aligned

Single gap (12 legacy systems) consistently identified in both. Most mature business line.

### 2L Challenge Recommendations

1. **Card Technology needs 2L deep-dive** — expand RCSA scope to cover process dimensions
2. **Standardize RCSA-PLA linkage** — require RCSA to reference PLA dimension scores
3. **Introduce event-triggered RCSA updates** — >$100K loss = re-evaluate within 2 weeks
4. **Commercial Banking is a model** — their honest self-assessment is a template for other BLs`
  },
];

// ─── Components ────────────────────────────────────────────────────
const ToolCallCard = ({ tool, params, result, description, animState }) => {
  const serverName = tool.split("/")[0];
  const toolName = tool.split("/")[1];
  const colors = { "erm-controls-mcp": "#2563eb", "erm-events-mcp": "#dc2626", "erm-requirements-mcp": "#7c3aed", "erm-risk-mcp": "#d97706", "erm-mitigation-mcp": "#059669", "erm-assessments-mcp": "#0891b2", "erm-rcsa-mcp": "#e11d48", "erm-pla-mcp": "#8b5cf6" };
  const color = colors[serverName] || "#6b7280";
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${animState === "complete" ? color + "44" : "rgba(255,255,255,0.06)"}`, borderRadius: 8, padding: "10px 14px", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, transition: "all 0.4s ease", opacity: animState === "hidden" ? 0 : 1, transform: animState === "hidden" ? "translateY(8px)" : "translateY(0)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        {animState === "loading" && <span style={{ width: 12, height: 12, border: `2px solid ${color}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />}
        {animState === "complete" && <span style={{ color, fontSize: 14 }}>✓</span>}
        <span style={{ color, fontWeight: 600 }}>{serverName}</span>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
        <span style={{ color: "rgba(255,255,255,0.7)" }}>{toolName}</span>
      </div>
      <div style={{ color: "rgba(255,255,255,0.4)", paddingLeft: 20, fontSize: 11 }}>
        {animState === "loading" ? description : `→ ${typeof result === "object" ? (Array.isArray(result) ? `${result.length} records returned` : result ? "1 record returned" : "No results") : result}`}
      </div>
    </div>
  );
};

export default function ERMMCPDemo() {
  const [sel, setSel] = useState(null);
  const [states, setStates] = useState([]);
  const [results, setResults] = useState([]);
  const [showSynth, setShowSynth] = useState(false);
  const [synthText, setSynthText] = useState("");
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState("chat");
  const endRef = useRef(null);

  const scroll = useCallback(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, []);
  useEffect(() => { scroll(); }, [states, showSynth, synthText, scroll]);

  const run = async (s) => {
    setSel(s); setStates(s.steps.map(() => "hidden")); setResults(s.steps.map(() => null));
    setShowSynth(false); setSynthText(""); setRunning(true); setLogs([]);
    for (let i = 0; i < s.steps.length; i++) {
      await new Promise(r => setTimeout(r, 300));
      setStates(p => { const n = [...p]; n[i] = "loading"; return n; });
      setLogs(p => [...p, { timestamp: new Date().toISOString().split("T")[1].split(".")[0], tool: s.steps[i].tool, user: "jsmith", role: "risk_analyst", action: "read", status: "authorized" }]);
      await new Promise(r => setTimeout(r, 500 + Math.random() * 300));
      const fn = MCP_TOOLS[s.steps[i].tool];
      const res = fn ? fn(s.steps[i].params) : null;
      setResults(p => { const n = [...p]; n[i] = res; return n; });
      setStates(p => { const n = [...p]; n[i] = "complete"; return n; });
    }
    await new Promise(r => setTimeout(r, 400));
    setShowSynth(true);
    for (let i = 0; i <= s.synthesis.length; i += 4) { await new Promise(r => setTimeout(r, 6)); setSynthText(s.synthesis.slice(0, i)); }
    setSynthText(s.synthesis); setRunning(false);
  };

  const reset = () => { setSel(null); setStates([]); setResults([]); setShowSynth(false); setSynthText(""); setLogs([]); };

  const md = (text) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("## ")) return <h2 key={i} style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: "16px 0 8px", fontFamily: "'DM Sans', sans-serif" }}>{line.slice(3)}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} style={{ fontSize: 14, fontWeight: 600, color: "#cbd5e1", margin: "12px 0 6px", fontFamily: "'DM Sans', sans-serif" }}>{line.slice(4)}</h3>;
      if (line.startsWith("|")) {
        const tl = []; let j = i; while (j < lines.length && lines[j].startsWith("|")) { tl.push(lines[j]); j++; }
        if (i > 0 && lines[i-1]?.startsWith("|")) return null;
        const hc = tl[0].split("|").filter(c => c.trim()); const dr = tl.slice(2);
        return (<div key={i} style={{ overflowX: "auto", margin: "8px 0" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}><thead><tr>{hc.map((c, ci) => <th key={ci} style={{ textAlign: "left", padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap" }}>{c.trim()}</th>)}</tr></thead><tbody>{dr.map((row, ri) => { const cells = row.split("|").filter(c => c.trim()); return <tr key={ri}>{cells.map((c, ci) => <td key={ci} style={{ padding: "5px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#e2e8f0", whiteSpace: "nowrap" }}>{c.trim()}</td>)}</tr>; })}</tbody></table></div>);
      }
      if (line.startsWith("- ⬜") || line.startsWith("- ✅")) return <div key={i} style={{ padding: "2px 0 2px 16px", color: "#cbd5e1", fontSize: 12.5 }}>{line.slice(2)}</div>;
      if (/^\d+\.\s/.test(line)) return <div key={i} style={{ padding: "2px 0 2px 8px", color: "#cbd5e1", fontSize: 12.5 }}>{line}</div>;
      if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return <p key={i} style={{ margin: "3px 0", color: "#cbd5e1", fontSize: 12.5, lineHeight: 1.6 }}>{parts.map((p, pi) => p.startsWith("**") ? <strong key={pi} style={{ color: "#e2e8f0", fontWeight: 600 }}>{p.slice(2, -2)}</strong> : p)}</p>;
    });
  };

  const svc = [{ n: "Controls", c: "#2563eb" }, { n: "Events", c: "#dc2626" }, { n: "Reqs", c: "#7c3aed" }, { n: "Risk", c: "#d97706" }, { n: "Mitigation", c: "#059669" }, { n: "Assess", c: "#0891b2" }, { n: "RCSA", c: "#e11d48" }, { n: "PLA", c: "#8b5cf6" }];

  return (
    <div style={{ minHeight: "100vh", background: "#0c0f1a", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.1) transparent}`}</style>

      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "white" }}>R</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>ERM Copilot</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'IBM Plex Mono', monospace" }}>MCP-Enabled • 9 Microservices Connected</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 420 }}>
          {svc.map(s => <span key={s.n} style={{ fontSize: 9, padding: "3px 7px", borderRadius: 4, background: s.c + "22", color: s.c, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{s.n}</span>)}
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 65px)" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
            {["chat", "gateway"].map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", background: "none", border: "none", color: tab === t ? "#e2e8f0" : "rgba(255,255,255,0.3)", borderBottom: tab === t ? "2px solid #2563eb" : "2px solid transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{t === "gateway" ? "MCP Gateway Audit Log" : "AI Chat"}</button>)}
          </div>

          {tab === "chat" ? (
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              {!sel ? (
                <div style={{ animation: "fadeIn 0.5s ease" }}>
                  <div style={{ textAlign: "center", marginBottom: 24, marginTop: 28 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.03em" }}>Enterprise Risk Management — MCP Demo</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 540, margin: "0 auto", lineHeight: 1.6 }}>See how AI queries across Controls, Events, Risk, RCSA, PLA and more using MCP. Includes cross-assessment correlation, 2L oversight, and full-stack event tracing.</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 700, margin: "0 auto" }}>
                    {SCENARIOS.map((s, i) => (
                      <button key={i} onClick={() => run(s)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", color: "#e2e8f0" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb44"; e.currentTarget.style.background = "rgba(37,99,235,0.06)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 16 }}>{s.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 8 }}>{s.query}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 10, color: "#2563eb", fontFamily: "'IBM Plex Mono', monospace" }}>{s.steps.length} tool calls →</span>
                          <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: s.category === "RCSA" ? "#e11d4822" : s.category === "PLA" ? "#8b5cf622" : s.category === "RCSA + PLA" ? "#f59e0b22" : s.category === "Full Stack" ? "#dc262622" : s.category === "Executive" ? "#2563eb22" : "#05966922", color: s.category === "RCSA" ? "#e11d48" : s.category === "PLA" ? "#8b5cf6" : s.category === "RCSA + PLA" ? "#f59e0b" : s.category === "Full Stack" ? "#dc2626" : s.category === "Executive" ? "#2563eb" : "#059669", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{s.category}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16, animation: "fadeIn 0.3s ease" }}>
                    <div style={{ background: "#2563eb", borderRadius: "14px 14px 4px 14px", padding: "10px 16px", maxWidth: "80%", fontSize: 13, lineHeight: 1.5 }}>{sel.query}</div>
                  </div>
                  <div style={{ display: "flex", gap: 12, animation: "fadeIn 0.4s ease" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white" }}>R</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>MCP TOOL CALLS</div>
                        {sel.steps.map((step, i) => <ToolCallCard key={i} tool={step.tool} params={step.params} result={results[i]} description={step.description} animState={states[i]} />)}
                      </div>
                      {showSynth && (
                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px 20px", animation: "fadeIn 0.5s ease" }}>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 10, fontFamily: "'IBM Plex Mono', monospace" }}>SYNTHESIZED ANALYSIS</div>
                          {md(synthText)}
                          {running && <span style={{ display: "inline-block", width: 6, height: 14, background: "#2563eb", animation: "pulse 0.8s infinite", marginLeft: 2, verticalAlign: "middle" }} />}
                        </div>
                      )}
                    </div>
                  </div>
                  {!running && sel && <div style={{ textAlign: "center", marginTop: 24 }}><button onClick={reset} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 20px", color: "#e2e8f0", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>← Try Another Scenario</button></div>}
                  <div ref={endRef} />
                </div>
              )}
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
                {logs.length === 0 ? <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 60 }}>Run a scenario to see MCP Gateway audit logs here</div> : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 60px 80px 50px 80px", gap: 0, marginBottom: 8, padding: "0 8px" }}>
                      {["TIME", "TOOL", "USER", "ROLE", "ACT", "STATUS"].map(h => <span key={h} style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600 }}>{h}</span>)}
                    </div>
                    {logs.map((l, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 60px 80px 50px 80px", gap: 0, padding: "5px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)", animation: "fadeIn 0.3s ease" }}>
                        <span style={{ color: "rgba(255,255,255,0.4)" }}>{l.timestamp}</span>
                        <span style={{ color: "#93c5fd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.tool}</span>
                        <span style={{ color: "#e2e8f0" }}>{l.user}</span>
                        <span style={{ color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.role}</span>
                        <span style={{ color: "#86efac" }}>{l.action}</span>
                        <span style={{ color: "#4ade80" }}>✓ {l.status}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ width: 250, borderLeft: "1px solid rgba(255,255,255,0.06)", padding: 14, overflowY: "auto", background: "rgba(255,255,255,0.01)", flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", marginBottom: 10, fontFamily: "'IBM Plex Mono', monospace" }}>ARCHITECTURE</div>
          <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: 12, marginBottom: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ textAlign: "center", fontSize: 11, color: "#93c5fd", fontWeight: 600, marginBottom: 6 }}>AI Model (Claude)</div>
            <div style={{ textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.15)", marginBottom: 3 }}>↓</div>
            <div style={{ textAlign: "center", fontSize: 10, color: "#fbbf24", fontWeight: 600, padding: "5px 0", border: "1px dashed #fbbf2444", borderRadius: 6, marginBottom: 3, background: "rgba(251,191,36,0.05)" }}>MCP Gateway</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", textAlign: "center", marginBottom: 6 }}>Auth • Audit • Policy • Rate Limit</div>
            <div style={{ textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.15)", marginBottom: 6 }}>↓</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
              {svc.map(s => <div key={s.n} style={{ fontSize: 8, padding: "3px 4px", borderRadius: 3, textAlign: "center", background: s.c + "15", color: s.c, fontWeight: 600, border: `1px solid ${s.c}22` }}>{s.n}</div>)}
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>ASSESSMENT TYPES</div>
          {[
            { name: "RCSA", desc: "Risk & Control Self-Assessment — 1L self-identifies risks, rates controls, creates action items", color: "#e11d48" },
            { name: "PLA", desc: "Process Level Assessment — evaluates end-to-end process health across 6 dimensions with maturity scoring", color: "#8b5cf6" },
            { name: "Control Test", desc: "Independent testing of individual control design and operating effectiveness", color: "#0891b2" },
          ].map(a => (
            <div key={a.name} style={{ marginBottom: 8, padding: "8px 10px", background: a.color + "08", borderRadius: 6, border: `1px solid ${a.color}15` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: a.color, marginBottom: 3 }}>{a.name}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{a.desc}</div>
            </div>
          ))}

          {sel && (
            <div style={{ marginTop: 8, padding: "10px 12px", background: "rgba(37,99,235,0.06)", borderRadius: 8, border: "1px solid rgba(37,99,235,0.15)" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#93c5fd", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>MCP VALUE</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                This query touched <strong style={{ color: "#e2e8f0" }}>{new Set(sel.steps.map(s => s.tool.split("/")[0])).size} microservices</strong> in <strong style={{ color: "#e2e8f0" }}>{sel.steps.length} tool calls</strong>. Without MCP, an analyst navigates each system manually — typically 2-4 hours compressed into seconds.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

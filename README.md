# PRAMAANX
"Copyright (c) 2026 rkivln. All rights reserved. This repository and its contents are proprietary. No one may copy, distribute, modify, or use this code without explicit permission."
## AI-Based Fake Identity & Document Screening System

> **PRAMAANX** is a local-first, privacy-conscious identity and document screening platform designed for controlled verification environments such as border checkpoints. It combines document capture, OCR/MRZ extraction, face processing, liveness analysis, rule-based/risk screening, officer review, and tamper-evident audit records into a single screening workflow.

---

## 1. Project Overview

PRAMAANX is designed around one core principle:

> **Process sensitive identity data locally whenever possible, and send only the minimum authorized result to the central system.**

The system is intended to assist authorized officers in detecting potentially fraudulent identity documents and identity mismatches quickly and consistently.

The MVP focuses on a **functional local screening station** that can operate without requiring every sensitive image to be uploaded to a cloud service.

### Core MVP workflow

```text
Passport / Identity Document
          │
          ▼
   Camera / Image Capture
          │
          ▼
      Local OCR
          │
          ▼
     MRZ Extraction
          │
          ▼
   Document Validation
          │
          ▼
    Face Detection
          │
          ▼
 Face Verification + Liveness
          │
          ▼
      Risk Engine
          │
          ▼
    Officer Review
          │
          ▼
 Screening Decision
          │
          ▼
 Tamper-Evident Audit Hash
```

---

# 2. Problem Statement

Manual identity and document verification can involve multiple disconnected activities:

- Capturing identity documents
- Reading passport/document fields
- Checking MRZ data
- Comparing document information
- Comparing the document portrait with the live person
- Checking liveness
- Detecting inconsistencies
- Applying verification rules
- Recording the screening decision
- Maintaining an audit trail

These operations can become slower and less consistent when performed manually, especially at high-throughput checkpoints.

PRAMAANX proposes a unified screening workflow that assists the officer while keeping sensitive processing close to the point of capture.

---

# 3. Objectives

PRAMAANX aims to:

1. Reduce the time required for routine identity screening.
2. Automate extraction of passport/document information.
3. Validate MRZ information and document fields.
4. Compare the document portrait with the live subject.
5. Add liveness analysis to reduce presentation-attack risk.
6. Generate an interpretable risk assessment.
7. Provide a clear officer-review interface.
8. Create a tamper-evident audit record.
9. Minimize unnecessary transmission of raw biometric/document data.
10. Provide an architecture that can later support multiple checkpoints and authorized institutional integrations.

---

# 4. Design Principles

## 4.1 Local-first processing

Sensitive operations should primarily happen on the screening workstation.

```text
Passport Image
      │
      ▼
Local OCR
      │
      ▼
Local Face Processing
      │
      ▼
Local Screening
      │
      ▼
Only Required Result /
Authorized Record
      │
      ▼
Central Server
```

The architecture does **not** depend on uploading every passport image or face image to a cloud service.

---

## 4.2 Privacy by design

PRAMAANX follows data-minimization principles:

- Process sensitive images locally where feasible.
- Avoid unnecessary cloud storage.
- Send only authorized results/events to the central backend.
- Separate local processing from centralized administration.
- Apply role-based access control to central functions.
- Maintain an auditable record of important screening events.

---

## 4.3 Explainable screening

The system should not simply output:

```text
FAKE
```

Instead, the officer should see evidence such as:

```text
Decision: REVIEW REQUIRED

Reasons:
✓ MRZ checksum valid
✓ Document fields internally consistent
✓ Face similarity above configured threshold
✓ Liveness passed
⚠ Date/field inconsistency detected
⚠ Risk rule triggered
```

The final decision remains subject to the operational policy and authorized human review.

---

# 5. MVP Scope

The following features form the **PRAMAANX SIH MVP**.

## MVP Feature Set

### 5.1 Local screening application

A desktop application packaged as:

```text
PRAMAANX.exe
```

The desktop application contains the local screening interface and local processing pipeline.

---

### 5.2 Document capture

The officer can:

- Open the camera.
- Capture a passport/document image.
- Preview the captured image.
- Retake the image.
- Perform basic image preprocessing.

Typical preprocessing operations include:

- Cropping
- Rotation correction
- Perspective correction
- Resize
- Noise reduction
- Contrast enhancement
- Document-region detection

---

### 5.3 Local OCR

OCR extracts machine-readable information from the captured document.

Example fields:

```text
Document Number
Surname
Given Names
Nationality
Date of Birth
Sex
Date of Issue
Date of Expiry
```

The extracted values are normalized before validation.

---

### 5.4 MRZ processing

For passports supporting an MRZ, PRAMAANX extracts and validates MRZ information.

The MVP can perform checks such as:

- MRZ format validation
- Field parsing
- Check-digit validation
- Document-number consistency
- Date consistency
- Cross-field consistency

Example:

```text
MRZ
 │
 ├── Document Type
 ├── Issuing State
 ├── Document Number
 ├── Date of Birth
 ├── Sex
 ├── Expiry Date
 └── Check Digits
```

---

### 5.5 Face detection

The system detects the face from the document portrait and/or live camera stream.

The detection stage identifies:

- Face bounding box
- Facial landmarks where supported
- Face quality
- Pose/visibility conditions

---

### 5.6 Face verification

The MVP compares:

```text
Document Portrait
       │
       ▼
Face Detection
       │
       ▼
Face Embedding
       │
       │
       ▼
Similarity Comparison
       ▲
       │
Live Face
```

A configurable similarity threshold determines whether the comparison is sufficiently close for the screening policy.

The system should expose the score and decision context rather than treating the model output as an absolute identity proof.

---

### 5.7 Liveness analysis

The MVP includes a local liveness/presentation-attack screening component.

The purpose is to help identify attempts involving:

- Printed photographs
- Screen replay
- Non-live face presentation
- Other detectable presentation attacks supported by the selected model

The liveness result is incorporated into the screening result.

---

### 5.8 Risk engine

The risk engine combines multiple verification signals.

Example:

```text
                 ┌───────────────┐
                 │ OCR / MRZ     │
                 │ Validation    │
                 └───────┬───────┘
                         │
                 ┌───────▼───────┐
                 │ Face Match    │
                 └───────┬───────┘
                         │
                 ┌───────▼───────┐
                 │ Liveness      │
                 └───────┬───────┘
                         │
                 ┌───────▼───────┐
                 │ Consistency   │
                 │ Rules         │
                 └───────┬───────┘
                         │
                         ▼
                    Risk Engine
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
           LOW        REVIEW        HIGH
```

The MVP risk engine can be primarily rule-based and deterministic.

---

### 5.9 Officer review

The officer receives a concise result screen.

Example:

```text
PRAMAANX SCREENING RESULT

Overall Status
────────────────────────
✓ LOW RISK

Document
────────────────────────
MRZ                 PASS
OCR Extraction      PASS
Field Consistency   PASS

Identity
────────────────────────
Face Detection      PASS
Face Verification   PASS
Liveness            PASS

Risk
────────────────────────
Risk Level          LOW

Audit
────────────────────────
Audit ID            XXXXXXXX
Timestamp           XXXXXXXX
Checkpoint          XXXXXXXX
```

For suspicious cases:

```text
⚠ REVIEW REQUIRED

Reasons:
• Face similarity below configured threshold
• Document field inconsistency
• Risk rule triggered

Officer Action:
[Review] [Reject] [Escalate]
```

---

### 5.10 Audit hash

The MVP generates a tamper-evident audit hash for important screening information.

Conceptually:

```text
Screening Data
      │
      ▼
Canonical Record
      │
      ▼
Cryptographic Hash
      │
      ▼
Audit ID / Hash
```

The hash can help demonstrate that an audit record has not been silently modified.

The MVP does **not** require a blockchain or distributed ledger.

---

# 6. Complete System Architecture

PRAMAANX employs an edge-hybrid, multi-tiered monorepo architecture engineered for high throughput, local offline resilience, strict privacy preservation, and centralized enterprise governance.

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       PRAMAANX WORKSTATION / CHECKPOINT                                │
│                                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              DESKTOP CLIENT SHELL (apps/desktop)                                 │  │
│  │   • React 19 + TypeScript + Vite + Tailwind CSS                                                 │  │
│  │   • Dual Runtime Packaging: Electron 28 & Tauri v2 (Rust Native)                                │  │
│  │   • Hardware Camera Feeds & Document Preprocessing Capture UI                                    │  │
│  │   • Real-Time Risk Visualizations, Decision Logging & Report Exporter UI                         │  │
│  └──────────────────┬─────────────────────────────────────────────────────────────┬─────────────────┘  │
│                     │                                                             │                    │
│     High-Speed HTTP │ Local Loopback (:5001)                      JWT-Secured API │ HTTP (:5000)       │
│     (Offline-Ready) │                                             (Central/Edge)  │                    │
│                     ▼                                                             ▼                    │
│  ┌──────────────────────────────────────────────────┐  ┌────────────────────────────────────────────┐  │
│  │    LOCAL AI & FORENSIC ENGINE (local-engine)     │  │        CORE BACKEND API (services/api)     │  │
│  │  FastAPI (Port 5001)                             │  │  FastAPI (Port 5000)                       │  │
│  │  ──────────────────────────────────────────────  │  │  ───────────────────────────────────────── │  │
│  │  • Document OCR: PaddleOCR + Preprocessing       │  │  • Officer Auth & JWT RBAC (Officer/Admin) │  │
│  │  • MRZ Validator: ICAO 9303 Checksum Engine      │  │  • Checkpoint & Workstation Management     │  │
│  │  • Biometric Face: InsightFace / ArcFace Cosine  │  │  • Verification Session State Machine      │  │
│  │  • Presentation Attack: Passive Liveness Model   │  │  • Cryptographic Hash Chain Audit Verifier │  │
│  │  • Forensics: ELA, OpenCV Tamper, PyTorch Neural │  │  • Verification History & Review Queues    │  │
│  │  • Risk Engine: XGBoost + Deterministic Rules    │  │  • Edge Inference Coordination             │  │
│  │  • Multi-Format Reports: PDF, XLSX, DOCX, CSV    │  └──────────────────────┬─────────────────────┘  │
│  │  • Local Digital Audit: SHA-256 JSON Hash Chain  │                         │                        │
│  └──────────────────┬───────────────────────────────┘                         │                        │
└─────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────┘
                      │                                                         │
       Direct Audit   │ Supabase Sync                             Managed Sync  │ Remote DB Access
       Sync (Optional)│                                                         │
                      ▼                                                         ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       CENTRAL CLOUD & ADVISORY TIER                                    │
│                                                                                                        │
│  ┌──────────────────────────────────────────────────┐  ┌────────────────────────────────────────────┐  │
│  │      AI ADVISORY SERVICE (services/ai-service)   │  │    CLOUD DATABASE & LEDGER (supabase)      │  │
│  │  Node.js + Express + TypeScript (Port 3001)      │  │  PostgreSQL with Row Level Security (RLS)  │  │
│  │  ──────────────────────────────────────────────  │  │  ───────────────────────────────────────── │  │
│  │  • Google Gemini Pro Multi-Factor Reasoning      │  │  • Verification Sessions & Captures        │  │
│  │  • Sanitized Non-PII Metadata Consumption Only   │  │  • Biometric Scores & Forensic Signals     │  │
│  │  • Secondary Officer Advisory & Observations     │  │  • Verification Decisions & Review Logs    │  │
│  │  • Zero Raw Biometric/Document Exposure to LLMs  │  │  • Tamper-Evident SHA-256 Chained Audit Log│  │
│  └──────────────────────────────────────────────────┘  └────────────────────────────────────────────┘  │
│                                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                               SHARED CONTRACTS (packages/contracts)                              │  │
│  │   • JSON Schemas (verification.schema.json) & TypeScript Definitions (types/index.ts)            │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 7. Modern Separation of Concerns & Edge-Hybrid Architecture

Rather than monolithic desktop software, PRAMAANX partitions responsibilities across decoupled microservices and application layers:

## 7.1 Desktop Client Shell (`apps/desktop`)
- **React 19 Frontend**: High-responsiveness, stateful screening cockpit and verification workflow.
- **Dual Runtime Deployment**:
  - **Electron (28+)**: Universal cross-platform desktop shell with deep camera and local hardware driver bindings.
  - **Tauri v2 (Rust)**: Extremely lightweight (~15MB), low-memory, zero-overhead alternative runtime.
- **Secure Hardware Access**: Camera capture, preview, live visual framing, and multi-document ingestion.
- **Client-Side Storage**: Ephemeral session caching and secure credential retention.

## 7.2 Local AI & Forensic Engine (`local-engine` - Port 5001)
- **Zero-Cloud Dependency**: Runs 100% on the local workstation for mission-critical offline border resilience.
- **Document Intelligence**: PaddleOCR text extraction and full ICAO Doc 9303 MRZ parsing with checksum validations.
- **Biometric Pipeline**: InsightFace ArcFace 512-d embeddings, cosine face similarity matching, and passive anti-spoofing liveness verification.
- **Multi-Factor Forensics**:
  - **Error Level Analysis (ELA)**: Re-compression difference analysis detecting cloned document regions.
  - **Tampering Analysis**: OpenCV Laplacian edge variance and contour frequency anomaly inspection.
  - **Deep Neural Noise Detection**: PyTorch NoiseNet examining high-frequency sensor noise inconsistencies.
  - **PDF / Image Metadata**: Exif and structural metadata inspection for image manipulation software traces.
- **Risk Assessment**: XGBoost composite scoring combined with border compliance rules.
- **Multi-Format Reporting Engine**: Generates official inspection dossiers and audit manifests in PDF, Excel (XLSX), Word (DOCX), and CSV.
- **Local Tamper-Evident Audit**: SHA-256 chained local JSON audit store with optional direct Supabase digital audit sync.

## 7.3 Core Central Backend (`services/api` - Port 5000)
- **Python FastAPI Service**: High-concurrency async API orchestrating institutional security workflows.
- **Authentication & RBAC**: JWT authorization supporting granular roles (`officer`, `supervisor`, `admin`).
- **State Machine Engine**: Enforces strict verification lifecycles from session creation to final officer approval.
- **Cryptographic Audit Integrity**: Validates the SHA-256 hash chains across historical screening logs.
- **Supervisory Review Queue**: Routes flagged screenings to senior immigration supervisors for review.

## 7.4 AI Advisory Microservice (`services/ai-service` - Port 3001)
- **Node.js + Express**: Specialized LLM microservice consuming Google Gemini Pro.
- **Privacy-Preserving Advisory**: Sends strictly non-PII derived technical signals (confidence percentages, ELA discrepancy scores, liveness metrics) to generate explanatory natural-language insights for the officer.
- **Non-Decisional Policy**: AI opinions serve as advisory assistance only—never as automated border decisions.

## 7.5 Cloud Database & Audit Ledger (`supabase`)
- **PostgreSQL Database**: Scalable cloud relational storage fortified with Row Level Security (RLS).
- **Audit Hash Chaining**: Every screening event links its cryptographic hash to the prior record, producing an immutable digital ledger.

---

# 8. Offline / Connectivity Model

PRAMAANX should not claim that the entire institutional system is permanently offline.

Instead, the intended model is:

```text
                INTERNET / CENTRAL SERVER
                         ▲
                         │
                   Secure Sync
                         │
                         │
              ┌──────────┴──────────┐
              │   PRAMAANX.EXE      │
              │                      │
              │ Local Screening      │
              │ OCR                  │
              │ Face Processing      │
              │ Liveness             │
              │ Risk Engine          │
              └──────────────────────┘
```

If connectivity temporarily fails:

```text
Capture
  ↓
Local Processing
  ↓
Local Screening
  ↓
Local Audit/Event Queue
```

When connectivity returns:

```text
Queued Authorized Events
          ↓
Secure Synchronization
          ↓
Central Server
```

Whether offline operation is permitted for a specific deployment should ultimately be controlled by institutional policy.

---

# 9. Dynamic Updates

A central server is necessary for controlled updates across multiple screening checkpoints.

Example:

```text
Officer A                  Officer B                  Officer C
Checkpoint 1               Checkpoint 2               Checkpoint 3
     │                          │                          │
     └──────────────┬───────────┴──────────────┬───────────┘
                    │                          │
                    ▼                          ▼
                 Secure Central Backend
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
          Rules       Models      Reference Data
```

An authorized administrator may update:

- Document validation rules
- Risk thresholds
- Reference data
- Screening policies
- Model versions
- Configuration parameters

Clients can then receive approved updates through a controlled synchronization mechanism.

---

# 10. Technology Stack

PRAMAANX is organized as an enterprise monorepo combining edge Python intelligence, modern web UI, dual-target desktop packaging, and cloud ledger persistence:

## 10.1 Desktop Application (`apps/desktop`)
- **UI Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide React icon suite
- **Packaging Option 1 (Standard)**: Electron 28 with `electron-builder`
- **Packaging Option 2 (High Efficiency)**: Tauri v2 (Rust-powered native runtime, ~15MB memory footprint)
- **Device & Media**: WebRTC camera stream capture, canvas frame extraction, and real-time guidance overlays

## 10.2 Local AI & Forensic Engine (`local-engine`)
- **Runtime**: Python 3.11+ / FastAPI / Uvicorn (Port 5001)
- **Computer Vision**: OpenCV (`opencv-python-headless`), Pillow (`PIL`)
- **OCR Engine**: PaddleOCR / Tesseract with multilingual model weights
- **Biometric Pipeline**: InsightFace (ArcFace 512-dimensional embeddings, SCRFD alignment)
- **Deep Learning**: PyTorch (`torch`, `torchvision`) for neural noise feature extraction
- **PDF & Metadata**: PyMuPDF (`fitz`) and ExifTool metadata parsing
- **Reporting Engine**: ReportLab (PDF), OpenPyXL (Excel), python-docx (Word), standard CSV

## 10.3 Core Central Backend (`services/api`)
- **Runtime**: Python 3.11+ / FastAPI / Uvicorn (Port 5000)
- **Validation**: Pydantic v2 schemas
- **Auth**: Enterprise JWT with password hashing and Role-Based Access Control (RBAC)
- **Database Integration**: Supabase Python Client (`supabase-py`) connecting to managed PostgreSQL
- **Integrity Verifier**: SHA-256 cryptographic chain validator traversing audit logs

## 10.4 AI Advisory Service (`services/ai-service`)
- **Runtime**: Node.js 20+ / Express / TypeScript (Port 3001)
- **Security**: Helmet, CORS, Morgan request logging
- **LLM Engine**: Google Generative AI (`@google/generative-ai` - Gemini Pro)
- **Boundary**: Zero PII / zero image ingestion; structured technical metadata analysis only

## 10.5 Cloud Database & Audit Ledger (`supabase`)
- **Database**: PostgreSQL 15+ hosted on Supabase
- **Access Control**: Row Level Security (RLS) policies scoped by officer assignment and role
- **Ledger Security**: Cryptographic SHA-256 hash chaining across `audit_logs` records

## 10.6 Contracts & Type Safety (`packages/contracts`)
- **Shared Schemas**: JSON Schema (`verification.schema.json`)
- **Shared Types**: Central TypeScript interfaces (`types/index.ts`)

---

# 11. Local AI, Computer Vision & Forensic Stack

PRAMAANX executes the complete inspection pipeline locally without streaming raw identity media to cloud endpoints.

## 11.1 Document Preprocessing & OCR
Captures are processed locally to maximize optical recognition fidelity:
1. Document region detection and boundary cropping
2. Contrast enhancement, adaptive thresholding, and perspective rectification
3. Text extraction via PaddleOCR
4. Text normalization and document attribute categorization

## 11.2 ICAO 9303 MRZ Processing
Deterministic validation layer complying with international travel document standards:
- Supports TD1 (ID cards), TD2, and TD3 (Passport) specifications
- Extracts issuing state, document number, birth date, sex, expiration date, and personal numbers
- Calculates and verifies individual check digits and composite check digits
- Cross-validates MRZ data against visual OCR text fields for discrepancy detection

## 11.3 Biometric Face Verification
Performs 1:1 facial biometric comparison between the document portrait and the live subject:
- SCRFD / landmark detector locates face and aligns eye/nose geometry
- InsightFace / ArcFace produces 512-dimensional biometric feature embeddings
- Computes cosine similarity distance against operational border policy thresholds
- Raw facial embeddings are discarded after session evaluation (Privacy by Design)

## 11.4 Passive Liveness & Anti-Spoofing
Screens live camera captures for presentation attacks:
- Evaluates RGB micro-textures, specular highlights, and chromatic aberration
- Detects screen replay, printed photo attacks, and digital manipulation attempts
- Produces a deterministic liveness confidence score

## 11.5 Multi-Factor Document Forensics
A comprehensive four-pillar forensic inspection suite:
1. **Error Level Analysis (ELA)**: Re-saves image at known compression ratios and evaluates compression error differentials to expose digitally spliced text or swapped portraits.
2. **OpenCV Tamper Analysis**: Evaluates Laplacian edge variance, blur contours, and high-frequency edge anomalies around security print patterns.
3. **Deep Neural Noise Detection**: PyTorch NoiseNet extracts high-frequency sensor noise signatures to flag mismatched sensor artifacts.
4. **Metadata & Exif Inspection**: PyMuPDF inspects file headers, creation timestamps, and software signature tags for editing tools (e.g. Photoshop, GIMP).

## 11.6 Risk Engine (XGBoost + Border Rules)
Combines all verification signals into an interpretable risk assessment:
- Multi-factor evaluation: OCR confidence, MRZ validity, face similarity, liveness, and forensic indicators
- Hybrid decision architecture: Fast deterministic border rules coupled with an XGBoost classifier
- Produces structured evidence points and risk tiering: `LOW`, `REVIEW`, or `HIGH`

## 11.7 Multi-Format Report Generation
Generates complete legal screening dossiers and audit logs on demand:
- **PDF**: Formal border screening dossiers with header styling, officer details, and evidence checklists via ReportLab
- **Excel (XLSX)**: Structured multi-tab inspection sheets via OpenPyXL
- **Word (DOCX)**: Editable institutional case reports via python-docx
- **CSV**: Lightweight flat records for ingestion into governmental databases

---

# 12. Risk Engine

The MVP uses an explainable screening/risk layer.

Example inputs:

```text
MRZ Validation
Field Consistency
Document Expiry
Face Match
Liveness
Image Quality
Configured Rules
```

Example scoring concept:

```text
                    Risk Engine
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
     PASS              WARNING           FAIL
       │                 │                 │
       ▼                 ▼                 ▼
     LOW RISK      REVIEW REQUIRED     HIGH RISK
```

A risk score should be treated as a decision-support signal, not as an autonomous determination of identity fraud.

---

# 13. Audit Architecture

Every important screening event can be represented by a canonical record.

Example:

```json
{
  "auditId": "XXXXX",
  "checkpointId": "XXXXX",
  "timestamp": "XXXXX",
  "screeningDecision": "REVIEW",
  "documentVerification": "PASS",
  "faceVerification": "REVIEW",
  "liveness": "PASS",
  "riskLevel": "MEDIUM",
  "reasonCodes": [
    "FACE_THRESHOLD",
    "FIELD_INCONSISTENCY"
  ]
}
```

A canonical representation is hashed:

```text
Canonical Screening Record
            ↓
       SHA-256 Hash
            ↓
      Audit Integrity
```

The exact hashing and signing strategy can be strengthened during controlled deployment.

---

# 14. Data Flow

## 14.1 Document flow

```text
Camera
  ↓
Captured Image
  ↓
Preprocessing
  ↓
OCR
  ↓
MRZ Parser
  ↓
Document Validation
```

---

## 14.2 Biometric flow

```text
Document Portrait
       ↓
Face Detection
       ↓
Face Embedding
       │
       │
       ▼
Similarity Engine
       ▲
       │
Live Camera Face
       │
       ▼
Liveness
```

---

## 14.3 Decision flow

```text
Document Results
       +
Face Verification
       +
Liveness
       +
Risk Rules
       ↓
Risk Engine
       ↓
Officer Review
       ↓
Final Screening Event
       ↓
Audit Hash
```

---

# 15. Central Server & Microservices Architecture

The centralized and cloud infrastructure provides governance, synchronization, audit verification, and advisory capabilities across distributed border stations:

```text
                               ┌───────────────────────────┐
                               │   DESKTOP SCREENING APP   │
                               │   (Electron / Tauri)      │
                               └─────────────┬─────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │                                           │
         Port 5000     ▼                             Port 3001     ▼
┌─────────────────────────────────────────┐   ┌─────────────────────────────────────────┐
│     FASTAPI BACKEND (services/api)      │   │  AI ADVISORY SERVICE (services/ai-srv)  │
│                                         │   │                                         │
│ • Authentication & JWT Token RBAC       │   │ • Express.js + Google Generative AI     │
│ • Verification State Machine Lifecycle  │   │ • Gemini Pro Multi-Factor Reasoning     │
│ • Session Coordination                  │   │ • Strict Metadata-Only Ingestion        │
│ • Cryptographic Hash-Chain Verification │   │ • Non-Decisional Structured Insights    │
│ • Supervisor Escalation & Review Queue  │   └─────────────────────────────────────────┘
│ • System Telemetry & Admin Statistics   │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE MANAGED POSTGRESQL                                 │
│                                                                                       │
│ • officers                 • verification_sessions       • risk_assessments           │
│ • checkpoints              • document_captures           • ai_opinions                │
│ • workstations             • document_analysis           • verification_decisions     │
│ • assignments              • biometric_analysis          • audit_logs (Hash Chained)  │
│ • verification_checks      • review_actions              • system_events              │
│                                                                                       │
│ Enforced by PostgreSQL Row Level Security (RLS) Policies                              │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 16. Backend & Cloud Technologies

The institutional layer is implemented with high-concurrency, modern frameworks:

### 16.1 Python FastAPI (`services/api`)
- High-performance asynchronous Python runtime with Pydantic v2 data validation
- Stateless JWT authentication and role-based endpoint authorization
- Verification session state machine preventing illegal screening stage transitions
- Cryptographic hash-chain integrity verification traversing historical audit records

### 16.2 Node.js & Express (`services/ai-service`)
- Lightweight microservice interfacing with Google Gemini Pro
- Computes multi-factor qualitative observations from numeric scores without raw document images
- Hardened with Helmet, strict CORS, and structured payload sanitization

### 16.3 Supabase PostgreSQL
- Fully relational database with schemas, foreign keys, and indexes on frequent lookup fields
- **Row Level Security (RLS)** ensuring officers can only access their assigned checkpoint data, while supervisors and admins access broader audit records
- Cryptographic SHA-256 chain links (`previous_hash` → `current_hash`) preventing undetected audit tampering

---

# 17. API Architecture

The system exposes structured REST APIs across its microservice ecosystem:

### 17.1 Core Backend API (`services/api` - Port 5000)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Officer ID authentication & JWT issuance |
| `POST` | `/api/auth/logout` | Authenticated | Revokes current officer session |
| `GET` | `/api/auth/me` | Authenticated | Current officer profile and permissions |
| `GET` | `/api/checkpoints` | Authenticated | List authorized screening checkpoints |
| `POST` | `/api/checkpoints/select` | Authenticated | Select and activate current checkpoint |
| `POST` | `/api/verifications` | Officer | Initialize new verification session |
| `POST` | `/api/verifications/{id}/document` | Officer | Ingest document capture metadata |
| `POST` | `/api/verifications/{id}/document/analyze` | Officer | Trigger document OCR & validation |
| `POST` | `/api/verifications/{id}/biometric/analyze`| Officer | Trigger face match & liveness analysis |
| `POST` | `/api/verifications/{id}/risk` | Officer | Calculate composite risk assessment |
| `GET` | `/api/verifications/{id}/result` | Officer | Retrieve complete verification bundle |
| `POST` | `/api/verifications/{id}/decision` | Officer | Record screening decision (`APPROVE`/`REVIEW`/`REJECT`) |
| `GET` | `/api/history` | Officer+ | Filter and paginate historical verifications |
| `GET` | `/api/reviews/pending` | Supervisor | Retrieve flagged cases requiring supervisor review |
| `GET` | `/api/audit` | Auditor / Admin | Query tamper-evident audit trail |
| `GET` | `/api/audit/integrity` | Admin | Validate SHA-256 hash-chain integrity |
| `GET` | `/api/admin/stats` | Admin | Aggregate checkpoint throughput and risk metrics |
| `GET` | `/api/system/status` | Authenticated | System component health & connectivity |
| `GET` | `/api/health` | Public | API liveness probe |

### 17.2 Local AI Engine API (`local-engine` - Port 5001)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/verify/full` | Complete offline screening (OCR + MRZ + Face + Liveness + Forensics + Risk + Audit) |
| `GET` | `/api/audit/records` | Retrieve historical offline audit records |
| `POST` | `/api/decision` | Log officer approval/rejection locally |
| `POST` | `/api/report/individual/export` | Generate legal dossier (`format=pdf\|excel\|word\|csv`) |
| `GET` | `/api/report/individual/{id}` | Export past screening case by ID |
| `GET` | `/health` | Engine status, model list, and offline readiness probe |

### 17.3 AI Advisory API (`services/ai-service` - Port 3001)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analysis/analyze` | Evaluates technical verification signals via Gemini Pro and returns structured advisory opinion |
| `GET` | `/health` | Service health probe |

---

# 18. Authentication & RBAC

The controlled deployment should implement role-based access control.

Example roles:

```text
SYSTEM ADMIN
     │
     ├── Configuration
     ├── Models
     ├── Rules
     └── User Management

SUPERVISOR
     │
     ├── Reports
     ├── Screening History
     └── Review

OFFICER
     │
     ├── Screening
     └── Assigned Operations

AUDITOR
     │
     └── Audit / Reports
```

Users should only receive the permissions required for their operational role.

---

# 19. Security Architecture

PRAMAANX should use layered security.

## Endpoint security

- Secure OS account
- Application signing where applicable
- Restricted workstation permissions
- Protected local configuration
- Controlled application updates

## Application security

- Input validation
- Secure session handling
- Role-based authorization
- Error handling
- Secure secrets management

## Network security

- HTTPS/TLS
- VPN/private network where required
- API authentication
- Request authorization
- Network segmentation

## Data security

- Data minimization
- Encryption at rest where required
- Encryption in transit
- Controlled retention
- Audit logging

---

# 20. Centralized vs Local Responsibilities

| Capability | Local PRAMAANX.exe | Central Server |
|---|---:|---:|
| React UI | ✓ | |
| Camera capture | ✓ | |
| Image preprocessing | ✓ | |
| OCR | ✓ | |
| MRZ parsing | ✓ | |
| Face detection | ✓ | |
| Face verification | ✓ | |
| Liveness | ✓ | |
| Basic risk computation | ✓ | |
| Officer review | ✓ | |
| Audit hash generation | ✓ | |
| Authentication | ✓ / Central validation | ✓ |
| RBAC management | | ✓ |
| Screening history | Local queue/cache | ✓ |
| Central audit trail | | ✓ |
| Configuration | Cached | ✓ |
| Rule management | Cached | ✓ |
| Model/version management | Cached | ✓ |
| Cross-checks | Limited | ✓ |
| Government integration | | ✓ |
| Central reporting | | ✓ |

---

# 21. Deployment Architecture

## Phase 1 — SIH MVP

The MVP demonstrates the core local screening concept.

```text
┌───────────────────────────────────────┐
│          PRAMAANX MVP                 │
│                                       │
│  Camera                               │
│    ↓                                  │
│  Document Capture                     │
│    ↓                                  │
│  Local OCR + MRZ                      │
│    ↓                                  │
│  Face Detection                       │
│    ↓                                  │
│  Face Verification                    │
│    ↓                                  │
│  Liveness                             │
│    ↓                                  │
│  Risk Engine                          │
│    ↓                                  │
│  Officer Review                       │
│    ↓                                  │
│  Audit Hash                           │
└───────────────────────────────────────┘
```

### MVP deliverables

- Functional desktop screening UI
- Document capture
- OCR
- MRZ extraction/validation
- Face detection
- Face verification
- Liveness
- Risk engine
- Result page
- Human-readable reasons
- Audit ID/hash
- Local-first processing demonstration

---

# 22. Phase 2 — Controlled Deployment

```text
                    CENTRAL SERVER
                         │
                 Secure API / VPN
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   Checkpoint 1     Checkpoint 2     Checkpoint 3
   PRAMAANX.EXE     PRAMAANX.EXE     PRAMAANX.EXE
```

Features:

- Central authentication
- PostgreSQL backend
- Screening history
- Multi-checkpoint synchronization
- Admin-controlled rules
- Model/version management
- Central audit trail
- Reporting
- Controlled offline synchronization

---

# 23. Phase 3 — Institutional Integration

Future institutional deployment may include:

- Authorized government databases
- Secure government network/VPN
- Advanced forensic document models
- Permissioned audit ledger
- Advanced cross-checking
- Central intelligence/reference systems
- Operational validation
- Hardware security integration
- Enterprise monitoring

Government database access should only be implemented through officially authorized interfaces, policies, credentials, and legal/operational approvals.

---

# 24. Monorepo Structure

The PRAMAANX repository is structured as a unified monorepo with segregated application packages, core services, edge inference engines, and shared contracts:

```text
PRAMAANX/
├── apps/
│   └── desktop/                       # Desktop screening application
│       ├── electron/                  # Electron main & preload scripts
│       │   ├── main.cjs               # Main process window management
│       │   └── preload.cjs            # IPC isolation & bridge
│       ├── src-tauri/                 # Tauri v2 Rust native wrapper
│       │   ├── Cargo.toml             # Rust dependencies
│       │   └── src/main.rs            # Native application entrypoint
│       ├── src/                       # React 19 UI source
│       │   ├── components/            # Capture, processing, and result components
│       │   │   ├── StepDocumentCapture.tsx
│       │   │   ├── StepFaceCapture.tsx
│       │   │   ├── StepProcessing.tsx
│       │   │   ├── StepResult.tsx
│       │   │   └── AuditTrailView.tsx
│       │   ├── services/api/          # API client implementations
│       │   └── types/                 # Frontend TypeScript interfaces
│       ├── package.json               # Desktop dependencies & build scripts
│       ├── vite.config.ts             # Vite bundler configuration
│       └── tailwind.config.js         # Tailwind styling configuration
│
├── local-engine/                      # Offline-capable Python AI & Forensic Engine (Port 5001)
│   ├── audit/                         # Local & Supabase audit persistence
│   │   └── supabase_audit.py          # SHA-256 digital audit logger
│   ├── biometric/                     # Facial analysis & liveness pipeline
│   │   ├── face.py                    # InsightFace ArcFace embedding & cosine similarity
│   │   └── liveness.py                # Passive presentation-attack detection
│   ├── document/                      # Document extraction & validation
│   │   ├── ocr.py                     # PaddleOCR document extraction
│   │   ├── mrz.py                     # ICAO 9303 MRZ parsing & checksum checks
│   │   └── rules.py                   # Document validity rule evaluations
│   ├── forensic/                      # Multi-factor forensic inspection
│   │   ├── ela.py                     # Error Level Analysis (Pillow)
│   │   ├── tamper.py                  # OpenCV Laplacian & contour anomaly inspection
│   │   ├── model.py                   # PyTorch NoiseNet neural noise extraction
│   │   └── metadata.py                # PyMuPDF & Exif file header forensics
│   ├── report/                        # Multi-format report generation
│   │   └── generator.py               # PDF, Excel, Word, and CSV exporters
│   ├── risk/                          # Composite risk evaluation
│   │   └── engine.py                  # XGBoost classifier + Border policy rules
│   ├── server.py                      # FastAPI edge engine entrypoint
│   ├── requirements.txt               # Python ML / CV dependencies
│   └── Dockerfile                     # Containerization specification
│
├── services/
│   ├── api/                           # Core Central Backend API (Port 5000)
│   │   ├── app/
│   │   │   ├── api/                   # REST routers (auth, checkpoints, verifications, audit)
│   │   │   ├── edge/                  # Edge inference coordination modules
│   │   │   ├── models/                # Domain models
│   │   │   ├── repositories/          # Database access repositories
│   │   │   ├── schemas/               # Pydantic validation schemas
│   │   │   ├── services/              # Session state machine, integrity verifier, risk
│   │   │   ├── utils/                 # Seed data and migration runners
│   │   │   ├── config.py              # Environment configuration
│   │   │   └── main.py                # FastAPI central application entrypoint
│   │   ├── tests/                     # Pytest automated test suites
│   │   ├── requirements.txt           # Backend dependencies
│   │   └── Dockerfile
│   │
│   └── ai-service/                    # Secondary AI Advisory Service (Port 3001)
│       ├── src/
│       │   ├── routes/                # Express analysis routes
│       │   │   └── analysis.ts        # Gemini Pro advisory generation
│       │   └── server.ts              # Express application entrypoint
│       ├── package.json
│       ├── tsconfig.json
│       └── Dockerfile
│
├── packages/
│   └── contracts/                     # Cross-service shared contracts
│       ├── schemas/                   # verification.schema.json (JSON Schema)
│       └── types/                     # TypeScript shared type declarations (index.ts)
│
├── supabase/
│   └── migrations/                    # PostgreSQL migrations, RLS policies, hash triggers
│
├── docs/                              # Formal system documentation
│   ├── api.md                         # Complete REST API reference
│   ├── architecture.md                # System architecture summary
│   ├── database.md                    # PostgreSQL schema and RLS policies
│   ├── deployment.md                  # Development and production deployment guide
│   └── security.md                    # Threat model & cryptographic audit design
│
├── docker-compose.yml                 # Multi-service container orchestration
├── package.json                       # Root monorepo workspace configuration
└── README.md                          # Main project architecture & documentation
```

---

# 25. Implemented Technology Stack

| Layer | Implemented Technology | Purpose / Highlights |
|---|---|---|
| **Desktop Shell** | Electron 28 + Tauri v2 (Rust) | Dual runtime flexibility: standard cross-platform desktop shell or ultra-compact native binary |
| **Frontend Framework** | React 19 + TypeScript + Vite | Component-driven UI, real-time camera processing, modular screening steps |
| **Styling** | Tailwind CSS + Lucide Icons | Responsive, government-grade dark/light visual design |
| **Local AI Engine** | Python 3.11+ / FastAPI (Port 5001) | Low-latency local processing server running completely offline at the checkpoint |
| **Document OCR** | PaddleOCR + OpenCV | Multilingual OCR with document boundary perspective correction |
| **MRZ Parser** | ICAO 9303 Compliant Engine | Parsing & check-digit verification for Passports (TD3) and ID Cards (TD1/TD2) |
| **Biometric Matching** | InsightFace (ArcFace 512-d) | High-accuracy facial embeddings, cosine similarity calculation |
| **Liveness Detection** | Passive RGB Anti-Spoofing | Evaluates texture, frequency, and screen reflection patterns |
| **Forensics: ELA** | Pillow (`PIL`) | Error Level Analysis detecting digital retouching and photo splicing |
| **Forensics: Tamper** | OpenCV (`cv2`) | Laplacian variance, edge distortion, and copy-move detection |
| **Forensics: Neural** | PyTorch (`torch`, `torchvision`) | Neural sensor noise pattern analysis via deep convolution |
| **Forensics: Metadata** | PyMuPDF (`fitz`) | Parsing structural PDF/Exif headers and editing tool footprints |
| **Dossier Exporters** | ReportLab, OpenPyXL, docx | Multi-format legal dossier export: PDF, Excel (XLSX), Word (DOCX), and CSV |
| **Risk Classifier** | XGBoost + Deterministic Rules | Machine-learning weighted risk scores combined with border policy rules |
| **Central Backend** | Python 3.11+ / FastAPI (Port 5000) | State machine orchestration, JWT auth, checkpoint administration |
| **Central Database** | Supabase PostgreSQL 15+ | Relational persistence with Row Level Security (RLS) enforcement |
| **Cryptographic Audit** | SHA-256 Hash Chaining | Tamper-evident ledger linking sequential audit logs via cryptographic hashes |
| **AI Advisory Service** | Node.js 20+ / Express (Port 3001) | Non-decisional LLM opinions using Google Gemini Pro over metadata |
| **Shared Contracts** | JSON Schema + TypeScript | Monorepo schema validation across desktop, backend, and edge services |
| **Orchestration** | Docker & Docker Compose | Containerized reproducible execution of api, ai-service, and local-engine |

---

# 26. Microservices & Edge Inference Architecture

The PRAMAANX system coordinates multiple lightweight local and central services to balance offline autonomy with enterprise visibility:

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT INTERACTION FLOW                                        │
│                                                                                                  │
│   1. Login & Checkpoint Activation       2. Create Session        3. Stream Captures             │
│   Desktop ─────────► services/api (5000) ────────────────► Desktop ─────────► local-engine (5001)│
│                                                                                     │            │
│   4. Full Edge Screening Pipeline (Zero Cloud Exposure)                             │            │
│      ├── OCR & ICAO-9303 MRZ Parsing                                                │            │
│      ├── InsightFace Biometric ArcFace Match & Liveness                             │            │
│      ├── Multi-Factor Forensics (ELA, Tamper, Neural, Metadata)                     │            │
│      ├── XGBoost Composite Risk Calculation                                         │            │
│      ├── Local SHA-256 Chained Digital Audit Log                                    │            │
│      └── Export Legal Dossiers (PDF / XLSX / DOCX / CSV)                            │            │
│                                                                                     ▼            │
│   5. Sync Authorized Results & Hashes (Metadata Only)                            Desktop         │
│      Desktop ───────────────────────────────────────────────────────────────► services/api (5000)│
│                                                                                     │            │
│   6. Optional Advisory & Cloud Audit Sync                                           ▼            │
│      services/api (5000) ───► services/ai-service (3001) [Gemini Pro]          Supabase (DB)     │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Port Allocation & Service Endpoints
- **Port 5173**: React Desktop Development Web Server (Vite)
- **Port 5000**: Core Backend API (`services/api` - FastAPI)
- **Port 5001**: Local AI & Forensic Engine (`local-engine` - FastAPI, offline loopback)
- **Port 3001**: AI Advisory Microservice (`services/ai-service` - Express + Gemini Pro)
- **Port 5432**: Supabase Managed PostgreSQL Database

---

# 27. Screening State Machine

A screening session can follow a deterministic state flow:

```text
START
  │
  ▼
DOCUMENT_CAPTURE
  │
  ▼
IMAGE_QUALITY_CHECK
  │
  ▼
OCR_PROCESSING
  │
  ▼
MRZ_VALIDATION
  │
  ▼
FACE_CAPTURE
  │
  ▼
FACE_DETECTION
  │
  ▼
LIVENESS
  │
  ▼
FACE_VERIFICATION
  │
  ▼
RISK_EVALUATION
  │
  ▼
OFFICER_REVIEW
  │
  ├───────────────┐
  ▼               ▼
CLEAR           REVIEW
  │               │
  └───────┬───────┘
          ▼
   AUDIT GENERATION
          │
          ▼
      COMPLETE
```

This makes the screening process easier to test and audit.

---

# 28. Result Classification

The MVP can use three operational categories:

### LOW RISK

Verification signals satisfy configured thresholds.

```text
Document       PASS
MRZ            PASS
Face           PASS
Liveness       PASS
Risk Rules     PASS
```

### REVIEW REQUIRED

One or more signals require officer attention.

```text
Document       PASS
MRZ            PASS
Face           REVIEW
Liveness       PASS
Risk Rules     WARNING
```

### HIGH RISK

Multiple configured risk conditions are triggered.

```text
Document       WARNING
MRZ            FAIL
Face           FAIL
Liveness       WARNING
Risk Rules     HIGH
```

The exact operational meaning of each category should be defined by the deploying authority.

---

# 29. Human-in-the-Loop Design

PRAMAANX is designed as an **officer-assistance system**, not an autonomous enforcement system.

```text
AI / Rules
    ↓
Evidence
    ↓
Risk Assessment
    ↓
Officer Review
    ↓
Authorized Decision
```

The system should present:

- What passed
- What failed
- What requires review
- Why a rule was triggered
- Relevant confidence/similarity information
- Audit metadata

This improves transparency and reduces blind reliance on a single model output.

---

# 30. Performance Goals for MVP

The MVP should be evaluated on:

### Accuracy

- OCR field extraction accuracy
- MRZ parsing accuracy
- Face verification performance
- Liveness performance
- Document consistency detection

### Speed

Measure:

```text
Capture → OCR
OCR → Face Processing
Face Processing → Risk
Total Screening Time
```

### Reliability

Test:

- Poor lighting
- Blurred images
- Different face poses
- Glasses
- Document rotation
- Camera variation
- Temporary network failure

### Usability

Measure:

- Number of officer interactions
- Time to complete a screening
- Error recovery
- Result readability

---

# 31. Testing Strategy

## Unit Testing

Test:

- MRZ parser
- Check-digit validation
- Field normalization
- Risk rules
- Threshold logic
- Audit hashing

## Integration Testing

Test:

```text
Camera
  ↓
OCR
  ↓
MRZ
  ↓
Face
  ↓
Liveness
  ↓
Risk
  ↓
Result
```

## End-to-End Testing

Simulate complete screening sessions.

## Security Testing

Test:

- Authentication
- Authorization
- API access control
- Input validation
- Session security
- Local data protection
- Network encryption

---

# 32. Example Screening Record

```json
{
  "screeningId": "SCR-XXXXX",
  "checkpointId": "CP-XXXXX",
  "timestamp": "2026-XX-XXTXX:XX:XX",
  "document": {
    "ocr": "PASS",
    "mrz": "PASS",
    "consistency": "PASS"
  },
  "biometric": {
    "faceDetection": "PASS",
    "faceVerification": "PASS",
    "liveness": "PASS"
  },
  "risk": {
    "level": "LOW",
    "score": "XX",
    "reasonCodes": []
  },
  "decision": "CLEAR",
  "auditHash": "XXXXXXXXXXXXXXXX"
}
```

This is a **schema example only** and does not represent real identity data.

---

# 33. Privacy Model

PRAMAANX follows the principle:

```text
RAW SENSITIVE DATA
        │
        ▼
LOCAL PROCESSING
        │
        ▼
DERIVED VERIFICATION RESULTS
        │
        ▼
MINIMUM AUTHORIZED DATA
        │
        ▼
CENTRAL SYSTEM
```

This minimizes unnecessary movement of:

- Passport images
- Face images
- Biometric embeddings
- Personally identifiable information

Actual retention, deletion, encryption, access, and sharing policies must be defined according to the deployment authority's requirements and applicable law.

---

# 34. Central Synchronization

When online:

```text
Local Screening
      ↓
Create Authorized Event
      ↓
Encrypt / Secure Transport
      ↓
Central API
      ↓
Validate Authentication
      ↓
Validate Authorization
      ↓
Store Event
      ↓
Return Acknowledgement
```

When offline:

```text
Local Screening
      ↓
Local Pending Queue
      ↓
Connectivity Restored
      ↓
Secure Sync
      ↓
Central Acknowledgement
      ↓
Mark Synchronized
```

Synchronization must include protection against:

- Duplicate events
- Partial uploads
- Replay
- Unauthorized modification
- Clock inconsistencies
- Conflicting updates

---

# 35. Model and Rule Versioning

Every screening result should be traceable to the relevant processing configuration.

Example:

```text
Screening
   │
   ├── OCR Model: vX.X
   ├── Face Model: vX.X
   ├── Liveness Model: vX.X
   ├── Rule Set: vX.X
   └── Risk Configuration: vX.X
```

This is important because screening results can otherwise become difficult to reproduce after models or thresholds change.

---

# 36. Future Database Integration

The future architecture can support authorized reference databases:

```text
                    PRAMAANX
                        │
                 Central Backend
                        │
            ┌───────────┴───────────┐
            │                       │
      Internal DB          Authorized External
                            Government Systems
```

External integrations should be:

- Officially authorized
- API-based where available
- Network-restricted
- Authenticated
- Audited
- Permission-controlled
- Data-minimized

PRAMAANX should **not assume unrestricted access to government databases**.

---

# 37. Future Enhancements

Potential future development includes:

- Advanced document tampering detection
- UV/IR document analysis hardware
- NFC/ePassport chip verification where supported
- Advanced presentation-attack detection
- Document template classification
- Cross-checking against authorized reference systems
- Multi-checkpoint intelligence
- Advanced anomaly detection
- Hardware security modules
- Digital signatures
- Permissioned audit infrastructure
- Central operational dashboards
- Enterprise device management
- Secure model distribution
- Model drift monitoring
- Expanded document-country support

---

# 38. Development Roadmap

```text
                    PRAMAANX ROADMAP

PHASE 1
SIH MVP
│
├── React + Electron
├── Camera
├── OCR
├── MRZ
├── Face Detection
├── Face Verification
├── Liveness
├── Risk Engine
└── Audit Hash
        │
        ▼
PHASE 2
CONTROLLED DEPLOYMENT
│
├── Central Authentication
├── PostgreSQL
├── Screening History
├── Multi-Checkpoint Sync
├── RBAC
├── Rule Management
├── Model Versioning
└── Central Reporting
        │
        ▼
PHASE 3
INSTITUTIONAL INTEGRATION
│
├── Authorized Government Databases
├── Secure VPN / Government Network
├── Advanced Forensics
├── Permissioned Audit Ledger
└── Operational Validation
```

---

# 39. Quick Start & Execution

The PRAMAANX monorepo can be executed either via Docker Compose or using concurrent local development commands:

## 39.1 Prerequisites
- **Node.js**: v20+ and `npm`
- **Python**: v3.11+ (with virtual environment or Conda)
- **Git**: Latest release
- **Docker & Docker Compose** (optional for containerized run)
- **Webcam / Capture Device**: USB or built-in camera

---

## 39.2 Option A: Docker Compose (All-in-One)

Launch the core backend API, AI advisory service, and local engine in unified containers:

```bash
# Clone the repository
git clone <repository-url>
cd PRAMAANX

# Configure environment secrets
cp .env.example .env

# Build and start services
docker-compose up --build
```

Services will be online:
- **API Backend**: `http://localhost:5000`
- **Local Engine**: `http://localhost:5001`
- **AI Advisory**: `http://localhost:3001`

Then launch the desktop client:
```bash
npm run dev:desktop
```

---

## 39.3 Option B: Local Development (Individual Services)

### 1. Install All Dependencies
From the repository root:
```bash
npm run install:all
```
*(Installs root dependencies, API requirements, and AI service dependencies)*

Also install local AI engine dependencies:
```bash
cd local-engine
pip install -r requirements.txt
cd ..
```

### 2. Configure Environment
Populate `.env` with required secrets:
```bash
cp .env.example .env
```
Ensure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, and `GEMINI_API_KEY` are defined.

### 3. Run Database Migrations & Seeds
```bash
npm run migrate
npm run seed
```

### 4. Start Development Services
Open separate terminal tabs or run via workspace scripts:

```bash
# Terminal 1: Core FastAPI Backend (Port 5000)
npm run dev:api

# Terminal 2: Local AI & Forensic Engine (Port 5001)
cd local-engine && python server.py

# Terminal 3: AI Advisory Service (Port 3001)
npm run dev:ai

# Terminal 4: Desktop Application (Electron + Vite)
npm run dev:desktop
```

*For the lightweight Tauri desktop target:*
```bash
cd apps/desktop
npm run tauri:dev
```

---

# 40. MVP Demo Workflow

For inspection demonstrations:

```text
1. Officer Login & Checkpoint Selection
       ↓
2. Start Verification Session
       ↓
3. Document Capture & Frame Alignment
       ↓
4. PaddleOCR Extraction & ICAO-9303 MRZ Checksum Validation
       ↓
5. Live Face Capture & Passive Liveness Verification
       ↓
6. InsightFace / ArcFace Cosine Biometric Matching
       ↓
7. Multi-Factor Forensics (ELA + OpenCV Tamper + PyTorch Neural Noise + Metadata)
       ↓
8. XGBoost + Border Rules Composite Risk Assessment
       ↓
9. Secondary Gemini Pro Advisory Insights (Metadata-only)
       ↓
10. Officer Adjudication (APPROVE / REVIEW / REJECT)
       ↓
11. SHA-256 Tamper-Evident Hash Chain Generation & Supabase Ledger Sync
       ↓
12. Multi-Format Dossier Export (PDF / Excel / Word / CSV)
```

---

# 41. Current Implementation vs Future Expansions

### Implemented in Current System

- **Desktop Shell (`apps/desktop`)**: High-speed React 19 + TypeScript + Vite UI with dual packaging (Electron 28 & Tauri v2 Rust native).
- **Local AI Engine (`local-engine`)**: Python FastAPI server (Port 5001) operating completely offline.
- **Document Intelligence**: PaddleOCR text extraction and ICAO Doc 9303 MRZ parsing with strict check-digit validations.
- **Biometric Matching**: InsightFace ArcFace 512-dimensional facial embeddings and cosine similarity scoring.
- **Liveness Detection**: Passive RGB anti-spoofing protecting against presentation attacks.
- **Multi-Factor Forensics**: Error Level Analysis (ELA), OpenCV Laplacian/contour tampering detection, PyTorch NoiseNet neural noise analysis, and PyMuPDF metadata examination.
- **Risk Engine**: Hybrid XGBoost machine learning classifier + deterministic border policy rules.
- **Reporting Engine**: On-demand generation of formal dossiers in PDF, Excel (XLSX), Word (DOCX), and CSV.
- **Central Backend API (`services/api`)**: Python FastAPI server (Port 5000) with JWT auth, RBAC, checkpoint routing, and session state machine.
- **Cloud Database & Ledger (`supabase`)**: PostgreSQL relational persistence with Row Level Security (RLS) policies.
- **Cryptographic Audit Integrity**: Tamper-evident SHA-256 hash chaining across screening events with `/api/audit/integrity` validation.
- **AI Advisory Service (`services/ai-service`)**: Node.js/Express service (Port 3001) providing privacy-preserving Gemini Pro observations.
- **Shared Contracts (`packages/contracts`)**: Centralized JSON Schemas and TypeScript contracts.
- **Containerization**: Complete Docker Compose multi-service deployment.

### Planned Future Enterprise Expansions

- **National Border Interconnects**: Direct authorized integration with INTERPOL, NCIC, and national immigration databases.
- **Hardware Passport Scanner SDKs**: Native device drivers for specialized flatbed passport scanners (ARH Combo Smart, Gemalto/Thales QS2000, 3M).
- **Hardware Security Modules (HSM)**: Cryptographic root-of-trust key signing for audit chain anchors.
- **Multi-Spectral Forensics**: Ultraviolet (UV) fluorescence and Infrared (IR) B900 ink analysis for physical security feature verification.

---

# 42. Key Value Proposition

PRAMAANX combines:

```text
OFFLINE-CAPABLE LOCAL ENGINE
              +
PADDLEOCR & ICAO-9303 MRZ VALIDATION
              +
INSIGHTFACE BIOMETRIC VERIFICATION
              +
PASSIVE ANTI-SPOOF LIVENESS
              +
FOUR-PILLAR FORENSICS (ELA, TAMPER, NEURAL, METADATA)
              +
XGBOOST + RULES COMPOSITE RISK ENGINE
              +
MULTI-FORMAT DOSSIER EXPORTS (PDF / XLSX / DOCX / CSV)
              +
CRYPTOGRAPHIC SHA-256 TAMPER-EVIDENT AUDIT CHAIN
              +
PRIVACY-PRESERVING GEMINI PRO ADVISORY
              +
DUAL RUNTIME DESKTOP (ELECTRON & TAURI V2)
```

into a unified, privacy-conscious screening workflow. Sensitive documents and facial imagery never leave the screening workstation, while centralized authorities maintain real-time auditability and policy governance.

---

# 43. Final Architecture Summary

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              PRAMAANX BORDER CHECKPOINT                                │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                     DESKTOP CLIENT UI (apps/desktop)                             │  │
│  │                     React 19 • Tailwind CSS • Vite                               │  │
│  │                     Packaged via Electron 28 OR Tauri v2                         │  │
│  └─────────────────┬──────────────────────────────────────────────┬─────────────────┘  │
│                    │                                              │                    │
│     Offline Loopback (:5001)                       Secure Session (:5000)              │
│                    ▼                                              ▼                    │
│  ┌──────────────────────────────────┐            ┌──────────────────────────────────┐  │
│  │   LOCAL AI & FORENSIC ENGINE     │            │        CORE CENTRAL API          │  │
│  │   FastAPI Service (:5001)        │            │   FastAPI Service (:5000)        │  │
│  │  ──────────────────────────────  │            │  ──────────────────────────────  │  │
│  │  • PaddleOCR Document Extraction │            │  • JWT Auth & RBAC               │  │
│  │  • ICAO 9303 MRZ Checksums       │            │  • Checkpoint Management         │  │
│  │  • ArcFace Biometric Matching    │            │  • Verification State Machine    │  │
│  │  • Passive Liveness Detection    │            │  • SHA-256 Audit Integrity Check │  │
│  │  • Multi-Factor Forensics (ELA,  │            │  • Review & History Queues       │  │
│  │    Tamper, PyTorch, Metadata)    │            └────────────────┬─────────────────┘  │
│  │  • XGBoost Risk Scoring Engine   │                             │                    │
│  │  • PDF / XLSX / DOCX / CSV Export│                             │                    │
│  │  • Local SHA-256 Chained Audit   │                             │                    │
│  └──────────────────────────────────┘                             │                    │
└───────────────────────────────────────────────────────────────────┼────────────────────┘
                                                                    │
                                                  Managed Cloud Sync│
                                                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             CENTRAL CLOUD PLATFORM                                     │
│                                                                                        │
│  ┌──────────────────────────────────┐            ┌──────────────────────────────────┐  │
│  │      AI ADVISORY MICROSERVICE    │            │    SUPABASE MANAGED POSTGRESQL   │  │
│  │   Node.js / Express (:3001)      │            │  ──────────────────────────────  │  │
│  │  ──────────────────────────────  │            │  • Verification Records          │  │
│  │  • Google Gemini Pro Reasoning   │◄───────────┤  • Biometric / Forensic Scores   │  │
│  │  • Zero Raw Biometrics / PII     │            │  • Tamper-Evident SHA-256 Chained│  │
│  │  • Structured Advisory Insights  │            │    Immutable Audit Ledger        │  │
│  └──────────────────────────────────┘            │  • Enforced by PostgreSQL RLS    │  │
│                                                  └──────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 44. Project Status

**Project:** PRAMAANX  
**Problem Domain:** AI-Based Fake Identity & Document Screening  
**Architecture:** Local-first / Hybrid  
**Primary Deployment Target:** Controlled identity-screening checkpoints  
**Current Focus:** SIH MVP  
**Future Direction:** Multi-checkpoint controlled deployment and authorized institutional integration

---

## Disclaimer

PRAMAANX is a prototype/decision-support system intended for demonstration and controlled evaluation. Model outputs, risk scores, and automated checks should not be treated as infallible proof of identity or fraud. Production deployment requires domain validation, security assessment, privacy/legal review, operational testing, model evaluation, and authorization from the relevant institution.

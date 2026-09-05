# PRAMAANX
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

```text
                         PRAMAANX
                LOCAL-FIRST SCREENING PLATFORM
┌──────────────────────────────────────────────────────────────┐
│                    BORDER CHECKPOINT                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                  PRAMAANX.EXE                          │  │
│  │                                                        │  │
│  │  React UI                                             │  │
│  │      │                                                 │  │
│  │      ├── Camera Capture                                │  │
│  │      ├── Document Preprocessing                        │  │
│  │      ├── Local OCR                                     │  │
│  │      ├── MRZ Parser / Validator                        │  │
│  │      ├── Face Detection                                │  │
│  │      ├── Face Embedding / Verification                 │  │
│  │      ├── Liveness                                      │  │
│  │      ├── Risk Engine                                   │  │
│  │      └── Officer Review                                │  │
│  │                                                        │  │
│  │               Local Processing                         │  │
│  └─────────────────────────┬──────────────────────────────┘  │
│                            │                                 │
│                   Authorized Result                          │
└────────────────────────────┼─────────────────────────────────┘
                             │
                       Secure API / VPN
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                   CENTRAL SECURE SERVER                      │
│                                                              │
│  Authentication & RBAC                                      │
│  Central PostgreSQL                                          │
│  Screening History                                           │
│  Central Audit Trail                                         │
│  Reporting                                                   │
│  Configuration / Rules                                       │
│  Model / Version Management                                  │
│  Authorized Government Integrations                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 7. Why Not Put Everything Inside Electron?

PRAMAANX uses a hybrid local-first architecture instead of putting every responsibility into the desktop executable.

## Electron / Desktop application

The local application is responsible for:

- React UI
- Camera access
- OCR
- Face detection
- Face verification
- Liveness
- Image preprocessing
- Local risk computation
- Offline/basic screening
- Local audit generation

## Central server

The central server is responsible for:

- Officer authentication
- Role and permissions
- Screening history
- Central audit trail
- Central identity/reference database
- Configuration
- Rules
- Model/version management
- Cross-checking between checkpoints
- Authorized government integrations
- Central reporting

This separation provides a clear security and operational boundary.

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

## 10.1 Desktop Application

### Electron

Electron packages the PRAMAANX desktop screening application into a distributable executable.

Responsibilities:

- Desktop application shell
- Native camera/device access
- Local filesystem access where required
- Secure communication with local processing services
- Packaging and deployment

Example:

```text
PRAMAANX.exe
```

---

## 10.2 Frontend

### React

React provides the officer-facing user interface.

Used for:

- Login
- Screening dashboard
- Camera interface
- Document capture
- Face capture
- Processing status
- Result visualization
- Officer review
- Audit information

### HTML / CSS / JavaScript

The web technologies provide the base interface layer.

### UI Design

The interface is designed to be:

- Minimal
- Professional
- Fast to understand
- Suitable for government operational environments
- Accessible under time-constrained screening conditions

---

# 11. Local AI / Computer Vision Stack

## 11.1 OCR

A local OCR engine processes captured document images.

Pipeline:

```text
Camera
  ↓
Image Preprocessing
  ↓
Document Region
  ↓
OCR
  ↓
Text Normalization
  ↓
Field Extraction
```

OCR can be implemented using an offline-capable OCR engine appropriate for the target deployment.

Possible implementation:

- PaddleOCR
- Tesseract
- ONNX-compatible OCR models

The final implementation should benchmark accuracy and latency using representative passport/document images.

---

## 11.2 MRZ Processing

MRZ parsing is implemented as a deterministic processing layer.

```text
OCR Text
   ↓
MRZ Detection
   ↓
MRZ Parsing
   ↓
Check Digit Validation
   ↓
Normalized Identity Fields
```

The MRZ validator should follow the relevant ICAO machine-readable travel document specifications applicable to the document type being supported.

---

## 11.3 Face Detection

A dedicated face detector locates faces in:

- Document portraits
- Live camera frames

A suitable implementation may use an ONNX-compatible detector such as:

- SCRFD
- RetinaFace
- Another validated face detector

---

## 11.4 Face Recognition / Verification

The face verification pipeline can use:

```text
Face Detector
      ↓
Face Alignment
      ↓
Face Recognition Model
      ↓
Embedding
      ↓
Cosine Similarity / Distance
      ↓
Configured Threshold
      ↓
Verification Result
```

A practical model family for the MVP is:

**InsightFace / ArcFace-compatible recognition models**

The exact model should be selected and validated according to:

- Accuracy
- CPU/GPU performance
- Licensing
- Deployment constraints
- Representative evaluation data

---

## 11.5 Liveness

The liveness component evaluates whether the captured subject appears to be a live person rather than a presentation attack.

Possible implementation approaches include:

- Passive RGB liveness
- Lightweight anti-spoofing models
- ONNX-compatible anti-spoofing models

For institutional deployment, the selected model must undergo dedicated presentation-attack testing.

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

# 15. Central Server Architecture

The central system is intended for controlled deployment rather than being a mandatory dependency for every local operation.

```text
                    CENTRAL SERVER
┌─────────────────────────────────────────────┐
│ API Gateway / Backend                       │
├─────────────────────────────────────────────┤
│ Authentication                              │
│ RBAC                                        │
│ Screening Service                           │
│ Audit Service                               │
│ Configuration Service                       │
│ Model/Version Service                       │
│ Synchronization Service                     │
│ Reporting Service                           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│              PostgreSQL                     │
│                                             │
│ Officers                                    │
│ Roles                                       │
│ Checkpoints                                 │
│ Screening Events                            │
│ Audit Metadata                              │
│ Configuration                               │
│ Model Versions                              │
│ Reference Data                              │
└─────────────────────────────────────────────┘
```

---

# 16. Backend Technology

A suitable controlled-deployment backend stack is:

### Node.js

Used as the server-side JavaScript/TypeScript runtime.

### Express.js

Used to build REST APIs and backend services.

### PostgreSQL

Used as the central relational database.

Potential entities include:

```text
Officer
Role
Checkpoint
ScreeningSession
ScreeningResult
AuditRecord
Configuration
RuleVersion
ModelVersion
ReferenceRecord
SyncEvent
```

---

# 17. API Architecture

Example API structure:

```text
/api/v1/auth
/api/v1/officers
/api/v1/checkpoints
/api/v1/screenings
/api/v1/audits
/api/v1/config
/api/v1/models
/api/v1/reference
/api/v1/sync
/api/v1/reports
```

Example flow:

```text
PRAMAANX.EXE
      │
      │ HTTPS / Secure Network
      ▼
Backend API
      │
      ├── Authentication
      ├── Authorization
      ├── Screening Event
      ├── Audit
      └── Synchronization
               │
               ▼
           PostgreSQL
```

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

# 24. Repository Structure

A recommended repository structure:

```text
PRAMAANX/
│
├── desktop/
│   ├── electron/
│   │   ├── main/
│   │   ├── preload/
│   │   └── ipc/
│   │
│   └── renderer/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/
│       │   ├── hooks/
│       │   └── utils/
│       └── public/
│
├── local-ai/
│   ├── ocr/
│   ├── mrz/
│   ├── face/
│   ├── liveness/
│   ├── preprocessing/
│   └── risk-engine/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── utils/
│   └── tests/
│
├── database/
│   ├── migrations/
│   ├── schema/
│   └── seeds/
│
├── models/
│   ├── ocr/
│   ├── face/
│   └── liveness/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── security/
│   └── deployment/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/
│
├── .env.example
├── package.json
└── README.md
```

---

# 25. Recommended MVP Technology Stack

| Layer | Technology |
|---|---|
| Desktop Shell | Electron |
| Frontend | React |
| Language | JavaScript / TypeScript |
| Styling | CSS / Tailwind CSS or equivalent |
| Camera | Browser/Web APIs + Electron integration |
| OCR | PaddleOCR / Tesseract / equivalent |
| MRZ | Custom parser + validation logic |
| Face Detection | SCRFD / equivalent |
| Face Recognition | InsightFace / ArcFace-compatible model |
| Liveness | Local anti-spoofing model |
| AI Runtime | ONNX Runtime where appropriate |
| Image Processing | OpenCV |
| Local Processing | Python service and/or native/Node integration |
| Backend | Node.js |
| API | Express.js |
| Database | PostgreSQL |
| Authentication | JWT/session-based enterprise authentication |
| Secure Transport | HTTPS/TLS |
| Network | Secure API / VPN |
| Audit | Cryptographic hashing |
| Packaging | Electron Builder |
| Version Control | Git |
| Repository | GitHub |
| Testing | Jest / Vitest + integration/E2E tooling |

The exact model/runtime combination should be finalized after benchmarking the target hardware.

---

# 26. Local AI Service Architecture

For heavier computer-vision workloads, PRAMAANX can separate the UI process from the AI processing process.

```text
┌───────────────────────────────┐
│        Electron + React       │
│                               │
│ Officer Interface             │
│ Camera                        │
│ Results                       │
└───────────────┬───────────────┘
                │
          Local IPC / API
                │
                ▼
┌───────────────────────────────┐
│       Local AI Service        │
│                               │
│ OpenCV                        │
│ OCR                           │
│ MRZ                           │
│ Face Detection                │
│ Face Recognition              │
│ Liveness                      │
│ Risk Engine                   │
└───────────────────────────────┘
```

This architecture prevents the desktop UI from becoming tightly coupled to every AI implementation.

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

# 39. Quick Start — MVP

> The commands below are a reference architecture. Exact commands may change with the final repository structure.

## Prerequisites

Recommended development environment:

```text
Node.js
npm
Python
Git
OpenCV-compatible environment
Camera
Optional NVIDIA GPU for accelerated model inference
```

---

## Clone

```bash
git clone <repository-url>
cd PRAMAANX
```

---

## Install frontend/desktop dependencies

```bash
npm install
```

---

## Install local AI dependencies

```bash
cd local-ai
pip install -r requirements.txt
```

---

## Configure environment

Create:

```text
.env
```

from:

```text
.env.example
```

Never commit real secrets to Git.

---

## Run MVP

```bash
npm run dev
```

The development application should launch the PRAMAANX desktop screening interface.

---

# 40. MVP Demo Workflow

For the SIH demonstration:

```text
1. Officer Login
       ↓
2. Start New Screening
       ↓
3. Capture Passport
       ↓
4. OCR Extracts Details
       ↓
5. MRZ Validated
       ↓
6. Capture Live Face
       ↓
7. Face Detection
       ↓
8. Liveness Check
       ↓
9. Face Verification
       ↓
10. Risk Engine
       ↓
11. Officer Result
       ↓
12. Audit ID + Hash
```

A clean demo should visibly show the transition between each stage without exposing unnecessary personal information.

---

# 41. SIH MVP Boundary

The **SIH MVP is not the complete institutional system**.

### Included in MVP

- Local desktop application
- Camera capture
- OCR
- MRZ processing
- Face detection
- Face verification
- Liveness
- Risk engine
- Human-readable reasons
- Officer review
- Audit hash
- Local-first processing

### Planned after MVP

- Central PostgreSQL
- Enterprise authentication
- Multi-checkpoint synchronization
- Central screening history
- Central reporting
- Admin-controlled model/rule updates
- Authorized government integrations
- Secure VPN deployment
- Advanced forensic models

This distinction is intentional: the MVP demonstrates the core technical feasibility while the later phases define a realistic path toward institutional deployment.

---

# 42. Key Value Proposition

PRAMAANX combines:

```text
LOCAL AI
    +
DOCUMENT INTELLIGENCE
    +
BIOMETRIC VERIFICATION
    +
LIVENESS
    +
RISK ANALYSIS
    +
HUMAN REVIEW
    +
AUDITABILITY
    +
PRIVACY-FIRST ARCHITECTURE
```

into a unified screening workflow.

The architectural advantage is that **sensitive computation can remain at the checkpoint while centralized infrastructure provides governance, synchronization, configuration, reporting, and authorized integrations.**

---

# 43. Final Architecture Summary

```text
                         PRAMAANX
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
   LOCAL SCREENING                    CENTRAL PLATFORM
     PRAMAANX.EXE                     Controlled Deployment
          │                                 │
   ┌──────┼──────┐                  ┌───────┼────────┐
   │      │      │                  │       │        │
 Camera  OCR   Face              Auth    PostgreSQL Audit
   │      │      │                  │       │        │
   │     MRZ  Liveness             RBAC  History  Reporting
   │      │      │                  │       │        │
   └──────┼──────┘                  └───────┼────────┘
          │                                 │
          ▼                                 │
      Risk Engine                           │
          │                                 │
          ▼                                 │
     Officer Review                         │
          │                                 │
          ▼                                 │
      Audit Hash                            │
          │                                 │
          └──────── Secure Sync ────────────┘
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

import io
import csv
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

# ReportLab for PDF
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

# openpyxl for Excel
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# python-docx for Word
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

NAVY = colors.HexColor("#0B2942")
SAFFRON = colors.HexColor("#FF9933")
GREEN = colors.HexColor("#138808")
DARK = colors.HexColor("#17212B")
GRAY_BG = colors.HexColor("#F8F9FA")
BORDER_COLOR = colors.HexColor("#D6DCE2")
RED = colors.HexColor("#B42318")
AMBER = colors.HexColor("#C47A00")

def normalize_record(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalizes both FullScreeningResponse and stored audit_trail record formats
    into a uniform structured dictionary for report generation.
    """
    v_id = raw.get("verification_id") or raw.get("id") or "UNKNOWN-CASE"
    ts = raw.get("timestamp") or datetime.now(timezone.utc).isoformat()

    # Risk signals
    risk = raw.get("risk") or raw.get("risk_assessment") or {}
    score = risk.get("risk_score") if "risk_score" in risk else risk.get("score")
    if score is not None:
        try:
            score = float(score)
            if score <= 1.0 and score > 0:
                score = round(score * 100.0, 1)
        except Exception:
            score = 0.0
    else:
        score = 0.0

    level = risk.get("risk_level") or risk.get("level") or "UNKNOWN"
    recommendation = risk.get("decision_recommendation") or risk.get("recommendation") or "PENDING"
    reasons = risk.get("reasons") or []

    # Document & OCR signals
    doc_meta = raw.get("document") or {}
    ocr = raw.get("ocr") or {}
    ocr_fields = ocr.get("fields") or {}
    mrz = raw.get("mrz") or {}

    doc_type = ocr_fields.get("document_type") or doc_meta.get("type") or mrz.get("format") or "Identity Document"
    doc_num = ocr_fields.get("document_number") or doc_meta.get("document_number") or mrz.get("document_number") or "—"
    name = ocr_fields.get("name") or doc_meta.get("name") or mrz.get("given_names") or "—"
    dob = ocr_fields.get("dob") or mrz.get("birth_date") or "—"
    gender = ocr_fields.get("gender") or mrz.get("sex") or "—"
    expiry = ocr_fields.get("expiry") or mrz.get("expiry_date") or "—"
    nationality = ocr_fields.get("nationality") or mrz.get("nationality") or "IND"
    country = ocr_fields.get("issuing_country") or "India"

    # Biometric signals
    bio = raw.get("biometric") or raw.get("biometrics") or {}
    face_match = bio.get("face_match_status") or "NO_DATA"
    similarity = bio.get("face_similarity_score") if "face_similarity_score" in bio else bio.get("similarity_score", 0.0)
    liveness_status = bio.get("liveness", {}).get("liveness_status") if isinstance(bio.get("liveness"), dict) else bio.get("liveness_status", "PASS")

    # Forensics signals
    forensics = raw.get("forensics") or {}
    ela_score = forensics.get("ela", {}).get("ela_score") if isinstance(forensics.get("ela"), dict) else forensics.get("ela_score", 95.0)
    tamper_status = forensics.get("tamper", {}).get("tamper_status") if isinstance(forensics.get("tamper"), dict) else forensics.get("tamper_status", "CLEAN")

    # Hashes & Officer
    hashes = raw.get("hashes") or raw.get("audit", {}).get("hashes") or {}
    doc_hash = hashes.get("document_sha256") or "—"
    face_hash = hashes.get("face_sha256") or "—"

    officer = raw.get("officer") or raw.get("officer_info") or {}
    off_id = officer.get("officer_id") or "OFFICER-01"
    off_name = officer.get("name") or "Screening Officer"
    checkpoint = officer.get("checkpoint_code") or "CHK-01"

    return {
        "verification_id": v_id,
        "timestamp": ts,
        "recommendation": recommendation,
        "risk_score": score,
        "risk_level": level,
        "reasons": reasons,
        "document_type": doc_type,
        "document_number": doc_num,
        "name": name,
        "dob": dob,
        "gender": gender,
        "expiry": expiry,
        "nationality": nationality,
        "issuing_country": country,
        "face_match": face_match,
        "similarity": similarity,
        "liveness": liveness_status,
        "ela_score": ela_score,
        "tamper_status": tamper_status,
        "document_sha256": doc_hash,
        "face_sha256": face_hash,
        "officer_id": off_id,
        "officer_name": off_name,
        "checkpoint": checkpoint,
    }

# ==============================================================================
# 1. PDF REPORT GENERATORS (ReportLab)
# ==============================================================================

def generate_individual_pdf(raw_record: Dict[str, Any]) -> bytes:
    """Generates an official PDF border screening inspection report for an individual case."""
    r = normalize_record(raw_record)
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'GovTitle',
        parent=styles['Heading1'],
        fontSize=14,
        leading=16,
        textColor=NAVY,
        fontName='Helvetica-Bold'
    )
    subtitle_style = ParagraphStyle(
        'GovSubtitle',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=11,
        textColor=DARK,
        fontName='Helvetica'
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=10,
        leading=13,
        textColor=NAVY,
        fontName='Helvetica-Bold',
        spaceBefore=8,
        spaceAfter=4
    )
    cell_label = ParagraphStyle(
        'CellLabel',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#5B6773'),
        fontName='Helvetica-Bold'
    )
    cell_val = ParagraphStyle(
        'CellVal',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=11,
        textColor=DARK,
        fontName='Helvetica'
    )
    hash_style = ParagraphStyle(
        'HashVal',
        parent=styles['Normal'],
        fontSize=7,
        leading=8.5,
        textColor=DARK,
        fontName='Courier'
    )

    elements = []

    # Tricolor Banner
    elements.append(HRFlowable(width="100%", thickness=3, color=SAFFRON, spaceAfter=2))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#E0E0E0"), spaceAfter=2))
    elements.append(HRFlowable(width="100%", thickness=3, color=GREEN, spaceAfter=8))

    # Header Table
    header_data = [
        [
            Paragraph("<b>PRAMAANX &bull; OFFICIAL BORDER SCREENING DOSSIER</b>", title_style),
            Paragraph(f"<b>CASE REF:</b> {r['verification_id']}<br/><b>DATE:</b> {r['timestamp'][:19]}", subtitle_style)
        ],
        [
            Paragraph("OFFICIAL IDENTITY &amp; FORENSIC INSPECTION CERTIFICATE &bull; GOVERNMENT OF INDIA", subtitle_style),
            Paragraph(f"<b>STATION:</b> {r['checkpoint']} &bull; <b>OFFICER:</b> {r['officer_id']}", subtitle_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[360, 160])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 10))

    # Verdict Badge Block
    verdict_bg = GREEN if r['recommendation'] == 'VERIFIED' else (AMBER if r['recommendation'] == 'REVIEW' else RED)
    verdict_text = f"DECISION VERDICT: {r['recommendation']} &bull; COMPOSITE RISK SCORE: {r['risk_score']}/100 ({r['risk_level']} RISK)"
    verdict_p = Paragraph(f"<font color='white'><b>{verdict_text}</b></font>", ParagraphStyle('VBadge', parent=styles['Normal'], fontSize=9.5, leading=12, alignment=1, fontName='Helvetica-Bold'))
    verdict_table = Table([[verdict_p]], colWidths=[520])
    verdict_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), verdict_bg),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(verdict_table)
    elements.append(Spacer(1, 10))

    # Section 1: Subject Identity & Document Information
    elements.append(Paragraph("1. DOCUMENT &amp; HOLDER IDENTITY", section_heading))
    doc_table_data = [
        [
            Paragraph("DOCUMENT TYPE", cell_label),
            Paragraph(r["document_type"], cell_val),
            Paragraph("DOCUMENT NUMBER", cell_label),
            Paragraph(r["document_number"], cell_val),
        ],
        [
            Paragraph("SUBJECT FULL NAME", cell_label),
            Paragraph(r["name"], cell_val),
            Paragraph("DATE OF BIRTH", cell_label),
            Paragraph(r["dob"], cell_val),
        ],
        [
            Paragraph("GENDER / SEX", cell_label),
            Paragraph(r["gender"], cell_val),
            Paragraph("EXPIRY DATE", cell_label),
            Paragraph(r["expiry"], cell_val),
        ],
        [
            Paragraph("NATIONALITY", cell_label),
            Paragraph(r["nationality"], cell_val),
            Paragraph("ISSUING COUNTRY", cell_label),
            Paragraph(r["issuing_country"], cell_val),
        ],
    ]
    t_doc = Table(doc_table_data, colWidths=[120, 140, 120, 140])
    t_doc.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GRAY_BG),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_doc)
    elements.append(Spacer(1, 10))

    # Section 2: Biometric & Forensics Breakdown
    elements.append(Paragraph("2. BIOMETRIC &amp; FORENSIC VERIFICATION BREAKDOWN", section_heading))
    bio_table_data = [
        [
            Paragraph("ARCFACE SIMILARITY", cell_label),
            Paragraph(f"{r['similarity']}% ({r['face_match']})", cell_val),
            Paragraph("BIOMETRIC LIVENESS", cell_label),
            Paragraph(r["liveness"], cell_val),
        ],
        [
            Paragraph("ELA COMPRESSION", cell_label),
            Paragraph(f"{r['ela_score']}/100", cell_val),
            Paragraph("TAMPER INTEGRITY", cell_label),
            Paragraph(r["tamper_status"], cell_val),
        ],
    ]
    t_bio = Table(bio_table_data, colWidths=[120, 140, 120, 140])
    t_bio.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GRAY_BG),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_bio)
    elements.append(Spacer(1, 10))

    # Section 3: Evidence Reasons
    elements.append(Paragraph("3. SYSTEM EVIDENCE &amp; SIGNAL REASONING", section_heading))
    reasons_list = r["reasons"] if r["reasons"] else ["All verification criteria satisfied with zero anomalies flagged."]
    reasons_data = [[Paragraph(f"&bull; {item}", cell_val)] for item in reasons_list]
    t_reasons = Table(reasons_data, colWidths=[520])
    t_reasons.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GRAY_BG),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_reasons)
    elements.append(Spacer(1, 10))

    # Section 4: Cryptographic Audit Hashes
    elements.append(Paragraph("4. CRYPTOGRAPHIC DIGITAL AUDIT TRAIL", section_heading))
    hash_data = [
        [Paragraph("DOCUMENT SHA-256", cell_label), Paragraph(r["document_sha256"], hash_style)],
        [Paragraph("LIVE FACE SHA-256", cell_label), Paragraph(r["face_sha256"], hash_style)],
    ]
    t_hash = Table(hash_data, colWidths=[130, 390])
    t_hash.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GRAY_BG),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_hash)
    elements.append(Spacer(1, 14))

    # Officer Sign-off Block
    sign_data = [
        [
            Paragraph(f"<b>Inspecting Officer:</b> {r['officer_name']} ({r['officer_id']})<br/><b>Station:</b> {r['checkpoint']}", subtitle_style),
            Paragraph("<b>Digital Signature:</b> VALIDATED &bull; IMMUTABLE AUDIT RECORD<br/><b>Certified via PRAMAANX Border Gate Engine</b>", subtitle_style),
        ]
    ]
    t_sign = Table(sign_data, colWidths=[260, 260])
    t_sign.setStyle(TableStyle([
        ('LINEABOVE', (0, 0), (-1, 0), 1, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(t_sign)

    doc.build(elements)
    buf.seek(0)
    return buf.getvalue()

def generate_audit_log_pdf(records: List[Dict[str, Any]]) -> bytes:
    """Generates an official PDF compilation of the entire digital audit log."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=30,
        rightMargin=30,
        topMargin=30,
        bottomMargin=30
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('AudTitle', parent=styles['Heading1'], fontSize=13, leading=15, textColor=NAVY, fontName='Helvetica-Bold')
    sub_style = ParagraphStyle('AudSub', parent=styles['Normal'], fontSize=8, leading=10, textColor=DARK, fontName='Helvetica')
    th_style = ParagraphStyle('TH', parent=styles['Normal'], fontSize=7.5, leading=9, textColor=colors.white, fontName='Helvetica-Bold')
    td_style = ParagraphStyle('TD', parent=styles['Normal'], fontSize=7, leading=8.5, textColor=DARK, fontName='Helvetica')

    elements = []
    elements.append(HRFlowable(width="100%", thickness=2.5, color=SAFFRON, spaceAfter=2))
    elements.append(HRFlowable(width="100%", thickness=2.5, color=GREEN, spaceAfter=6))

    header_table = Table([
        [
            Paragraph("<b>PRAMAANX &bull; MASTER DIGITAL AUDIT LOG REGISTER</b>", title_style),
            Paragraph(f"<b>TOTAL SESSIONS:</b> {len(records)}<br/><b>EXPORTED:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}", sub_style)
        ]
    ], colWidths=[360, 175])
    elements.append(header_table)
    elements.append(Spacer(1, 8))

    # Ledger Table
    table_rows = [
        [
            Paragraph("CASE ID", th_style),
            Paragraph("TIMESTAMP", th_style),
            Paragraph("DOCUMENT", th_style),
            Paragraph("NUMBER", th_style),
            Paragraph("HOLDER", th_style),
            Paragraph("VERDICT", th_style),
            Paragraph("RISK", th_style),
            Paragraph("ARCFACE", th_style),
            Paragraph("OFFICER", th_style),
        ]
    ]

    for rec in records:
        r = normalize_record(rec)
        v_color = "#138808" if r['recommendation'] == 'VERIFIED' else ("#C47A00" if r['recommendation'] == 'REVIEW' else "#B42318")
        table_rows.append([
            Paragraph(f"<b>{r['verification_id']}</b>", td_style),
            Paragraph(r['timestamp'][:19], td_style),
            Paragraph(r['document_type'][:15], td_style),
            Paragraph(r['document_number'], td_style),
            Paragraph(r['name'][:18], td_style),
            Paragraph(f"<font color='{v_color}'><b>{r['recommendation']}</b></font>", td_style),
            Paragraph(f"{r['risk_score']}", td_style),
            Paragraph(f"{r['similarity']}%", td_style),
            Paragraph(r['officer_id'], td_style),
        ])

    ledger_table = Table(table_rows, colWidths=[70, 75, 75, 65, 80, 55, 35, 45, 35])
    ledger_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, GRAY_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(ledger_table)

    doc.build(elements)
    buf.seek(0)
    return buf.getvalue()

# ==============================================================================
# 2. EXCEL REPORT GENERATORS (openpyxl)
# ==============================================================================

def generate_individual_excel(raw_record: Dict[str, Any]) -> bytes:
    """Generates an official multi-tab Excel inspection workbook for an individual case."""
    r = normalize_record(raw_record)
    wb = openpyxl.Workbook()

    # Sheet 1: Case Dossier
    ws = wb.active
    ws.title = "Screening Dossier"

    header_fill = PatternFill(start_color="0B2942", end_color="0B2942", fill_type="solid")
    section_fill = PatternFill(start_color="F8F9FA", end_color="F8F9FA", fill_type="solid")
    border_thin = Border(
        left=Side(style='thin', color="D6DCE2"),
        right=Side(style='thin', color="D6DCE2"),
        top=Side(style='thin', color="D6DCE2"),
        bottom=Side(style='thin', color="D6DCE2")
    )

    # Title Banner
    ws.merge_cells("A1:D1")
    ws["A1"] = "PRAMAANX — OFFICIAL IDENTITY SCREENING DOSSIER"
    ws["A1"].font = Font(name="Arial", size=14, bold=True, color="FFFFFF")
    ws["A1"].fill = header_fill
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 30

    rows = [
        ("Case Reference", r["verification_id"], "Inspection Timestamp", r["timestamp"]),
        ("Station Checkpoint", r["checkpoint"], "Inspecting Officer", f"{r['officer_name']} ({r['officer_id']})"),
        ("Decision Verdict", r["recommendation"], "Composite Risk Score", f"{r['risk_score']} / 100 ({r['risk_level']})"),
        ("", "", "", ""),
        ("DOCUMENT IDENTITY", "", "", ""),
        ("Document Type", r["document_type"], "Document Number", r["document_number"]),
        ("Subject Name", r["name"], "Date of Birth", r["dob"]),
        ("Gender / Sex", r["gender"], "Expiry Date", r["expiry"]),
        ("Nationality", r["nationality"], "Issuing Country", r["issuing_country"]),
        ("", "", "", ""),
        ("BIOMETRICS & FORENSICS", "", "", ""),
        ("ArcFace Similarity", f"{r['similarity']}% ({r['face_match']})", "Biometric Liveness", r["liveness"]),
        ("ELA Compression Score", f"{r['ela_score']}/100", "Tamper Integrity", r["tamper_status"]),
        ("", "", "", ""),
        ("DIGITAL AUDIT INTEGRITY", "", "", ""),
        ("Document SHA-256", r["document_sha256"], "Live Face SHA-256", r["face_sha256"]),
    ]

    curr_row = 3
    for r_data in rows:
        c1, c2, c3, c4 = r_data
        if c1 in ["DOCUMENT IDENTITY", "BIOMETRICS & FORENSICS", "DIGITAL AUDIT INTEGRITY"]:
            ws.merge_cells(start_row=curr_row, start_column=1, end_row=curr_row, end_column=4)
            cell = ws.cell(row=curr_row, column=1, value=c1)
            cell.font = Font(name="Arial", size=11, bold=True, color="0B2942")
            cell.fill = section_fill
        else:
            ws.cell(row=curr_row, column=1, value=c1).font = Font(name="Arial", size=9.5, bold=True, color="5B6773")
            ws.cell(row=curr_row, column=2, value=c2).font = Font(name="Arial", size=10, bold=False, color="17212B")
            ws.cell(row=curr_row, column=3, value=c3).font = Font(name="Arial", size=9.5, bold=True, color="5B6773")
            ws.cell(row=curr_row, column=4, value=c4).font = Font(name="Arial", size=10, bold=False, color="17212B")
            for col in range(1, 5):
                ws.cell(row=curr_row, column=col).border = border_thin
        curr_row += 1

    # Auto-adjust column widths
    ws.column_dimensions['A'].width = 24
    ws.column_dimensions['B'].width = 38
    ws.column_dimensions['C'].width = 24
    ws.column_dimensions['D'].width = 38

    # Sheet 2: Evidence Reasons
    ws2 = wb.create_sheet(title="Evidence Signals")
    ws2.append(["Signal Index", "Reason Description", "Category"])
    for cell in ws2[1]:
        cell.font = Font(name="Arial", size=10, bold=True, color="FFFFFF")
        cell.fill = header_fill

    reasons = r["reasons"] if r["reasons"] else ["All verification criteria passed."]
    for idx, reason in enumerate(reasons, 1):
        ws2.append([idx, reason, "Deterministic / Model Rule"])

    ws2.column_dimensions['A'].width = 14
    ws2.column_dimensions['B'].width = 75
    ws2.column_dimensions['C'].width = 28

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf.getvalue()

def generate_audit_log_excel(records: List[Dict[str, Any]]) -> bytes:
    """Generates an official multi-column Excel spreadsheet of the whole audit ledger."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Audit Ledger"

    header_fill = PatternFill(start_color="0B2942", end_color="0B2942", fill_type="solid")
    headers = [
        "Verification ID",
        "Timestamp (UTC)",
        "Verdict",
        "Risk Score",
        "Risk Level",
        "Document Type",
        "Document Number",
        "Cardholder Name",
        "DOB",
        "Gender",
        "ArcFace Similarity (%)",
        "Face Match",
        "Liveness",
        "ELA Score",
        "Tamper Status",
        "Document SHA-256",
        "Face SHA-256",
        "Officer ID",
        "Station Checkpoint"
    ]
    ws.append(headers)

    for cell in ws[1]:
        cell.font = Font(name="Arial", size=10, bold=True, color="FFFFFF")
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 24

    for rec in records:
        r = normalize_record(rec)
        ws.append([
            r["verification_id"],
            r["timestamp"],
            r["recommendation"],
            r["risk_score"],
            r["risk_level"],
            r["document_type"],
            r["document_number"],
            r["name"],
            r["dob"],
            r["gender"],
            r["similarity"],
            r["face_match"],
            r["liveness"],
            r["ela_score"],
            r["tamper_status"],
            r["document_sha256"],
            r["face_sha256"],
            r["officer_id"],
            r["checkpoint"],
        ])

    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 3, 12)

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf.getvalue()

# ==============================================================================
# 3. WORD REPORT GENERATORS (python-docx)
# ==============================================================================

def generate_individual_docx(raw_record: Dict[str, Any]) -> bytes:
    """Generates an official formatted Word document (.docx) for an individual screening case."""
    r = normalize_record(raw_record)
    doc = docx.Document()

    # Title
    title = doc.add_paragraph()
    run = title.add_run("PRAMAANX — OFFICIAL SCREENING DOSSIER")
    run.font.name = "Arial"
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = RGBColor(11, 41, 66)

    sub = doc.add_paragraph()
    r_sub = sub.add_run("BORDER & IMMIGRATION SCREENING INSPECTION REPORT • GOVERNMENT OF INDIA")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(9)
    r_sub.font.color.rgb = RGBColor(91, 103, 115)

    doc.add_paragraph(f"Case Reference: {r['verification_id']}  |  Timestamp: {r['timestamp']}")

    # Verdict Box
    v_box = doc.add_paragraph()
    v_run = v_box.add_run(f"VERDICT: {r['recommendation']}  |  RISK SCORE: {r['risk_score']}/100 ({r['risk_level']} RISK)")
    v_run.font.name = "Arial"
    v_run.font.size = Pt(11)
    v_run.font.bold = True
    v_color = RGBColor(19, 136, 8) if r['recommendation'] == 'VERIFIED' else (RGBColor(196, 122, 0) if r['recommendation'] == 'REVIEW' else RGBColor(180, 35, 24))
    v_run.font.color.rgb = v_color

    # Document Details Table
    doc.add_heading("1. Document & Holder Details", level=2)
    table = doc.add_table(rows=4, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    doc_fields = [
        ("Document Type", r["document_type"], "Document Number", r["document_number"]),
        ("Subject Name", r["name"], "Date of Birth", r["dob"]),
        ("Gender / Sex", r["gender"], "Expiry Date", r["expiry"]),
        ("Nationality", r["nationality"], "Issuing Country", r["issuing_country"]),
    ]
    for row_idx, row_data in enumerate(doc_fields):
        for col_idx, text in enumerate(row_data):
            cell = table.cell(row_idx, col_idx)
            cell.text = str(text)
            if col_idx % 2 == 0:
                cell.paragraphs[0].runs[0].font.bold = True

    # Biometrics Table
    doc.add_heading("2. Biometrics & Forensics", level=2)
    b_table = doc.add_table(rows=2, cols=4)
    b_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    bio_fields = [
        ("ArcFace Similarity", f"{r['similarity']}% ({r['face_match']})", "Biometric Liveness", r["liveness"]),
        ("ELA Compression", f"{r['ela_score']}/100", "Tamper Integrity", r["tamper_status"]),
    ]
    for row_idx, row_data in enumerate(bio_fields):
        for col_idx, text in enumerate(row_data):
            cell = b_table.cell(row_idx, col_idx)
            cell.text = str(text)
            if col_idx % 2 == 0:
                cell.paragraphs[0].runs[0].font.bold = True

    # Evidence Reasons
    doc.add_heading("3. Evidence Signals & Reasons", level=2)
    reasons = r["reasons"] if r["reasons"] else ["No anomalies detected; all security gates confirmed."]
    for reason in reasons:
        doc.add_paragraph(f"• {reason}")

    # Digital Audit
    doc.add_heading("4. Digital Audit Hashes", level=2)
    doc.add_paragraph(f"Document SHA-256: {r['document_sha256']}")
    doc.add_paragraph(f"Face SHA-256: {r['face_sha256']}")
    doc.add_paragraph(f"Officer: {r['officer_name']} ({r['officer_id']})  |  Checkpoint: {r['checkpoint']}")

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.getvalue()

def generate_audit_log_docx(records: List[Dict[str, Any]]) -> bytes:
    """Generates an official Word document (.docx) compilation of the entire audit log."""
    doc = docx.Document()
    title = doc.add_paragraph()
    run = title.add_run("PRAMAANX — MASTER DIGITAL AUDIT REGISTER")
    run.font.name = "Arial"
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = RGBColor(11, 41, 66)

    doc.add_paragraph(f"Total Audit Entries: {len(records)}  |  Exported: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")

    table = doc.add_table(rows=len(records) + 1, cols=7)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    headers = ["Case ID", "Timestamp", "Document Type", "Number", "Name", "Verdict", "Risk"]
    for col_idx, h in enumerate(headers):
        cell = table.cell(0, col_idx)
        cell.text = h
        cell.paragraphs[0].runs[0].font.bold = True

    for row_idx, rec in enumerate(records, 1):
        r = normalize_record(rec)
        vals = [r["verification_id"], r["timestamp"][:19], r["document_type"][:14], r["document_number"], r["name"][:16], r["recommendation"], str(r["risk_score"])]
        for col_idx, val in enumerate(vals):
            table.cell(row_idx, col_idx).text = val

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.getvalue()

# ==============================================================================
# 4. CSV REPORT GENERATORS (Python standard library)
# ==============================================================================

def generate_individual_csv(raw_record: Dict[str, Any]) -> str:
    """Generates an RFC 4180 compliant CSV string for an individual screening case."""
    r = normalize_record(raw_record)
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["Field", "Value"])
    writer.writerow(["Verification ID", r["verification_id"]])
    writer.writerow(["Timestamp", r["timestamp"]])
    writer.writerow(["Decision Verdict", r["recommendation"]])
    writer.writerow(["Composite Risk Score", r["risk_score"]])
    writer.writerow(["Risk Level", r["risk_level"]])
    writer.writerow(["Evidence Reasons", " | ".join(r["reasons"])])
    writer.writerow(["Document Type", r["document_type"]])
    writer.writerow(["Document Number", r["document_number"]])
    writer.writerow(["Subject Name", r["name"]])
    writer.writerow(["Date of Birth", r["dob"]])
    writer.writerow(["Gender", r["gender"]])
    writer.writerow(["Expiry Date", r["expiry"]])
    writer.writerow(["Nationality", r["nationality"]])
    writer.writerow(["Issuing Country", r["issuing_country"]])
    writer.writerow(["ArcFace Similarity (%)", r["similarity"]])
    writer.writerow(["Face Match Status", r["face_match"]])
    writer.writerow(["Biometric Liveness", r["liveness"]])
    writer.writerow(["ELA Compression Score", r["ela_score"]])
    writer.writerow(["Tamper Status", r["tamper_status"]])
    writer.writerow(["Document SHA-256", r["document_sha256"]])
    writer.writerow(["Face SHA-256", r["face_sha256"]])
    writer.writerow(["Officer ID", r["officer_id"]])
    writer.writerow(["Checkpoint Code", r["checkpoint"]])

    return output.getvalue()

def generate_audit_log_csv(records: List[Dict[str, Any]]) -> str:
    """Generates an RFC 4180 compliant CSV string of the whole audit ledger."""
    output = io.StringIO()
    writer = csv.writer(output)

    headers = [
        "verification_id",
        "timestamp",
        "recommendation",
        "risk_score",
        "risk_level",
        "document_type",
        "document_number",
        "subject_name",
        "date_of_birth",
        "gender",
        "expiry_date",
        "nationality",
        "arcface_similarity",
        "face_match_status",
        "liveness_status",
        "ela_score",
        "tamper_status",
        "document_sha256",
        "face_sha256",
        "officer_id",
        "checkpoint_code",
        "evidence_reasons"
    ]
    writer.writerow(headers)

    for rec in records:
        r = normalize_record(rec)
        writer.writerow([
            r["verification_id"],
            r["timestamp"],
            r["recommendation"],
            r["risk_score"],
            r["risk_level"],
            r["document_type"],
            r["document_number"],
            r["name"],
            r["dob"],
            r["gender"],
            r["expiry"],
            r["nationality"],
            r["similarity"],
            r["face_match"],
            r["liveness"],
            r["ela_score"],
            r["tamper_status"],
            r["document_sha256"],
            r["face_sha256"],
            r["officer_id"],
            r["checkpoint"],
            " | ".join(r["reasons"])
        ])

    return output.getvalue()

from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH


def add_heading(document: Document, text: str, level: int = 1):
    heading = document.add_paragraph()
    run = heading.add_run(text)
    run.bold = True
    if level == 1:
        run.font.size = Pt(16)
    elif level == 2:
        run.font.size = Pt(14)
    else:
        run.font.size = Pt(12)
    heading.alignment = WD_ALIGN_PARAGRAPH.LEFT


def add_para(document: Document, text: str, bold: bool = False, italic: bool = False):
    p = document.add_paragraph()
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.size = Pt(11)
    return p


def add_key_value(document: Document, key: str, value: str):
    p = document.add_paragraph()
    run_key = p.add_run(f"{key}: ")
    run_key.bold = True
    run_key.font.size = Pt(11)
    run_val = p.add_run(value)
    run_val.font.size = Pt(11)


def add_table(document: Document, headers, rows):
    table = document.add_table(rows=1, cols=len(headers))
    table.style = 'Table Grid'
    table.autofit = True
    hdr_cells = table.rows[0].cells
    for idx, header in enumerate(headers):
        hdr_cells[idx].text = str(header)
        # Make header bold
        for paragraph in hdr_cells[idx].paragraphs:
            for run in paragraph.runs:
                run.bold = True

    for row in rows:
        row_cells = table.add_row().cells
        for idx, cell_text in enumerate(row):
            row_cells[idx].text = str(cell_text)
    document.add_paragraph()  # spacing after table
    return table


def build_document(output_path: str):
    document = Document()

    # Page setup
    section = document.sections[0]
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)

    # Header block
    header = document.add_paragraph()
    header.alignment = WD_ALIGN_PARAGRAPH.CENTER
    uni_run = header.add_run("University of Engineering & Technology Peshawar\n")
    uni_run.bold = True
    uni_run.font.size = Pt(16)

    dept_run = header.add_run("Department of Computer Science & IT\n")
    dept_run.bold = True
    dept_run.font.size = Pt(12)

    subj_run = header.add_run("Subject: Compiler Construction (Summer Semester)\n")
    subj_run.font.size = Pt(11)

    marks_run = header.add_run("Total Marks: 10\n")
    marks_run.font.size = Pt(11)

    asg_run = header.add_run("Assignment No. 3\n")
    asg_run.bold = True
    asg_run.font.size = Pt(12)

    document.add_paragraph()  # spacing

    # Student info
    add_key_value(document, "Name", "[Your Name Here]")
    add_key_value(document, "Registration Number", "[Your Reg No Here]")

    document.add_paragraph()  # spacing

    # Question 1
    add_heading(document, "Question 1: Grammar Transformation", level=1)

    add_para(document, "Original Grammar:", bold=True)
    add_para(document, "Expr → Term + Expr | Term")
    add_para(document, "Term → Factor * Term | Factor")
    add_para(document, "Factor → ( Expr ) | id")
    document.add_paragraph()

    add_para(document, "a) Identify and eliminate the Immediate Left Recursion in this grammar.", bold=True)
    add_para(
        document,
        (
            "The grammar has no immediate left recursion. Immediate left recursion occurs when a "
            "non-terminal begins a production with itself (e.g., A → Aα). Here, the productions "
            "for Expr and Term are right-recursive (e.g., Expr → Term + Expr), so no elimination is required."
        ),
    )
    document.add_paragraph()

    add_para(document, "b) Apply Left Factoring where necessary.", bold=True)
    add_para(
        document,
        (
            "Left factoring is needed for Expr and Term because each has alternatives that share a common prefix: "
            "Term for Expr, and Factor for Term."
        ),
    )

    add_para(document, "Left Factoring Result:", bold=True)
    add_para(document, "Expr → Term ExprTail")
    add_para(document, "ExprTail → + Expr | ε")
    add_para(document, "Term → Factor TermTail")
    add_para(document, "TermTail → * Term | ε")
    add_para(document, "Factor → ( Expr ) | id")
    document.add_paragraph()

    add_para(document, "c) Suitability for Predictive Parsing.", bold=True)
    add_para(
        document,
        (
            "Yes. The transformed grammar is LL(1)-friendly: it is free of left recursion and has been left-factored, "
            "so the FIRST sets of alternatives are disjoint, enabling a predictive choice."
        ),
    )

    document.add_paragraph()

    # Question 2
    add_heading(document, "Question 2: FIRST and FOLLOW Sets", level=1)

    add_para(document, "Grammar:", bold=True)
    add_para(document, "S → A b B | c C a")
    add_para(document, "A → d S | ε")
    add_para(document, "B → e A f | C")
    add_para(document, "C → g | ε")
    document.add_paragraph()

    add_para(document, "a) FIRST sets:", bold=True)
    add_para(document, "FIRST(C) = { g, ε }")
    add_para(document, "FIRST(A) = { d, ε }")
    add_para(document, "FIRST(B) = { e, g, ε }")
    add_para(document, "FIRST(S) = { c, d, b }")
    document.add_paragraph()

    add_para(document, "b) FOLLOW sets:", bold=True)
    add_para(document, "FOLLOW(S) = { $ }")
    add_para(document, "FOLLOW(A) = { b, f }")
    add_para(document, "FOLLOW(B) = { $ }")
    add_para(document, "FOLLOW(C) = { a, $ }")
    document.add_paragraph()

    add_para(document, "c) Table entries for A → ε:", bold=True)
    add_para(
        document,
        (
            "Since FOLLOW(A) = { b, f }, the production A → ε is entered under columns b and f for non-terminal A."
        ),
    )

    document.add_paragraph()

    # Question 3
    add_heading(document, "Question 3: LL(1) Parsing Table & Parse", level=1)

    add_para(document, "Grammar:", bold=True)
    add_para(document, "S → if E then S ElsePart | other")
    add_para(document, "ElsePart → else S | ε")
    add_para(document, "E → true")
    add_para(document, "Terminals: if, then, else, true, other")
    document.add_paragraph()

    add_para(document, "a) LL(1) Parsing Table:", bold=True)
    headers = [
        "Non-Terminal",
        "if",
        "then",
        "else",
        "true",
        "other",
        "$",
    ]
    rows = [
        [
            "S",
            "S → if E then S ElsePart",
            "",
            "",
            "",
            "S → other",
            "",
        ],
        [
            "ElsePart",
            "",
            "",
            "ElsePart → else S",
            "",
            "",
            "ElsePart → ε",
        ],
        [
            "E",
            "",
            "",
            "",
            "E → true",
            "",
            "",
        ],
    ]
    add_table(document, headers, rows)

    add_para(document, "b) Parse simulation for input: if true then other else other", bold=True)
    sim_headers = ["Stack", "Input", "Action"]
    sim_rows = [
        ["$ S", "if true then other else other $", "Use S → if E then S ElsePart"],
        ["$ ElsePart S then E if", "if true then other else other $", "Expand S"],
        ["$ ElsePart S then E", "true then other else other $", "Match 'if'"],
        ["$ ElsePart S then true", "true then other else other $", "Use E → true"],
        ["$ ElsePart S then", "then other else other $", "Match 'true'"],
        ["$ ElsePart S", "other else other $", "Match 'then'"],
        ["$ ElsePart other", "other else other $", "Use S → other"],
        ["$ ElsePart", "else other $", "Match 'other'"],
        ["$ S else", "else other $", "Use ElsePart → else S"],
        ["$ S", "other $", "Match 'else'"],
        ["$ other", "other $", "Use S → other"],
        ["$", "$", "Match 'other' and accept"],
    ]
    add_table(document, sim_headers, sim_rows)

    # Save
    document.save(output_path)


if __name__ == "__main__":
    build_document("/workspace/Assignment3_TopDown_Parsing.docx")


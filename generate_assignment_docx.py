from docx import Document
from docx.shared import Pt
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH


def set_run_font_times_new_roman(run, size_pt, bold=False):
    run.font.name = "Times New Roman"
    # Ensure East Asian font mapping also uses Times New Roman
    r = run._element.rPr
    if r is not None and r.rFonts is not None:
        r.rFonts.set(qn('w:eastAsia'), 'Times New Roman')
    run.font.size = Pt(size_pt)
    run.bold = bold


def add_heading_paragraph(document: Document, text: str):
    p = document.add_paragraph()
    run = p.add_run(text)
    set_run_font_times_new_roman(run, 16, bold=True)
    return p


def add_body_paragraph(document: Document, text: str):
    p = document.add_paragraph()
    run = p.add_run(text)
    set_run_font_times_new_roman(run, 14, bold=False)
    return p


def add_sql_block(document: Document, sql: str):
    # Keep Times New Roman per requirement; present as separate lines
    for line in sql.strip().split("\n"):
        p = document.add_paragraph()
        run = p.add_run(line)
        set_run_font_times_new_roman(run, 14, bold=False)
    return document


def main():
    document = Document()

    # Set Normal style defaults to Times New Roman, 14 pt
    normal_style = document.styles["Normal"]
    normal_style.font.name = "Times New Roman"
    normal_style.font.size = Pt(14)
    # Ensure East Asian mapping for style as well
    try:
        normal_style.element.rPr.rFonts.set(qn('w:eastAsia'), 'Times New Roman')
    except Exception:
        pass

    # Header block
    title_p = document.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run("University of Engineering & Technology Peshawar")
    set_run_font_times_new_roman(title_run, 16, bold=True)

    add_body_paragraph(document, "Department of Computer Science & IT")
    add_body_paragraph(document, "Subject: Database Summer Semester")
    add_body_paragraph(document, "Total Marks: 10")
    add_body_paragraph(document, "Assignment No. 3")

    # Spacing
    document.add_paragraph("")

    # Q1
    add_heading_paragraph(document, "Q No 1. Case Study on Query Optimization")
    add_body_paragraph(document, (
        "A university database has two tables: \n"
        "- Student(student_id, name, age, course_id)\n"
        "- Course(course_id, course_name)\n"
        "Write two different SQL queries to retrieve the names of students enrolled in the course \"Database Systems\".\n"
    ))

    add_body_paragraph(document, "Query 1: Explicit join")
    add_sql_block(document, (
        "SELECT s.name\n"
        "FROM Student AS s\n"
        "JOIN Course  AS c ON c.course_id = s.course_id\n"
        "WHERE c.course_name = 'Database Systems';"
    ))

    document.add_paragraph("")

    add_body_paragraph(document, "Query 2: EXISTS (semi-join)")
    add_sql_block(document, (
        "SELECT s.name\n"
        "FROM Student AS s\n"
        "WHERE EXISTS (\n"
        "  SELECT 1\n"
        "  FROM Course AS c\n"
        "  WHERE c.course_id = s.course_id\n"
        "    AND c.course_name = 'Database Systems'\n"
        ");"
    ))

    document.add_paragraph("")

    add_body_paragraph(document, "Optimizer transformations and likely execution plans:")
    add_body_paragraph(document, (
        "Heuristic (rule-based) optimizations: \n"
        "- Push selections: Apply c.course_name = 'Database Systems' early to reduce rows in Course.\n"
        "- Projection pushdown: Retain only columns needed (s.name, s.course_id, c.course_id, c.course_name).\n"
        "- Join reordering/associativity: Treat EXISTS as a semi-join; join smaller filtered set first.\n"
        "- Replace IN/EXISTS with semi-join: Avoid duplicating s rows when not needed.\n"
    ))
    add_body_paragraph(document, (
        "Cost-based choices (dependent on statistics and indexes): \n"
        "- If an index exists on Course(course_name) or Course(course_name, course_id), the optimizer can \n"
        "  first find course_id for 'Database Systems' cheaply, then join to Student.\n"
        "- If an index exists on Student(course_id) (ideally covering with (course_id, name)), an index nested-loops \n"
        "  plan can probe Student efficiently for the matching course_id.\n"
        "- Without useful indexes and for equality predicates, a hash join (build on filtered Course, probe Student) \n"
        "  is typically preferred due to linear-time behavior.\n"
        "- With both sides already ordered by course_id (e.g., clustered indexes), a merge join may be optimal since \n"
        "  it avoids hashing and random I/O.\n"
    ))

    document.add_paragraph("")

    # Q2
    add_heading_paragraph(document, "Q No 2. Indexing Analysis")

    add_body_paragraph(document, (
        "(a) Recommended index for filtering on dept and age simultaneously: \n"
        "Use a composite B-tree index on (dept, age). This supports equality lookups on dept and efficient range \n"
        "scans or equality on age within each department. Compared to two separate single-column indexes, the composite \n"
        "index avoids an index-merge and yields better locality and fewer page reads. If queries often return only name \n"
        "or a few columns, consider a covering index with included columns.\n"
    ))

    add_body_paragraph(document, (
        "(b) Inefficient index type for range queries on salary and why: \n"
        "A hash index is inefficient (and typically unusable) for range predicates (e.g., salary BETWEEN a AND b) because \n"
        "hashing destroys ordering and prevents ordered scans. B-tree indexes preserve key order and are preferred for \n"
        "range queries.\n"
    ))

    document.add_paragraph("")

    # Q3
    add_heading_paragraph(document, "Q No 3. Join Algorithm Evaluation")

    add_body_paragraph(document, (
        "Given Orders (≈5,000,000 rows) and Customers (≈50,000 rows), with an equality join on customer_id: \n"
        "- Most efficient in the general case (unsorted inputs, no selective index): Hash Join. Build the hash on the \n"
        "  smaller Customers table (≈50k), then probe with Orders (≈5M). This yields near linear time and avoids costly \n"
        "  random I/O. Memory requirements are manageable for a 50k-row hash table.\n"
        "- If an index exists on Orders(customer_id) (or a clustered/covering index), an Index Nested Loops plan can be \n"
        "  competitive: scan Customers (50k) and probe Orders via the index. This is best when each customer matches a \n"
        "  small number of orders and the join is selective.\n"
        "- If both inputs are already ordered on customer_id (e.g., clustered B-tree on both), a Merge Join can be excellent, \n"
        "  as it streams both sides once with minimal memory and no hashing—otherwise, sorting 5M rows can be expensive.\n"
        "Key factors: input sizes (5M vs 50k), available indexes (especially on Orders.customer_id), predicate type (equality), \n"
        "and whether data is pre-sorted. In most real deployments without perfect ordering, Hash Join is the default winner.\n"
    ))

    # Save
    output_path = "/workspace/Database_Assignment_3.docx"
    document.save(output_path)
    print(f"Saved: {output_path}")


if __name__ == "__main__":
    main()


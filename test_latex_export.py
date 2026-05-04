import re

def markdown_to_latex(text: str) -> str:
    if not text: return ""

    # Replace newlines
    text = text.replace("\r\n", "\n")

    # Code blocks
    blocks = []
    def rep_code(m):
        blocks.append(m.group(2))
        return f"CODEBLOCK{len(blocks)-1}CODEBLOCK"
    text = re.sub(r"```([a-zA-Z0-9_]*)\s*\n(.*?)```", rep_code, text, flags=re.DOTALL)

    # Display math
    dmaths = []
    def rep_dmath(m):
        dmaths.append(m.group(1))
        return f"DMATH{len(dmaths)-1}DMATH"
    text = re.sub(r"\$\$(.*?)\$\$", rep_dmath, text, flags=re.DOTALL)

    # Inline math
    imaths = []
    def rep_imath(m):
        imaths.append(m.group(1))
        return f"IMATH{len(imaths)-1}IMATH"
    text = re.sub(r"\$(.*?)\$", rep_imath, text)

    # Escape LaTeX special chars (excluding placeholders)
    text = text.replace('\\', '\\textbackslash ')
    text = text.replace('%', '\\%')
    text = text.replace('&', '\\&')
    text = text.replace('_', '\\_')
    text = text.replace('#', '\\#')
    
    # Headings
    text = re.sub(r"(?m)^\\#\\#\\#\\# (.*?)$", r"\\subsubsection*{\1}", text)
    text = re.sub(r"(?m)^\\#\\#\\# (.*?)$", r"\\subsection*{\1}", text)
    text = re.sub(r"(?m)^\\#\\# (.*?)$", r"\\section*{\1}", text)
    text = re.sub(r"(?m)^\\# (.*?)$", r"\\part*{\1}", text)

    # Bold/Italic
    text = re.sub(r"\*\*(.*?)\*\*", r"\\textbf{\1}", text)
    text = re.sub(r"\*(.*?)\*", r"\\textit{\1}", text)
    
    # Blockquotes
    text = re.sub(r"(?m)^> (.*?)$", r"\\begin{quote}\1\\end{quote}", text)

    # Restore placeholders
    for i, c in enumerate(blocks):
        text = text.replace(f"CODEBLOCK{i}CODEBLOCK", f"\\begin{{verbatim}}\n{c}\n\\end{{verbatim}}")
    for i, m in enumerate(dmaths):
        text = text.replace(f"DMATH{i}DMATH", f"$${m}$$")
    for i, m in enumerate(imaths):
        text = text.replace(f"IMATH{i}IMATH", f"${m}$")
        
    return text

print(markdown_to_latex("Hola _mundo_ con $x^2$ y % de ganancia.\n\n## Subtitulo\n\n```python\nprint('hello_world')\n```"))

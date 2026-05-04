import React from 'react'
import { renderToString } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

const text = "Invalid latex: $\\begin{pmatrix} 1 & 2 \\end{pmatrix}$ and $x^2$"

try {
  const html = renderToString(
    <ReactMarkdown 
      remarkPlugins={[remarkMath]} 
      rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
    >{text}</ReactMarkdown>
  )
  console.log("Success:", html)
} catch (e) {
  console.error("Error:", e)
}

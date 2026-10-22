import { NextRequest, NextResponse } from "next/server";
import { PORTFOLIO_CONTENT } from "@/config/content";

function buildSystemPrompt(): string {
  const projectList = PORTFOLIO_CONTENT.projects
    .map(
      (p) =>
        `- ${p.title} (${p.role}, ${p.buildTime}): ${p.oneLiner} | Stack: ${p.stack.join(
          ", "
        )} | Problem: ${p.problem} | Solution: ${p.solution}`
    )
    .join("\n");

  const skillsList = PORTFOLIO_CONTENT.skills
    .map((g) => `${g.category}: ${g.items.map((i) => i.name).join(", ")}`)
    .join(" | ");

  return `You are the technical portfolio assistant for ${PORTFOLIO_CONTENT.name} (${PORTFOLIO_CONTENT.role}).
Tagline: ${PORTFOLIO_CONTENT.tagline}
Bio: ${PORTFOLIO_CONTENT.bioParagraphs.join(" ")}
Availability: ${PORTFOLIO_CONTENT.availability}
Contact: Email ${PORTFOLIO_CONTENT.contact.email}, GitHub ${PORTFOLIO_CONTENT.contact.github}, LinkedIn ${PORTFOLIO_CONTENT.contact.linkedin}
Projects:
${projectList}
Skills:
${skillsList}
Answer concisely and technically like a senior engineer.`;
}

function generateLocalDarkroomReply(question: string): string {
  const q = question.toLowerCase();

  // Check if asking about a specific project by name
  for (const proj of PORTFOLIO_CONTENT.projects) {
    const firstWord = proj.title.split(" ")[0].toLowerCase();
    if (q.includes(firstWord) || q.includes(proj.id.toLowerCase())) {
      return `**${proj.title}** (${proj.role})\n\n• **Summary:** ${proj.oneLiner}\n• **Problem:** ${proj.problem}\n• **Solution:** ${proj.solution}\n• **Stack:** ${proj.stack.join(", ")}\n• **Repo:** ${proj.repoLink}`;
    }
  }

  if (
    q.includes("deep learning") ||
    q.includes("neural") ||
    q.includes("siren") ||
    q.includes("adam") ||
    q.includes("backprop") ||
    q.includes("ml") ||
    q.includes("ai") ||
    q.includes("pytorch")
  ) {
    return `${PORTFOLIO_CONTENT.name}'s Deep Learning work focuses on client-side neural execution and computer vision:\n• **MicroSIREN (Section 04):** A live 2-layer coordinate MLP trained at 60fps in TypeScript using bias-corrected **Adam** ($m_t, v_t$) and analytical backpropagation. You can switch between **SIREN ($\\sin(\\omega_0 x)$)**, **ReLU**, and **Tanh** to observe spectral bias live.\n• **2D Vision Kernels:** Real-time 3×3 Sobel edge magnitude, 2D Gabor orientation filters, and 16×16 patch self-similarity.\n• **Semantic Search:** Live cosine-similarity vector query over project and photography embeddings.`;
  }

  if (q.includes("project") || q.includes("built") || q.includes("work") || q.includes("repo")) {
    const list = PORTFOLIO_CONTENT.projects
      .map((p) => `• **${p.title}**: ${p.oneLiner} ([GitHub](${p.repoLink}))`)
      .join("\n");
    return `Here are ${PORTFOLIO_CONTENT.name}'s featured engineering projects:\n${list}`;
  }

  if (q.includes("stack") || q.includes("skill") || q.includes("tech") || q.includes("language")) {
    return `${PORTFOLIO_CONTENT.name}'s core stack:\n• **Deep Learning & Vision:** PyTorch, Coordinate MLPs (SIREN), 2D CNN/Gabor kernels, ONNX Runtime Web, Vector Embeddings\n• **Frontend & GPU:** TypeScript, React 18, Next.js (App Router), WebGL2 / Three.js, Custom GLSL, HTML5 Canvas\n• **Systems:** Python, Node.js, PostgreSQL (pgvector), Git, Vercel`;
  }

  if (q.includes("photo") || q.includes("camera") || q.includes("film")) {
    return `${PORTFOLIO_CONTENT.name} shoots medium-format and 35mm black-and-white film (Hasselblad 500C/M, Leica M6, Ilford HP5+) and uses optical physics—like dispersion, halation, and spatial frequency—to inform both custom GLSL shaders and computer vision feature extractors.`;
  }

  if (
    q.includes("hire") ||
    q.includes("contact") ||
    q.includes("email") ||
    q.includes("available") ||
    q.includes("reach")
  ) {
    return `${PORTFOLIO_CONTENT.name} is **${PORTFOLIO_CONTENT.availability.toLowerCase()}**.\n\n• **Email:** ${PORTFOLIO_CONTENT.contact.email}\n• **GitHub:** ${PORTFOLIO_CONTENT.contact.github}\n• **Tip:** Press \`⌘K\` / \`Ctrl+K\` to open the CLI and run \`sudo hire-me\`.`;
  }

  return `${PORTFOLIO_CONTENT.name} is a **${PORTFOLIO_CONTENT.role}** based in ${PORTFOLIO_CONTENT.location}.\n\nYou can ask me about:\n• **MicroSIREN** (how the live in-browser Adam neural network trainer works)\n• **SonicFlow** or **LagosLife** repositories\n• **WebGL2 shader optimization** (single on-demand context lifecycle)\n• **Hiring & contact details** (${PORTFOLIO_CONTENT.contact.email})`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = String(body?.message || "").trim();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt();
    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (openAiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.5,
          max_tokens: 280,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content;
        if (reply) {
          return NextResponse.json({ reply, provider: "openai" });
        }
      }
    }

    if (geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\nVisitor question: ${message}` }],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return NextResponse.json({ reply, provider: "gemini" });
        }
      }
    }

    return NextResponse.json({
      reply: generateLocalDarkroomReply(message),
      provider: "local-engine",
    });
  } catch {
    return NextResponse.json({
      reply: generateLocalDarkroomReply("overview"),
      provider: "local-engine",
    });
  }
}

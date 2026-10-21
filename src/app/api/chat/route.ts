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

  return `You are the Darkroom AI Assistant for ${PORTFOLIO_CONTENT.name} (${PORTFOLIO_CONTENT.role}).
Tagline: ${PORTFOLIO_CONTENT.tagline}
Bio: ${PORTFOLIO_CONTENT.bioParagraphs.join(" ")}
Availability: ${PORTFOLIO_CONTENT.availability}
Contact: Email ${PORTFOLIO_CONTENT.contact.email}, GitHub ${PORTFOLIO_CONTENT.contact.github}, LinkedIn ${PORTFOLIO_CONTENT.contact.linkedin}
Projects:
${projectList}
Skills:
${skillsList}
Speak with concise, insightful creative-engineering precision and occasional darkroom/optics metaphors.`;
}

function generateLocalDarkroomReply(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("project") || q.includes("built") || q.includes("work") || q.includes("halide")) {
    const top = PORTFOLIO_CONTENT.projects
      .slice(0, 3)
      .map((p) => `• **${p.title}** (${p.stack.slice(0, 3).join(", ")}): ${p.oneLiner}`)
      .join("\n");
    return `Here are key archival plates from ${PORTFOLIO_CONTENT.name}'s contact sheet:\n${top}\n\nYou can click any frame in **03.SHEETS** to launch the interactive sandbox and read the full Problem/Solution case study.`;
  }

  if (q.includes("stack") || q.includes("skill") || q.includes("tech") || q.includes("webgl")) {
    return `${PORTFOLIO_CONTENT.name} specializes in **TypeScript, Next.js (App Router), WebGL / React Three Fiber, custom GLSL shaders, GSAP + Lenis choreography**, and **Rust/WASM + Node.js backend pipelines**. In the darkroom, that's paired with medium-format silver gelatin printing.`;
  }

  if (q.includes("photo") || q.includes("camera") || q.includes("film") || q.includes("darkroom")) {
    return `Photography isn't a side hobby here — it's the structural lens for how ${PORTFOLIO_CONTENT.name} writes code. Shoots on **Hasselblad 500C/M, Leica M6, and Pentax 67II** using Ilford HP5+ and Kodak Tri-X 400, often translating chemical halation and grain physics directly into GLSL fragment shaders.`;
  }

  if (q.includes("hire") || q.includes("contact") || q.includes("email") || q.includes("available")) {
    return `${PORTFOLIO_CONTENT.name} is currently **${PORTFOLIO_CONTENT.availability.toLowerCase()}**.\n\n• **Email:** ${PORTFOLIO_CONTENT.contact.email}\n• **GitHub:** ${PORTFOLIO_CONTENT.contact.github}\n• **Secret tip:** Open the CLI Terminal (\`Ctrl+K\`) and run \`sudo hire-me\` for root clearance.`;
  }

  return `${PORTFOLIO_CONTENT.name} is a **${PORTFOLIO_CONTENT.role}**. ${PORTFOLIO_CONTENT.tagline}\n\nAsk me about specific **WebGL & full-stack projects**, **technical stack**, **analog film gear**, or **how to get in touch**!`;
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

    // 1. Use OpenAI if OPENAI_API_KEY is configured
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
          temperature: 0.6,
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

    // 2. Use Gemini if GEMINI_API_KEY is configured
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

    // 3. Built-in zero-latency Darkroom knowledge engine fallback
    return NextResponse.json({
      reply: generateLocalDarkroomReply(message),
      provider: "darkroom-local-engine",
    });
  } catch {
    return NextResponse.json({
      reply: generateLocalDarkroomReply("overview"),
      provider: "darkroom-local-engine",
    });
  }
}

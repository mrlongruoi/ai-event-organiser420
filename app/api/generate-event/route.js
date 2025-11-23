import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Normalize and extract text from a variety of model response shapes.
async function getTextFromResponse(resp) {
  // resp may be:
  // - a string
  // - an object with a text() method (Response-like)
  // - an object with fields like outputText or content

  if (typeof resp === "string") return resp;

  if (typeof resp?.text === "function") {
    // resp.text() may return a Promise or a plain string
    const maybe = resp.text();
    return typeof maybe?.then === "function" ? await maybe : maybe;
  }

  if (resp && typeof resp === "object") {
    if (typeof resp?.outputText === "string") return resp.outputText;
    if (typeof resp?.content === "string") return resp.content;
    return JSON.stringify(resp);
  }

  throw new Error("Unexpected response shape from model");
}

function cleanModelText(text) {
  // Trim and remove common markdown code fences that some models include
  if (text == null) return "";
  return String(text).trim().replaceAll(/```json\n?/g, "").replaceAll(/```\n?/g, "");
}

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are an event planning assistant. Generate event details based on the user's description.

CRITICAL: Return ONLY valid JSON with properly escaped strings. No newlines in string values - use spaces instead.

Return this exact JSON structure:
{
  "title": "Event title (catchy and professional, single line)",
  "description": "Detailed event description in a single paragraph. Use spaces instead of line breaks. Make it 2-3 sentences describing what attendees will learn and experience.",
  "category": "One of: tech, music, sports, art, food, business, health, education, gaming, networking, outdoor, community",
  "suggestedCapacity": 50,
  "suggestedTicketType": "free"
}

User's event idea: ${prompt}

Rules:
- Return ONLY the JSON object, no markdown, no explanation
- All string values must be on a single line with no line breaks
- Use spaces instead of \\n+or line breaks in description
- Make title catchy and under 80 characters
- Description should be 2-3 sentences, informative, single paragraph
- suggestedTicketType should be either "free" or "paid"
`;

    const result = await model.generateContent(systemPrompt);

    const resp = result?.response ?? result;
    const text = await getTextFromResponse(resp);
    const cleanedText = cleanModelText(text);

    console.log(cleanedText);

    const eventData = JSON.parse(cleanedText);

    return NextResponse.json(eventData);
  } catch (error) {
    console.error("Error generating event:", error);
    return NextResponse.json(
      { error: "Failed to generate event: " + (error?.message ?? String(error)) },
      { status: 500 }
    );
  }
}

import { VertexAI } from "@google-cloud/vertexai";
process.env.GOOGLE_APPLICATION_CREDENTIALS = "/var/www/study-app/gcp-key.json";
const v = new VertexAI({project:"gen-lang-client-0754997267", location:"us-central1"});
const sys = "You are scoring a job candidate. Return STRICT JSON: {\"score\":0-10,\"label\":\"Strong Fit|Good Fit|Moderate Fit|Weak Fit\",\"matched\":[],\"gaps\":[],\"highlights\":[]}. Output ONLY the JSON.";
const model = v.getGenerativeModel({
  model:"gemini-2.5-flash",
  systemInstruction:{role:"system",parts:[{text:sys}]},
  generationConfig:{temperature:0.4, maxOutputTokens:1024, responseMimeType:"application/json"}
});
const r = await model.generateContent({contents:[{role:"user",parts:[{text:"Score candidate for AI Engineer at TCS. Skills: Python, LangChain, RAG."}]}]});
const text = r.response?.candidates?.[0]?.content?.parts?.map(p=>p.text).join("") || "EMPTY";
console.log("RAW:", text.slice(0,400));
console.log("MATCH:", text.match(/\{[\s\S]*\}/) ? "YES - JSON found" : "NO - no JSON found");

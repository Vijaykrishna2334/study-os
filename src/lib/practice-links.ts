// Curated practice resources per topic prefix. Longest prefix wins.
// Each topic page surfaces practice + coding sites + sandbox + reference reading.

export type Link = { label: string; url: string; kind: "practice" | "ref" | "code" | "video" | "dataset" };

const RULES: Array<{ prefix: string; links: Link[] }> = [
  // ────────────── DSA (cross-cutting, always visible) handled in component, not here ──────────────

  // ─── Phase 1: Math + Python + Data ───
  { prefix: "P1_1_1", links: [
    { label: "3Blue1Brown — Essence of Linear Algebra", url: "https://www.3blue1brown.com/topics/linear-algebra", kind: "video" },
    { label: "Khan Academy — Linear Algebra", url: "https://www.khanacademy.org/math/linear-algebra", kind: "ref" },
    { label: "Brilliant — Linear Algebra problems", url: "https://brilliant.org/courses/linear-algebra/", kind: "practice" },
    { label: "NumPy linear algebra exercises", url: "https://www.machinelearningplus.com/python/101-numpy-exercises-python/", kind: "practice" },
  ]},
  { prefix: "P1_1_2", links: [
    { label: "3Blue1Brown — Essence of Calculus", url: "https://www.3blue1brown.com/topics/calculus", kind: "video" },
    { label: "Khan Academy — Multivariable Calculus", url: "https://www.khanacademy.org/math/multivariable-calculus", kind: "ref" },
    { label: "Paul's Online Math Notes", url: "https://tutorial.math.lamar.edu/", kind: "ref" },
  ]},
  { prefix: "P1_1_3", links: [
    { label: "StatQuest — Probability & Stats", url: "https://www.youtube.com/c/joshstarmer", kind: "video" },
    { label: "Seeing Theory (interactive)", url: "https://seeing-theory.brown.edu/", kind: "ref" },
    { label: "Brilliant — Probability", url: "https://brilliant.org/courses/probability/", kind: "practice" },
    { label: "HackerRank — 10 Days of Statistics", url: "https://www.hackerrank.com/domains/tutorials/10-days-of-statistics", kind: "practice" },
  ]},
  { prefix: "P1_1_4", links: [
    { label: "Information Theory — Cover & Thomas (PDF)", url: "http://staff.ustc.edu.cn/~cgong821/Wiley.Interscience.Elements.of.Information.Theory.Jul.2006.eBook-DDU.pdf", kind: "ref" },
  ]},
  { prefix: "P1_1_5", links: [
    { label: "Convex Optimization — Boyd (Stanford)", url: "https://web.stanford.edu/~boyd/cvxbook/", kind: "ref" },
    { label: "Distill — Why Momentum Really Works", url: "https://distill.pub/2017/momentum/", kind: "ref" },
  ]},
  { prefix: "P1_2_1", links: [
    { label: "NumPy official quickstart", url: "https://numpy.org/doc/stable/user/quickstart.html", kind: "ref" },
    { label: "100 NumPy Exercises", url: "https://github.com/rougier/numpy-100", kind: "practice" },
    { label: "HackerRank — NumPy", url: "https://www.hackerrank.com/domains/python?filters%5Bsubdomains%5D%5B%5D=numpy", kind: "practice" },
  ]},
  { prefix: "P1_2_2", links: [
    { label: "Pandas official user guide", url: "https://pandas.pydata.org/docs/user_guide/", kind: "ref" },
    { label: "Kaggle Learn — Pandas", url: "https://www.kaggle.com/learn/pandas", kind: "practice" },
    { label: "HackerRank — Pandas", url: "https://www.hackerrank.com/domains/python?filters%5Bsubdomains%5D%5B%5D=py-pandas", kind: "practice" },
  ]},
  { prefix: "P1_2_3", links: [
    { label: "Kaggle Learn — Data Visualization", url: "https://www.kaggle.com/learn/data-visualization", kind: "practice" },
    { label: "From Data to Viz", url: "https://www.data-to-viz.com/", kind: "ref" },
  ]},
  { prefix: "P1_2_4", links: [
    { label: "scikit-learn user guide", url: "https://scikit-learn.org/stable/user_guide.html", kind: "ref" },
    { label: "Kaggle Learn — Intro to ML", url: "https://www.kaggle.com/learn/intro-to-machine-learning", kind: "practice" },
  ]},
  { prefix: "P1_3", links: [
    { label: "Kaggle Learn — Data Cleaning", url: "https://www.kaggle.com/learn/data-cleaning", kind: "practice" },
    { label: "Kaggle Learn — Feature Engineering", url: "https://www.kaggle.com/learn/feature-engineering", kind: "practice" },
    { label: "Imbalanced-learn docs", url: "https://imbalanced-learn.org/stable/", kind: "ref" },
  ]},

  // ─── Phase 2: Classical ML ───
  { prefix: "P2_", links: [
    { label: "Kaggle Playground competitions", url: "https://www.kaggle.com/competitions?hostSegmentIdFilter=8", kind: "practice" },
    { label: "Hands-On ML (book repo)", url: "https://github.com/ageron/handson-ml3", kind: "code" },
    { label: "StatQuest — ML playlist", url: "https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF", kind: "video" },
    { label: "Distill.pub — visual explanations", url: "https://distill.pub/", kind: "ref" },
  ]},
  { prefix: "P2_4_5", links: [
    { label: "XGBoost docs + tutorials", url: "https://xgboost.readthedocs.io/", kind: "ref" },
    { label: "Kaggle — XGBoost tutorial", url: "https://www.kaggle.com/code/dansbecker/xgboost", kind: "practice" },
  ]},
  { prefix: "P2_5_4", links: [
    { label: "Setosa.io — PCA visualization", url: "https://setosa.io/ev/principal-component-analysis/", kind: "ref" },
  ]},

  // ─── Phase 3: Deep Learning ───
  { prefix: "P3_", links: [
    { label: "fast.ai — Practical Deep Learning", url: "https://course.fast.ai/", kind: "video" },
    { label: "Karpathy — Zero to Hero", url: "https://karpathy.ai/zero-to-hero.html", kind: "video" },
    { label: "Deep Learning book — Goodfellow", url: "https://www.deeplearningbook.org/", kind: "ref" },
    { label: "Papers With Code", url: "https://paperswithcode.com/", kind: "ref" },
  ]},
  { prefix: "P3_1_4", links: [
    { label: "Illustrated Transformer — Jay Alammar", url: "https://jalammar.github.io/illustrated-transformer/", kind: "ref" },
    { label: "Attention Is All You Need (paper)", url: "https://arxiv.org/abs/1706.03762", kind: "ref" },
  ]},
  { prefix: "P3_3_2", links: [
    { label: "PyTorch tutorials", url: "https://pytorch.org/tutorials/", kind: "ref" },
    { label: "PyTorch 60-min Blitz", url: "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html", kind: "practice" },
  ]},
  { prefix: "P3_3_4", links: [
    { label: "Hugging Face Course", url: "https://huggingface.co/learn/nlp-course/chapter1/1", kind: "video" },
  ]},

  // ─── Phase 4: Computer Vision ───
  { prefix: "P4_", links: [
    { label: "CS231n — Stanford CV", url: "https://cs231n.stanford.edu/", kind: "video" },
    { label: "Roboflow Universe — CV datasets", url: "https://universe.roboflow.com/", kind: "dataset" },
    { label: "Hugging Face CV models", url: "https://huggingface.co/models?pipeline_tag=image-classification", kind: "code" },
    { label: "Papers With Code — CV", url: "https://paperswithcode.com/area/computer-vision", kind: "ref" },
  ]},
  { prefix: "P4_3_1", links: [
    { label: "Ultralytics YOLO docs", url: "https://docs.ultralytics.com/", kind: "ref" },
  ]},
  { prefix: "P4_4_4", links: [
    { label: "Segment Anything demo", url: "https://segment-anything.com/demo", kind: "code" },
  ]},
  { prefix: "P4_6_1", links: [
    { label: "Stable Diffusion — diffusers docs", url: "https://huggingface.co/docs/diffusers", kind: "ref" },
    { label: "Annotated Diffusion (HF)", url: "https://huggingface.co/blog/annotated-diffusion", kind: "ref" },
  ]},

  // ─── Phase 5: NLP → Transformers ───
  { prefix: "P5_", links: [
    { label: "Hugging Face NLP Course", url: "https://huggingface.co/learn/nlp-course", kind: "video" },
    { label: "Karpathy — Let's build GPT (video)", url: "https://www.youtube.com/watch?v=kCc8FmEb1nY", kind: "video" },
    { label: "Stanford CS224n", url: "https://web.stanford.edu/class/cs224n/", kind: "video" },
    { label: "Illustrated BERT — Alammar", url: "https://jalammar.github.io/illustrated-bert/", kind: "ref" },
  ]},

  // ─── Phase 6: LLMs ───
  { prefix: "P6_", links: [
    { label: "Hugging Face — LLM Course", url: "https://huggingface.co/learn/llm-course", kind: "video" },
    { label: "DeepLearning.AI short courses", url: "https://www.deeplearning.ai/short-courses/", kind: "video" },
    { label: "Prompt Engineering Guide", url: "https://www.promptingguide.ai/", kind: "ref" },
    { label: "OpenAI Cookbook", url: "https://cookbook.openai.com/", kind: "code" },
  ]},
  { prefix: "P6_5", links: [
    { label: "PEFT library (HF)", url: "https://huggingface.co/docs/peft", kind: "ref" },
    { label: "Unsloth — fast fine-tune notebooks", url: "https://github.com/unslothai/unsloth", kind: "code" },
  ]},
  { prefix: "P6_6", links: [
    { label: "llama.cpp — quantization guide", url: "https://github.com/ggerganov/llama.cpp", kind: "code" },
    { label: "Ollama library", url: "https://ollama.com/library", kind: "code" },
  ]},
  { prefix: "P6_7", links: [
    { label: "vLLM docs", url: "https://docs.vllm.ai/", kind: "ref" },
  ]},

  // ─── Phase 7: RAG ───
  { prefix: "P7_", links: [
    { label: "LangChain RAG tutorial", url: "https://python.langchain.com/docs/tutorials/rag/", kind: "ref" },
    { label: "LlamaIndex RAG", url: "https://docs.llamaindex.ai/en/stable/understanding/", kind: "ref" },
    { label: "RAGAS evaluation", url: "https://docs.ragas.io/", kind: "ref" },
    { label: "TruLens", url: "https://www.trulens.org/", kind: "ref" },
    { label: "Pinecone Learning Center", url: "https://www.pinecone.io/learn/", kind: "ref" },
  ]},

  // ─── Phase 8: Agents ───
  { prefix: "P8_", links: [
    { label: "LangGraph docs", url: "https://langchain-ai.github.io/langgraph/", kind: "ref" },
    { label: "CrewAI", url: "https://docs.crewai.com/", kind: "ref" },
    { label: "AutoGen (Microsoft)", url: "https://microsoft.github.io/autogen/", kind: "ref" },
    { label: "MCP spec", url: "https://modelcontextprotocol.io/", kind: "ref" },
    { label: "Anthropic — Building Effective Agents", url: "https://www.anthropic.com/research/building-effective-agents", kind: "ref" },
  ]},

  // ─── Phase 9: Multimodal ───
  { prefix: "P9_", links: [
    { label: "Hugging Face — multimodal models", url: "https://huggingface.co/models?pipeline_tag=image-text-to-text", kind: "code" },
    { label: "OpenAI Vision cookbook", url: "https://cookbook.openai.com/examples/gpt_with_vision_for_video_understanding", kind: "code" },
  ]},

  // ─── Phase 10: MLOps ───
  { prefix: "P10_", links: [
    { label: "Made With ML — MLOps", url: "https://madewithml.com/", kind: "ref" },
    { label: "MLOps Zoomcamp (free)", url: "https://github.com/DataTalksClub/mlops-zoomcamp", kind: "video" },
    { label: "Full Stack Deep Learning", url: "https://fullstackdeeplearning.com/", kind: "video" },
    { label: "MLflow docs", url: "https://mlflow.org/docs/latest/index.html", kind: "ref" },
    { label: "Langfuse", url: "https://langfuse.com/docs", kind: "ref" },
  ]},

  // ─── Phase 11: Frontier ───
  { prefix: "P11_", links: [
    { label: "Lilian Weng blog", url: "https://lilianweng.github.io/", kind: "ref" },
    { label: "Sebastian Raschka — Ahead of AI", url: "https://magazine.sebastianraschka.com/", kind: "ref" },
    { label: "arXiv-sanity", url: "https://arxiv-sanity-lite.com/", kind: "ref" },
  ]},

  // ─── Phase 12: Specialized ───
  { prefix: "P12_1", links: [
    { label: "Spinning Up in Deep RL", url: "https://spinningup.openai.com/", kind: "ref" },
    { label: "Hugging Face Deep RL course", url: "https://huggingface.co/learn/deep-rl-course/", kind: "video" },
  ]},
  { prefix: "P12_4", links: [
    { label: "Stanford CS224W — Graph ML", url: "https://web.stanford.edu/class/cs224w/", kind: "video" },
    { label: "PyG (PyTorch Geometric)", url: "https://pytorch-geometric.readthedocs.io/", kind: "ref" },
  ]},
];

// Always-on links for every topic — coding practice & sandbox
export const ALWAYS_ON: Link[] = [
  { label: "LeetCode", url: "https://leetcode.com/problemset/", kind: "practice" },
  { label: "NeetCode 150", url: "https://neetcode.io/practice", kind: "practice" },
  { label: "Kaggle", url: "https://www.kaggle.com/", kind: "practice" },
  { label: "Google Colab (open notebook)", url: "https://colab.research.google.com/", kind: "code" },
  { label: "Hugging Face Spaces", url: "https://huggingface.co/spaces", kind: "code" },
  { label: "Papers With Code", url: "https://paperswithcode.com/", kind: "ref" },
];

export function linksFor(code: string, phase: number): Link[] {
  const matches: { len: number; links: Link[] }[] = [];
  for (const r of RULES) {
    if (code.startsWith(r.prefix)) matches.push({ len: r.prefix.length, links: r.links });
  }
  matches.sort((a, b) => a.len - b.len); // shorter first = broader → specific
  const seen = new Set<string>();
  const out: Link[] = [];
  for (const m of matches) for (const l of m.links) if (!seen.has(l.url)) { seen.add(l.url); out.push(l); }
  return out;
}

export const KIND_META: Record<Link["kind"], { label: string; color: string; icon: string }> = {
  practice: { label: "Practice",  color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", icon: "▶" },
  ref:      { label: "Reference", color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",   icon: "📘" },
  video:    { label: "Video",     color: "bg-rose-500/15 text-rose-300 border-rose-500/30",         icon: "🎬" },
  code:     { label: "Code",      color: "bg-amber-500/15 text-amber-300 border-amber-500/30",      icon: "⚙" },
  dataset:  { label: "Dataset",   color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",         icon: "◫" },
};

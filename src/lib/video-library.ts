// Curated YouTube playlist per phase — top-reviewed, high-likes, top channels only.
// topicCodePrefix matches the Phase/topic file naming convention.

export type Video = { id: string; title: string; channel: string; minutes: number; topicCodePrefix?: string; tag?: string };

const VIDEOS: Record<number, Video[]> = {
  1: [
    // Linear Algebra
    { id: "fNk_zzaMoSs", title: "Essence of Linear Algebra — Chapter 1", channel: "3Blue1Brown", minutes: 15, topicCodePrefix: "P1_1_1", tag: "math" },
    { id: "k7RM-ot2NWY", title: "Vectors — Essence of Linear Algebra Ch2", channel: "3Blue1Brown", minutes: 10, topicCodePrefix: "P1_1_1", tag: "math" },
    { id: "kYB8IZa5AuE", title: "Matrix Multiplication — 3Blue1Brown", channel: "3Blue1Brown", minutes: 10, topicCodePrefix: "P1_1_1", tag: "math" },
    { id: "PFDu9oVAE-g", title: "Eigenvectors and Eigenvalues", channel: "3Blue1Brown", minutes: 17, topicCodePrefix: "P1_1_1", tag: "math" },
    // Calculus
    { id: "WUvTyaaNkzM", title: "Essence of Calculus — Chapter 1", channel: "3Blue1Brown", minutes: 17, topicCodePrefix: "P1_1_2", tag: "math" },
    { id: "9vKqVkMQHKk", title: "Chain Rule — Essence of Calculus", channel: "3Blue1Brown", minutes: 14, topicCodePrefix: "P1_1_2", tag: "math" },
    // Probability & Stats
    { id: "HZGCoVF3YvM", title: "Bayes Theorem (3Blue1Brown)", channel: "3Blue1Brown", minutes: 15, topicCodePrefix: "P1_1_3", tag: "prob" },
    { id: "SzZ6GpcfoQY", title: "Probability — StatQuest Full Course", channel: "StatQuest", minutes: 40, topicCodePrefix: "P1_1_3", tag: "prob" },
    { id: "pTmLQvMM79M", title: "Normal Distribution — StatQuest", channel: "StatQuest", minutes: 19, topicCodePrefix: "P1_1_3", tag: "prob" },
    // Information Theory
    { id: "v68zYyaEmEA", title: "How Information Theory Broke Encryption", channel: "Veritasium", minutes: 35, topicCodePrefix: "P1_1_4", tag: "info" },
    // Optimization
    { id: "MD2fYip6QsQ", title: "Gradient Descent — How NNs Learn", channel: "3Blue1Brown", minutes: 21, topicCodePrefix: "P1_1_5", tag: "optim" },
    { id: "sDv4f4s2SB8", title: "Stochastic Gradient Descent Explained", channel: "StatQuest", minutes: 10, topicCodePrefix: "P1_1_5", tag: "optim" },
    // Python / NumPy / Pandas
    { id: "GB9ByFAIAH4", title: "Complete NumPy Tutorial", channel: "Keith Galli", minutes: 60, topicCodePrefix: "P1_2_1", tag: "numpy" },
    { id: "vmEHCJofslg", title: "Pandas Tutorial (Corey Schafer)", channel: "Corey Schafer", minutes: 30, topicCodePrefix: "P1_2_2", tag: "pandas" },
    { id: "e60ItwlZTKM", title: "Matplotlib Full Tutorial", channel: "Corey Schafer", minutes: 50, topicCodePrefix: "P1_2_3", tag: "viz" },
  ],
  2: [
    // Linear & Logistic Regression
    { id: "nk2CQITm_eo", title: "Linear Regression (StatQuest)", channel: "StatQuest", minutes: 28, topicCodePrefix: "P2_2_1" },
    { id: "yIYKR4sgzI8", title: "Logistic Regression (StatQuest)", channel: "StatQuest", minutes: 9, topicCodePrefix: "P2_3_1" },
    { id: "XXpU5t0cUkI", title: "Regularization Ridge & Lasso — StatQuest", channel: "StatQuest", minutes: 18, topicCodePrefix: "P2_2_2" },
    // Trees & Ensemble
    { id: "_L39rN6gz7Y", title: "Decision Trees (StatQuest)", channel: "StatQuest", minutes: 18, topicCodePrefix: "P2_3_4" },
    { id: "J4Wdy0Wc_xQ", title: "Random Forest (StatQuest)", channel: "StatQuest", minutes: 10, topicCodePrefix: "P2_4_1" },
    { id: "OtD8wVaFm6E", title: "XGBoost Part 1 (StatQuest)", channel: "StatQuest", minutes: 21, topicCodePrefix: "P2_4_5" },
    { id: "8b1JEDvenQU", title: "XGBoost Part 2 — Math Details", channel: "StatQuest", minutes: 25, topicCodePrefix: "P2_4_5" },
    { id: "StWY5QWMXCk", title: "Gradient Boosting (StatQuest)", channel: "StatQuest", minutes: 15, topicCodePrefix: "P2_4_4" },
    // SVMs
    { id: "efR1C6CvhmE", title: "Support Vector Machines (StatQuest)", channel: "StatQuest", minutes: 20, topicCodePrefix: "P2_3_3" },
    // Clustering & Unsupervised
    { id: "4b4MUYve_U8", title: "K-Means Clustering (StatQuest)", channel: "StatQuest", minutes: 9, topicCodePrefix: "P2_5_1" },
    { id: "FgakZw6K1QQ", title: "PCA Step-by-Step (StatQuest)", channel: "StatQuest", minutes: 22, topicCodePrefix: "P2_5_4" },
    { id: "eUHd0bPSzd8", title: "DBSCAN Clustering (StatQuest)", channel: "StatQuest", minutes: 15, topicCodePrefix: "P2_5_2" },
    // Model Evaluation
    { id: "Kdsp6soqA7o", title: "ROC and AUC (StatQuest)", channel: "StatQuest", minutes: 14, topicCodePrefix: "P2_6_1" },
    { id: "vP06aMoz4v8", title: "Cross Validation (StatQuest)", channel: "StatQuest", minutes: 7, topicCodePrefix: "P2_6_2" },
    { id: "1o5JgeqMRuQ", title: "Bias / Variance Tradeoff (StatQuest)", channel: "StatQuest", minutes: 6, topicCodePrefix: "P2_6_3" },
  ],
  3: [
    // Neural Networks Basics
    { id: "aircAruvnKk", title: "But what is a Neural Network? (3B1B)", channel: "3Blue1Brown", minutes: 19, topicCodePrefix: "P3_1_1" },
    { id: "Ilg3gGewQ5U", title: "What is Backpropagation Really Doing?", channel: "3Blue1Brown", minutes: 14, topicCodePrefix: "P3_1_3" },
    { id: "tIeHLnjs5U8", title: "Convolutional Neural Networks Explained", channel: "Brandon Rohrer", minutes: 13, topicCodePrefix: "P3_1_2" },
    { id: "jDe5BAsT2-Y", title: "Batch Normalization Explained", channel: "DeepBean", minutes: 12, topicCodePrefix: "P3_2_2" },
    { id: "OoUX-nOEjG0", title: "Dropout Regularization (StatQuest)", channel: "StatQuest", minutes: 7, topicCodePrefix: "P3_2_3" },
    // Optimizers
    { id: "NE88eqLngkg", title: "Adam Optimizer Explained", channel: "Weights & Biases", minutes: 15, topicCodePrefix: "P3_2_4" },
    // Karpathy hands-on
    { id: "VMj-3S1tku0", title: "makemore: Intro to Neural Networks (Karpathy)", channel: "Andrej Karpathy", minutes: 145, topicCodePrefix: "P3_1_3" },
    { id: "kCc8FmEb1nY", title: "Let's build GPT from scratch (Karpathy)", channel: "Andrej Karpathy", minutes: 117, topicCodePrefix: "P3_1_4" },
    // Transformers
    { id: "iDulhoQ2pro", title: "Attention is All You Need — Paper Walkthrough", channel: "Yannic Kilcher", minutes: 27, topicCodePrefix: "P3_1_4" },
    { id: "4Bdc55j80l8", title: "Illustrated Transformer Visual Walkthrough", channel: "AI Summer", minutes: 22, topicCodePrefix: "P3_1_4" },
  ],
  4: [
    // Object Detection
    { id: "TJlAxW-2nmI", title: "YOLO Algorithm Explained", channel: "Aladdin Persson", minutes: 22, topicCodePrefix: "P4_3_1" },
    { id: "ag3DLKsl2vk", title: "YOLOv8 — Train Custom Object Detector", channel: "Nicolai Nielsen", minutes: 30, topicCodePrefix: "P4_3_1" },
    { id: "9s_FpMpdYW8", title: "R-CNN, Fast RCNN, Faster RCNN Explained", channel: "Deeplizard", minutes: 20, topicCodePrefix: "P4_3_2" },
    // Segmentation
    { id: "6v3d-a4Z-wY", title: "Image Segmentation with U-Net", channel: "Aladdin Persson", minutes: 40, topicCodePrefix: "P4_4_1" },
    // Vision Transformers
    { id: "j3VNqtJUoz0", title: "Vision Transformers (ViT) Explained", channel: "AI Coffee Break", minutes: 16, topicCodePrefix: "P4_5_1" },
    { id: "TrdevFK_am4", title: "CLIP — Connecting Text and Images", channel: "Yannic Kilcher", minutes: 26, topicCodePrefix: "P4_5_4" },
    // Generative Models
    { id: "1CIpzeNxIhU", title: "Stable Diffusion Explained", channel: "Computerphile", minutes: 26, topicCodePrefix: "P4_6_1" },
    { id: "H45lF4sUgiE", title: "GANs from Scratch — PyTorch", channel: "Aladdin Persson", minutes: 35, topicCodePrefix: "P4_6_2" },
    { id: "fbLgFrlTnGU", title: "Diffusion Models Explained Simply", channel: "Outlier", minutes: 20, topicCodePrefix: "P4_6_1" },
    // Transfer Learning
    { id: "yofjFQddwHE", title: "Transfer Learning with PyTorch", channel: "Patrick Loeber", minutes: 28, topicCodePrefix: "P4_2_1" },
  ],
  5: [
    // Embeddings
    { id: "viZrOnJclY0", title: "Word Embeddings (StatQuest)", channel: "StatQuest", minutes: 16, topicCodePrefix: "P5_2_1" },
    { id: "LSS_bos_mqM", title: "Word2Vec Explained (StatQuest)", channel: "StatQuest", minutes: 17, topicCodePrefix: "P5_2_2" },
    // RNNs & LSTMs
    { id: "WCUNPb-5EYI", title: "RNNs Clearly Explained (StatQuest)", channel: "StatQuest", minutes: 13, topicCodePrefix: "P5_3_1" },
    { id: "YCzL96nL7j0", title: "LSTM Networks (StatQuest)", channel: "StatQuest", minutes: 20, topicCodePrefix: "P5_3_2" },
    { id: "8HyCNIVRbSU", title: "GRU — Gated Recurrent Units (StatQuest)", channel: "StatQuest", minutes: 14, topicCodePrefix: "P5_3_3" },
    // Transformers for NLP
    { id: "zxQyTK8quyY", title: "Transformers Explained Visually", channel: "Hedu AI", minutes: 27, topicCodePrefix: "P5_4_1" },
    { id: "xI0HHN5XKDo", title: "BERT NLP Explained", channel: "AI Coffee Break", minutes: 8, topicCodePrefix: "P5_4_2" },
    { id: "SZorAJ4I-sA", title: "BERT Paper Explained — Yannic Kilcher", channel: "Yannic Kilcher", minutes: 36, topicCodePrefix: "P5_4_2" },
    // Attention
    { id: "PSs6nxngL6k", title: "Attention Mechanism — Seq2Seq", channel: "StatQuest", minutes: 16, topicCodePrefix: "P5_4_1" },
    // Text Generation
    { id: "kCc8FmEb1nY", title: "Build GPT from Scratch — Karpathy", channel: "Andrej Karpathy", minutes: 117, topicCodePrefix: "P5_5_1" },
    // Sentence Transformers
    { id: "OATCgQtNX2o", title: "Sentence Transformers & Semantic Search", channel: "James Briggs", minutes: 30, topicCodePrefix: "P5_4_3" },
  ],
  6: [
    // LLM Fundamentals
    { id: "ISNdQcPhsts", title: "What are Large Language Models?", channel: "Google Cloud Tech", minutes: 14, topicCodePrefix: "P6_1_1" },
    { id: "zjkBMFhNj_g", title: "GPT-4 Technical Report Explained", channel: "Yannic Kilcher", minutes: 38, topicCodePrefix: "P6_1_1" },
    // Prompt Engineering
    { id: "5pIUulvIeCA", title: "Prompt Engineering Full Course", channel: "freeCodeCamp", minutes: 41, topicCodePrefix: "P6_1_2" },
    { id: "jC4v5AS4RIM", title: "Chain of Thought Prompting Explained", channel: "AI Explained", minutes: 14, topicCodePrefix: "P6_1_3" },
    // Fine-tuning
    { id: "Us5ZFp16PaU", title: "LoRA & QLoRA Explained", channel: "Sebastian Raschka", minutes: 26, topicCodePrefix: "P6_2_2" },
    { id: "dA-NhCtF4eo", title: "Fine-Tune LLM with QLoRA — Practical", channel: "Trelis Research", minutes: 45, topicCodePrefix: "P6_2_1" },
    { id: "iHrIoHPOHj0", title: "Full Fine-Tuning vs LoRA vs QLoRA", channel: "Weights & Biases", minutes: 30, topicCodePrefix: "P6_2_2" },
    // RLHF & Alignment
    { id: "qPN_XZcJf_s", title: "RLHF Explained", channel: "Edan Meyer", minutes: 33, topicCodePrefix: "P6_3_1" },
    { id: "2gn1FpmuFoI", title: "DPO — Direct Preference Optimization", channel: "Yannic Kilcher", minutes: 22, topicCodePrefix: "P6_3_2" },
    // Quantization
    { id: "C6ZszXYPDDw", title: "Quantization — GGUF, GPTQ, AWQ Explained", channel: "Maarten Grootendorst", minutes: 22, topicCodePrefix: "P6_6_1" },
    // Tokenization
    { id: "zduSFxRajkE", title: "Let's Build the GPT Tokenizer — Karpathy", channel: "Andrej Karpathy", minutes: 134, topicCodePrefix: "P6_5_1" },
  ],
  7: [
    // RAG Core
    { id: "T-D1OfcDW1M", title: "RAG from Scratch — LangChain", channel: "LangChain", minutes: 18, topicCodePrefix: "P7_1_1" },
    { id: "JEBDfGqrAUA", title: "Vector Databases Explained", channel: "Fireship", minutes: 9, topicCodePrefix: "P7_1_2" },
    { id: "wd7TZ4w1mSw", title: "Advanced RAG Techniques", channel: "AI Engineer", minutes: 24, topicCodePrefix: "P7_3_1" },
    { id: "qN_2fnOPY-M", title: "RAG vs Fine-Tuning — When to use which", channel: "Weights & Biases", minutes: 22, topicCodePrefix: "P7_1_1" },
    // Vector Stores
    { id: "klTvEwg29d0", title: "Pinecone Vector Database Tutorial", channel: "James Briggs", minutes: 28, topicCodePrefix: "P7_1_2" },
    { id: "e_k9jnOA6qo", title: "FAISS — Facebook AI Similarity Search", channel: "James Briggs", minutes: 20, topicCodePrefix: "P7_1_2" },
    // Chunking & Embeddings
    { id: "8OJC21T2SL4", title: "RAG Chunking Strategies Explained", channel: "Sam Witteveen", minutes: 20, topicCodePrefix: "P7_2_1" },
    { id: "OATCgQtNX2o", title: "Sentence Transformers for RAG", channel: "James Briggs", minutes: 30, topicCodePrefix: "P7_2_2" },
    // Advanced RAG
    { id: "knDDGYHnnSI", title: "GraphRAG — Microsoft", channel: "Trelis Research", minutes: 30, topicCodePrefix: "P7_4_1" },
    { id: "sVcwVQRHIc8", title: "Hybrid Search — BM25 + Vector", channel: "James Briggs", minutes: 22, topicCodePrefix: "P7_3_2" },
    { id: "rqtXRsKEBpE", title: "Reranking in RAG Pipelines", channel: "Sam Witteveen", minutes: 18, topicCodePrefix: "P7_3_3" },
  ],
  8: [
    // Agents Core
    { id: "F8NKVhkZZWI", title: "AI Agents — ReAct Framework Explained", channel: "Sam Witteveen", minutes: 18, topicCodePrefix: "P8_1_1" },
    { id: "5LiMrEXgsbY", title: "Building Effective Agents — Anthropic", channel: "Anthropic", minutes: 28, topicCodePrefix: "P8_1_1" },
    { id: "ZXiruGOCn9s", title: "AI Agents Full Course — LangChain", channel: "freeCodeCamp", minutes: 120, topicCodePrefix: "P8_1_1" },
    // Tool Use / Function Calling
    { id: "p0I-hwZSWMs", title: "OpenAI Function Calling — Full Tutorial", channel: "AI Jason", minutes: 22, topicCodePrefix: "P8_2_1" },
    { id: "j4b_TEiGlHI", title: "Tool Use with Claude — Anthropic", channel: "Anthropic", minutes: 25, topicCodePrefix: "P8_2_1" },
    // LangChain / LangGraph
    { id: "PqS1TIzcQQg", title: "LangGraph Full Tutorial", channel: "LangChain", minutes: 35, topicCodePrefix: "P8_5_2" },
    { id: "aywZrzNaKjs", title: "LangChain Agents Crash Course", channel: "Sam Witteveen", minutes: 30, topicCodePrefix: "P8_5_1" },
    // Multi-Agent
    { id: "pBBe1pk8hf4", title: "Multi-Agent Systems with CrewAI", channel: "AI Jason", minutes: 30, topicCodePrefix: "P8_4_1" },
    { id: "tFuZzlhM3_c", title: "AutoGen — Multi-Agent Conversation", channel: "Microsoft Research", minutes: 20, topicCodePrefix: "P8_4_2" },
    // MCP
    { id: "vQYWhEEHC8c", title: "MCP — Model Context Protocol Explained", channel: "AI Jason", minutes: 17, topicCodePrefix: "P8_5_6" },
    // Memory
    { id: "tcuBqOsRNuU", title: "Agent Memory — Short-term and Long-term", channel: "LangChain", minutes: 22, topicCodePrefix: "P8_3_1" },
  ],
  9: [
    // Multimodal
    { id: "AKMua_TVz3A", title: "Multimodal LLMs Explained", channel: "AI Explained", minutes: 12, topicCodePrefix: "P9_2_1" },
    { id: "TrdevFK_am4", title: "CLIP — Connecting Text and Images", channel: "Yannic Kilcher", minutes: 26, topicCodePrefix: "P9_2_2" },
    { id: "j3VNqtJUoz0", title: "Vision Transformers (ViT)", channel: "AI Coffee Break", minutes: 16, topicCodePrefix: "P9_2_3" },
    // Audio / Speech
    { id: "I7iOOk1g9CM", title: "Whisper by OpenAI Explained", channel: "AI Explained", minutes: 14, topicCodePrefix: "P9_3_1" },
    { id: "g6tIUrMQOzg", title: "Whisper — Build a Transcription App", channel: "AssemblyAI", minutes: 25, topicCodePrefix: "P9_3_1" },
    // Image Generation
    { id: "1CIpzeNxIhU", title: "How Stable Diffusion Works", channel: "Computerphile", minutes: 26, topicCodePrefix: "P9_1_2" },
    { id: "fbLgFrlTnGU", title: "Diffusion Models Explained Simply", channel: "Outlier", minutes: 20, topicCodePrefix: "P9_1_2" },
    // GPT-4V
    { id: "dMRX76k14LM", title: "GPT-4V Vision — What it Can Do", channel: "AI Explained", minutes: 16, topicCodePrefix: "P9_2_1" },
  ],
  10: [
    // MLOps
    { id: "9BgIDqAzfuA", title: "MLOps Crash Course", channel: "freeCodeCamp", minutes: 96, topicCodePrefix: "P10_1_1" },
    { id: "oNM2Tu6QUsk", title: "MLflow Tutorial — Full Course", channel: "Bex T", minutes: 60, topicCodePrefix: "P10_2_1" },
    { id: "4uyNsDFGbPo", title: "Weights & Biases — Experiment Tracking", channel: "Weights & Biases", minutes: 30, topicCodePrefix: "P10_2_2" },
    // Deployment
    { id: "WgIgPdqQpaM", title: "FastAPI for ML Deployment", channel: "ArjanCodes", minutes: 28, topicCodePrefix: "P10_3_3" },
    { id: "x4k1XEjNzeQ", title: "Docker for ML Engineers", channel: "Patrick Loeber", minutes: 22, topicCodePrefix: "P10_3_1" },
    { id: "FHf_7ryjJLU", title: "Kubernetes for ML — Crash Course", channel: "TechWorld with Nana", minutes: 60, topicCodePrefix: "P10_3_2" },
    { id: "wMD5yvlmMnM", title: "Deploy ML Model on AWS SageMaker", channel: "Krish Naik", minutes: 45, topicCodePrefix: "P10_3_4" },
    // Data Pipelines
    { id: "m6KgiGzSDC0", title: "Apache Airflow for ML Workflows", channel: "Astronomer", minutes: 40, topicCodePrefix: "P10_4_2" },
    // Monitoring
    { id: "MoD7h4HvmJg", title: "Data Drift Monitoring in ML", channel: "Made With ML", minutes: 18, topicCodePrefix: "P10_5_1" },
    { id: "yAJDqSAO-JI", title: "Model Monitoring — Evidently AI", channel: "Evidently AI", minutes: 25, topicCodePrefix: "P10_5_2" },
  ],
  11: [
    // Reasoning Models
    { id: "_3iL_dUjAoo", title: "OpenAI o1 — Chain of Thought Reasoning", channel: "AI Explained", minutes: 14, topicCodePrefix: "P11_1_1" },
    { id: "bAWV_yrqx4w", title: "DeepSeek R1 Walkthrough", channel: "Yannic Kilcher", minutes: 32, topicCodePrefix: "P11_1_2" },
    { id: "5vfIT5LOkR0", title: "Gemini 2.0 Deep Dive", channel: "Google DeepMind", minutes: 20, topicCodePrefix: "P11_1_3" },
    { id: "GFiFgKS7GmM", title: "Claude 3 — Anthropic Model Explained", channel: "AI Explained", minutes: 18, topicCodePrefix: "P11_1_4" },
    // Long Context / KV Cache
    { id: "mWGpALZmVJo", title: "KV Cache Explained", channel: "Efficient ML", minutes: 15, topicCodePrefix: "P11_2_2" },
    { id: "UhDtH7Ln_hc", title: "RAG vs Long Context LLMs", channel: "AI Jason", minutes: 18, topicCodePrefix: "P11_2_3" },
    // Flash Attention
    { id: "P5JS-RD32cE", title: "Flash Attention Explained", channel: "Aleksa Gordić", minutes: 20, topicCodePrefix: "P11_5_3" },
    // AI Coding Agents
    { id: "mml9YkwmGAQ", title: "GitHub Copilot — Full Tutorial", channel: "Fireship", minutes: 10, topicCodePrefix: "P11_3_1" },
    { id: "gqUQbjsYZLQ", title: "Cursor AI — Full Course", channel: "Tech With Tim", minutes: 30, topicCodePrefix: "P11_3_2" },
    { id: "N7aul-2GW6c", title: "Claude Code — Agentic Coding", channel: "Anthropic", minutes: 20, topicCodePrefix: "P11_3_4" },
    // Computer Use
    { id: "ODaHJzOADi8", title: "Claude Computer Use Demo", channel: "Anthropic", minutes: 12, topicCodePrefix: "P11_4_1" },
    { id: "ZID220t_MpI", title: "Browser Use — AI Browser Automation", channel: "AI Jason", minutes: 18, topicCodePrefix: "P11_4_3" },
    // Security
    { id: "x8pW19wKfXQ", title: "Prompt Injection Attacks", channel: "Computerphile", minutes: 11, topicCodePrefix: "P11_7_3" },
  ],
  12: [
    // RL
    { id: "Mut_u40Sqz4", title: "Deep RL Bootcamp — Hugging Face", channel: "Hugging Face", minutes: 42, topicCodePrefix: "P12_1" },
    { id: "nyjbcRQ-uQ8", title: "Deep Q-Network (DQN) Explained", channel: "Machine Learning with Phil", minutes: 25, topicCodePrefix: "P12_1_1" },
    { id: "5P7I-xPq8u8", title: "PPO — Proximal Policy Optimization", channel: "Machine Learning with Phil", minutes: 30, topicCodePrefix: "P12_1_2" },
    { id: "9BWXGckRUGs", title: "AlphaGo — How it Works", channel: "Two Minute Papers", minutes: 5, topicCodePrefix: "P12_1_3" },
    // GNNs
    { id: "8owQBFAHC8E", title: "Graph Neural Networks Intro", channel: "Aleksa Gordić", minutes: 28, topicCodePrefix: "P12_4" },
    { id: "JtDgmmQ60x8", title: "Graph Attention Networks", channel: "Aleksa Gordić", minutes: 22, topicCodePrefix: "P12_4_1" },
    // Federated Learning
    { id: "vrW3xUMv09I", title: "Federated Learning Explained", channel: "Yann Dubois", minutes: 18, topicCodePrefix: "P12_3" },
    // Future AI
    { id: "KV5gb1KPUVA", title: "Mixture of Experts (MoE) Explained", channel: "Yannic Kilcher", minutes: 22, topicCodePrefix: "P12_5_1" },
    { id: "AixkqzbZDH8", title: "State Space Models — Mamba Explained", channel: "Aleksa Gordić", minutes: 30, topicCodePrefix: "P12_5_2" },
    { id: "UiX8K-xBUpE", title: "AI Safety — Current Research Overview", channel: "Anthropic", minutes: 25, topicCodePrefix: "P12_6_1" },
  ],
};

export function videosForPhase(phase: number): Video[] {
  return VIDEOS[phase] || [];
}
export function videosForTopic(code: string, phase: number): Video[] {
  return videosForPhase(phase).filter((v) => !v.topicCodePrefix || code.startsWith(v.topicCodePrefix));
}
export function allVideos(): { phase: number; videos: Video[] }[] {
  return Object.entries(VIDEOS).map(([phase, videos]) => ({ phase: Number(phase), videos })).sort((a, b) => a.phase - b.phase);
}

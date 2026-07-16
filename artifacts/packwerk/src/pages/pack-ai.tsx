import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

type ChatMessage = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "I need packaging for a skincare serum",
  "Help me reduce the cost of my current pouches",
  "Plan packaging for an e-commerce launch",
  "I need a sustainable option for food",
];

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Tell me what you are packaging, your expected quantity, and what matters most: cost, shelf life, sustainability, or a premium finish. I will turn that into a practical packaging plan.",
};

function MessageContent({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, lineIndex) => (
        <span key={`${line}-${lineIndex}`} className={`packai-line${line.trim().startsWith("-") ? " bullet" : ""}`}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={index}>{part.slice(2, -2)}</strong>
              : <span key={index}>{part}</span>
          )}
        </span>
      ))}
    </>
  );
}

export default function PackAIPlanner() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Packworkz AI Packaging Planner";
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [loading, messages]);

  const sendMessage = async (preset?: string) => {
    const content = (preset ?? input).trim();
    if (!content || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/pack-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json() as { reply?: string; error?: string };
      setMessages((current) => [...current, {
        role: "assistant",
        content: data.reply || data.error || "I could not complete that plan. Please try again.",
      }]);
    } catch {
      setMessages((current) => [...current, {
        role: "assistant",
        content: "I cannot reach the planning service right now. Please try again in a moment.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
  };

  return (
    <main className="packai-page">
      <aside className="packai-sidebar">
        <Link href="/" className="packai-brand">Packworkz</Link>
        <button type="button" className="packai-new" onClick={resetChat}>
          <span className="material-symbols-outlined">edit_square</span>
          New packaging plan
        </button>
        <div className="packai-sidebar-copy">
          <span>PACKAGING PLANNER</span>
          <strong>A buying decision, not a generic answer.</strong>
          <p>Built around Packworkz formats, materials, MOQs, price bands, and production paths.</p>
        </div>
        <div className="packai-sidebar-steps">
          {[
            ["01", "Describe the product"],
            ["02", "Compare viable formats"],
            ["03", "Choose sample or pricing path"],
          ].map(([number, label]) => (
            <div key={number}><span>{number}</span>{label}</div>
          ))}
        </div>
        <Link href="/products" className="packai-sidebar-link">Browse catalog <span className="material-symbols-outlined">arrow_forward</span></Link>
      </aside>

      <section className="packai-workspace">
        <header className="packai-header">
          <div>
            <span className="packai-status-dot" />
            <strong>Packworkz AI Planner</strong>
            <small>Live catalog reasoning</small>
          </div>
          <Link href="/" className="packai-close" aria-label="Exit planner"><span className="material-symbols-outlined">close</span></Link>
        </header>

        <div className="packai-thread">
          <div className="packai-thread-inner">
            <div className="packai-intro">
              <div className="packai-mark"><span className="material-symbols-outlined">auto_awesome</span></div>
              <p className="packai-intro-kicker">PACKWORKZ AI</p>
              <h1>Plan your packaging.</h1>
              <p>Describe the product and quantity in plain language. Get a focused format shortlist, MOQ fit, indicative cost, and the right next step.</p>
              <div className="packai-output-row" aria-label="Planner output">
                <span><b>01</b> Format</span><span><b>02</b> Material</span><span><b>03</b> MOQ & cost</span><span><b>04</b> Buying path</span>
              </div>
            </div>

            {messages.length === 1 && (
              <div className="packai-starters">
                {STARTERS.map((starter) => (
                  <button key={starter} type="button" onClick={() => sendMessage(starter)}>
                    <span>{starter}</span><span className="material-symbols-outlined">north_east</span>
                  </button>
                ))}
              </div>
            )}

            <div className="packai-messages" aria-live="polite">
              {messages.map((message, index) => (
                <article key={`${message.role}-${index}`} className={`packai-message ${message.role}`}>
                  <div className="packai-avatar">
                    <span className="material-symbols-outlined">{message.role === "assistant" ? "auto_awesome" : "person"}</span>
                  </div>
                  <div>
                    <strong>{message.role === "assistant" ? "Packworkz AI" : "You"}</strong>
                    <div className="packai-message-copy"><MessageContent text={message.content} /></div>
                  </div>
                </article>
              ))}
              {loading && (
                <article className="packai-message assistant">
                  <div className="packai-avatar"><span className="material-symbols-outlined">auto_awesome</span></div>
                  <div><strong>Packworkz AI</strong><div className="packai-thinking"><span /><span /><span /></div></div>
                </article>
              )}
              <div ref={endRef} />
            </div>
          </div>
        </div>

        <div className="packai-composer-wrap">
          <div className="packai-composer">
            <span className="material-symbols-outlined packai-composer-spark">auto_awesome</span>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Describe your product, quantity, current pack, or problem..."
              rows={1}
              disabled={loading}
            />
            <button type="button" onClick={() => sendMessage()} disabled={!input.trim() || loading} aria-label="Send message">
              <span className="material-symbols-outlined">arrow_upward</span>
            </button>
          </div>
          <p>Indicative planning guidance. Final compatibility and production pricing follow specification review.</p>
        </div>
      </section>
    </main>
  );
}

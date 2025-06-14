import { useState } from "react";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
});

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      {
        role: "user",
        content: [{ type: "text", text: input }],
      },
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const command = new InvokeModelCommand({
        modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0", 
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          messages: newMessages,
          max_tokens: 1000,
        }),
      });

      const response = await client.send(command);
      console.log(response);
      const decoded = new TextDecoder().decode(response.body);
      const parsed = JSON.parse(decoded);
      console.log(parsed);

      const assistantContent =
        parsed?.content?.map((part) => part.text).join("") ||
        "No response.";

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: [{ type: "text", text: assistantContent }],
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: [{ type: "text", text: `Error: ${err.message}` }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>🤖 Chatbot</h1>
      <div style={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div key={idx} style={msg.role === "user" ? styles.user : styles.bot}>
            <strong>{msg.role === "user" ? "You" : "Bot"}:</strong>{" "}
            {msg.content.map((c, i) => (
              <span key={i}>{c.text}</span>
            ))}
          </div>
        ))}
        {loading && (
          <div style={styles.bot}>
            <strong>Bot:</strong> typing...
          </div>
        )}
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Say something..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "sans-serif",
    padding: 20,
    maxWidth: 800,
    margin: "0 auto",
  },
  chatBox: {
    border: "1px solid #ccc",
    borderRadius: 8,
    padding: 10,
    height: 400,
    overflowY: "auto",
    marginBottom: 10,
    background: "#f9f9f9",
    color: "black"
  },
  user: {
    backgroundColor: "#e6f7ff",
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  bot: {
    backgroundColor: "#fffbe6",
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  inputContainer: {
    display: "flex",
    gap: 8,
  },
  input: {
    flexGrow: 1,
    padding: 10,
    borderRadius: 4,
    border: "1px solid #ccc",
    fontSize: 16,
  },
  button: {
    padding: "10px 20px",
    fontSize: 16,
    borderRadius: 4,
    backgroundColor: "#1890ff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default App;

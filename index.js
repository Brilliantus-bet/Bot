require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// LiveChat API
const API_BASE = "https://api.livechatinc.com/v3.5";
const TOKEN = process.env.LIVECHAT_API_TOKEN;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json"
};

// Para testes simples
app.get("/responder", (req, res) => {
  res.send("Responder online");
});

// Webhook principal + validação do ChatBot.com
app.post("/responder", async (req, res) => {
  // ✅ Validação de Webhook (Challenge)
  if (req.body.challenge) {
    return res
      .status(200)
      .set("Content-Type", "text/plain") // resposta deve ser texto puro!
      .send(req.body.challenge);
  }

  const { chat_id, hashtag } = req.body;

  if (!chat_id || !hashtag) {
    return res.status(400).json({ error: "Parâmetros obrigatórios: chat_id e hashtag." });
  }

  try {
    // Buscar todas as respostas prontas (canned responses)
    const cannedRes = await axios.get(`${API_BASE}/configuration/action/list_canned_responses`, {
      headers
    });

    const lista = cannedRes.data.responses;

    // Encontrar a resposta pela hashtag (sem o #)
    const resposta = lista.find(r => r.tags.includes(hashtag.replace("#", "")));

    if (!resposta) {
      return res.status(404).json({ error: `Resposta com a hashtag ${hashtag} não encontrada.` });
    }

    // Enviar a resposta no chat
    await axios.post(
      `${API_BASE}/agent/action/send_event`,
      {
        chat_id,
        event: {
          type: "message",
          text: resposta.text
        }
      },
      { headers }
    );

    return res.json({ status: "Resposta enviada com sucesso!" });

  } catch (err) {
    console.error("Erro:", err.message);
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
});

// Start
app.listen(3000, () => {
  console.log("🚀 Servidor rodando na porta 3000");
});

require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const API_BASE = "https://api.livechatinc.com/v3.5";
const TOKEN = process.env.LIVECHAT_API_TOKEN;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json"
};

// ✅ Adicionado para validação do webhook
app.get("/responder", (req, res) => {
  res.status(200).send("Responder online");
});

app.post("/responder", async (req, res) => {
  const { chat_id, hashtag } = req.body;

  if (!chat_id || !hashtag) {
    return res.status(400).json({ error: "Parâmetros obrigatórios: chat_id e hashtag." });
  }

  try {
    const cannedRes = await axios.get(`${API_BASE}/configuration/action/list_canned_responses`, {
      headers
    });

    const lista = cannedRes.data.responses;

    const resposta = lista.find(r => r.tags.includes(hashtag.replace("#", "")));

    if (!resposta) {
      return res.status(404).json({ error: `Resposta com a hashtag ${hashtag} não encontrada.` });
    }

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

app.listen(3000, () => {
  console.log("🚀 Servidor rodando na porta 3000");
});

const express = require("express");
const app = express();

app.use(express.json());

app.post("/responder", (req, res) => {
  console.log("Recebido:", req.body);
  if (req.body.challenge) {
    return res.send(req.body.challenge);
  }

  return res.status(400).send("Sem challenge");
});

app.listen(3000, () => {
  console.log("Servidor simples rodando na porta 3000");
});

const express = require("express");
const router = express.Router();
// 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
const fetch = require("node-fetch");

router.post("/", async (req, res) => {
  const {prompt} = req.body;
  console.log("OPENROUTER_API_KEY:", "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");
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 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`,
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3-0324:free",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const data = await response.json();
    console.log("Full API response:", data);

    if (
      data &&
      Array.isArray(data.choices) &&
      data.choices.length > 0 &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      const aiResponse = data.choices[0].message.content;
      res.status(200).json({ answer: aiResponse });
    } else {
      console.error(
        "Unexpected DeepSeek response:",
        JSON.stringify(data, null, 2)
      );
      res
        .status(500)
        .json({ error: "AI response not found. Try again later." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;

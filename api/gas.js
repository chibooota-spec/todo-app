export default async function handler(req, res) {
  const GAS_URL = "https://script.google.com/macros/s/AKfycbzhULQPrWnp1VS-Wv4HabZ-z6qIbDMl7XV2Ynzt1zPG5cfWG_lH5WKNhfMd4j1aKWinJA/exec";
  const response = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });
  const data = await response.json();
  res.status(200).json(data);
}
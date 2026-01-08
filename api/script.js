function sendToAI() {
  const prompt = document.getElementById("prompt").value;

  fetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("output").innerText =
      data.candidates[0].content.parts[0].text;
  })
  .catch(err => {
    document.getElementById("output").innerText = "Error contacting AI";
  });
}

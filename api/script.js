fetch("/api/gemini", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "What is Panadol used for?"
  })
})
.then(res => res.json())
.then(data => {
  document.getElementById("result").innerText =
    data.candidates[0].content.parts[0].text;
});

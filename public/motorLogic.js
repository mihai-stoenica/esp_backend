function activateMotor() {
  const seconds = parseInt(document.getElementById('motorDuration').value);
  if (!isNaN(seconds)) {
    ws.send(JSON.stringify({ event: 'motor', seconds }));
    logMessage(`Motor activation sent for ${seconds} seconds`);
  }
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.event === 'humidity') {
    document.getElementById('humidityDisplay').textContent = `${data.value}`;
  }
};

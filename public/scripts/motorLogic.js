function activateMotor() {
  const seconds = parseInt(document.getElementById('motorDuration').value);
  if (!isNaN(seconds)) {
    const query = JSON.stringify({ event: 'motor', seconds });
    ws.send(query);
    console.log(`Motor activated for ${seconds} seconds`);
  }
}



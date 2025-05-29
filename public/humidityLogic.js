export function updateHumidity(instantHumidity) {
    const humidityElement = document.getElementById("humidityDisplay");
    if (humidityElement) {
        const humidity = instantHumidity; 
        humidityElement.textContent = `${humidity}%`;
    }
}
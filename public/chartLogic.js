const itemsPerPage = 10;
let currentPage = 0;
let processedData = [];
let chart;

async function fetchHumidityData() {
    try {
        const response = await fetch('https://espbackend-production.up.railway.app/api/log');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log('Raw API data:', data);
        currentPage = Math.floor(data.length / itemsPerPage);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('errorMessage').textContent = 'Failed to fetch data: ' + error.message;
        return [];
    }
}

function displayDataPreview(data) {
    const previewDiv = document.getElementById('dataPreview');
    previewDiv.innerHTML = ''; 
    if (data.length === 0) {
        previewDiv.textContent = 'No data to display.';
        return;
    }
    const ul = document.createElement('ol');
    data.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `Timestamp: ${entry.timestamp}, Humidity: ${entry.humidity}%`;
        ul.appendChild(li);
    });
    previewDiv.appendChild(ul);
}

function createChart() {
    const ctx = document.getElementById('humidityChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Soil Humidity (%)',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: [],
                pointBorderColor: '#fff',
                pointHoverRadius: 8,
                borderWidth: 2,
                showLine: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Humidity (%)'
                    },
                    ticks: {
                        stepSize: 10,
                    }
                },
                x: {
                    display: false,
                }
            },
            plugins: {
                legend: {
                    display: true,
                }
            }
        }
    });
}

function updateChart() {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = processedData.slice(start, end);

    chart.data.labels = pageData.map(entry => entry.timestamp.toLocaleString());
    chart.data.datasets[0].data = pageData.map(entry => entry.humidity);
    chart.data.datasets[0].pointBackgroundColor = pageData.map(entry =>
        entry.humidity > 20 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
    );
    chart.update();

    document.getElementById('pageIndicator').textContent = `Page ${currentPage + 1} of ${Math.ceil(processedData.length / itemsPerPage)}`;
    document.getElementById('prevBtn').disabled = currentPage === 0;
    document.getElementById('nextBtn').disabled = (currentPage + 1) * itemsPerPage >= processedData.length;
}

async function init() {
    const humidityData = await fetchHumidityData();
    displayDataPreview(humidityData);
    if (humidityData.length > 0) {
        processedData = humidityData.map(entry => ({
            timestamp: new Date(entry.timestamp),
            humidity: parseFloat(entry.humidity)
        })).filter(entry => !isNaN(entry.humidity) && entry.timestamp instanceof Date && !isNaN(entry.timestamp.getTime()));

        console.log('Processed chart data:', processedData);
        createChart();
        updateChart();

        const avg = processedData.reduce((sum, entry) => sum + entry.humidity, 0) / processedData.length;
        document.getElementById('averageHumidity').textContent = `${avg.toFixed(2)}%`;
    } else {
        document.getElementById('humidityChart').replaceWith(
            document.createTextNode('No data available to display.')
        );
        document.getElementById('errorMessage').textContent = 'No data available.';
    }
}

document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        updateChart();
    }
});

document.getElementById('nextBtn').addEventListener('click', () => {
    if ((currentPage + 1) * itemsPerPage < processedData.length) {
        currentPage++;
        updateChart();
    }
});

window.onload = init;

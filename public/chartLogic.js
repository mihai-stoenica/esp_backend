    async function fetchHumidityData() { 
        try {
            const response = await fetch('https://espbackend-production.up.railway.app/api/log');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            console.log('Raw API data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            document.getElementById('errorMessage').textContent = 'Failed to fetch data: ' + error.message;
            return [];
        }
    }

    function displayDataPreview(data) {
        const previewDiv = document.getElementById('dataPreview');
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

    function createChart(data) {
        const processedData = data.map(entry => ({
            timestamp: new Date(entry.timestamp),
            humidity: parseFloat(entry.humidity)
        })).filter(entry => !isNaN(entry.humidity) && entry.timestamp instanceof Date && !isNaN(entry.timestamp.getTime()));

        console.log('Processed chart data:', processedData);

        if (processedData.length === 0) {
            document.getElementById('errorMessage').textContent = 'No valid data to display in chart.';
            return;
        }
        const pointColors = processedData.map(entry => entry.humidity > 20 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)');

        const ctx = document.getElementById('humidityChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: processedData.map(entry => entry.timestamp.toLocaleString()),
                datasets: [{
                    label: 'Soil Humidity (%)',
                    data: processedData.map(entry => entry.humidity),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    
                    pointBackgroundColor: pointColors,
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

    async function init() {
        const humidityData = await fetchHumidityData();
        displayDataPreview(humidityData);
        if (humidityData.length > 0) {
            createChart(humidityData);
            document.getElementById('averageHumidity').textContent = `${(humidityData.reduce((sum, entry) => sum + parseFloat(entry.humidity), 0) / humidityData.length).toFixed(2)}%`;
        } else {
            document.getElementById('humidityChart').replaceWith(
                document.createTextNode('No data available to display.')
            );
            document.getElementById('errorMessage').textContent = 'No data available.';
        }
    }

    window.onload = init;
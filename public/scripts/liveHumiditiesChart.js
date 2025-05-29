    const ctx1 = document.getElementById('liveHumidityChart').getContext('2d');

    let humidity = 0; 

    const centerTextPlugin = {
            id: 'centerText',
            afterDraw(chart) {
                if (chart.canvas.id === 'liveHumidityChart' && chart.config.type === 'doughnut') {
                    const { ctx, chartArea: { width, height } } = chart;
                ctx.save();
                ctx.font = 'bold 30px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(75, 192, 192, 1)'; 
                const centerX = width / 2;
                const centerY = height / 2;
                ctx.fillText(`${humidity}%`, centerX, centerY);
                ctx.restore();
                }
                
            }
    };

    Chart.register(centerTextPlugin);

    const liveChart = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: ['Humidity', 'Remaining'],
                datasets: [{
                    data: [humidity, 100 - humidity],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)', 
                        'rgba(200, 200, 200, 0.3)' 
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(200, 200, 200, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                circumference: 180, 
                rotation: -90, 
                plugins: {
                    legend: {
                        display: false 
                    },
                    title: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw}%`;
                            }
                        }
                    }
                },
                cutout: '70%' 
            }
        });

    function updateHumidity(value) {
      humidity = value;
      liveChart.data.datasets[0].data = [value, 100 - value];
      liveChart.update();
    
    }

    // WebSocket code
    
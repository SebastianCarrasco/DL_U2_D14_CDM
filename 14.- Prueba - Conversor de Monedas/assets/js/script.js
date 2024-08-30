let chart; // Variable global para almacenar la instancia del gráfico

document.getElementById('convert-btn').addEventListener('click', async function () {
    const amount = document.getElementById('amount').value;
    const currency = document.getElementById('currency').value;
    const resultElement = document.getElementById('result');

    if (amount === '') {
        resultElement.textContent = 'Por favor, ingrese una cantidad.';
        return;
    }

    try {
        const response = await fetch('https://mindicador.cl/api');
        if (!response.ok) throw new Error('Error al obtener los datos de la API');
        const data = await response.json();

        if (!data[currency]) {
            throw new Error(`No se encontró información para la moneda: ${currency}`);
        }

        const conversionRate = data[currency].valor;
        const convertedAmount = (amount / conversionRate).toFixed(2);

        resultElement.textContent = `${amount} CLP = ${convertedAmount} ${currency.toUpperCase()}`;

        // Obtener historial de los últimos 10 días
        const historicalResponse = await fetch(`https://mindicador.cl/api/${currency}`);
        if (!historicalResponse.ok) throw new Error('Error al obtener los datos históricos de la API');
        const historicalData = await historicalResponse.json();
        const last10Days = historicalData.serie.slice(0, 10).reverse();

        const dates = last10Days.map(entry => entry.fecha.split('T')[0]);
        const values = last10Days.map(entry => entry.valor);

        // Destruir el gráfico anterior si existe
        if (chart) {
            chart.destroy();
        }

        // Crear gráfico
        const ctx = document.getElementById('chart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: `Historial últimos 10 días (${currency.toUpperCase()})`,
                    data: values,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Fecha'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Valor'
                        }
                    }
                }
            }
        });
    } catch (error) {
        resultElement.textContent = `Error: ${error.message}`;
    }
});

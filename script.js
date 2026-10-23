// 1. Fetch active services from backend on page load
async function loadServices() {
    try {
        const response = await fetch('http://localhost:3000/api/services');
        const result = await response.json();
        const select = document.getElementById('service_id');
        
        if (result.success && result.data.length > 0) {
            select.innerHTML = '<option value="">-- Choose a Service --</option>';
            result.data.forEach(service => {
                select.innerHTML += `<option value="${service.service_id}">${service.service_name} (~${service.estimated_duration_minutes} mins)</option>`;
            });
        } else {
            select.innerHTML = '<option value="">No services available</option>';
        }
    } catch (err) {
        console.error('Error loading services:', err);
        document.getElementById('service_id').innerHTML = '<option value="">Failed to connect to backend server</option>';
    }
}

// 2. Handle form submission to generate token
document.getElementById('tokenForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const citizen_name = document.getElementById('citizen_name').value;
    const citizen_phone = document.getElementById('citizen_phone').value;
    const service_id = document.getElementById('service_id').value;

    try {
        const response = await fetch('http://localhost:3000/api/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ citizen_name, citizen_phone, service_id })
        });
        const result = await response.json();

        if (result.success) {
            document.getElementById('resTokenNum').textContent = result.data.token_number;
            document.getElementById('resQueuePos').textContent = result.data.queue_position;
            document.getElementById('resultBox').classList.remove('hidden');
            document.getElementById('tokenForm').reset();
        } else {
            alert(result.error || 'Failed to generate token');
        }
    } catch (err) {
        console.error('Error generating token:', err);
        alert('Could not connect to the backend server.');
    }
});

// Run on page load
loadServices();
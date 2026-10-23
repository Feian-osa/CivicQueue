let currentActiveTokenId = null;

// 1. Fetch active services on page load to populate dropdown
async function loadServices() {
    try {
        const response = await fetch('http://localhost:3000/api/services');
        const result = await response.json();
        const select = document.getElementById('service_id');
        
        if (result.success && result.data.length > 0) {
            select.innerHTML = '';
            result.data.forEach(service => {
                select.innerHTML += `<option value="${service.service_id}">${service.service_name}</option>`;
            });
        } else {
            select.innerHTML = '<option value="">No services available</option>';
        }
    } catch (err) {
        console.error('Error loading services:', err);
        document.getElementById('service_id').innerHTML = '<option value="">Failed to connect to backend server</option>';
    }
}

// 2. Call Next Token (FIFO Queue Logic)
document.getElementById('callBtn').addEventListener('click', async () => {
    const counter_id = document.getElementById('counter_id').value;
    const staff_id = document.getElementById('staff_id').value;
    const service_id = document.getElementById('service_id').value;
    const msgBox = document.getElementById('messageBox');

    msgBox.classList.add('hidden');

    if (!counter_id || !staff_id || !service_id) {
        alert("Please ensure Counter ID, Staff ID, and Service are selected.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/tokens/call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ counter_id: Number(counter_id), staff_id: Number(staff_id), service_id: Number(service_id) })
        });
        const result = await response.json();

        if (result.success) {
            currentActiveTokenId = result.data.token_id;
            document.getElementById('activeTokenNum').textContent = result.data.token_number;
            document.getElementById('activeCitizenName').textContent = result.data.citizen_name;
            document.getElementById('activeTokenBox').classList.remove('hidden');
        } else {
            document.getElementById('activeTokenBox').classList.add('hidden');
            msgBox.textContent = result.message || "No waiting tokens in the queue.";
            msgBox.classList.remove('hidden');
        }
    } catch (err) {
        console.error('Error calling token:', err);
        alert('Could not connect to the backend server.');
    }
});

// 3. Complete Current Token
document.getElementById('completeBtn').addEventListener('click', async () => {
    if (!currentActiveTokenId) return;

    try {
        const response = await fetch('http://localhost:3000/api/tokens/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token_id: currentActiveTokenId })
        });
        const result = await response.json();

        if (result.success) {
            alert("Token marked as completed!");
            document.getElementById('activeTokenBox').classList.add('hidden');
            currentActiveTokenId = null;
        } else {
            alert(result.error || 'Failed to complete token');
        }
    } catch (err) {
        console.error('Error completing token:', err);
        alert('Could not connect to the backend server.');
    }
});

// Run on page load
loadServices();
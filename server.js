const cors = require('cors'); //CORS (Cross-Origin Resource Sharing) is a security feature that allows or restricts resources on a web server to be requested from another domain outside the domain from which the resource originated. In this case, it allows our frontend (which may be running on a different port or domain) to make requests to our backend API without being blocked by the browser's same-origin policy.
const express = require('express');       //Helps us create a web server and API endpoints.
const mysql = require('mysql2');         //Allows JavaScript to communicate with MySQL.
const app = express();                   //Creates our Express application, where we'll define what the server does.

app.use(express.json()); // Lets the server read data sent in JSON format.
app.use(cors()); // Enables CORS for all routes, allowing requests from any origin. This is important for frontend-backend communication when they are hosted on different domains or ports.

// 1. Create connection pool to MySQL database
const db = mysql.createPool({
    host: 'localhost',  
    user: 'root',
    password: 'dipesh123',          // Creates reusable connections(through a connection pool) to MySQL so the app can access the database efficiently.
    database: 'token_management_system'
});

// 2. API Endpoint to get all active services (Raw SQL + No ORM)
app.get('/api/services', (req, res) => {    //req= Request object, res= Response object  // When someone asks for services from frontend through GET request to /api/services, this code handles the request and sends back the result.
                                           
    const rawSql = "SELECT service_id, service_name, estimated_duration_minutes FROM services WHERE is_active = TRUE";  // Gets the ID, name, and estimated time of all active services from the database.
    
    db.query(rawSql, (err, results) => {        // call back function to handle the result of the query. If there's an error, send a 500 response with error details. Otherwise, send back the results in JSON format.
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });     // If there's an error, send a 500 response with error details in the form of json.
        }
        res.json({ success: true, data: results });     // if no error, send back the results in JSON format with a success message.
    });
});

// 3. POST Token Generation Route (NEW from Step 7)
app.post('/api/tokens', (req, res) => {   // Handles POST requests to create/generate a new token.
    const { citizen_name, citizen_phone, service_id } = req.body; // Extract citizen name, phone, and service ID from the JSON request body.

    if (!citizen_name || !citizen_phone || !service_id) { // Validate that all required fields were provided.
        return res.status(400).json({ error: "All fields are required" }); // Send 400 Bad Request if any field is missing.
    }

    const countSql = "SELECT COUNT(*) AS total FROM tokens WHERE service_id = ?"; // Count existing tokens for this service to calculate the next queue number.
    
    db.execute(countSql, [service_id], (err, countResult) => { // Execute parameterized count query safely using service_id.
        if (err) {
            return res.status(500).json({ error: "Database error while counting tokens", details: err.message }); // Send 500 if counting tokens fails.
        }

        const nextNumber = countResult[0].total + 1; // Next queue position is current total + 1.
        const tokenNumber = `TKN-${service_id}-${nextNumber}`; // Build the token number using service ID and queue position.

        const insertSql = `
            INSERT INTO tokens (token_number, citizen_name, citizen_phone, service_id, status) 
            VALUES (?, ?, ?, ?, 'WAITING')
        `; // SQL statement to insert the new token with WAITING status.

        db.execute(insertSql, [tokenNumber, citizen_name, citizen_phone, service_id], (err, insertResult) => { // Insert the new token using parameterized values.
            if (err) {
                return res.status(500).json({ error: "Failed to generate token", details: err.message }); // Send 500 if inserting the token fails.
            }

            res.status(201).json({ // Send 201 Created with the generated token details.
                success: true,
                message: "Token generated successfully",
                data: {
                    token_id: insertResult.insertId,
                    token_number: tokenNumber,
                    citizen_name: citizen_name,
                    queue_position: nextNumber
                }
            });
        });
    });
});
// 4. POST Staff Call Next Token Route (Step 8)
app.post('/api/tokens/call', (req, res) => {   // Handles POST requests when staff click "Call Next Token".
    const { counter_id, staff_id, service_id } = req.body; // Extract counter, staff, and service IDs from request.

    if (!counter_id || !staff_id || !service_id) { // Validate required parameters.
        return res.status(400).json({ error: "Counter ID, Staff ID, and Service ID are required" });
    }

    // Step 1: Find the oldest WAITING token for this service (FIFO logic)
    const findOldestSql = `
        SELECT token_id, token_number, citizen_name 
        FROM tokens 
        WHERE service_id = ? AND status = 'WAITING' 
        ORDER BY created_at ASC 
        LIMIT 1
    `;

    db.execute(findOldestSql, [service_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error while fetching queue", details: err.message });
        }

        // Check if there are any waiting tokens left in the queue
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "No waiting tokens in the queue for this service." });
        }

        const nextToken = results[0];

        // Step 2: Update that token's status to 'CALLED' and assign counter & staff
        const updateSql = `
            UPDATE tokens 
            SET status = 'CALLED', 
                counter_id = ?, 
                staff_id = ?, 
                called_at = CURRENT_TIMESTAMP 
            WHERE token_id = ?
        `;

        db.execute(updateSql, [counter_id, staff_id, nextToken.token_id], (err, updateResult) => {
            if (err) {
                return res.status(500).json({ error: "Failed to update token status", details: err.message });
            }

            // Step 3: Send back the called token details to the staff dashboard
            res.json({
                success: true,
                message: "Token called successfully",
                data: {
                    token_id: nextToken.token_id,
                    token_number: nextToken.token_number,
                    citizen_name: nextToken.citizen_name,
                    counter_id: counter_id
                }
            });
        });
    });
});
// 5. POST Complete Token Route (Step 9)
app.post('/api/tokens/complete', (req, res) => {   // Handles POST requests when staff finish serving a citizen.
    const { token_id } = req.body; // Extract token ID from the request body.

    if (!token_id) { // Validate that token ID is provided.
        return res.status(400).json({ error: "Token ID is required" });
    }

    // SQL statement to update the token status to COMPLETED and record the timestamp
    const completeSql = `
        UPDATE tokens 
        SET status = 'COMPLETED', 
            completed_at = CURRENT_TIMESTAMP 
        WHERE token_id = ? AND status = 'CALLED'
    `;

    db.execute(completeSql, [token_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database error while completing token", details: err.message });
        }

        // Check if any row was actually updated (ensures it was in 'CALLED' state first)
        if (result.affectedRows === 0) {
            return res.status(400).json({ success: false, message: "Token not found or is not currently in 'CALLED' status." });
        }

        res.json({
            success: true,
            message: "Token marked as completed successfully",
            data: {
                token_id: token_id,
                status: "COMPLETED"
            }
        });
    });
});
// 5. Start Server
app.listen(3000, () => {   // listen() is a method that starts the server and listens for incoming requests on the specified port (3000 in this case). The callback function is executed once the server is up and running, logging a message to the console.
    console.log("Server running on port 3000");
});
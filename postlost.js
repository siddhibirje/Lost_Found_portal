var API_ENDPOINT = "https://jry0c2aolh.execute-api.ap-south-1.amazonaws.com/lostitem";

document.getElementById("lostForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    // Get form data
    const name = document.getElementById("lostItemName").value;
    const location = document.getElementById("lostLocation").value;
    const date = document.getElementById("lostDate").value;
    const contact = document.getElementById("lostContact").value;
    const remarks = document.getElementById("lostRemark").value;

    // Validate that required fields are not empty
    if (!name || !location || !date || !contact) {
        alert("Please fill in all the required fields.");
        return;
    }

    try {
        // Step 1: Request Pre-signed URL from Lambda via API Gateway
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                location,
                date,
                remarks,
                contact,
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Lost item successfully reported!');
            window.location.href = 'lostitems.html'; // Redirect after successful submission
        } else {
            alert('Failed to report the lost item.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
    }
});

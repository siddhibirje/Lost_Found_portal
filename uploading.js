// Add your API endpoint here
var API_ENDPOINT ="https://jry0c2aolh.execute-api.ap-south-1.amazonaws.com/founditem";

// Function to upload found item data
document.getElementById("saveItem").addEventListener("click", function(event) {
    event.preventDefault();
    
    var inputData = {
        "name": document.getElementById("foundItemName").value,
        "location": document.getElementById("foundLocation").value,
        "date": document.getElementById("foundDate").value,
        "remarks": document.getElementById("foundRemark").value,
        "contact": document.getElementById("foundContact").value
    };
    
    fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(inputData)
    })
    .then(response => response.json())
    .then(data => {
        alert("Found item reported successfully!");
        window.location.href = 'founditems.html';
    })
    .catch(error => {
        alert("Error saving found item.");
        console.error("Error:", error);
    });
});



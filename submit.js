document.getElementById("lostForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const fileInput = document.getElementById("foundImage");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select an image.");
        return;
    }

    // Convert image to Base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function () {
        const base64Image = reader.result;

        const itemData = {
            name: document.getElementById("foundItemName").value,
            location: document.getElementById("foundLocation").value,
            date: document.getElementById("foundDate").value,
            remarks: document.getElementById("foundRemark").value,
            imageBase64: base64Image
        };

        const response = await fetch("https://jry0c2aolh.execute-api.ap-south-1.amazonaws.com/lostitem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(itemData)
        });

        const data = await response.json();
        if (response.ok) {
            alert("Item uploaded successfully!");
            console.log("Image URL:", data.imageUrl);
        } else {
            alert("Upload failed: " + data.message);
        }
    };
});

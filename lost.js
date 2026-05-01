var API_ENDPOINT = "https://jry0c2aolh.execute-api.ap-south-1.amazonaws.com/lostitem"; 

document.getElementById("showItemsBtn").onclick = function() {  
    $.ajax({
        url: API_ENDPOINT,
        type: 'GET',
        success: function(response) {
            $('#foundItemsTable tbody').empty();

            // ✅ Force parse in case it's a string
            var items = typeof response === 'string' ? JSON.parse(response) : response;

            if (items.length === 0) {
                $('#foundItemsTable tbody').append("<tr><td colspan='5' class='text-center text-gray-500'>No lost items reported yet.</td></tr>");
                return;
            }

            $.each(items, function(i, data) {          
                $("#foundItemsTable tbody").append(`
                    <tr class="border-b">
                        <td class="px-4 py-2">${data['name'] || 'N/A'}</td>
                        <td class="px-4 py-2">${data['location'] || 'Unknown'}</td>
                        <td class="px-4 py-2">${data['date'] || 'Not Specified'}</td>
                        <td class="px-4 py-2">${data['remarks'] || 'No remarks'}</td>
                        <td class="px-4 py-2">${data['contact'] || 'No Contact Info'}</td>
                    </tr>
                `);
            });
        },
        error: function() {
            alert("Error retrieving lost items.");
        }
    });
};
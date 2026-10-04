// Accessing the DOM element to attach the event listener
document.getElementById('addStudentBtn').addEventListener('click', function() {
    const nameInput = document.getElementById('studentName');
    const studentName = nameInput.value.trim();

    // Basic validation
    if (studentName === "") {
        alert("Enter a name first. The DOM can't read your mind.");
        return;
    }

    // Creating new DOM elements dynamically[cite: 8]
    const list = document.getElementById('attendanceList');
    const listItem = document.createElement('li');
    listItem.className = 'student-row';

    const nameNode = document.createElement('span');
    nameNode.innerText = studentName;

    const statusNode = document.createElement('span');
    statusNode.innerText = "Pending";
    statusNode.className = 'status-text';

    // Creating functional buttons for event handling[cite: 8]
    const presentBtn = document.createElement('button');
    presentBtn.innerText = "P";
    presentBtn.className = 'btn-present';
    
    // Modifying existing DOM elements via events[cite: 8]
    presentBtn.addEventListener('click', function() {
        statusNode.innerText = "Present";
        statusNode.className = 'status-text status-present';
    });

    const absentBtn = document.createElement('button');
    absentBtn.innerText = "A";
    absentBtn.className = 'btn-absent';
    
    absentBtn.addEventListener('click', function() {
        statusNode.innerText = "Absent";
        statusNode.className = 'status-text status-absent';
    });

    const actionDiv = document.createElement('div');
    actionDiv.appendChild(presentBtn);
    actionDiv.appendChild(absentBtn);

    // Appending everything to the DOM[cite: 8]
    listItem.appendChild(nameNode);
    listItem.appendChild(statusNode);
    listItem.appendChild(actionDiv);

    list.appendChild(listItem);

    // Clearing the input field
    nameInput.value = "";
});
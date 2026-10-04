document.getElementById('addTaskBtn').addEventListener('click', addTask);

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("You can't add an empty task. We aren't testing ghost inputs here.");
        return;
    }

    // Creating DOM elements dynamically[cite: 8]
    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');

    // Complete Button
    const completeBtn = document.createElement('button');
    completeBtn.innerText = "✓";
    completeBtn.className = "complete-btn";
    completeBtn.addEventListener('click', function() {
        li.classList.toggle('completed'); // Dynamically modifies CSS styles[cite: 8]
    });

    // Task Content
    const span = document.createElement('span');
    span.innerText = taskText;
    span.className = "task-text";

    // Actions Wrapper
    const actions = document.createElement('div');
    actions.className = "actions";

    // Edit Button
    const editBtn = document.createElement('button');
    editBtn.innerText = "Edit";
    editBtn.className = "edit-btn";
    editBtn.addEventListener('click', function() {
        if (li.classList.contains('completed')) {
            alert("You can't edit a task you've already completed. Uncheck it first.");
            return;
        }
        // Modifying existing DOM content dynamically[cite: 8]
        const newTask = prompt("Update your task:", span.innerText);
        if (newTask !== null && newTask.trim() !== "") {
            span.innerText = newTask.trim();
        }
    });

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = "✗";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener('click', function() {
        taskList.removeChild(li); // Removing elements dynamically[cite: 8]
    });

    // Constructing the DOM node tree[cite: 8]
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(completeBtn);
    li.appendChild(span);
    li.appendChild(actions);

    taskList.appendChild(li);

    // Clear the input
    taskInput.value = "";
}
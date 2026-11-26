const form = document.getElementById('studentForm');
const msg = document.getElementById('msg');
let cachedStudents = [];

async function loadStudents() {
    const res = await fetch('/api/students');
    cachedStudents = await res.json();
    const tbody = document.getElementById('studentTable');
    tbody.innerHTML = cachedStudents.map(s => `
        <tr>
            <td>${s.id}</td>
            <td>${s.roll_no}</td>
            <td>${s.full_name}</td>
            <td>${s.department}</td>
            <td>${s.semester}</td>
            <td>${s.email}</td>
            <td>
                <button class="edit" onclick="editStudent(${s.id})">Edit</button>
                <button class="delete" onclick="deleteStudent(${s.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('studentId').value;
    const payload = {
        roll_no: document.getElementById('roll_no').value,
        full_name: document.getElementById('full_name').value,
        department: document.getElementById('department').value,
        semester: document.getElementById('semester').value,
        email: document.getElementById('email').value
    };
    const res = await fetch(id ? `/api/students/${id}` : '/api/students', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    msg.style.color = res.ok ? '#15803d' : '#dc2626';
    msg.textContent = data.message;
    if (res.ok) {
        resetForm();
        loadStudents();
    }
});

function editStudent(id) {
    const s = cachedStudents.find(x => x.id === id);
    if (!s) return;
    document.getElementById('studentId').value = s.id;
    document.getElementById('roll_no').value = s.roll_no;
    document.getElementById('full_name').value = s.full_name;
    document.getElementById('department').value = s.department;
    document.getElementById('semester').value = s.semester;
    document.getElementById('email').value = s.email;
    document.getElementById('submitBtn').textContent = 'Update Student';
}

async function deleteStudent(id) {
    if (!confirm('Delete this student record?')) return;
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    const data = await res.json();
    msg.textContent = data.message;
    loadStudents();
}

function resetForm() {
    form.reset();
    document.getElementById('studentId').value = '';
    document.getElementById('submitBtn').textContent = 'Add Student';
}

loadStudents();

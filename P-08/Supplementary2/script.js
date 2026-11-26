const form = document.getElementById('empForm');
const status = document.getElementById('status');
let empList = [];

async function loadEmployees() {
    const res = await fetch('/api/employees');
    empList = await res.json();
    document.getElementById('empTable').innerHTML = empList.map(e => `
        <tr>
            <td>${e.id}</td>
            <td>${e.emp_code}</td>
            <td>${e.name}</td>
            <td>${e.designation}</td>
            <td>${e.department}</td>
            <td>₹${Number(e.salary).toLocaleString()}</td>
            <td>
                <button class="edit" onclick="editEmp(${e.id})">Edit</button>
                <button class="del" onclick="delEmp(${e.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('empId').value;
    const payload = {
        emp_code: document.getElementById('emp_code').value,
        name: document.getElementById('name').value,
        designation: document.getElementById('designation').value,
        department: document.getElementById('department').value,
        salary: document.getElementById('salary').value
    };
    const res = await fetch(id ? `/api/employees/${id}` : '/api/employees', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    status.style.color = res.ok ? '#059669' : '#dc2626';
    status.textContent = data.message;
    if (res.ok) {
        resetForm();
        loadEmployees();
    }
});

function editEmp(id) {
    const emp = empList.find(x => x.id === id);
    if (!emp) return;
    document.getElementById('empId').value = emp.id;
    document.getElementById('emp_code').value = emp.emp_code;
    document.getElementById('name').value = emp.name;
    document.getElementById('designation').value = emp.designation;
    document.getElementById('department').value = emp.department;
    document.getElementById('salary').value = emp.salary;
    document.getElementById('saveBtn').textContent = 'Update Employee';
}

async function delEmp(id) {
    if (!confirm('Remove this employee?')) return;
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    const data = await res.json();
    status.textContent = data.message;
    loadEmployees();
}

function resetForm() {
    form.reset();
    document.getElementById('empId').value = '';
    document.getElementById('saveBtn').textContent = 'Add Employee';
}

loadEmployees();

const form = document.getElementById('bookForm');
const msg = document.getElementById('msg');
let bookList = [];

async function loadBooks(search = '') {
    const url = search ? `/api/books?search=${encodeURIComponent(search)}` : '/api/books';
    const res = await fetch(url);
    bookList = await res.json();
    document.getElementById('bookTable').innerHTML = bookList.map(b => `
        <tr>
            <td>${b.id}</td>
            <td>${b.isbn}</td>
            <td>${b.title}</td>
            <td>${b.author}</td>
            <td>${b.genre}</td>
            <td>${b.copies}</td>
            <td>
                <button class="edit" onclick="editBook(${b.id})">Edit</button>
                <button class="del" onclick="delBook(${b.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('bookId').value;
    const payload = {
        isbn: document.getElementById('isbn').value,
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        genre: document.getElementById('genre').value,
        copies: document.getElementById('copies').value
    };
    const res = await fetch(id ? `/api/books/${id}` : '/api/books', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    msg.style.color = res.ok ? '#15803d' : '#dc2626';
    msg.textContent = data.message;
    if (res.ok) {
        resetForm();
        loadBooks();
    }
});

function editBook(id) {
    const b = bookList.find(x => x.id === id);
    if (!b) return;
    document.getElementById('bookId').value = b.id;
    document.getElementById('isbn').value = b.isbn;
    document.getElementById('title').value = b.title;
    document.getElementById('author').value = b.author;
    document.getElementById('genre').value = b.genre;
    document.getElementById('copies').value = b.copies;
    document.getElementById('saveBtn').textContent = 'Update Book';
}

async function delBook(id) {
    if (!confirm('Delete this book from catalog?')) return;
    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
    const data = await res.json();
    msg.textContent = data.message;
    loadBooks();
}

function resetForm() {
    form.reset();
    document.getElementById('bookId').value = '';
    document.getElementById('saveBtn').textContent = 'Add Book';
}

loadBooks();

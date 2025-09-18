// Cookie
function setCookie(name, value, days = 7, path = '/', sameSite = 'Lax', secure = false) {
    const enc = encodeURIComponent(value);
    let str = `${name}=${enc}; Path=${path}; SameSite=${sameSite}`;
    if (days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        str += `; Expires=${expires}`;
    }
    if (secure) str += '; Secure'; 
    document.cookie = str;
}

function getCookie(name) {
    const pairs = document.cookie.split('; ');
    for (const p of pairs) {
        const [k, v] = p.split('=');
        if (k === name) return decodeURIComponent(v);
    }
    return null;
}


const list = document.getElementById('todoList');
const addBtn = document.getElementById('addBtn');
const input = document.getElementById('todoInput');


function createItem(text, completed = false) {
    const li = document.createElement('li');
    if (completed) li.classList.add('completed');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'complete';
    checkbox.checked = !!completed;
    checkbox.setAttribute('aria-label','تکمیل شد');

    const span = document.createElement('span');
    span.textContent = text;

    const editBtn = document.createElement('button');
    editBtn.textContent = 'ویرایش';
    editBtn.className = 'edit btn';
    editBtn.setAttribute('aria-label','ویرایش');

    const delBtn = document.createElement('button');
    delBtn.textContent = 'حذف';
    delBtn.className = 'delete btn btn--danger';
    delBtn.setAttribute('aria-label','حذف');

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(delBtn);
    return li;
}

function serializeTodos() {
    const data = [];
    list.querySelectorAll('li').forEach(li => {
        const text = (li.querySelector('span')?.textContent ?? '').trim();
        const completed = li.classList.contains('completed');
        data.push({ text, completed });
    });
    return data;
}

function saveTodos() {
    try {
        const data = serializeTodos();
        setCookie('todos', JSON.stringify(data), 30);
    } catch (e) {
        console.error('Cookie save failed:', e);
    }
}

function loadTodos() {
    const raw = getCookie('todos');
    if (!raw) return;
    try {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
            list.innerHTML = '';
            for (const item of data) {
                const li = createItem(item.text ?? 'بدون متن', !!item.completed);
                list.appendChild(li);
            }
        }
    } catch (e) {
        console.warn('Invalid cookie JSON, clearing…');
        setCookie('todos', '[]', 1);
    }
}

function toggleEmpty() {
  document.querySelector('.empty').hidden = !!document.querySelector('#todoList li');
}

// Add item
function addFromInput() {
    const text = input.value.trim();
    if (!text) return;
    list.appendChild(createItem(text, false));
    input.value = '';
    saveTodos(); toggleEmpty();
}
addBtn.addEventListener('click', addFromInput);
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addFromInput();
});


list.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;

    // delete
    if (e.target.classList.contains('delete')) {
        li.remove();
        saveTodos(); toggleEmpty();
        return;
    }

    // edit
    if (e.target.classList.contains('edit')) {
        const span = li.querySelector('span');
        const oldText = span ? span.textContent : '';

        const inputEl = document.createElement('input');
        inputEl.type = 'text';
        inputEl.value = oldText;

        const updateBtn = document.createElement('button');
        updateBtn.textContent = 'بروزرسانی';
        updateBtn.className = 'update';

        li.replaceChild(inputEl, span);
        li.replaceChild(updateBtn, e.target);

        inputEl.addEventListener('keydown', (ke) => {
            if (ke.key === 'Enter') {
                updateBtn.click();
            }
        });
        return;
    }

    // update 
    if (e.target.classList.contains('update')) {
        const inputEl = li.querySelector('input[type="text"]');
        const newText = (inputEl?.value ?? '').trim() || 'بدون متن';

        const span = document.createElement('span');
        span.textContent = newText;

        const editBtn = document.createElement('button');
        editBtn.textContent = 'ویرایش';
        editBtn.className = 'edit btn';
        editBtn.setAttribute('aria-label','ویرایش');

        li.replaceChild(span, inputEl);
        li.replaceChild(editBtn, e.target);

        saveTodos(); toggleEmpty();
    }
});

list.addEventListener('change', (e) => {
    if (e.target.classList.contains('complete')) {
        const li = e.target.closest('li');
        li.classList.toggle('completed', e.target.checked);
        saveTodos(); toggleEmpty();
    }
});

loadTodos();
toggleEmpty();
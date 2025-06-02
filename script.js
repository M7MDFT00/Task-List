// Language texts
const translations = {
    en: {
        appTitle: "Task List",
        authorText: "Created by M7MDFT",
        taskPlaceholder: "Enter a new task",
        addTask: "Add",
        edit: "Edit",
        copy: "Copy",
        complete: "Complete",
        incomplete: "Incomplete",
        subtask: "Subtask",
        delete: "Delete",
        created: "Created",
        completed: "Completed",
        notCompleted: "Not completed",
        settings: "Settings",
        switchLanguage: "Switch to Arabic",
        hideCreation: "Hide Creation Time",
        showCreation: "Show Creation Time",
        hideCompletion: "Hide Completion Time",
        showCompletion: "Show Completion Time",
        clearAll: "Clear All Tasks",
        confirmClear: "Are you sure you want to delete ALL tasks?",
        noTasks: "No tasks yet. Add your first task!",
        cancel: "Cancel",
        deleteAll: "Delete All"
    },
    ar: {
        appTitle: "قائمة المهام",
        authorText: "صنع بواسطة M7MDFT",
        taskPlaceholder: "أدخل مهمة جديدة",
        addTask: "إضافة",
        edit: "تعديل",
        copy: "نسخ",
        complete: "إكمال",
        incomplete: "غير مكتمل",
        subtask: "مهمة فرعية",
        delete: "حذف",
        created: "وقت الإنشاء",
        completed: "وقت الإكمال",
        notCompleted: "غير مكتملة",
        settings: "الإعدادات",
        switchLanguage: "التغيير إلى الإنجليزية",
        hideCreation: "إخفاء وقت الإنشاء",
        showCreation: "إظهار وقت الإنشاء",
        hideCompletion: "إخفاء وقت الإكمال",
        showCompletion: "إظهار وقت الإكمال",
        clearAll: "حذف جميع المهام",
        confirmClear: "هل أنت متأكد أنك تريد حذف جميع المهام؟",
        noTasks: "لا توجد مهام بعد. أضف مهمتك الأولى!",
        cancel: "إلغاء",
        deleteAll: "حذف الكل"
    }
};

let currentLanguage = localStorage.getItem('language') || 'en';

document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    loadSettings();
    
    // تحميل وضع Dark Mode من localStorage
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
    
    // إظهار الأزرار مباشرة عند التحميل
    const darkModeBtn = document.querySelector('.toggle-dark-mode');
    if (darkModeBtn) darkModeBtn.style.display = 'block';
    
    const scrollBtn = document.getElementById('scrollToTop');
    if (scrollBtn) scrollBtn.style.display = 'flex';
    
    checkScrollToTop();
});

window.addEventListener('scroll', checkScrollToTop);

function checkScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        scrollToTopBtn.style.display = 'flex';
        scrollToTopBtn.classList.toggle('visible', window.pageYOffset > 300);
    }
}

function handleTaskInputKeyPress(e) {
    if (e.key === 'Enter') addTask();
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
        subtasks: []
    };

    addTaskToDOM(task);
    saveTask(task);
    taskInput.value = '';
    document.getElementById('emptyMessage').style.display = 'none';
}

function addTaskToDOM(task) {
    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;
    if (task.completed) li.classList.add('completed');

    li.innerHTML = `
        <div class="task-content">
            <span class="task-text">${task.text}</span>
            <div class="task-meta">
                <span class="creation-time">${translations[currentLanguage].created}: ${new Date(task.createdAt).toLocaleString()}</span>
                ${task.completed ? `<span class="completion-time"> | ${translations[currentLanguage].completed}: ${new Date(task.completedAt).toLocaleString()}</span>` : ''}
            </div>
            ${task.subtasks.length > 0 ? `
                <div class="subtasks">
                    ${task.subtasks.map(subtask => createSubtaskHTML(subtask)).join('')}
                </div>
            ` : ''}
            <div class="subtask-input">
                <input type="text" placeholder="${translations[currentLanguage].taskPlaceholder}" onkeypress="handleSubtaskInputKeyPress(event, this)">
                <button onclick="addSubtask(this)">${translations[currentLanguage].addTask}</button>
            </div>
        </div>
        <div class="task-actions">
            <button class="task-btn edit-btn" onclick="editTask(this)">${translations[currentLanguage].edit}</button>
            <button class="task-btn copy-btn" onclick="copyTask(this)">${translations[currentLanguage].copy}</button>
            <button class="task-btn ${task.completed ? 'incomplete-btn' : 'complete-btn'}" 
                    onclick="${task.completed ? 'markTaskIncomplete' : 'markTaskComplete'}(this)">
                ${task.completed ? translations[currentLanguage].incomplete : translations[currentLanguage].complete}
            </button>
            <button class="task-btn subtask-btn" onclick="toggleSubtaskInput(this)">+ ${translations[currentLanguage].subtask}</button>
            <button class="task-btn delete-btn" onclick="deleteTask(this)">${translations[currentLanguage].delete}</button>
        </div>
    `;

    const emptyMessage = document.getElementById('emptyMessage');
    if (emptyMessage) {
        taskList.insertBefore(li, emptyMessage);
    } else {
        taskList.appendChild(li);
    }
}

function createSubtaskHTML(subtask) {
    return `
        <div class="subtask" data-id="${subtask.id || Date.now()}">
            <span class="subtask-text ${subtask.completed ? 'completed' : ''}">${subtask.text}</span>
            <div class="task-meta">
                <span class="creation-time">${translations[currentLanguage].created}: ${new Date(subtask.createdAt).toLocaleString()}</span>
                ${subtask.completed ? `<span class="completion-time"> | ${translations[currentLanguage].completed}: ${new Date(subtask.completedAt).toLocaleString()}</span>` : ''}
            </div>
            <div class="task-actions">
                <button class="task-btn ${subtask.completed ? 'incomplete-btn' : 'complete-btn'}" 
                        onclick="${subtask.completed ? 'markSubtaskIncomplete' : 'markSubtaskComplete'}(this)">
                    ${subtask.completed ? translations[currentLanguage].incomplete : translations[currentLanguage].complete}
                </button>
                <button class="task-btn delete-btn" onclick="deleteSubtask(this)">${translations[currentLanguage].delete}</button>
            </div>
        </div>
    `;
}

function copyTask(button) {
    const li = button.closest('.task-item');
    const taskId = parseInt(li.dataset.id);
    const taskText = li.querySelector('.task-text').textContent;
    
    const newTask = {
        id: Date.now(),
        text: taskText + " (" + translations[currentLanguage].copy + ")",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
        subtasks: []
    };

    // Copy subtasks if any
    const subtasks = li.querySelectorAll('.subtask');
    subtasks.forEach(subtask => {
        newTask.subtasks.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            text: subtask.querySelector('.subtask-text').textContent,
            completed: subtask.querySelector('.subtask-text').classList.contains('completed'),
            createdAt: new Date().toISOString(),
            completedAt: subtask.querySelector('.subtask-text').classList.contains('completed') ? 
                         new Date().toISOString() : null
        });
    });

    addTaskToDOM(newTask);
    saveTask(newTask);
}

function handleSubtaskInputKeyPress(e, inputElement) {
    if (e.key === 'Enter') addSubtask(inputElement.nextElementSibling);
}

function toggleSubtaskInput(button) {
    const subtaskInput = button.closest('.task-item').querySelector('.subtask-input');
    subtaskInput.style.display = subtaskInput.style.display === 'flex' ? 'none' : 'flex';
    if (subtaskInput.style.display === 'flex') {
        subtaskInput.querySelector('input').focus();
    }
}

function addSubtask(button) {
    const input = button.previousElementSibling;
    const subtaskText = input.value.trim();
    if (!subtaskText) return;

    const li = button.closest('.task-item');
    const taskId = parseInt(li.dataset.id);
    const subtask = {
        id: Date.now(),
        text: subtaskText,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    };

    // Add to DOM
    const subtasksContainer = li.querySelector('.subtasks') || document.createElement('div');
    if (!li.querySelector('.subtasks')) {
        subtasksContainer.className = 'subtasks';
        li.querySelector('.task-content').insertBefore(subtasksContainer, li.querySelector('.subtask-input'));
    }
    
    subtasksContainer.appendChild(createElementFromHTML(createSubtaskHTML(subtask)));
    
    // Update in storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].subtasks.push(subtask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Reset input
    input.value = '';
    button.closest('.subtask-input').style.display = 'none';
}

function editTask(button) {
    const li = button.closest('.task-item');
    const taskText = li.querySelector('.task-text');
    const currentText = taskText.textContent;
    
    const editHtml = `
        <div style="display: flex; gap: 0.3rem; width: 100%;">
            <input type="text" value="${currentText}" style="flex: 1; padding: 0.3rem;" 
                   onkeypress="if(event.key === 'Enter') saveTaskEdit(this)" 
                   onblur="saveTaskEdit(this)">
            <button onclick="cancelTaskEdit(this)" style="padding: 0.3rem;">✕</button>
        </div>
    `;
    
    taskText.replaceWith(createElementFromHTML(editHtml));
    li.querySelector('input').focus();
}

function saveTaskEdit(input) {
    const li = input.closest('.task-item');
    const newText = input.value.trim();
    if (!newText) {
        cancelTaskEdit(input);
        return;
    }

    const taskId = parseInt(li.dataset.id);
    
    // Update DOM
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = newText;
    input.parentElement.replaceWith(span);
    
    // Update storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].text = newText;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

function cancelTaskEdit(button) {
    const li = button.closest('.task-item');
    const taskId = parseInt(li.dataset.id);
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = task.text;
        button.parentElement.replaceWith(span);
    }
}

function markTaskComplete(button) {
    const li = button.closest('.task-item');
    const taskId = parseInt(li.dataset.id);
    li.classList.add('completed');
    
    button.textContent = translations[currentLanguage].incomplete;
    button.classList.remove('complete-btn');
    button.classList.add('incomplete-btn');
    button.setAttribute('onclick', 'markTaskIncomplete(this)');
    
    // Update completion time display
    const completionTime = new Date().toISOString();
    const completionTimeElement = li.querySelector('.completion-time') || document.createElement('span');
    if (!li.querySelector('.completion-time')) {
        completionTimeElement.className = 'completion-time';
        li.querySelector('.task-meta').appendChild(completionTimeElement);
    }
    completionTimeElement.textContent = ` | ${translations[currentLanguage].completed}: ${new Date(completionTime).toLocaleString()}`;
    completionTimeElement.style.display = 'inline';
    
    // Update storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = true;
        tasks[taskIndex].completedAt = completionTime;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

function markTaskIncomplete(button) {
    const li = button.closest('.task-item');
    const taskId = parseInt(li.dataset.id);
    li.classList.remove('completed');
    
    button.textContent = translations[currentLanguage].complete;
    button.classList.remove('incomplete-btn');
    button.classList.add('complete-btn');
    button.setAttribute('onclick', 'markTaskComplete(this)');
    
    // Hide completion time
    const completionTimeElement = li.querySelector('.completion-time');
    if (completionTimeElement) {
        completionTimeElement.style.display = 'none';
    }
    
    // Update storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = false;
        tasks[taskIndex].completedAt = null;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

function markSubtaskComplete(button) {
    const subtaskElement = button.closest('.subtask');
    const subtaskTextElement = subtaskElement.querySelector('.subtask-text');
    const li = subtaskElement.closest('.task-item');
    const taskId = parseInt(li.dataset.id);
    const subtaskId = parseInt(subtaskElement.dataset.id);
    
    subtaskTextElement.classList.add('completed');
    button.textContent = translations[currentLanguage].incomplete;
    button.classList.remove('complete-btn');
    button.classList.add('incomplete-btn');
    button.setAttribute('onclick', 'markSubtaskIncomplete(this)');
    
    // Update completion time
    const completionTime = new Date().toISOString();
    const completionTimeElement = subtaskElement.querySelector('.completion-time') || document.createElement('span');
    if (!subtaskElement.querySelector('.completion-time')) {
        completionTimeElement.className = 'completion-time';
        subtaskElement.querySelector('.task-meta').appendChild(completionTimeElement);
    }
    completionTimeElement.textContent = ` | ${translations[currentLanguage].completed}: ${new Date(completionTime).toLocaleString()}`;
    
    // Update storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1 && tasks[taskIndex].subtasks) {
        const subtaskIndex = tasks[taskIndex].subtasks.findIndex(st => st.id === subtaskId);
        if (subtaskIndex !== -1) {
            tasks[taskIndex].subtasks[subtaskIndex].completed = true;
            tasks[taskIndex].subtasks[subtaskIndex].completedAt = completionTime;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }
}

function markSubtaskIncomplete(button) {
    const subtaskElement = button.closest('.subtask');
    const subtaskTextElement = subtaskElement.querySelector('.subtask-text');
    const li = subtaskElement.closest('.task-item');
    const taskId = parseInt(li.dataset.id);
    const subtaskId = parseInt(subtaskElement.dataset.id);
    
    subtaskTextElement.classList.remove('completed');
    button.textContent = translations[currentLanguage].complete;
    button.classList.remove('incomplete-btn');
    button.classList.add('complete-btn');
    button.setAttribute('onclick', 'markSubtaskComplete(this)');
    
    // Remove completion time
    const completionTimeElement = subtaskElement.querySelector('.completion-time');
    if (completionTimeElement) {
        completionTimeElement.remove();
    }
    
    // Update storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1 && tasks[taskIndex].subtasks) {
        const subtaskIndex = tasks[taskIndex].subtasks.findIndex(st => st.id === subtaskId);
        if (subtaskIndex !== -1) {
            tasks[taskIndex].subtasks[subtaskIndex].completed = false;
            tasks[taskIndex].subtasks[subtaskIndex].completedAt = null;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }
}

function deleteTask(button) {
    const li = button.closest('.task-item');
    const taskId = parseInt(li.dataset.id);
    li.remove();
    
    // Update storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Show empty message if no tasks left
    if (document.getElementById('taskList').children.length === 1) {
        document.getElementById('emptyMessage').style.display = 'block';
    }
}

function deleteSubtask(button) {
    const subtaskElement = button.closest('.subtask');
    const li = subtaskElement.closest('.task-item');
    const taskId = parseInt(li.dataset.id);
    const subtaskId = parseInt(subtaskElement.dataset.id);
    
    subtaskElement.remove();
    
    // Update storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1 && tasks[taskIndex].subtasks) {
        tasks[taskIndex].subtasks = tasks[taskIndex].subtasks.filter(st => st.id !== subtaskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

function saveTask(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskList = document.getElementById('taskList');
    
    // Clear existing tasks but keep empty message
    const emptyMessage = document.getElementById('emptyMessage');
    taskList.innerHTML = '';
    if (emptyMessage) {
        taskList.appendChild(emptyMessage);
    }
    
    if (tasks.length > 0) {
        emptyMessage.style.display = 'none';
        tasks.forEach(task => addTaskToDOM(task));
    }
}

function loadSettings() {
    if (localStorage.getItem('showCreationTime') === 'false') {
        document.querySelectorAll('.creation-time').forEach(el => el.style.display = 'none');
        document.getElementById('creation-time-btn').textContent = 
            currentLanguage === 'en' ? 'Show Creation Time' : 'إظهار وقت الإنشاء';
    }
    if (localStorage.getItem('showCompletionTime') === 'false') {
        document.querySelectorAll('.completion-time').forEach(el => el.style.display = 'none');
        document.getElementById('completion-time-btn').textContent = 
            currentLanguage === 'en' ? 'Show Completion Time' : 'إظهار وقت الإكمال';
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
}

function toggleCreationTime() {
    const show = localStorage.getItem('showCreationTime') !== 'false';
    localStorage.setItem('showCreationTime', show ? 'false' : 'true');
    
    document.querySelectorAll('.creation-time').forEach(el => {
        el.style.display = show ? 'none' : 'inline';
    });
    
    document.getElementById('creation-time-btn').textContent = 
        show ? (currentLanguage === 'en' ? 'Show Creation Time' : 'إظهار وقت الإنشاء') 
             : (currentLanguage === 'en' ? 'Hide Creation Time' : 'إخفاء وقت الإنشاء');
}

function toggleCompletionTime() {
    const show = localStorage.getItem('showCompletionTime') !== 'false';
    localStorage.setItem('showCompletionTime', show ? 'false' : 'true');
    
    document.querySelectorAll('.completion-time').forEach(el => {
        el.style.display = show ? 'none' : 'inline';
    });
    
    document.getElementById('completion-time-btn').textContent = 
        show ? (currentLanguage === 'en' ? 'Show Completion Time' : 'إظهار وقت الإكمال') 
             : (currentLanguage === 'en' ? 'Hide Completion Time' : 'إخفاء وقت الإكمال');
}

function showClearAllDialog() {
    const dialog = document.getElementById('clearAllDialog');
    const message = document.getElementById('dialog-message');
    const cancelBtn = dialog.querySelector('.dialog-cancel');
    const confirmBtn = dialog.querySelector('.dialog-confirm');
    
    message.textContent = translations[currentLanguage].confirmClear;
    cancelBtn.textContent = translations[currentLanguage].cancel;
    confirmBtn.textContent = translations[currentLanguage].deleteAll;
    
    dialog.showModal();
}

function clearAllTasks() {
    localStorage.removeItem('tasks');
    document.getElementById('taskList').innerHTML = '';
    document.getElementById('emptyMessage').style.display = 'block';
    document.getElementById('clearAllDialog').close();
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    localStorage.setItem('language', currentLanguage);
    updateLanguage();
}

function updateLanguage() {
    // Update UI texts
    document.getElementById('app-title').textContent = translations[currentLanguage].appTitle;
    document.getElementById('author-text').textContent = translations[currentLanguage].authorText;
    document.getElementById('taskInput').placeholder = translations[currentLanguage].taskPlaceholder;
    document.getElementById('add-task-btn').textContent = translations[currentLanguage].addTask;
    document.getElementById('settings-title').textContent = translations[currentLanguage].settings;
    document.getElementById('language-btn').textContent = translations[currentLanguage].switchLanguage;
    document.getElementById('clear-all-btn').textContent = translations[currentLanguage].clearAll;
    document.getElementById('emptyMessage').textContent = translations[currentLanguage].noTasks;
    
    // Update time toggle buttons
    const showCreation = localStorage.getItem('showCreationTime') !== 'false';
    document.getElementById('creation-time-btn').textContent = 
        showCreation ? translations[currentLanguage].hideCreation : translations[currentLanguage].showCreation;
    
    const showCompletion = localStorage.getItem('showCompletionTime') !== 'false';
    document.getElementById('completion-time-btn').textContent = 
        showCompletion ? translations[currentLanguage].hideCompletion : translations[currentLanguage].showCompletion;
    
    // Update task buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.textContent = translations[currentLanguage].edit;
    });
    
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.textContent = translations[currentLanguage].copy;
    });
    
    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.textContent = translations[currentLanguage].complete;
    });
    
    document.querySelectorAll('.incomplete-btn').forEach(btn => {
        btn.textContent = translations[currentLanguage].incomplete;
    });
    
    document.querySelectorAll('.subtask-btn').forEach(btn => {
        btn.textContent = '+ ' + translations[currentLanguage].subtask;
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.textContent = translations[currentLanguage].delete;
    });
    
    // Update subtask buttons
    document.querySelectorAll('.subtask .complete-btn').forEach(btn => {
        const isCompleted = btn.closest('.subtask').querySelector('.subtask-text').classList.contains('completed');
        btn.textContent = isCompleted ? translations[currentLanguage].incomplete : translations[currentLanguage].complete;
    });
}

function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}
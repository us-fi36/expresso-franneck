document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "/todo-api";

    function loadItems() {
        const userId = document.getElementById('user-id').value;
        fetch(apiUrl + `?userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                const todoList = document.getElementById('todo-list');
                todoList.innerHTML = "";
                data.forEach(item => {
                    const li = document.createElement('li');
                    li.id = item.id;
                    li.className = "todo-item";

                    const span = document.createElement('span');
                    span.className = 'todo-text';
                    span.textContent = item.text;
                    if (item.completed) {
                        span.classList.toggle('done');
                    }

                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'btn btn-danger';
                    deleteButton.textContent = 'Löschen';

                    const doneButton = document.createElement('button');
                    doneButton.className = 'btn btn-success';
                    doneButton.textContent = 'Erledigt';

                    // Handle delete button click
                    deleteButton.addEventListener('click', function() {
                        fetch(apiUrl, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ id: item.id })
                        })
                        .then(response => response.json())
                        .then(() => {
                            li.remove(); // Remove the todo from the list
                        });
                    });

                    // Handle done button click
                    doneButton.addEventListener('click', function () {
                        fetch(apiUrl, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ id: item.id })
                        })
                        .then(response => response.json())
                        .then(() => {
                            span.classList.toggle('done');
                        });
                    });

                    li.append(span);
                    li.appendChild(doneButton);
                    li.appendChild(deleteButton);
                    todoList.appendChild(li);
                });
            });
    }

    document.getElementById('todo-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const todoInput = document.getElementById('todo-input').value;
        const userId = document.getElementById('user-id').value;

        console.log("User ID:", userId); // Debugging-Zeile
        console.log("Todo Text:", todoInput); // Debugging-Zeile

        // Überprüfen, ob userId und todoInput nicht leer sind
        if (!userId) {
            console.error("User ID darf nicht leer sein.");
            return;
        }
        if (!todoInput) {
            console.error("Todo-Text darf nicht leer sein.");
            return;
        }

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: userId, text: todoInput })
        })
        .then(response => response.json())
        .then(data => {
            loadItems();
            document.getElementById('todo-input').value = ""; // Leere das Eingabefeld
        })
        .catch(error => console.error("Fehler beim Erstellen des To-Dos:", error));
    });

    loadItems();
});

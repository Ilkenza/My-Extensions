document.addEventListener("DOMContentLoaded", function () {
    const projectNameInput = document.getElementById("projectNameInput");
    const addProjectButton = document.getElementById("addProject");
    const projectList = document.getElementById("projectList");
    const projectTasks = document.getElementById("projectTasks");
    const taskInput = document.getElementById("taskInput");
    const addTaskButton = document.getElementById("addTask");
    const taskList = document.getElementById("taskList");
    const headerTitle = document.getElementById("headerTitle");
    const backArrow = document.getElementById("backArrow");
    const completedTasksContainer = document.getElementById("completedTasksContainer");
    const completedTasksHeader = document.getElementById("completedTasksHeader");
    const completedTaskList = document.getElementById("completedTaskList");
    const completedCount = document.getElementById("completedCount");
    const toggleCompleted = document.getElementById("toggleCompleted");

    const completedProjectsContainer = document.getElementById("completedProjectsContainer");
    const completedProjectsHeader = document.getElementById("completedProjectsHeader");
    const completedProjectList = document.getElementById("completedProjectList");
    const completedProjectsCount = document.getElementById("completedProjectsCount");
    const toggleCompletedProjects = document.getElementById("toggleCompletedProjects");



    let projects = JSON.parse(localStorage.getItem('projects')) || [];

    if (projects.length === 0) {
        projectNameInput.style.display = "block";
        addProjectButton.style.display = "block";
    } else {
        projectNameInput.style.display = "block";
        addProjectButton.style.display = "block";
        loadProjects();
    }
    function addProject(projectName) {
        if (projectName.length > 23) {
            alert("Project name must be 23 characters or less.");
            return;
        }

        if (projectName && !projects.some(project => project.name === projectName)) {
            projects.push({ name: projectName, completed: false });
            saveProjects(projects);
            addProjectToDOM(projectName, false);
            localStorage.setItem(`tasks_${projectName}`, JSON.stringify([]));
            projectNameInput.value = "";
        }
    }

    addProjectButton.addEventListener("click", function () {
        const projectName = projectNameInput.value;
        addProject(projectName);
    });

    projectNameInput.addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            const projectName = projectNameInput.value;
            addProject(projectName);
        }
    });

    function loadProjects() {
        const projects = JSON.parse(localStorage.getItem('projects')) || [];
        for (const project of projects) {
            addProjectToDOM(project.name, project.completed);
        }
        updateCompletedProjectsCount(projects.filter(project => project.completed).length);
    }


    let currentlyEditing = null;
    function addProjectToDOM(projectName, completed) {
        const projectId = `project-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const projectItem = document.createElement("li");
        projectItem.className = "task-item";
        projectItem.id = projectId;

        const projectContainer = document.createElement("div");
        projectContainer.className = "task-container";

        const projectLabel = document.createElement("label");
        projectLabel.className = "check-container";

        const projectCheckbox = document.createElement("input");
        projectCheckbox.type = "checkbox";
        projectCheckbox.className = "task-checkbox";
        projectCheckbox.id = `cbx-${projectId}`;
        projectCheckbox.checked = completed;

        const taskCheckmark = document.createElement("div");
        taskCheckmark.className = "task-checkmark";

        projectLabel.appendChild(projectCheckbox);
        projectLabel.appendChild(taskCheckmark);

        const projectText = document.createElement("input");
        projectText.type = "text";
        projectText.className = "project-input";
        projectText.value = projectName;
        projectText.readOnly = true;

        if (completed) {
            projectText.style.textDecoration = "line-through";
            projectText.style.color = "gray"
        }

        const projectIcons = document.createElement("span");
        projectIcons.className = "icons";

        const editIcon = document.createElement("i");
        editIcon.className = "fas fa-edit edit";
        editIcon.title = "Edit";

        const deleteIcon = document.createElement("i");
        deleteIcon.className = "fas fa-trash delete";
        deleteIcon.title = "Delete";

        const confirmIcon = document.createElement("i");
        confirmIcon.className = "fas fa-check confirm-edit";
        confirmIcon.style.display = "none";
        confirmIcon.title = "Confirm";

        const cancelIcon = document.createElement("i");
        cancelIcon.className = "fas fa-times cancel-edit";
        cancelIcon.style.display = "none";
        cancelIcon.title = "Cancel";

        projectContainer.appendChild(projectLabel);
        projectContainer.appendChild(projectText);
        projectItem.appendChild(projectContainer);
        projectItem.appendChild(projectIcons);

        projectIcons.appendChild(editIcon);
        projectIcons.appendChild(deleteIcon);
        projectIcons.appendChild(confirmIcon);
        projectIcons.appendChild(cancelIcon);

        if (completed) {
            completedProjectList.appendChild(projectItem);
        } else {
            projectList.appendChild(projectItem);
        }

        projectCheckbox.addEventListener("change", function () {
            const projectItem = this.closest(".task-item");

            if (!projectItem.classList.contains("just-added")) {
                projectItem.classList.add("checked");
            }

            setTimeout(() => {
                const projectIndex = projects.findIndex(project => project.name === projectName);
                projects[projectIndex].completed = projectCheckbox.checked;

                if (projectCheckbox.checked) {
                    projectText.style.textDecoration = "line-through";
                    projectText.style.color = "gray";
                    projectItem.classList.add("scale-out");
                    projectItem.addEventListener("animationend", function () {
                        projectList.removeChild(projectItem);
                        completedProjectList.appendChild(projectItem);
                        projectItem.classList.remove("scale-out");
                        projectItem.classList.add("scale-in");
                        projectItem.addEventListener("animationend", function () {
                            projectItem.classList.remove("scale-in");
                        }, { once: true });
                    }, { once: true });
                } else {
                    projectText.style.textDecoration = "none";
                    projectText.style.color = "";
                    completedProjectList.removeChild(projectItem);
                    projectList.appendChild(projectItem);
                    projectItem.classList.add("scale-in");
                    projectItem.addEventListener("animationend", function () {
                        projectItem.classList.remove("scale-in");
                    }, { once: true });
                }

                if (!projectItem.classList.contains("just-added")) {
                    projectItem.classList.remove("checked");
                }
                projectItem.classList.remove("just-added");

                updateCompletedProjectsCount(projects.filter(project => project.completed).length);
                saveProjects(projects);
            }, 300);
        });

        projectText.addEventListener("click", function () {
            if (!currentlyEditing) {
                openProject(projectName);
            }
        });


        editIcon.addEventListener("click", function (event) {
            event.stopPropagation();

            if (currentlyEditing && currentlyEditing !== projectItem) {
                saveCurrentEditingItem();
            }

            currentlyEditing = projectItem;

            projectText.readOnly = false;
            projectText.classList.add("editing");
            editIcon.style.display = "none";
            deleteIcon.style.display = "none";
            confirmIcon.style.display = "inline";
            cancelIcon.style.display = "inline";

        });

        deleteIcon.addEventListener("click", function () {
            const projectItem = this.closest(".task-item");

            projectItem.classList.add("scale-out");

            projectItem.addEventListener("animationend", function () {
                const projectIndex = projects.findIndex(project => project.name === projectName);
                projects.splice(projectIndex, 1);
                saveProjects(projects);

                projectItem.remove();
                updateCompletedProjectsCount(projects.filter(project => project.completed).length);
            }, { once: true });
        });




        confirmIcon.addEventListener("click", function () {
            saveCurrentEdit();
        });

        cancelIcon.addEventListener("click", function () {
            cancelCurrentEdit();
        });

        function saveCurrentEdit() {
            saveCurrentEditingItem();
            if (!currentlyEditing) return;

            const currentProjectText = projectText.value.trim();

            if (currentProjectText && !projects.some(project => project.name === currentProjectText)) {
                const projectIndex = projects.findIndex(project => project.name === projectName);
                const oldProjectName = projects[projectIndex].name;

                projects[projectIndex].name = currentProjectText;
                saveProjects(projects);

                const tasks = JSON.parse(localStorage.getItem(`tasks_${oldProjectName}`)) || [];
                localStorage.removeItem(`tasks_${oldProjectName}`);
                localStorage.setItem(`tasks_${currentProjectText}`, JSON.stringify(tasks));

                projectName = currentProjectText;
            } else {
                projectText.value = projectName;
            }

            resetEditState();
        }

        function cancelCurrentEdit() {
            saveCurrentEditingItem();
            if (!currentlyEditing) return;

            projectText.value = projectName;
            resetEditState();

        }

        function resetEditState() {
            if (!currentlyEditing) return;

            projectText.readOnly = true;
            projectText.classList.remove("editing");
            editIcon.style.display = "inline";
            deleteIcon.style.display = "inline";
            confirmIcon.style.display = "none";
            cancelIcon.style.display = "none";

            currentlyEditing = null;
        }

    }

    function openProject(projectName) {
        headerTitle.textContent = projectName;
        projectNameInput.style.display = "none";
        addProjectButton.style.display = "none";
        taskInput.style.display = "block";
        addTaskButton.style.display = "block";
        projectTasks.style.display = "block";
        projectList.style.display = "none";
        completedProjectsContainer.style.display = "none";
        document.getElementById("projects").style.display = "none";
        backArrow.style.display = "flex";
        taskList.innerHTML = "";
        completedTaskList.innerHTML = "";
        completedTasksContainer.style.display = "none";

        let tasks = JSON.parse(localStorage.getItem(`tasks_${projectName}`)) || [];
        let completedTasks = tasks.filter(task => task.completed);
        updateCompletedCount(completedTasks.length);

        for (const task of tasks) {
            addTaskToDOM(task.text, task.completed, task.originalIndex);
        }

        addTaskButton.addEventListener("click", function () {
            const taskText = taskInput.value;
            if (taskText === "") return;

            const tasks = JSON.parse(localStorage.getItem(`tasks_${headerTitle.textContent}`)) || [];
            const task = { text: taskText, completed: false, originalIndex: Date.now() };
            tasks.push(task);
            addTaskToDOM(task.text, task.completed, task.originalIndex);
            saveTasks(headerTitle.textContent, tasks);
            taskInput.value = "";
        });

        taskInput.addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                addTaskButton.click();
            }
        });

        function addTaskToDOM(text, completed, originalIndex) {
            const taskId = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const taskItem = document.createElement("li");
            taskItem.className = "task-item";
            taskItem.id = taskId;

            const taskContainer = document.createElement("div");
            taskContainer.className = "task-container";

            const taskLabel = document.createElement("label");
            taskLabel.className = "check-container";

            const taskCheckbox = document.createElement("input");
            taskCheckbox.type = "checkbox";
            taskCheckbox.className = "task-checkbox";
            taskCheckbox.id = `cbx-${taskId}`;
            taskCheckbox.checked = completed;

            const taskCheckmark = document.createElement("div");
            taskCheckmark.className = "task-checkmark";

            taskLabel.appendChild(taskCheckbox);
            taskLabel.appendChild(taskCheckmark);

            const taskText = document.createElement("textarea");
            taskText.className = "task-input";
            taskText.value = text;
            taskText.readOnly = true;

            if (completed) {
                taskText.style.textDecoration = "line-through";
                taskText.style.color = "grey";
            } else {
                taskText.style.textDecoration = "none";
                taskText.style.color = "";
            }

            const taskIcons = document.createElement("span");
            taskIcons.className = "icons";

            const editIcon = document.createElement("i");
            editIcon.className = "fas fa-edit edit";
            editIcon.title = "Edit";

            const deleteIcon = document.createElement("i");
            deleteIcon.className = "fas fa-trash delete";
            deleteIcon.title = "Delete";

            const confirmIcon = document.createElement("i");
            confirmIcon.className = "fas fa-check confirm-edit";
            confirmIcon.style.display = "none";
            confirmIcon.title = "Confirm";

            const cancelIcon = document.createElement("i");
            cancelIcon.className = "fas fa-times cancel-edit";
            cancelIcon.style.display = "none";
            cancelIcon.title = "Cancel";

            taskItem.classList.add("just-added");

            taskContainer.appendChild(taskLabel);
            taskContainer.appendChild(taskText);
            taskItem.appendChild(taskContainer);
            taskItem.appendChild(taskIcons);

            taskIcons.appendChild(editIcon);
            taskIcons.appendChild(deleteIcon);
            taskIcons.appendChild(confirmIcon);
            taskIcons.appendChild(cancelIcon);

            if (completed) {
                taskText.style.textDecoration = "line-through";
                taskText.style.color = "grey";
                completedTaskList.appendChild(taskItem);
            } else {
                taskList.appendChild(taskItem);
            }

            taskCheckbox.addEventListener("change", function () {
                const taskItem = this.closest(".task-item");

                if (!taskItem.classList.contains("just-added")) {
                    taskItem.classList.add("checked");
                }

                setTimeout(() => {
                    const tasks = JSON.parse(localStorage.getItem(`tasks_${headerTitle.textContent}`)) || [];
                    const taskIndex = tasks.findIndex(task => task.text === text);
                    tasks[taskIndex].completed = taskCheckbox.checked;

                    if (taskCheckbox.checked) {
                        taskText.style.textDecoration = "line-through";
                        taskText.style.color = "grey";
                        taskItem.classList.add("scale-out");
                        taskItem.addEventListener("animationend", function () {
                            taskList.removeChild(taskItem);
                            completedTaskList.appendChild(taskItem);
                            taskItem.classList.remove("scale-out");
                            taskItem.classList.add("scale-in");
                            taskItem.addEventListener("animationend", function () {
                                taskItem.classList.remove("scale-in");
                            }, { once: true });
                        }, { once: true });
                    } else {
                        taskText.style.textDecoration = "none";
                        taskText.style.color = "";
                        completedTaskList.removeChild(taskItem);
                        taskList.appendChild(taskItem);
                        taskItem.classList.add("scale-in");
                        taskItem.addEventListener("animationend", function () {
                            taskItem.classList.remove("scale-in");
                        }, { once: true });
                    }

                    if (!taskItem.classList.contains("just-added")) {
                        taskItem.classList.remove("checked");
                    }
                    taskItem.classList.remove("just-added");

                    updateCompletedCount(tasks.filter(task => task.completed).length);
                    saveTasks(headerTitle.textContent, tasks);
                }, 300);
            });

            editIcon.addEventListener("click", function () {
                if (currentlyEditing && currentlyEditing !== taskItem) {
                    saveCurrentEditingItem();
                }

                currentlyEditing = taskItem;

                taskText.readOnly = false;
                taskText.classList.add("editing");
                editIcon.style.display = "none";
                deleteIcon.style.display = "none";
                confirmIcon.style.display = "inline";
                cancelIcon.style.display = "inline";
            });

            confirmIcon.addEventListener("click", function () {
                saveCurrentEdit();
            });

            cancelIcon.addEventListener("click", function () {
                cancelCurrentEdit();
            });

            deleteIcon.addEventListener("click", function () {
                const taskItem = this.closest(".task-item");

                taskItem.classList.add("scale-out");

                taskItem.addEventListener("animationend", function () {
                    const taskIndex = tasks.findIndex(task => task.text === taskText.textContent);
                    tasks.splice(taskIndex, 1);
                    saveTasks(headerTitle.textContent, tasks);

                    taskItem.remove();
                    updateCompletedCount(tasks.filter(task => task.completed).length);
                }, { once: true });
            });


            function saveCurrentEdit() {
                if (!currentlyEditing) return;

                const currentTaskText = currentlyEditing.querySelector('.task-input');
                const newText = currentTaskText.value.trim();

                if (newText && !tasks.some(task => task.text === newText)) {
                    const taskIndex = tasks.findIndex(task => task.text === text);
                    tasks[taskIndex].text = newText;
                    saveTasks(headerTitle.textContent, tasks);
                    text = newText;
                } else {
                    currentTaskText.value = text;
                }

                resetEditState();
            }

            function cancelCurrentEdit() {
                if (!currentlyEditing) return;

                const currentTaskText = currentlyEditing.querySelector('.task-input');
                currentTaskText.value = text;
                resetEditState();
            }

            function resetEditState() {
                if (!currentlyEditing) return;

                const currentTaskText = currentlyEditing.querySelector('.task-input');
                const currentEditIcon = currentlyEditing.querySelector('.edit');
                const currentDeleteIcon = currentlyEditing.querySelector('.delete');
                const currentConfirmIcon = currentlyEditing.querySelector('.confirm-edit');
                const currentCancelIcon = currentlyEditing.querySelector('.cancel-edit');

                currentTaskText.readOnly = true;
                currentTaskText.classList.remove("editing");
                currentEditIcon.style.display = "inline";
                currentDeleteIcon.style.display = "inline";
                currentConfirmIcon.style.display = "none";
                currentCancelIcon.style.display = "none";

                currentlyEditing = null;
            }
        }


    }

    function saveCurrentEditingItem() {
        if (currentlyEditing) {
            const confirmButton = currentlyEditing.querySelector('.confirm-edit');
            confirmButton.click();
        }
    }


    backArrow.addEventListener("click", function () {
        saveCurrentEditingItem();

        headerTitle.textContent = "Projects";
        projectNameInput.style.display = "block";
        addProjectButton.style.display = "block";
        taskInput.style.display = "none";
        addTaskButton.style.display = "none";
        projectList.style.display = "block";
        projectTasks.style.display = "none";
        backArrow.style.display = "none";
        document.getElementById("projects").style.display = "block";
        taskList.innerHTML = "";
        completedTaskList.innerHTML = "";
        completedTasksContainer.style.display = "none";

        const completedProjects = projects.filter(project => project.completed);
        if (completedProjects.length > 0) {
            completedProjectsContainer.style.display = "block";
        } else {
            completedProjectsContainer.style.display = "none";
        }
    });

    function checkInitialVisibility(list, toggleIcon) {
        const isVisible = list.classList.contains("visible");

        if (isVisible) {
            toggleIcon.classList.add("up");
            toggleIcon.classList.remove("down");
        } else {
            toggleIcon.classList.add("down");
            toggleIcon.classList.remove("up");
        }
    }

    // Funkcija za toggle liste zadataka
    function toggleTaskList(header, list, toggleIcon) {
        const isVisible = list.classList.contains("visible");

        if (isVisible) {
            list.style.height = list.scrollHeight + "px";
            list.classList.remove("visible");
            list.classList.add("hidden");

            list.offsetHeight; // trigger reflow

            list.style.height = "0";

            setTimeout(() => {
                list.style.display = "none";
            }, 300);
        } else {
            list.style.display = "block";
            list.style.height = "0";

            list.offsetHeight; // trigger reflow

            list.style.height = list.scrollHeight + "px";
            list.classList.remove("hidden");
            list.classList.add("visible");

            setTimeout(() => {
                list.style.height = "auto";
            }, 300);
        }

        toggleIcon.classList.toggle("up", !isVisible);
        toggleIcon.classList.toggle("down", isVisible);
    }

    // Dodavanje event listenera za klik na header
    completedTasksHeader.addEventListener("click", function () {
        toggleTaskList(completedTasksHeader, completedTaskList, toggleCompleted);
    });

    completedProjectsHeader.addEventListener("click", function () {
        toggleTaskList(completedProjectsHeader, completedProjectList, toggleCompletedProjects);
    });

    // Inicijalna provera stanja strelica
    checkInitialVisibility(completedTaskList, toggleCompleted);
    checkInitialVisibility(completedProjectList, toggleCompletedProjects);

    function moveTaskToCompleted(taskItem) {
        taskItem.classList.add("scale-out");

        taskItem.addEventListener("animationend", function () {
            completedTaskList.appendChild(taskItem);

            taskItem.classList.remove("scale-out");
            taskItem.classList.add("scale-in");

            taskItem.addEventListener("animationend", function () {
                taskItem.classList.remove("scale-in");
            }, { once: true });
        }, { once: true });
    }

    document.querySelector("#addTask").addEventListener("click", function () {
        const taskText = taskInput.value;
        if (taskText === "") return;

        const tasks = JSON.parse(localStorage.getItem(`tasks_${headerTitle.textContent}`)) || [];
        const task = { text: taskText, completed: false, originalIndex: Date.now() };
        tasks.push(task);
        addTaskToDOM(task.text, task.completed, task.originalIndex);
        saveTasks(headerTitle.textContent, tasks);
        taskInput.value = "";
    });




    function saveProjects(projects) {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    function saveTasks(projectName, tasks) {
        localStorage.setItem(`tasks_${projectName}`, JSON.stringify(tasks));
    }

    function updateCompletedCount(count) {
        completedCount.textContent = count;
        completedTasksContainer.style.display = count > 0 ? "flex" : "none";
    }

    function updateCompletedProjectsCount(count) {
        completedProjectsCount.textContent = count;
        completedProjectsContainer.style.display = count > 0 ? "flex" : "none";
    }
});

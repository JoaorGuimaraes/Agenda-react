import { useEffect, useState } from "react";

import "../styles/tasklist.scss";

import { FiCheckSquare, FiTrash } from "react-icons/fi";

import { Box, Button, Modal, TextField, Typography } from "@mui/material";

import { api } from "../Services/api";

interface Task {
  id: number;
  title: string;
  date: string;
  isCompleted: boolean;
  description: string;
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export function TaskList() {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const [itemModalAberto, setItemModalAberto] = useState<Task>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [description, setDescription] = useState("");
  const [isRefresh, setIsRefresh] = useState(true);
  useEffect(() => {
    if (isRefresh) {
      api.get("/tasks").then((response) => setTasks(response.data));
      setIsRefresh(false);
    }
  }, [isRefresh]);

  function handleOpenModal(task: Task) {
    setDescription(task.description);
    setItemModalAberto(task);

    setOpen(true);
  }

  function handleCreateNewTask() {
    if (newTaskTitle && newTaskDate) {
      api
        .post("/tasks", {
          title: newTaskTitle,
          id: Math.random(),
          date: newTaskDate,
          description: "",
          isCompleted: false,
        })
        .catch(() => alert("Something wrong... sorry"))
        .finally(() => setIsRefresh(true));

      setNewTaskTitle("");
      setNewTaskDate("");
    } else {
      alert("The task cannot receive an empty title");
    }
  }

  function handleToggleTaskCompletion(task: Task) {
    api
      .patch(`/tasks/${task.id}`, { isCompleted: !task.isCompleted })
      .catch(() => alert("Something wrong... sorry"))
      .finally(() => setIsRefresh(true));
  }

  function handleRemoveTask(id: number) {
    api
      .delete(`/tasks/${id}`)
      .catch(() => alert("Something wrong... sorry"))
      .finally(() => setIsRefresh(true));
  }

  function addDescription() {
    if (itemModalAberto && description) {
      api
        .patch(`/tasks/${itemModalAberto.id}`, { description: description })
        .catch(() => alert("Something wrong... sorry"))
        .finally(() => setIsRefresh(true));
      setDescription("");
    }
  }

  return (
    <section className="task-list container">
      <header>
        <h2>My tasks</h2>

        <div className="input-group">
          <input
            type="text"
            placeholder="Adicionar novo todo"
            onChange={(e) => setNewTaskTitle(e.target.value)}
            value={newTaskTitle}
          />
          <input
            type="text"
            placeholder="Adicionar data"
            onChange={(e) => setNewTaskDate(e.target.value)}
            value={newTaskDate}
          />
          <button
            type="submit"
            data-testid="add-task-button"
            onClick={handleCreateNewTask}
          >
            <FiCheckSquare size={16} color="#fff" />
          </button>
        </div>
      </header>

      <main>
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <div
                className={task.isCompleted ? "completed" : ""}
                data-testid="task"
              >
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    readOnly
                    checked={task.isCompleted}
                    onClick={() => handleToggleTaskCompletion(task)}
                  />
                  <span className="checkmark"></span>
                </label>
                <p>{task.title}</p>
                <p style={{ display: "flex", justifyContent: "right" }}>
                  {task.date}
                </p>
              </div>
              <Button onClick={() => handleOpenModal(task)}>description</Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRemoveTask(task.id)}
              >
                <p>delete this task</p>
                <FiTrash size={16} />
              </Button>
            </li>
          ))}
        </ul>
      </main>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Description:
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <TextField
              id="filled-multiline-static"
              label="Multiline"
              multiline
              rows={4}
              defaultValue={description}
              variant="filled"
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button
              variant="contained"
              type="submit"
              onClick={() => {
                addDescription();
                setOpen(false);
              }}
            >
              Save
            </Button>
          </Typography>
        </Box>
      </Modal>
    </section>
  );
}

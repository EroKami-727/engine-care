<<<<<<< HEAD
# EngineCare

EngineCare is a predictive maintenance solution that estimates the Remaining Useful Life (RUL) of aircraft engines. It features a web-based interface for uploading engine sensor data and an intelligent backend that dynamically scales resources to perform analysis, providing a cost-effective and powerful tool for engine maintenance planning.

## Features

-   **Web Interface:** A clean, user-friendly frontend built with React for uploading engine data files.
-   **RUL Prediction:** Utilizes a pre-trained machine learning model (`engine_model.pkl`) to predict the remaining operational cycles of an engine.
-   **Dynamic Scaling:** The backend manager (`manager.py`) intelligently launches and terminates Dockerized worker instances (`main.py`) on-demand for each prediction request.
-   **Cost-Efficient:** Workers are automatically shut down after a period of inactivity (5 minutes), minimizing resource consumption and operational costs.
-   **Containerized Workers:** The prediction model runs in a sandboxed Docker container, ensuring a consistent and reliable environment.

## Project Structure

```
EngineCare/
├── backend/            # Python backend (FastAPI)
│   ├── main.py         # The worker process that runs predictions inside Docker
│   └── manager.py      # The main manager that listens for requests and spawns workers
├── data/               # Engine sensor data and documentation
├── frontend/           # React frontend application
├── models/             # Trained machine learning model
├── Dockerfile          # Defines the environment for the prediction worker
└── SHOWTIME.md         # A step-by-step guide for a live demo
```

## How It Works

1.  A user uploads an engine data file via the React frontend.
2.  The request is sent to the `manager.py` script, which is exposed to the internet via Ngrok.
3.  The manager receives the request and spins up a new Docker container named `engine-worker-instance`. This worker runs the `main.py` script.
4.  The manager forwards the data file to the worker.
5.  The worker's FastAPI server loads the `engine_model.pkl` model, processes the data, and returns the predicted RUL.
6.  The result is displayed to the user on the website.
7.  After 5 minutes of inactivity, the manager automatically stops and removes the Docker container to save resources.

## Getting Started

Refer to `SHOWTIME.md` for a detailed guide on setting up the project for a live demonstration.
=======
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

While this project uses React, Vite supports many popular JS frameworks. [See all the supported frameworks](https://vitejs.dev/guide/#scaffolding-your-first-vite-project).

## Deploy Your Own

Deploy your own Vite project with Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/examples/tree/main/framework-boilerplates/vite-react&template=vite-react)

_Live Example: https://vite-react-example.vercel.app_

### Deploying From Your Terminal

You can deploy your new Vite project with a single command from your terminal using [Vercel CLI](https://vercel.com/download):

```shell
$ vercel
```
>>>>>>> 2d7c4c036d44252566628b5de84778a80ebbb0ec

import docker
import time
import httpx
import asyncio
import pandas as pd
import random
import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.theme import Theme

# --- PRETTY CONSOLE SETUP ---
custom_theme = Theme({
    "info": "cyan",
    "warning": "yellow",
    "error": "bold red",
    "success": "bold green",
    "system": "dim white"
})
console = Console(theme=custom_theme)

# --- CONFIGURATION ---
IMAGE_NAME = "engine-care-worker"
CONTAINER_NAME = "engine-worker"
WORKER_PORT = 8000
HOST_PORT = 8001
IDLE_TIMEOUT = 300 
TEST_DATA_PATH = "../data/test_FD001.txt"

# Global State
last_activity = time.time()
client = docker.from_env()
test_data_cache = None

# --- HELPERS ---
def log_event(title, message, style="info"):
    """Prints a pretty log entry."""
    console.print(f"[{style}]➜ {title}:[/] {message}")

def load_sample_data():
    global test_data_cache
    if test_data_cache is None:
        console.log("[system]Loading Test Data for Simulation...[/]")
        cols = ['unit_number', 'time', 'op1', 'op2', 'op3'] + [f'sensor_{i}' for i in range(1, 22)]
        try:
            if not os.path.exists(TEST_DATA_PATH):
                log_event("DATA ERROR", "Test data file missing", "error")
                return None
            df = pd.read_csv(TEST_DATA_PATH, sep=r'\s+', header=None, names=cols)
            test_data_cache = df
            log_event("SYSTEM", "Test Data Loaded into Memory", "success")
        except Exception as e:
            log_event("ERROR", str(e), "error")
            return None
    return test_data_cache

# --- LIFECYCLE ---
async def monitor_idle_container():
    global last_activity
    while True:
        await asyncio.sleep(60)
        try:
            container = client.containers.get(CONTAINER_NAME)
            if container.status == "running":
                idle_time = time.time() - last_activity
                if idle_time > IDLE_TIMEOUT:
                    log_event("AUTO-SCALING", f"Container idle for {int(idle_time)}s. Stopping...", "warning")
                    container.stop()
        except Exception:
            pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    console.print(Panel.fit("[bold blue]ENGINE CARE MANAGER[/]\n[white]Zero-Ops Orchestrator Online[/]", border_style="blue"))
    load_sample_data()
    asyncio.create_task(monitor_idle_container())
    yield
    console.print("[bold red]Shutting down Manager...[/]")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DOCKER LOGIC ---
def get_or_create_worker():
    global last_activity
    last_activity = time.time()

    try:
        try:
            container = client.containers.get(CONTAINER_NAME)
            status = container.status
            if status != "running":
                log_event("COLD START", "Waking up dormant container...", "warning")
                container.start()
                time.sleep(2)
                log_event("CONTAINER", "Worker is now Active", "success")
            else:
                # console.log("[system]Container is already warm.[/]")
                pass
        except docker.errors.NotFound:
            log_event("DEPLOY", "Provisioning new Docker container...", "warning")
            container = client.containers.run(
                IMAGE_NAME,
                name=CONTAINER_NAME,
                ports={f"{WORKER_PORT}/tcp": HOST_PORT},
                detach=True,
                mem_limit="4g"
            )
            time.sleep(3)
            log_event("DEPLOY", "Container Successfully Deployed", "success")

        return f"http://localhost:{HOST_PORT}"

    except Exception as e:
        log_event("CRITICAL", f"Docker Failure: {e}", "error")
        raise HTTPException(status_code=500, detail="Worker failed")

# --- ROUTES ---

@app.get("/simulate/sample")
def get_random_sample():
    log_event("REQUEST", "Frontend requested simulation data", "info")
    df = load_sample_data()
    if df is None: raise HTTPException(status_code=500)
    
    random_unit = random.choice(df['unit_number'].unique())
    engine_data = df[df['unit_number'] == random_unit]
    
    if len(engine_data) < 50:
        padding = [engine_data.iloc[0].values.tolist()] * (50 - len(engine_data))
        data_seq = padding + engine_data.values.tolist()
    else:
        data_seq = engine_data.iloc[-50:].values.tolist()
    
    clean_seq = [row[2:26] for row in data_seq]
    
    log_event("DATA", f"Serving sequence for Unit #{random_unit}", "success")
    return {"unit_id": int(random_unit), "sequence": clean_seq}

@app.post("/predict/jet-engine")
async def proxy_prediction(request: Request):
    log_event("INFERENCE", "Received Prediction Request. Forwarding to AI...", "info")
    worker_url = get_or_create_worker()
    
    try:
        payload = await request.json()
        async with httpx.AsyncClient() as client_http:
            response = await client_http.post(f"{worker_url}/predict", json=payload, timeout=10.0)
            
        if response.status_code == 200:
            data = response.json()
            rul = data['prediction']['rul']
            log_event("RESULT", f"AI Predicted RUL: {rul} cycles", "success")
            return data
        else:
            log_event("WORKER ERROR", response.text, "error")
            raise HTTPException(status_code=response.status_code)

    except Exception as e:
        log_event("NETWORK ERROR", str(e), "error")
        raise HTTPException(status_code=502)
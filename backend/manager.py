import docker
import time
import requests
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import threading

# --- CONFIGURATION ---
app = FastAPI(title="Zero-Ops Manager")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = docker.from_env()

CONTAINER_NAME = "engine-worker-instance"
IMAGE_NAME = "engine-worker"       
TARGET_PORT = 8000                 
HOST_PORT = 8001
WORKER_IP = "127.0.0.1" # Force IPv4 to prevent connection hangs
MANAGER_PORT = 8000                

IDLE_TIMEOUT_SECONDS = 300 
last_activity_time = time.time()

def get_container():
    try:
        return client.containers.get(CONTAINER_NAME)
    except docker.errors.NotFound:
        return None

def start_worker_if_needed():
    container = get_container()
    if not container or container.status != "running":
        print("✅ Worker is offline. Starting container...")
        if container:
            try: container.remove(force=True)
            except: pass
        
        client.containers.run(
            IMAGE_NAME, name=CONTAINER_NAME, detach=True,
            ports={f"{TARGET_PORT}/tcp": HOST_PORT}
        )
        
        print("⏳ Waiting for worker to become healthy...")
        for _ in range(30):
            try:
                resp = requests.get(f"http://{WORKER_IP}:{HOST_PORT}/", timeout=1)
                if resp.status_code == 200:
                    print("🚀 Worker is ONLINE!")
                    return
            except:
                time.sleep(1)
        raise HTTPException(status_code=503, detail="Worker failed to start")

def stop_worker_if_idle():
    global last_activity_time
    if time.time() - last_activity_time > IDLE_TIMEOUT_SECONDS:
        container = get_container()
        if container and container.status == "running":
            print(f"💤 Inactive for {IDLE_TIMEOUT_SECONDS}s. Scaling to Zero...")
            container.stop()
            last_activity_time = time.time()

@app.get("/{path:path}")
async def proxy_get(path: str, request: Request):
    global last_activity_time
    last_activity_time = time.time()
    start_worker_if_needed()
    try:
        resp = requests.get(f"http://{WORKER_IP}:{HOST_PORT}/{path}", params=request.query_params)
        return JSONResponse(content=resp.json(), status_code=resp.status_code)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@app.post("/{path:path}")
async def proxy_post(path: str, request: Request):
    """Handle POST requests (Read Data FIRST, Start Docker SECOND)"""
    global last_activity_time
    last_activity_time = time.time()
    
    # ---------------------------------------------------------
    # STEP 1: READ DATA IMMEDIATELY (Prevents ClientDisconnect)
    # ---------------------------------------------------------
    files_to_send = {}
    json_to_send = None
    data_to_send = None
    content_type = request.headers.get("content-type", "")

    print("📥 Receiving request data...")
    
    try:
        if "multipart/form-data" in content_type:
            # Read the file NOW so Cloudflare knows we got it
            form = await request.form()
            file_obj = form.get("file")
            
            if file_obj:
                print(f"📄 Buffered file: {file_obj.filename}")
                file_bytes = await file_obj.read()
                # Prepare for forwarding
                files_to_send = {
                    "file": (file_obj.filename, file_bytes, file_obj.content_type)
                }
            else:
                # Fallback if form but no file
                pass
        else:
            # Standard JSON
            json_to_send = await request.json()
            
    except Exception as e:
        print(f"❌ Error reading client data: {e}")
        raise HTTPException(status_code=400, detail="Upload interrupted")

    # ---------------------------------------------------------
    # STEP 2: WAKE UP DOCKER (Now we can take our time)
    # ---------------------------------------------------------
    print("⚡ Data secured. Checking Worker status...")
    start_worker_if_needed()

    # ---------------------------------------------------------
    # STEP 3: FORWARD TO WORKER
    # ---------------------------------------------------------
    worker_url = f"http://{WORKER_IP}:{HOST_PORT}/{path}"
    print(f"🚀 Forwarding to: {worker_url}")

    try:
        if files_to_send:
            resp = requests.post(worker_url, files=files_to_send, params=request.query_params, timeout=30)
        elif json_to_send:
            resp = requests.post(worker_url, json=json_to_send, params=request.query_params, timeout=30)
        else:
            # Fallback (rare)
            resp = requests.post(worker_url, params=request.query_params, timeout=30)

        return JSONResponse(content=resp.json(), status_code=resp.status_code)

    except Exception as e:
        print(f"❌ Proxy Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def idle_monitor():
    while True:
        time.sleep(10)
        stop_worker_if_idle()

threading.Thread(target=idle_monitor, daemon=True).start()

if __name__ == "__main__":
    print(f"🚀 Zero-Ops Manager listening on http://0.0.0.0:{MANAGER_PORT}")
    uvicorn.run(app, host="0.0.0.0", port=MANAGER_PORT)
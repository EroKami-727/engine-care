# Showtime: A Step-by-Step Demo Guide

This guide provides the steps to run a live demonstration of the EngineCare project.

## Part 1: The "Permanent URL" Fix

To ensure the deployed frontend can consistently communicate with your local backend, you need a static URL from Ngrok.

### Claim your Static Domain:

1.  Go to [dashboard.ngrok.com](https://dashboard.ngrok.com).
2.  Click **+ Create Domain**.
3.  Ngrok will provide a static domain, for example: `grizzly-heroic-pigeon.ngrok-free.app`.

### Update Frontend (One last time):

1.  Open `frontend/src/App.tsx`.
2.  Set the `API_URL` constant to your new static domain:

    ```typescript
    const API_URL = "https://grizzly-heroic-pigeon.ngrok-free.app";
    ```

3.  Deploy to Vercel by pushing your changes to GitHub. Vercel will now always use this static link.

## Part 2: The "Showtime" Pipeline

This is the routine for starting the backend services. You will need three terminal tabs. No need to open a code editor.

**Pre-requisite:** Boot up your laptop.

### Terminal 1: The Brain (Manager)

This runs the Python script that listens for and manages requests.

```bash
# 1. Activate the environment
source ~/Coding/venvs/enginecare/bin/activate.fish

# 2. Run the Manager
python ~/Coding/Projects/EngineCare/backend/manager.py
```

### Terminal 2: The Bridge (Ngrok)

This connects your local backend to the public, static URL.

```bash
# Use the --domain flag with your static name!
ngrok http --domain=grizzly-heroic-pigeon.ngrok-free.app 8000
```

> **Note:** Make sure the output says "Forwarding... -> localhost:8000".

### Terminal 3: The Proof (Docker Watch)

This terminal is for demonstrating the dynamic scaling of worker instances.

```bash
watch docker ps
```

## Part 3: The Demo Flow

1.  **Show the Empty Terminal:** Point to Terminal 3 and say, "Look, no servers running. 0 RAM usage."

2.  **Open the Website:** Open your Vercel link (e.g., `engine-care.vercel.app`) on your phone or another laptop.

3.  **Upload File:** Click "Run Diagnostics" and upload a relevant data file.

4.  **The Magic:**
    *   **Terminal 1** will show scrolling text: `Receiving request... Waking Worker...`
    *   **Terminal 3** will suddenly show a new container: `engine-worker-instance Up 2 seconds`.
    *   The **Website** will display the result: `Predicted RUL: 16 Cycles`.

5.  **The Drop:** Continue talking for about 5 minutes.

6.  **The Finale:** After the worker has been idle, it will shut down. The container will vanish from the list in **Terminal 3**. You can then say, "And now it scaled to zero to save costs."

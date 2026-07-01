# Vertex AI Llama Fine-tuning

This folder supports the app provider `vertex-llama`.

What it does:
- Uploads the app's valid fine-tuning examples as chat JSONL to `gs://<bucket>/open-model-tuning/...`.
- Submits a Vertex AI managed open-model SFT job through the Python SDK.
- Defaults to `meta/llama3-3@llama-3.3-70b-instruct` with `PEFT_ADAPTER` tuning.

Install the SDK in the repo venv:

```powershell
.\.venv\Scripts\python.exe -m pip install -r training\vertex_open_model_tuning\requirements.txt
```

Backend environment needed:

```env
GOOGLE_CLOUD_PROJECT=copy-writing-499306
GOOGLE_CLOUD_LOCATION=us-central1
VERTEX_TUNING_BUCKET=copy-writing-499306-vertex-tuning
VERTEX_LLAMA_TUNING_BASE_MODELS=meta/llama3-3@llama-3.3-70b-instruct
VERTEX_LLAMA_TUNING_PYTHON=.venv/Scripts/python.exe
VERTEX_LLAMA_TUNING_MODE=PEFT_ADAPTER
# Optional adapter size accepted by current SDK: 1, 4, 8, 16, or 32.
VERTEX_LLAMA_TUNING_ADAPTER_SIZE=
```

Create the tuning bucket and grant Vertex managed open-model tuning access:

```powershell
.\scripts\setup_vertex_tuning_bucket.ps1
```

The script grants the Vertex MOSS fine-tuning service account `service-167488791850@gcp-sa-vertex-moss-ft.iam.gserviceaccount.com` the bucket roles needed for `storage.objects.get`, `storage.objects.create`, `storage.objects.delete`, and `storage.buckets.get`.

Preflight the Python SDK without creating a paid tuning job:

```powershell
@'
{"preflight": true}
'@ | Set-Content -Encoding UTF8 $env:TEMP\vertex-llama-preflight.json
.\.venv\Scripts\python.exe training\vertex_open_model_tuning\submit_open_model_tuning.py --config $env:TEMP\vertex-llama-preflight.json
```

Run through the app:
- Open `/fine-tune`.
- Pick provider `Vertex AI Llama Fine-tuning`.
- Pick base model `Llama 3.3 70B Instruct`.
- Add at least 10 valid examples. Use 50-100+ for a visible voice shift.
- Start training.

Important notes:
- This creates a paid Vertex AI tuning job.
- The tuned output might be a deployable tuned model, endpoint, or PEFT adapter depending on Vertex response. The app only promotes it to Generator when Vertex returns a usable tuned model id.
- If the submit step fails with a Python SDK error, upgrade `google-cloud-aiplatform` in the venv.

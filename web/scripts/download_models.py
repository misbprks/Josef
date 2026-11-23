from huggingface_hub import snapshot_download
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "public" / "models"
MODELS = ["Xenova/opus-mt-en-id", "Xenova/opus-mt-id-en"]
ALLOW = [
    "*.json", "*.txt", "*.model", "*.spm",
    "onnx/*.onnx", "*.onnx"
]
for model in MODELS:
    destination = ROOT / model
    destination.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {model} into {destination}")
    snapshot_download(
        repo_id=model,
        local_dir=str(destination),
        allow_patterns=ALLOW,
    )
print("Model download step completed.")

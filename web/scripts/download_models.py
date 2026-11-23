from huggingface_hub import snapshot_download
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "public" / "models"
MODELS = ["Xenova/opus-mt-en-id", "Xenova/opus-mt-id-en"]

# Keep only the quantized encoder + merged decoder needed by the app.
# This avoids downloading multi-gigabyte fp32/fp16 and alternative graph variants.
ALLOW = [
    "config.json",
    "generation_config.json",
    "quantize_config.json",
    "special_tokens_map.json",
    "tokenizer.json",
    "tokenizer_config.json",
    "vocab.json",
    "source.spm",
    "target.spm",
    "onnx/encoder_model_quantized.onnx",
    "onnx/decoder_model_merged_quantized.onnx",
]

for model in MODELS:
    destination = ROOT / model
    destination.mkdir(parents=True, exist_ok=True)
    print(f"Downloading selected quantized files for {model}")
    snapshot_download(
        repo_id=model,
        local_dir=str(destination),
        allow_patterns=ALLOW,
    )

print("Both offline translation model snapshots downloaded.")

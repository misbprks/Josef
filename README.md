# IDEN Translator

Android app project for offline English ↔ Indonesian translation.

## Current implementation
- Android WebView shell (minimum Android API 26).
- Local browser UI with language swap, clear, copy, history, and dark mode.
- GitHub Actions downloads the two Xenova OPUS-MT model repositories and packages the web app into a debug APK.
- The Android manifest deliberately does not request INTERNET permission; runtime translation is intended to be local.

## Important build note
The workflow is an initial integration build, not yet a verified release. The ONNX model filenames/tokenizer compatibility and Android WebView WASM execution must be validated from the first GitHub Actions run. A successful Gradle build alone does not prove translation quality or offline inference on a physical device.

## Build
Push to `main` or manually run **Build IDEN Translator APK** in GitHub Actions. Download the artifact named `IDEN-Translator-debug-APK` when the workflow succeeds.

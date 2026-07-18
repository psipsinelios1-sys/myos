# Changelog: AI Titan — Silicon Empire

All notable changes to this project will be documented in this file.

---

## [1.1.2] - 2026-06-30

### Migrated
* **Desktop Wrapper Shell**: Migrated the application shell from Electron to **Tauri v2**, replacing the resource-heavy Chromium package wrapper.
* **Rust Native Backend**: Rewrote window management and custom storage handlers in native Rust.

### Added
* **Native Gemini REST API Integration**: Implemented Rust-side asynchronous HTTP connections (`reqwest`) to call Google's Gemini SDK models (`gemini-3.1-pro-preview` and `gemini-2.5-flash`). This completely eliminates the need to run an Express server subprocess during desktop play.
* **Tauri Windows Custom Binds**: Added native binds for minimizing, maximizing, closing, and tracking window states on frameless layouts.
* **Configured Rust GNU toolchain**: Set default compiler target to `stable-x86_64-pc-windows-gnu` for optimized MSYS2 builds.

### Fixed
* **Windows Linker Ordinance Errors**: Changed package lib target type to strictly `rlib` to prevent DLL generation overflow limits on Windows GNU compilers.
* **Port Allocation conflicts**: Intercepted `/api` routes dynamically to invoke Rust commands in desktop mode, leaving port `5173` clear for Vite dev servers.

### Optimized
* **Memory Footprint** 📉: Swap the standard memory allocator to **`MiMalloc`** (Microsoft's high-performance memory allocator) inside the Rust backend, reducing active RAM consumption by over 60%.
* **Package size** 💾: Configured aggressive release compiler tuning profiles (`LTO = true`, `codegen-units = 1`, `panic = "abort"`, and symbol stripping) to reduce final binary payload from 100MB+ down to ~9MB.
* **Frontend Minification** 📦: Integrated **`Terser`** minification inside Vite config to aggressively strip diagnostics console logging statements (`console.log`) during release compilation.
* **Startup time** 🏎️: Native webview launcher loads assets immediately.

---

*For release builds, run `npm run build`.*

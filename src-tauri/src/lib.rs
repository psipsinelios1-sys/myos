use tauri::Manager;
use serde::{Serialize, Deserialize};
use mimalloc::MiMalloc;
use std::sync::OnceLock;

#[global_allocator]
static GLOBAL: MiMalloc = MiMalloc;
use std::fs;
use std::path::PathBuf;

static HTTP_CLIENT: OnceLock<reqwest::Client> = OnceLock::new();

fn get_http_client() -> &'static reqwest::Client {
    HTTP_CLIENT.get_or_init(|| {
        reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(60)) // 60s timeout for local model cold-starts
            .build()
            .unwrap_or_else(|_| reqwest::Client::new())
    })
}

#[derive(Serialize, Deserialize, Default)]
struct Settings {
    #[serde(rename = "GEMINI_API_KEY")]
    gemini_api_key: Option<String>,
}

fn get_settings_path(app_handle: &tauri::AppHandle) -> PathBuf {
    let mut path = app_handle.path().app_local_data_dir().unwrap_or_else(|_| {
        std::env::current_dir().unwrap()
    });
    // Ensure parent dir exists
    let _ = fs::create_dir_all(&path);
    path.push("settings.json");
    path
}

fn read_raw_api_key(app_handle: &tauri::AppHandle) -> String {
    let path = get_settings_path(app_handle);
    if let Ok(content) = fs::read_to_string(path) {
        if let Ok(settings) = serde_json::from_str::<Settings>(&content) {
            if let Some(key) = settings.gemini_api_key {
                return key;
            }
        }
    }
    std::env::var("GEMINI_API_KEY").unwrap_or_default()
}

// Window commands
#[tauri::command]
fn minimize_window(window: tauri::Window) {
    let _ = window.minimize();
}

#[tauri::command]
fn maximize_window(window: tauri::Window) {
    if let Ok(true) = window.is_maximized() {
        let _ = window.unmaximize();
    } else {
        let _ = window.maximize();
    }
}

#[tauri::command]
fn close_window(window: tauri::Window) {
    let _ = window.close();
}

#[tauri::command]
fn is_window_maximized(window: tauri::Window) -> bool {
    window.is_maximized().unwrap_or(false)
}

#[tauri::command]
fn check_for_git_updates() -> Result<String, String> {
    use std::process::Command;

    // 1. Fetch from remote repository to update origin tracking branch
    let fetch_status = Command::new("git")
        .args(&["fetch", "origin"])
        .status();

    if let Err(e) = fetch_status {
        return Err(format!("Git fetch failed: {}", e));
    }

    // 2. Count commits between current local branch and origin/main
    let output = Command::new("git")
        .args(&["rev-list", "--count", "HEAD..origin/main"])
        .output();

    match output {
        Ok(out) => {
            if out.status.success() {
                let count_str = String::from_utf8_lossy(&out.stdout).trim().to_string();
                let count: i32 = count_str.parse().unwrap_or(0);
                if count > 0 {
                    let log_output = Command::new("git")
                        .args(&["log", "HEAD..origin/main", "--oneline", "-n", "5"])
                        .output();
                    let changelog = match log_output {
                        Ok(log_out) => String::from_utf8_lossy(&log_out.stdout).to_string(),
                        Err(_) => "".to_string(),
                    };
                    Ok(format!("UPDATE_AVAILABLE|{}|{}", count, changelog))
                } else {
                    Ok("UP_TO_DATE".to_string())
                }
            } else {
                Err(format!("Git check failed: {}", String::from_utf8_lossy(&out.stderr)))
            }
        }
        Err(e) => Err(format!("Failed to execute git: {}", e)),
    }
}

// API Key management
#[tauri::command]
fn get_api_key(app_handle: tauri::AppHandle) -> String {
    let path = get_settings_path(&app_handle);
    if let Ok(content) = fs::read_to_string(path) {
        if let Ok(settings) = serde_json::from_str::<Settings>(&content) {
            if let Some(key) = settings.gemini_api_key {
                if key.len() > 8 {
                    return format!("{}••••{}", &key[..4], &key[key.len() - 4..]);
                } else if !key.is_empty() {
                    return "••••••••".to_string();
                }
            }
        }
    }
    String::new()
}

#[tauri::command]
fn has_api_key(app_handle: tauri::AppHandle) -> bool {
    let path = get_settings_path(&app_handle);
    if let Ok(content) = fs::read_to_string(path) {
        if let Ok(settings) = serde_json::from_str::<Settings>(&content) {
            return settings.gemini_api_key.map_or(false, |k| !k.is_empty());
        }
    }
    false
}

#[tauri::command]
fn set_api_key(app_handle: tauri::AppHandle, key: String) -> bool {
    let path = get_settings_path(&app_handle);
    let mut settings = Settings::default();
    if let Ok(content) = fs::read_to_string(&path) {
        if let Ok(existing) = serde_json::from_str::<Settings>(&content) {
            settings = existing;
        }
    }
    settings.gemini_api_key = Some(key);
    if let Ok(json_str) = serde_json::to_string_pretty(&settings) {
        if fs::write(&path, json_str).is_ok() {
            return true;
        }
    }
    false
}

#[tauri::command]
fn clear_api_key(app_handle: tauri::AppHandle) -> bool {
    let path = get_settings_path(&app_handle);
    let mut settings = Settings::default();
    if let Ok(content) = fs::read_to_string(&path) {
        if let Ok(existing) = serde_json::from_str::<Settings>(&content) {
            settings = existing;
        }
    }
    settings.gemini_api_key = None;
    if let Ok(json_str) = serde_json::to_string_pretty(&settings) {
        if fs::write(&path, json_str).is_ok() {
            return true;
        }
    }
    false
}

// AI logic replacements
#[tauri::command]
async fn call_advisor(app_handle: tauri::AppHandle, prompt: String, model: Option<String>) -> Result<serde_json::Value, String> {
    let api_key = read_raw_api_key(&app_handle);
    if api_key.to_lowercase() == "ollama" {
        let url = "http://localhost:11434/api/chat";
        let body = serde_json::json!({
            "model": "llama3.1",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "stream": false
        });

        let client = get_http_client();
        if let Ok(response) = client.post(url).json(&body).send().await {
            if response.status().is_success() {
                if let Ok(json) = response.json::<serde_json::Value>().await {
                    if let Some(content) = json.pointer("/message/content") {
                        if let Some(text_str) = content.as_str() {
                            return Ok(serde_json::json!({ "response": text_str }));
                        }
                    }
                }
            }
        }
        return Ok(serde_json::json!({
            "response": "SYSTEM OFFLINE: Local Ollama service is not responding at http://localhost:11434. Please ensure Ollama is running and Llama 3.1 is downloaded."
        }));
    }

    if api_key.is_empty() {
        return Ok(serde_json::json!({
            "response": "SYSTEM OFFLINE: The AI Advisor requires a Gemini API Key. Please set it in Settings (gear icon in the title bar) to receive dynamic insights."
        }));
    }

    let selected_model = model.unwrap_or_else(|| "gemini-2.5-flash".to_string());
    let is_thinking_model = selected_model.contains("thinking");

    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
        selected_model, api_key
    );

    let client = get_http_client();

    let mut body = serde_json::json!({
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "safetySettings": [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_NONE"
            }
        ]
    });

    if is_thinking_model {
        body["config"] = serde_json::json!({
            "thinkingConfig": {
                "thinkingLevel": "HIGH"
            }
        });
    }

    let res = client.post(&url)
        .json(&body)
        .send()
        .await;

    match res {
        Ok(response) => {
            if response.status().is_success() {
                if let Ok(json) = response.json::<serde_json::Value>().await {
                    if let Some(candidates) = json.get("candidates") {
                        if let Some(candidate) = candidates.get(0) {
                            if let Some(content) = candidate.get("content") {
                                if let Some(parts) = content.get("parts") {
                                    if let Some(part) = parts.get(0) {
                                        if let Some(text) = part.get("text") {
                                            return Ok(serde_json::json!({ "response": text }));
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return Err("Unexpected response structure from Gemini API".to_string());
                }
                return Err("Failed to parse Gemini API JSON response".to_string());
            } else {
                let status = response.status().as_u16();
                if status == 429 {
                    // Try fallback to gemini-2.5-flash
                    let fallback_url = format!(
                        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={}",
                        api_key
                    );
                    let fallback_body = serde_json::json!({
                        "contents": [
                            {
                                "parts": [
                                    {
                                        "text": prompt
                                    }
                                ]
                            }
                        ]
                    });
                    if let Ok(fallback_res) = client.post(&fallback_url).json(&fallback_body).send().await {
                        if fallback_res.status().is_success() {
                            if let Ok(json) = fallback_res.json::<serde_json::Value>().await {
                                if let Some(text) = json.pointer("/candidates/0/content/parts/0/text") {
                                    return Ok(serde_json::json!({ "response": text }));
                                }
                            }
                        }
                    }
                }
                let err_text = response.text().await.unwrap_or_default();
                return Err(format!("Gemini API error ({}): {}", status, err_text));
            }
        }
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
async fn call_social_reply(
    app_handle: tauri::AppHandle,
    post_content: String,
    tone: String,
    company_name: String,
    hype_level: f64,
    sentiment: f64,
    past_posts: Vec<String>,
) -> Result<serde_json::Value, String> {
    let api_key = read_raw_api_key(&app_handle);
    if api_key.to_lowercase() == "ollama" {
        let mut past_posts_context = String::new();
        if !past_posts.is_empty() {
            past_posts_context = format!(
                "\nPast posts by the CEO for context (people remember these):\n- {}\n",
                past_posts.join("\n- ")
            );
        }

        let prompt = format!(
            "You are simulating replies on a tech social media platform like Twitter or Hacker News.\n\
             The user (CEO of an AI startup named {}) just posted this:\n\
             \"{}\"\n\
             {}\n\
             The current company stats are:\n\
             - PR Tone intended: {}\n\
             - Hype Level: {}\n\
             - Global Public Sentiment: {}%\n\n\
             Generate exactly 10 realistic, varied, and contextual replies to this post.\n\
             Return ONLY a valid JSON object. It MUST contain a single key \"replies\" which is an array of exactly 10 objects.\n\
             Format:\n\
             {{\n\
               \"replies\": [\n\
                 {{ \"handle\": \"@username1\", \"content\": \"first reply\", \"likes\": 15 }},\n\
                 {{ \"handle\": \"@username2\", \"content\": \"second reply\", \"likes\": 4 }}\n\
               ]\n\
             }}\n\
             Ensure the array contains exactly 10 objects.",
             company_name, post_content, past_posts_context, tone, hype_level, sentiment
        );

        let url = "http://localhost:11434/api/chat";
        let body = serde_json::json!({
            "model": "llama3.1",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "format": "json",
            "stream": false,
            "options": {
                "num_predict": 2048
            }
        });

        let client = get_http_client();
        match client.post(url).json(&body).send().await {
            Ok(response) => {
                if response.status().is_success() {
                    if let Ok(json) = response.json::<serde_json::Value>().await {
                        if let Some(content) = json.pointer("/message/content") {
                            if let Some(text_str) = content.as_str() {
                                let mut parsed_replies = None;

                                // Try parsing as array first by extracting everything between [ and ]
                                if let Some(start) = text_str.find('[') {
                                    if let Some(end) = text_str.rfind(']') {
                                        if start < end {
                                            let array_part = &text_str[start..=end];
                                            if let Ok(val) = serde_json::from_str::<serde_json::Value>(array_part) {
                                                parsed_replies = Some(val);
                                            }
                                        }
                                    }
                                }

                                // Try parsing as object if array search didn't yield a result
                                if parsed_replies.is_none() {
                                    if let Some(start) = text_str.find('{') {
                                        if let Some(end) = text_str.rfind('}') {
                                            if start < end {
                                                let obj_part = &text_str[start..=end];
                                                if let Ok(val) = serde_json::from_str::<serde_json::Value>(obj_part) {
                                                    if let Some(replies_val) = val.get("replies") {
                                                        parsed_replies = Some(replies_val.clone());
                                                    } else if let Some(replies_val) = val.pointer("/message/replies") {
                                                        parsed_replies = Some(replies_val.clone());
                                                    } else {
                                                        parsed_replies = Some(val);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                if let Some(replies) = parsed_replies {
                                    return Ok(serde_json::json!({ "replies": replies }));
                                } else {
                                    println!("[Ollama] Content was received but failed JSON structure validation. Raw content: {}", text_str);
                                }
                            }
                        }
                    } else {
                        println!("[Ollama] Failed to parse JSON response body");
                    }
                } else {
                    println!("[Ollama] Response status error: {}", response.status());
                }
            }
            Err(e) => {
                println!("[Ollama] Connection/Timeout error calling local service: {:?}", e);
            }
        }

        return Ok(serde_json::json!({
            "replies": [
                {
                    "handle": "@system_moderator",
                    "content": "Local Ollama service failed to respond. Make sure Ollama is running and Llama 3.1 is downloaded.",
                    "likes": 0,
                },
                {
                    "handle": "@tech_bro",
                    "content": "Not sure what to say about this one...",
                    "likes": 5,
                },
                {
                    "handle": "@ai_watcher",
                    "content": "Interesting strategy.",
                    "likes": 10,
                },
            ]
        }));
    }

    if api_key.is_empty() {
        return Ok(serde_json::json!({
            "replies": [
                {
                    "handle": "@tech_insider",
                    "content": "Interesting move. Let's see how the market reacts.",
                    "likes": 12,
                },
                {
                    "handle": "@dev_ops_guru",
                    "content": "Is this going to break production?",
                    "likes": 45,
                },
                {
                    "handle": "@venture_capitalist",
                    "content": "Scaling this will be the real challenge.",
                    "likes": 89,
                },
            ]
        }));
    }

    let mut past_posts_context = String::new();
    if !past_posts.is_empty() {
        past_posts_context = format!(
            "\nPast posts by the CEO for context (people remember these):\n- {}\n",
            past_posts.join("\n- ")
        );
    }

    let prompt = format!(
        "You are simulating replies on a tech social media platform like Twitter or Hacker News.\n\
         The user (CEO of an AI startup named {}) just posted this:\n\
         \"{}\"\n\
         {}\n\
         The current company stats are:\n\
         - PR Tone intended: {}\n\
         - Hype Level: {}\n\
         - Global Public Sentiment: {}%\n\n\
         Generate exactly 3 realistic, varied, and contextual replies to this post.\n\
         IMPORTANT: All 3 replies MUST be completely unique and distinct from each other. Do not repeat handles or text.\n\
         Return ONLY a valid JSON array of objects, with no markdown formatting around it (e.g., no ```json).\n\
         Each object MUST have:\n\
         {{\n\
           \"handle\": \"@username\",\n\
           \"content\": \"the reply text\",\n\
           \"likes\": number\n\
         }}",
         company_name, post_content, past_posts_context, tone, hype_level, sentiment
    );

    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={}",
        api_key
    );

    let client = get_http_client();
    let body = serde_json::json!({
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.9
        },
        "safetySettings": [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_NONE"
            }
        ]
    });

    let res = client.post(&url)
        .json(&body)
        .send()
        .await;

    match res {
        Ok(response) => {
            let status_code = response.status().as_u16();
            
            if response.status().is_success() {
                if let Ok(json) = response.json::<serde_json::Value>().await {
                    if let Some(text) = json.pointer("/candidates/0/content/parts/0/text") {
                        if let Some(text_str) = text.as_str() {
                            let mut text_clean = text_str.trim();
                            if text_clean.starts_with("```json") {
                                text_clean = text_clean.strip_prefix("```json").unwrap_or(text_clean);
                                text_clean = text_clean.strip_suffix("```").unwrap_or(text_clean);
                            } else if text_clean.starts_with("```") {
                                text_clean = text_clean.strip_prefix("```").unwrap_or(text_clean);
                                text_clean = text_clean.strip_suffix("```").unwrap_or(text_clean);
                            }
                            let text_clean = text_clean.trim();

                            if let Ok(parsed_replies) = serde_json::from_str::<serde_json::Value>(text_clean) {
                                return Ok(serde_json::json!({ "replies": parsed_replies }));
                            }
                        }
                    }
                }
                
                return Ok(serde_json::json!({
                    "replies": [
                        {
                            "handle": "@system_moderator",
                            "content": "JSON Parse Error: Gemini response did not match expected structure.",
                            "likes": 0,
                        },
                        {
                            "handle": "@tech_bro",
                            "content": "Not sure what to say about this one...",
                            "likes": 5,
                        },
                        {
                            "handle": "@ai_watcher",
                            "content": "Interesting strategy.",
                            "likes": 10,
                        },
                    ]
                }));
            }

            // Expose the raw error returned by Google
            let raw_text = response.text().await.unwrap_or_else(|_| "Empty response body".to_string());
            
            Ok(serde_json::json!({
                "replies": [
                    {
                        "handle": "@system_moderator",
                        "content": format!("Gemini API Error ({}): {}", status_code, raw_text),
                        "likes": 0,
                    },
                    {
                        "handle": "@tech_bro",
                        "content": "Not sure what to say about this one...",
                        "likes": 5,
                    },
                    {
                        "handle": "@ai_watcher",
                        "content": "Interesting strategy.",
                        "likes": 10,
                    },
                ]
            }))
        }
        Err(err) => {
            Ok(serde_json::json!({
                "replies": [
                    {
                        "handle": "@system_moderator",
                        "content": format!("Network connection failed: {}", err),
                        "likes": 0,
                    }
                ]
            }))
        }
    }
}

#[tauri::command]
async fn generate_user_reply(
    app_handle: tauri::AppHandle,
    draft_intent: String,
    original_post: String,
    tone: String,
    model: Option<String>,
) -> Result<serde_json::Value, String> {
    let api_key = read_raw_api_key(&app_handle);

    let post_context = if original_post.trim().is_empty() {
        "The CEO wants to publish a new main social media broadcast.".to_string()
    } else {
        format!("The CEO wants to reply to this social media post:\n\"{}\"", original_post)
    };

    let prompt = format!(
        "You are the PR Manager for a tech CEO.\n\
         {}\n\n\
         The CEO's rough draft / intent is:\n\
         \"{}\"\n\n\
         The desired tone is: {}\n\n\
         Expand this intent into a single, cohesive, and perfectly formatted corporate social media post.\n\
         Return ONLY the string content of the post. Do not include markdown quotes, prefixes, or explanations.",
         post_context, draft_intent, tone
    );

    if api_key.to_lowercase() == "ollama" {
        let url = "http://localhost:11434/api/chat";
        let body = serde_json::json!({
            "model": "llama3.1",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "stream": false
        });

        let client = get_http_client();
        if let Ok(response) = client.post(url).json(&body).send().await {
            if response.status().is_success() {
                if let Ok(json) = response.json::<serde_json::Value>().await {
                    if let Some(content) = json.pointer("/message/content") {
                        if let Some(text_str) = content.as_str() {
                            return Ok(serde_json::json!({ "response": text_str.trim() }));
                        }
                    }
                }
            }
        }
        return Ok(serde_json::json!({ "response": "ERROR: Local Ollama service failed to respond." }));
    }

    if api_key.is_empty() {
        return Ok(serde_json::json!({ "response": "ERROR: Gemini API Key missing." }));
    }

    let selected_model = model.unwrap_or_else(|| "gemini-2.5-flash".to_string());
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
        selected_model, api_key
    );

    let client = get_http_client();
    let body = serde_json::json!({
        "contents": [{ "parts": [{ "text": prompt }] }],
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    });

    match client.post(&url).json(&body).send().await {
        Ok(response) => {
            if response.status().is_success() {
                if let Ok(json) = response.json::<serde_json::Value>().await {
                    if let Some(candidates) = json.get("candidates") {
                        if let Some(candidate) = candidates.get(0) {
                            if let Some(content) = candidate.get("content") {
                                if let Some(parts) = content.get("parts") {
                                    if let Some(part) = parts.get(0) {
                                        if let Some(text) = part.get("text") {
                                            return Ok(serde_json::json!({ "response": text.as_str().unwrap_or("").trim() }));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                Ok(serde_json::json!({ "response": "ERROR: Unexpected Gemini API response structure." }))
            } else {
                let err_text = response.text().await.unwrap_or_default();
                Ok(serde_json::json!({ "response": format!("ERROR: Gemini API returned status. {}", err_text) }))
            }
        }
        Err(e) => Ok(serde_json::json!({ "response": format!("ERROR: Network connection failed: {}", e) }))
    }
}

#[tauri::command]
async fn generate_social_feed(
    app_handle: tauri::AppHandle,
    game_state_summary: String,
) -> Result<serde_json::Value, String> {
    let api_key = read_raw_api_key(&app_handle);

    let prompt = format!(
        "You are simulating the entire tech ecosystem and internet chatter around AI.\n\
         The current state of the AI industry is:\n\
         {}\n\n\
         Generate a JSON array of exactly 10 distinct, highly varied, context-aware social media posts.\n\
         The posts should come from different platforms (Twitter-style, Reddit-style, TikTok-style) and reflect the current state (hype, sentiment, models).\n\
         Return ONLY a valid JSON array of objects. Do NOT wrap it in markdown blockquotes like ```json.\n\
         Each object MUST have the following structure:\n\
         {{\n\
           \"handle\": \"@username or /u/username\",\n\
           \"platform\": \"TWITTER\" or \"REDDIT\" or \"TIKTOK\",\n\
           \"content\": \"the text of the post\",\n\
           \"sentiment\": \"POSITIVE\" or \"NEUTRAL\" or \"NEGATIVE\",\n\
           \"likes\": number (1 to 5000),\n\
           \"shares\": number (0 to 1000)\n\
         }}",
         game_state_summary
    );

    if api_key.to_lowercase() == "ollama" {
        // Fallback for local ollama
        let url = "http://localhost:11434/api/chat";
        let body = serde_json::json!({
            "model": "llama3.1",
            "messages": [{ "role": "user", "content": prompt }],
            "stream": false,
            "format": "json"
        });
        
        let client = get_http_client();
        if let Ok(response) = client.post(url).json(&body).send().await {
            if response.status().is_success() {
                if let Ok(json) = response.json::<serde_json::Value>().await {
                    if let Some(content) = json.pointer("/message/content") {
                        if let Some(text_str) = content.as_str() {
                            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(text_str) {
                                return Ok(parsed);
                            }
                        }
                    }
                }
            }
        }
        return Ok(serde_json::json!([]));
    }

    if api_key.is_empty() {
        return Ok(serde_json::json!([])); // Empty indicates failure to generate dynamic feed
    }

    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={}",
        api_key
    );

    let client = get_http_client();
    let body = serde_json::json!({
        "contents": [{ "parts": [{ "text": prompt }] }],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 1.0
        },
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    });

    match client.post(&url).json(&body).send().await {
        Ok(response) => {
            if response.status().is_success() {
                if let Ok(json) = response.json::<serde_json::Value>().await {
                    if let Some(text) = json.pointer("/candidates/0/content/parts/0/text") {
                        if let Some(text_str) = text.as_str() {
                            let mut text_clean = text_str.trim();
                            if text_clean.starts_with("```json") {
                                text_clean = text_clean.strip_prefix("```json").unwrap_or(text_clean);
                                text_clean = text_clean.strip_suffix("```").unwrap_or(text_clean);
                            } else if text_clean.starts_with("```") {
                                text_clean = text_clean.strip_prefix("```").unwrap_or(text_clean);
                                text_clean = text_clean.strip_suffix("```").unwrap_or(text_clean);
                            }
                            let text_clean = text_clean.trim();

                            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(text_clean) {
                                return Ok(parsed);
                            }
                        }
                    }
                }
            }
            Ok(serde_json::json!([]))
        }
        Err(_) => Ok(serde_json::json!([]))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        minimize_window,
        maximize_window,
        close_window,
        is_window_maximized,
        get_api_key,
        has_api_key,
        set_api_key,
        clear_api_key,
        call_advisor,
        call_social_reply,
        generate_user_reply,
        generate_social_feed,
        check_for_git_updates
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

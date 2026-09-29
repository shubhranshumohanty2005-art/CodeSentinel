"""
AI Client — Unified interface with automatic fallback chain.

Tries providers in order: NVIDIA NIM → Gemini → Groq
Catches timeouts, 429 rate limits, and 5xx errors, then falls through
to the next provider. Logs which provider served each request.

Usage:
    from apps.ai.ai_client import generate
    result = generate("Summarize this diff", system="You are a code reviewer")
"""
import json
import logging
import time
from django.conf import settings

logger = logging.getLogger(__name__)

# Provider timeout in seconds
PROVIDER_TIMEOUT = 60


def _call_nvidia(prompt, system=None, json_mode=False):
    """Call NVIDIA NIM API (OpenAI-compatible endpoint)."""
    api_key = settings.NVIDIA_API_KEY
    if not api_key:
        raise ValueError("NVIDIA_API_KEY not configured")

    from openai import OpenAI

    client = OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=api_key,
        timeout=PROVIDER_TIMEOUT,
        max_retries=0,
    )

    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    kwargs = {
        "model": "nvidia/llama-3.1-nemotron-70b-instruct",
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 4096,
    }

    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    response = client.chat.completions.create(**kwargs)
    return response.choices[0].message.content


def _call_gemini(prompt, system=None, json_mode=False):
    """Call Google Gemini API."""
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY not configured")

    import google.generativeai as genai

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        'gemini-3.8-flash',
        system_instruction=system if system else None,
    )

    generation_config = {
        "temperature": 0.3,
        "max_output_tokens": 4096,
    }
    if json_mode:
        generation_config["response_mime_type"] = "application/json"

    response = model.generate_content(
        prompt,
        generation_config=generation_config,
        request_options={"timeout": PROVIDER_TIMEOUT},
    )
    return response.text


def _call_groq(prompt, system=None, json_mode=False):
    """Call Groq API."""
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise ValueError("GROQ_API_KEY not configured")

    from groq import Groq

    client = Groq(api_key=api_key, timeout=PROVIDER_TIMEOUT, max_retries=0)

    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    kwargs = {
        "model": "qwen/qwen3.8-27b",
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 4096,
    }

    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    response = client.chat.completions.create(**kwargs)
    return response.choices[0].message.content


# Ordered fallback chain — use string references for late binding so
# unittest.mock.patch can replace the module-level names successfully.
PROVIDER_NAMES = [
    ("nvidia", "_call_nvidia"),
    ("gemini", "_call_gemini"),
    ("groq", "_call_groq"),
]

import re
import sys


def generate(prompt, system=None, json_mode=False):
    """
    Generate AI response with automatic fallback chain.

    Tries NVIDIA NIM → Gemini → Groq in order.
    Returns a dict: { "content": str, "provider": str }

    Args:
        prompt: The user/task prompt
        system: Optional system instruction
        json_mode: If True, request JSON output from the provider

    Returns:
        dict with 'content' (str) and 'provider' (str)

    Raises:
        RuntimeError if all providers fail
    """
    errors = []
    max_retries = 3

    # Look up provider functions by name at call time so that mocks work
    _this_module = sys.modules[__name__]
    providers = [(name, getattr(_this_module, fn_name)) for name, fn_name in PROVIDER_NAMES]

    for provider_name, provider_fn in providers:
        retries = 0
        while retries <= max_retries:
            try:
                logger.info(f"Trying AI provider: {provider_name}")
                start = time.time()
                content = provider_fn(prompt, system=system, json_mode=json_mode)
                elapsed = time.time() - start
                logger.info(f"AI provider {provider_name} responded in {elapsed:.2f}s")

                return {
                    "content": content,
                    "provider": provider_name,
                }
            except ValueError as e:
                # Provider not configured — skip immediately without logging as warning
                logger.info(f"Skipping {provider_name}: {e}")
                errors.append(f"{provider_name}: not configured")
                break
            except Exception as e:
                error_msg = str(e)
                error_type = type(e).__name__
                logger.error(f"[{provider_name}] Exception: {error_type} - {error_msg}")
                is_rate_limit = "429" in error_msg or "ResourceExhausted" in error_type or "RateLimit" in error_type or "quota" in error_msg.lower()
                is_timeout = "Timeout" in error_type or "timed out" in error_msg.lower()

                if (is_rate_limit or is_timeout) and retries < max_retries:
                    # If it's a timeout, skip immediately to avoid Gunicorn worker timeout
                    if is_timeout:
                        final_error_msg = f"{provider_name} timed out. Skipping to next provider."
                        logger.warning(final_error_msg)
                        errors.append(final_error_msg)
                        break

                    delay = 2.0 * (2 ** retries) if not is_timeout else 1.0
                    
                    if is_rate_limit:
                        # Attempt to extract specific retry delay if provided by the API
                        match = re.search(r"retry in (\d+(?:\.\d+)?)s", error_msg)
                        if match:
                            try:
                                delay = float(match.group(1)) + 1.0  # add 1s buffer
                            except ValueError:
                                pass

                    # If the delay is too long, we will hit Gunicorn's timeout before retrying.
                    # In this case, skip to the next provider immediately.
                    if delay > 30.0:
                        final_error_msg = f"{provider_name} retry delay ({delay:.2f}s) is too long. Skipping to next provider."
                        logger.warning(final_error_msg)
                        errors.append(final_error_msg)
                        break
                    
                    reason = "rate limited" if is_rate_limit else "timed out"
                    logger.warning(f"{provider_name} {reason}. Retrying in {delay:.2f}s... ({retries + 1}/{max_retries})")
                    time.sleep(delay)
                    retries += 1
                    continue

                # Exhausted retries or a different error occurred
                final_error_msg = f"{provider_name} failed: {error_type}: {error_msg}"
                logger.warning(final_error_msg)
                errors.append(final_error_msg)
                break

    error_summary = "; ".join(errors)
    logger.error(f"All AI providers failed: {error_summary}")
    raise RuntimeError(f"All AI providers failed: {error_summary}")


def generate_json(prompt, system=None):
    """
    Convenience wrapper that requests JSON output and parses it.

    Returns: dict with 'data' (parsed JSON), 'provider' (str)
    """
    result = generate(prompt, system=system, json_mode=True)
    try:
        data = json.loads(result["content"])
    except json.JSONDecodeError:
        # Try to extract JSON from the response
        content = result["content"]
        start = content.find('{')
        end = content.rfind('}') + 1
        if start >= 0 and end > start:
            data = json.loads(content[start:end])
        else:
            start = content.find('[')
            end = content.rfind(']') + 1
            if start >= 0 and end > start:
                data = json.loads(content[start:end])
            else:
                data = {"raw": content}

    return {
        "data": data,
        "provider": result["provider"],
    }

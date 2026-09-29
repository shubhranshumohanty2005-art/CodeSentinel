"""
Tests for the AI client fallback chain and GitHub service functions.
"""
from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings


@override_settings(
    NVIDIA_API_KEY='test-nvidia-key',
    GEMINI_API_KEY='test-gemini-key',
    GROQ_API_KEY='test-groq-key',
)
class AiClientFallbackTests(TestCase):
    """Test the AI fallback chain: NVIDIA → Gemini → Groq."""

    @patch('apps.ai.ai_client._call_nvidia')
    def test_nvidia_primary_success(self, mock_nvidia):
        """Test that NVIDIA is tried first and returns on success."""
        mock_nvidia.return_value = "NVIDIA response"

        from apps.ai.ai_client import generate
        result = generate("test prompt")

        self.assertEqual(result['content'], "NVIDIA response")
        self.assertEqual(result['provider'], "nvidia")
        mock_nvidia.assert_called_once()

    @patch('apps.ai.ai_client._call_gemini')
    @patch('apps.ai.ai_client._call_nvidia')
    def test_fallback_to_gemini(self, mock_nvidia, mock_gemini):
        """Test fallback to Gemini when NVIDIA fails."""
        mock_nvidia.side_effect = Exception("NVIDIA timeout")
        mock_gemini.return_value = "Gemini response"

        from apps.ai.ai_client import generate
        result = generate("test prompt")

        self.assertEqual(result['content'], "Gemini response")
        self.assertEqual(result['provider'], "gemini")
        mock_nvidia.assert_called_once()
        mock_gemini.assert_called_once()

    @patch('apps.ai.ai_client._call_groq')
    @patch('apps.ai.ai_client._call_gemini')
    @patch('apps.ai.ai_client._call_nvidia')
    def test_fallback_to_groq(self, mock_nvidia, mock_gemini, mock_groq):
        """Test fallback to Groq when both NVIDIA and Gemini fail."""
        mock_nvidia.side_effect = Exception("NVIDIA error")
        mock_gemini.side_effect = Exception("Gemini error")
        mock_groq.return_value = "Groq response"

        from apps.ai.ai_client import generate
        result = generate("test prompt")

        self.assertEqual(result['content'], "Groq response")
        self.assertEqual(result['provider'], "groq")

    @patch('apps.ai.ai_client._call_groq')
    @patch('apps.ai.ai_client._call_gemini')
    @patch('apps.ai.ai_client._call_nvidia')
    def test_all_providers_fail(self, mock_nvidia, mock_gemini, mock_groq):
        """Test RuntimeError when all providers fail."""
        mock_nvidia.side_effect = Exception("NVIDIA error")
        mock_gemini.side_effect = Exception("Gemini error")
        mock_groq.side_effect = Exception("Groq error")

        from apps.ai.ai_client import generate
        with self.assertRaises(RuntimeError) as ctx:
            generate("test prompt")

        self.assertIn("All AI providers failed", str(ctx.exception))

    @patch('apps.ai.ai_client._call_nvidia')
    def test_system_prompt_passed(self, mock_nvidia):
        """Test that system prompt is forwarded to the provider."""
        mock_nvidia.return_value = "response"

        from apps.ai.ai_client import generate
        generate("prompt", system="You are a reviewer")

        mock_nvidia.assert_called_once_with(
            "prompt", system="You are a reviewer", json_mode=False
        )

    @patch('apps.ai.ai_client._call_nvidia')
    def test_json_mode(self, mock_nvidia):
        """Test JSON mode is forwarded to the provider."""
        mock_nvidia.return_value = '{"key": "value"}'

        from apps.ai.ai_client import generate_json
        result = generate_json("prompt")

        self.assertEqual(result['data'], {"key": "value"})
        mock_nvidia.assert_called_once_with(
            "prompt", system=None, json_mode=True
        )


class GithubDiffSummarizerSkillTests(TestCase):
    """Test the github-diff-summarizer skill."""

    @patch('apps.ai.ai_client.generate_json')
    def test_summarize_diff_success(self, mock_generate):
        """Test successful diff summarization."""
        mock_generate.return_value = {
            'data': {
                'summary': 'Added new feature',
                'files_changed': ['app.py'],
                'change_type': 'feature',
                'risk_level': 'low',
                'key_changes': ['Added endpoint'],
            },
            'provider': 'nvidia',
        }

        from apps.ai.skills.github_diff_summarizer import summarize_diff
        result = summarize_diff("diff --git a/app.py b/app.py\n+new line")

        self.assertEqual(result['data']['change_type'], 'feature')
        self.assertEqual(result['provider'], 'nvidia')

    @patch('apps.ai.ai_client.generate_json')
    def test_summarize_diff_with_context(self, mock_generate):
        """Test diff summarization with additional context."""
        mock_generate.return_value = {
            'data': {'summary': 'test'},
            'provider': 'gemini',
        }

        from apps.ai.skills.github_diff_summarizer import summarize_diff
        result = summarize_diff("diff content", context="PR #42: Fix bug")

        # Verify context was included in the prompt
        call_args = mock_generate.call_args
        self.assertIn("PR #42", call_args[0][0])


class FirestoreClientTests(TestCase):
    """Test Firestore client helper functions."""

    def test_encrypt_decrypt_github_token_no_key(self):
        """Test that without encryption key, token is returned as-is."""
        from apps.core.firestore_client import encrypt_github_token
        with self.settings(FIELD_ENCRYPTION_KEY=''):
            result = encrypt_github_token('my-github-token')
            self.assertEqual(result, 'my-github-token')

    def test_encrypt_decrypt_github_token_with_key(self):
        """Test encryption/decryption with a Fernet key."""
        from cryptography.fernet import Fernet
        key = Fernet.generate_key().decode()

        from apps.core.firestore_client import encrypt_github_token
        with self.settings(FIELD_ENCRYPTION_KEY=key):
            encrypted = encrypt_github_token('my-github-token')
            self.assertNotEqual(encrypted, 'my-github-token')

            # Verify we can decrypt
            f = Fernet(key.encode())
            decrypted = f.decrypt(encrypted.encode()).decode()
            self.assertEqual(decrypted, 'my-github-token')

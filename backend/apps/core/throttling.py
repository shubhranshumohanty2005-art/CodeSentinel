from rest_framework.throttling import SimpleRateThrottle

class AIGenerationRateThrottle(SimpleRateThrottle):
    """
    Rate limit AI generation endpoints per user.
    Uses the user_id set by the FirebaseAuthMiddleware.
    """
    scope = 'ai_generation'

    def get_cache_key(self, request, view):
        user_id = getattr(request, 'user_id', None)
        if user_id:
            return self.cache_format % {
                'scope': self.scope,
                'ident': user_id
            }
        
        # Fallback to IP address if no user_id
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request)
        }

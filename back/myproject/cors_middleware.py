"""
Dev-only CORS for /api/* so Angular (localhost:4200 / 127.0.0.1:4200) can call the API.
"""
from django.http import HttpResponse

_ALLOWED_ORIGINS = frozenset(
    {
        'http://localhost:4200',
        'http://127.0.0.1:4200',
    }
)


def _reflect_origin(request) -> str:
    origin = request.headers.get('Origin')
    if origin in _ALLOWED_ORIGINS:
        return origin
    return 'http://localhost:4200'


class CorsDevMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.path.startswith('/api/'):
            return self.get_response(request)

        if request.method == 'OPTIONS':
            response = HttpResponse(status=204)
            o = _reflect_origin(request)
            response['Access-Control-Allow-Origin'] = o
            response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response['Access-Control-Max-Age'] = '86400'
            return response

        response = self.get_response(request)
        response['Access-Control-Allow-Origin'] = _reflect_origin(request)
        return response

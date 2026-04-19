from django.http import JsonResponse


def root(request):
    return JsonResponse(
        {
            'service': 'tutor-platform-api',
            'api_base': '/api/',
            'admin': '/admin/',
            'hint': 'REST endpoints live under /api/ — open /api/ for a list.',
        }
    )

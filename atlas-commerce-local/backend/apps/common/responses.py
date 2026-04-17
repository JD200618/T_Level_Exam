from rest_framework.response import Response


def success_response(data=None, message='OK', status_code=200):
    payload = {
        'ok': status_code < 400,
        'message': message,
    }
    if data is not None:
        payload['data'] = data
    return Response(payload, status=status_code)

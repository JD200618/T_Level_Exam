from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from apps.common.responses import success_response

from .serializers import CurrentUserSerializer, LoginSerializer
from .services import authenticate_with_email, login_user, logout_user


class CurrentUserView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return success_response(
                data={
                    'authenticated': False,
                    'user': None,
                },
                message='Anonymous session',
            )

        serializer = CurrentUserSerializer(request.user)
        return success_response(
            data={
                'authenticated': True,
                'user': serializer.data,
            },
            message='Authenticated session',
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate_with_email(**serializer.validated_data)
        if not user:
            return success_response(
                data={'authenticated': False},
                message='Invalid credentials',
                status_code=400,
            )
        login_user(request, user)
        return success_response(
            data={
                'authenticated': True,
                'user': CurrentUserSerializer(user).data,
            },
            message='Login successful',
        )


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logout_user(request)
        return success_response(message='Logout successful')

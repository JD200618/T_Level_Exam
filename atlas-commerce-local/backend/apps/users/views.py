from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import success_response

from .serializers import (
    AddressWriteSerializer,
    CurrentUserSerializer,
    LoginSerializer,
    PaymentMethodWriteSerializer,
    ProfileUpdateSerializer,
)
from .services import (
    authenticate_with_email,
    create_user_address,
    create_user_payment_method,
    delete_user_address,
    delete_user_payment_method,
    get_user_address,
    get_user_payment_method,
    login_user,
    logout_user,
    update_user_address,
    update_user_profile,
)


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


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return success_response(data={'profile': CurrentUserSerializer(request.user).data}, message='Profile loaded')

    def patch(self, request):
        serializer = ProfileUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = update_user_profile(request.user, **serializer.validated_data)
        return success_response(data={'profile': CurrentUserSerializer(user).data}, message='Profile updated')


class AddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        addresses = request.user.addresses.all()
        return success_response(
            data={'addresses': CurrentUserSerializer(request.user).data['addresses']},
            message='Addresses loaded',
        )

    def post(self, request):
        serializer = AddressWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        create_user_address(request.user, serializer.validated_data)
        return success_response(
            data={'addresses': CurrentUserSerializer(request.user).data['addresses']},
            message='Address created',
            status_code=201,
        )


class AddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, address_id):
        address = get_user_address(request.user, address_id)
        if not address:
            return success_response(message='Address not found', status_code=404)
        serializer = AddressWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        update_user_address(address, serializer.validated_data)
        return success_response(
            data={'addresses': CurrentUserSerializer(request.user).data['addresses']},
            message='Address updated',
        )

    def delete(self, request, address_id):
        address = get_user_address(request.user, address_id)
        if not address:
            return success_response(message='Address not found', status_code=404)
        delete_user_address(address)
        return success_response(
            data={'addresses': CurrentUserSerializer(request.user).data['addresses']},
            message='Address deleted',
        )


class PaymentMethodListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return success_response(
            data={'payment_methods': CurrentUserSerializer(request.user).data['payment_methods']},
            message='Payment methods loaded',
        )

    def post(self, request):
        serializer = PaymentMethodWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        create_user_payment_method(request.user, serializer.validated_data)
        return success_response(
            data={'payment_methods': CurrentUserSerializer(request.user).data['payment_methods']},
            message='Payment method created',
            status_code=201,
        )


class PaymentMethodDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, payment_method_id):
        method = get_user_payment_method(request.user, payment_method_id)
        if not method:
            return success_response(message='Payment method not found', status_code=404)
        delete_user_payment_method(method)
        return success_response(
            data={'payment_methods': CurrentUserSerializer(request.user).data['payment_methods']},
            message='Payment method deleted',
        )

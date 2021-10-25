export declare namespace PaymentSheet {
    type SetupParams = ClientSecretParams & GooglePayParams & ApplePayParams & {
        customerId?: string;
        customerEphemeralKeySecret?: string;
        customFlow?: boolean;
        merchantDisplayName?: string;
        style?: 'alwaysLight' | 'alwaysDark' | 'automatic';
    };
    type PresentParams = {
        confirmPayment?: boolean;
        clientSecret?: string;
    };
    type ClientSecretParams = {
        paymentIntentClientSecret: string;
        setupIntentClientSecret?: undefined;
    } | {
        setupIntentClientSecret: string;
        paymentIntentClientSecret?: undefined;
    };
    type ApplePayParams = {
        applePay?: true;
        merchantCountryCode: string;
    } | {
        applePay?: false;
        merchantCountryCode?: string;
    };
    type GooglePayParams = {
        googlePay?: true;
        merchantCountryCode: string;
        testEnv?: boolean;
    } | {
        googlePay?: false;
        merchantCountryCode?: string;
        testEnv?: boolean;
    };
    interface PaymentOption {
        label: string;
        image: string;
    }
}

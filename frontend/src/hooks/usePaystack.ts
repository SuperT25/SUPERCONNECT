const PAYSTACK_PUBLIC_KEY = 'pk_test_2a229928d8bf1ddc7d3a9a6557b6997f2a8a56b7';

interface PaystackOptions {
  email: string;
  amount: number;
  name: string;
  subaccountCode?: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

export const usePaystack = () => {
  const pay = ({ email, amount, name, subaccountCode, onSuccess, onClose }: PaystackOptions) => {
    const config: any = {
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: amount * 100,
      currency: 'NGN',
      ref: `SC-${Date.now()}`,
      metadata: { custom_fields: [{ display_name: 'Customer', variable_name: 'customer', value: name }] },
      callback: (response: any) => onSuccess(response.reference),
      onClose,
    };

    if (subaccountCode) {
      config.subaccount = subaccountCode;
      config.bearer = 'account';
    }

    const handler = (window as any).PaystackPop.setup(config);
    handler.openIframe();
  };

  return { pay };
};

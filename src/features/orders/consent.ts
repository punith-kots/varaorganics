export const SMS_CONSENT_TEXT =
  "I agree to receive SMS order confirmations and delivery updates from Vara Organic at the phone number provided.";

export function smsConsentRecord(optedIn: boolean | undefined, recordedAt: string) {
  return {
    smsOptIn: optedIn === true,
    smsOptInAt: optedIn === true ? recordedAt : null,
    smsConsentText: optedIn === true ? SMS_CONSENT_TEXT : null,
  };
}

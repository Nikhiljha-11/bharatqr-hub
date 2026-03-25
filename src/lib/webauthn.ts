export async function isPlatformBiometricAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    return false;
  }

  if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== "function") {
    return false;
  }

  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

function randomChallenge(length = 32) {
  const challenge = new Uint8Array(length);
  crypto.getRandomValues(challenge);
  return challenge;
}

export async function authenticateWithPlatformBiometrics(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential || !navigator.credentials) {
    return false;
  }

  const available = await isPlatformBiometricAvailable();
  if (!available) {
    return false;
  }

  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge: randomChallenge(),
    timeout: 60000,
    userVerification: "required",
    rpId: window.location.hostname,
    allowCredentials: [],
  };

  try {
    const assertion = await navigator.credentials.get({ publicKey });
    return Boolean(assertion);
  } catch {
    return false;
  }
}

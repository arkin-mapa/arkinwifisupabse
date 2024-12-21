interface CredentialResponse {
  credential: string;
}

interface Google {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: CredentialResponse) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
      }) => void;
      prompt: (notification: {
        isNotDisplayed: () => boolean;
        getNotDisplayedReason: () => string;
      }) => void;
    };
  };
}

interface Window {
  google?: Google;
}
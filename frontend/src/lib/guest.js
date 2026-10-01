const EMAIL_KEY = "katakana-guest-email";
const NAME_KEY = "katakana-guest-name";

export const getGuest = () => ({ email: localStorage.getItem(EMAIL_KEY) || "", name: localStorage.getItem(NAME_KEY) || "" });
export const saveGuest = ({ email, name }) => { localStorage.setItem(EMAIL_KEY, email); if (name) localStorage.setItem(NAME_KEY, name); };
export const clearGuest = () => { localStorage.removeItem(EMAIL_KEY); localStorage.removeItem(NAME_KEY); };

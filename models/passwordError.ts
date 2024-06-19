export type PasswordError = {
    lowercaseLetter: boolean;
    uppercaseLetter: boolean;
    digit: boolean;
    specialChar: boolean;
    minLength: boolean;
};
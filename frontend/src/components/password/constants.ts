export const PASSWORD_LENGTH = 4;

export type PasswordBoxStatus = 'inactive' | 'inputting' | 'success' | 'error';

export const PASSWORD_BOX_STYLE = {
  inactive: {color: '#f4f4f4', showEyes: false},
  inputting: {color: '#191919', showEyes: true},
  success: {color: '#48C06D', showEyes: true},
  error: {color: '#FF6C84', showEyes: true},
} as const;

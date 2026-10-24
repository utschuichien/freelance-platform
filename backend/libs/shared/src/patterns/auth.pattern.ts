export const AUTH_PATTERNS = {
  REGISTER: { cmd: 'auth.register' },
  LOGIN: { cmd: 'auth.login' },
  LOGOUT: { cmd: 'auth.logout' },
  VERIFY_TOKEN: { cmd: 'auth.verify_token' },
  REFRESH_TOKEN: { cmd: 'auth.refresh_token' },
  GET_USER: { cmd: 'auth.get_user' },
  GET_FREELANCERS: { cmd: 'auth.get_freelancers' },
  FORGOT_PASSWORD: { cmd: 'auth.forgot_password' },
  RESET_PASSWORD: { cmd: 'auth.reset_password' },
  GET_ALL_USERS: { cmd: 'auth.get_all_users' },
  UPDATE_USER_STATUS: { cmd: 'auth.update_user_status' },
};

import * as Keychain from 'react-native-keychain';

const SERVICE = 'AiRingAppLockPassword';

/**
 * 앱 잠금 비밀번호 저장
 * @param password 저장할 비밀번호(문자열)
 */
export async function setAppLockPassword(password: string) {
  await Keychain.setGenericPassword('applock', password, {service: SERVICE});
}

/**
 * 앱 잠금 비밀번호 가져오기
 * @returns 비밀번호(문자열) 또는 null
 */
export async function getAppLockPassword(): Promise<string | null> {
  const result = await Keychain.getGenericPassword({service: SERVICE});
  if (result) {
    return result.password;
  }
  return null;
}

/**
 * 앱 잠금 비밀번호 삭제
 */
export async function removeAppLockPassword() {
  await Keychain.resetGenericPassword({service: SERVICE});
}

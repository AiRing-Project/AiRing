<p align="center">
  <a href="https://reactnative.dev/" target="blank"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="200" alt="React Native Logo" /></a>
</p>

# AiRing Frontend

React Native CLI 기반으로 구축된 프론트엔드 모바일 안드로이드 애플리케이션입니다.

## 참고사항

- AI 전화 알람 기능을 구현하기 위해서는 native module을 직접 개발해야 하므로 Expo CLI가 아닌 React Native CLI로 앱을 bootstrap

- Windows에서는 아예 iOS 개발이 불가능하고 Apple Developer Program 멤버십에 가입 연 회비 99$라서 일단은 Android App만 개발

- 화면 개발 시 반드시 [`AppScreen` Component](https://do0ori.notion.site/React-Native-AppScreen-20a8ad35868480f2b1eece146d0fb4f1) 사용

## 애플리케이션 실행

- 의존성 설치

  ```bash
  npm install
  ```

- 앱 빌드

  ```bash
  # APK 빌드 (debugging 용)
  cd android && ./gradlew assembleDebug

  # AAB 빌드 (debugging 용)
  cd android && ./gradlew bundleDebug
  ```

- 개발 서버

  ```bash
  # Metro server cache 초기화 후 시작
  npm run android:apply-env-change

  # 앱 빌드 및 설치
  npm run android

  # 앱 재설치
  npm run android:reinstall

  # 빌드 오류 발생 시 -> 이것도 오류나면 build 폴더를 직접 삭제
  cd android && ./gradlew clean
  ```

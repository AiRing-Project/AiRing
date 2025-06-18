import {EMOTION_COLOR_MAP} from '../constants/emotion';
import {Emotion} from '../types/emotion';

/**
 * 텍스트에서 감정을 자동으로 매핑
 * @param text 분석할 텍스트
 * @returns 찾은 감정 또는 undefined
 */
export const mapEmotionFromText = (text: string): Emotion | undefined => {
  const emotions = Object.keys(EMOTION_COLOR_MAP) as Emotion[];

  // 모든 감정에 대해 검사
  for (const emotion of emotions) {
    // 감정 단어의 다양한 형태를 처리 (예: '우울하다', '우울해', '우울했다' 등)
    const emotionBase = emotion.replace(/[은는한]$/, ''); // '우울한' -> '우울'
    const pattern = new RegExp(`${emotionBase}(하|했|해|한|됐|든|다)`);

    if (pattern.test(text)) {
      return emotion;
    }
  }

  return undefined;
};

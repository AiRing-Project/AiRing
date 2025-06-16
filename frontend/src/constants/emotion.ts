import {Emotion} from '../types/emotion';

export const EMOTION_COLOR_MAP: Record<Emotion, [string, string]> = {
  // 긍정
  기쁜: ['#FFC327', '#FEA319'],
  감사하는: ['#FF8921', '#FF7700'],
  만족스러운: ['#07C472', '#00AC79'],
  편안한: ['#6DD84E', '#00D02A'],
  자신하는: ['#FF7781', '#FD626E'],
  흥분: ['#FF8FBA', '#FF5F9D'],

  // 부정
  분노: ['#FE5586', '#F7484B'],
  슬픔: ['#6BADFF', '#3A89FF'],
  우울한: ['#A592F0', '#5079F2'],
  불안: ['#6086D1', '#2C5CBC'],
  '스트레스 받는': ['#AB8263', '#9E7558'],
  외로운: ['#A0C3C7', '#308EAB'],
  당황: ['#C5A1E1', '#833CA2'],

  // 중립
  '그저 그런': ['#838FAB', '#838FAB'],
};

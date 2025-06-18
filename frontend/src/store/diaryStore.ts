import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';

import {Diary, DiaryStore} from '../types/diary';
import {mapEmotionFromText} from '../utils/emotion';

const STORAGE_KEY = '@diaries';

// 초기 데이터
const initialDiaries: Diary[] = [
  {
    date: '2025-05-01',
    id: '1',
    title: '출장 준비',
    content: '오늘은 출장 준비를 했다.',
    emotion: ['흥분', '자신하는'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-05-01').toISOString(),
    updatedAt: new Date('2025-05-01').toISOString(),
  },
  {
    date: '2025-05-02',
    id: '2',
    title: '아침 산책',
    content: '오늘은 아침 산책을 했다.',
    emotion: ['편안한', '자신하는'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-05-02').toISOString(),
    updatedAt: new Date('2025-05-02').toISOString(),
  },
  {
    date: '2025-05-03',
    id: '3',
    title: '점심 데이트',
    content: '오늘은 점심 데이트를 했다.',
    emotion: ['만족스러운', '기쁜'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-05-03').toISOString(),
    updatedAt: new Date('2025-05-03').toISOString(),
  },
  {
    date: '2025-05-04',
    id: '4',
    title: '가족 모임',
    content: '오늘은 가족 모임을 했다.',
    emotion: ['감사하는', '편안한'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-05-04').toISOString(),
    updatedAt: new Date('2025-05-04').toISOString(),
  },
  {
    date: '2025-05-05',
    id: '5',
    title: '어린이날',
    content: '오늘은 어린이날이다.',
    emotion: ['기쁜', '만족스러운'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-05-05').toISOString(),
    updatedAt: new Date('2025-05-05').toISOString(),
  },
  {
    date: '2025-05-07',
    id: '6',
    title: '책 읽기',
    content: '오늘은 책을 읽었다.',
    emotion: ['편안한', '자신하는'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-05-07').toISOString(),
    updatedAt: new Date('2025-05-07').toISOString(),
  },
  {
    date: '2025-05-10',
    id: '7',
    title: '운동 후 피곤함',
    content: '오늘은 운동을 했다.',
    emotion: ['불안', '우울한'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-05-10').toISOString(),
    updatedAt: new Date('2025-05-10').toISOString(),
  },
  {
    date: '2025-05-12',
    id: '8',
    title: '업무 스트레스',
    content: '오늘은 업무가 많았다.',
    emotion: ['스트레스 받는', '분노'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-05-12').toISOString(),
    updatedAt: new Date('2025-05-12').toISOString(),
  },
  {
    date: '2025-05-15',
    id: '9',
    title: '친구와 갈등',
    content: '오늘은 친구와 다퉜다.',
    emotion: ['당황', '스트레스 받는'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-05-15').toISOString(),
    updatedAt: new Date('2025-05-15').toISOString(),
  },
  {
    date: '2025-05-18',
    id: '10',
    title: '카페에서 휴식',
    content: '오늘은 카페에서 쉬었다.',
    emotion: ['편안한', '자신하는'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-05-18').toISOString(),
    updatedAt: new Date('2025-05-18').toISOString(),
  },
  {
    date: '2025-05-20',
    id: '11',
    title: '새로운 취미 시작',
    content: '오늘은 새로운 취미를 시작했다.',
    emotion: ['자신하는', '흥분'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-05-20').toISOString(),
    updatedAt: new Date('2025-05-20').toISOString(),
  },
  {
    date: '2025-05-22',
    id: '12',
    title: '비 오는 날',
    content: '오늘은 비가 왔다.',
    emotion: ['우울한', '불안'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-05-22').toISOString(),
    updatedAt: new Date('2025-05-22').toISOString(),
  },
  {
    date: '2025-05-25',
    id: '13',
    title: '맛집 탐방',
    content: '오늘은 맛집을 갔다.',
    emotion: ['기쁜', '만족스러운'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-05-25').toISOString(),
    updatedAt: new Date('2025-05-25').toISOString(),
  },
  {
    date: '2025-05-28',
    id: '14',
    title: '야근',
    content: '오늘은 야근을 했다.',
    emotion: ['슬픔', '스트레스 받는'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-05-28').toISOString(),
    updatedAt: new Date('2025-05-28').toISOString(),
  },
  {
    date: '2025-05-30',
    id: '15',
    title: '산책하며 생각 정리',
    content: '오늘은 산책을 하며 생각을 정리했다.',
    emotion: ['자신하는', '편안한'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-05-30').toISOString(),
    updatedAt: new Date('2025-05-30').toISOString(),
  },
  {
    date: '2025-06-02',
    id: '16',
    title: '생각이 많은 날',
    content: '오늘은 생각이 많았다.',
    emotion: ['외로운', '우울한'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-06-02').toISOString(),
    updatedAt: new Date('2025-06-02').toISOString(),
  },
  {
    date: '2025-06-03',
    id: '17',
    title: '오늘 일기',
    content: '오늘의 일기입니다.',
    emotion: ['분노', '스트레스 받는'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-06-03').toISOString(),
    updatedAt: new Date('2025-06-03').toISOString(),
  },
  {
    date: '2025-06-05',
    id: '18',
    title: '오늘 일기',
    content: '오늘의 일기입니다.',
    emotion: ['그저 그런'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-06-05').toISOString(),
    updatedAt: new Date('2025-06-05').toISOString(),
  },
  {
    date: '2025-06-07',
    id: '19',
    title: '오늘 일기',
    content: '오늘의 일기입니다.',
    emotion: ['흥분'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-06-07').toISOString(),
    updatedAt: new Date('2025-06-07').toISOString(),
  },
  {
    date: '2025-06-08',
    id: '20',
    title: '테니스 치기',
    content:
      '오늘은 테니스를 쳤다. 2시간 동안 해서 총 4게임을 쳤는데 내가 다 이겼다. 오늘따라 포핸드가 좀 잘 맞았다.',
    emotion: ['기쁜'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-06-08').toISOString(),
    updatedAt: new Date('2025-06-08').toISOString(),
  },
  {
    date: '2025-06-10',
    id: '21',
    title: '친구와 한강에서 피크닉',
    content: '오늘은 친구와 한강에서 피크닉을 했다.',
    emotion: ['편안한'],
    images: [],
    hasReply: true,
    createdAt: new Date('2025-06-10').toISOString(),
    updatedAt: new Date('2025-06-10').toISOString(),
  },
];

/**
 * 일기 내용에서 감정을 자동으로 매핑
 * @param content 일기 내용
 * @param currentEmotions 현재 선택된 감정 배열
 * @returns 최종 감정 배열
 */
const getEmotionsFromContent = (
  content: string,
  currentEmotions: string[] = [],
): string[] => {
  if (currentEmotions.length > 0) {
    return currentEmotions;
  }

  const detectedEmotion = mapEmotionFromText(content);
  return detectedEmotion ? [detectedEmotion] : [];
};

const useDiaryStore = create<DiaryStore>((set, get) => ({
  diaries: [],
  loading: false,
  error: null,

  getDiaries: async () => {
    try {
      set({loading: true, error: null});
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const diaries: Diary[] = data ? JSON.parse(data) : initialDiaries;

      // 초기 데이터가 없을 경우에만 저장
      if (!data) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialDiaries));
      }

      set({diaries, loading: false});
    } catch (error) {
      set({error: '일기를 불러오는데 실패했습니다.', loading: false});
    }
  },

  addDiary: async diary => {
    try {
      set({loading: true, error: null});
      const diaries = get().diaries;
      const lastId =
        diaries.length > 0 ? parseInt(diaries[diaries.length - 1].id) : 0;

      const emotions = getEmotionsFromContent(diary.content, diary.emotion);

      const newDiary: Diary = {
        ...diary,
        id: String(lastId + 1),
        emotion: emotions,
        hasReply: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedDiaries = [...diaries, newDiary];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDiaries));
      set({diaries: updatedDiaries, loading: false});
    } catch (error) {
      set({error: '일기 저장에 실패했습니다.', loading: false});
    }
  },

  updateDiary: async (id, updatedDiary) => {
    try {
      set({loading: true, error: null});
      const diaries = get().diaries.map(diary => {
        if (diary.id === id) {
          // content가 수정되었을 경우에만 감정 재매핑
          const emotions = updatedDiary.content
            ? getEmotionsFromContent(updatedDiary.content, updatedDiary.emotion)
            : diary.emotion;

          return {
            ...diary,
            ...updatedDiary,
            emotion: emotions,
            updatedAt: new Date().toISOString(),
          };
        }
        return diary;
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(diaries));
      set({diaries, loading: false});
    } catch (error) {
      set({error: '일기 수정에 실패했습니다.', loading: false});
    }
  },

  deleteDiary: async id => {
    try {
      set({loading: true, error: null});
      const diaries = get().diaries.filter(diary => diary.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(diaries));
      set({diaries, loading: false});
    } catch (error) {
      set({error: '일기 삭제에 실패했습니다.', loading: false});
    }
  },

  getDiaryByDate: date => {
    return get().diaries.find(diary => diary.date === date);
  },
}));

export default useDiaryStore;

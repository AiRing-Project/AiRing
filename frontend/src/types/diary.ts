export type Mode = 'read' | 'edit';

export interface Diary {
  id: string;
  date: string; // ISO string format
  title: string;
  content: string;
  emotion: string[];
  images: string[];
  hasReply: boolean;
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
}

export interface DiaryStore {
  diaries: Diary[];
  addDiary: (
    diary: Omit<Diary, 'id' | 'createdAt' | 'updatedAt' | 'hasReply'>,
  ) => Promise<void>;
  updateDiary: (id: string, diary: Partial<Diary>) => Promise<void>;
  deleteDiary: (id: string) => Promise<void>;
  getDiaries: () => Promise<void>;
  getDiaryByDate: (date: string) => Diary | undefined;
  loading: boolean;
  error: string | null;
}

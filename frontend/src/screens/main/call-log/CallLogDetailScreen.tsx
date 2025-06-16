import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {RootStackParamList} from '../../../../App';
import AppScreen from '../../../components/layout/AppScreen';
import Header from '../../../components/layout/Header';
import type {SpeakerType} from '../../../types/call';
import {formatKoreanDate, formatTime} from '../../../utils/date';

export interface CallMessage {
  from: SpeakerType;
  message: string;
}

export interface CallDetail {
  id: number;
  startedAt: string;
  messages: CallMessage[];
}

const detail: CallDetail = {
  id: 1,
  startedAt: '2025-05-11T20:30:05Z',
  messages: [
    {
      from: 'ai',
      message: '안녕! 오늘 하루는 어땠어?',
    },
    {
      from: 'user',
      message: '요즘 너무 지치고 아무것도 하기 싫어',
    },
    {
      from: 'ai',
      message: '그런 기분이 들 때가 있지. 혹시 무슨 일 있었어?',
    },
    {
      from: 'user',
      message:
        '딱히 큰 일은 아닌데, 그냥 계속 쌓인 피로랑 감정이 터진 느낌이야.',
    },
    {
      from: 'ai',
      message:
        '네 마음에 피로가 꽉 차 있었나 봐. 이렇게 이야기해줘서 고마워. 조금씩 가볍게 풀어나가보자, 내가 도와줄게!',
    },
    {
      from: 'user',
      message: '고마워. 사실 요즘 다른 사람들과 나를 자꾸 비교하게 돼.',
    },
    {
      from: 'ai',
      message: '그랬구나. 어떤 상황에서 비교를 하게 됐어?',
    },
    {
      from: 'user',
      message: '오늘은 여기까지 할래.',
    },
    {
      from: 'ai',
      message: '알겠어! 오늘도 수고 많았어. 푹 쉬어!',
    },
    {
      from: 'user',
      message: '응, 고마워. 내일 또 얘기하자.',
    },
    {
      from: 'ai',
      message: '내일도 힘내자! 좋은 밤 보내.',
    },
    {
      from: 'user',
      message: '잘 자!',
    },
    {
      from: 'ai',
      message: '좋은 꿈 꿔!',
    },
  ],
};

const CallLogDetailScreen = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'CallLogDetailScreen'>>();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'CallLogDetailScreen'>
    >();

  console.log(route.params.id);
  return (
    <AppScreen>
      {/* 상단 헤더 */}
      <Header
        title={formatKoreanDate(detail.startedAt)}
        onBackPress={() => navigation.goBack()}
      />
      <Text style={styles.headerTime}>{formatTime(detail.startedAt)}</Text>
      {/* 대화 내용 */}
      <ScrollView
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}>
        {detail.messages.map((msg, idx) => (
          <View
            key={idx}
            style={[
              styles.bubble,
              msg.from === 'ai' ? styles.aiBubble : styles.userBubble,
            ]}>
            <Text style={styles.bubbleText}>{msg.message}</Text>
          </View>
        ))}
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
    padding: 4,
  },
  headerDate: {
    fontSize: 18,
    letterSpacing: 0.2,
    fontWeight: '600',
    color: '#000',
    lineHeight: 20,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  headerTime: {
    fontSize: 10,
    letterSpacing: 0.1,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.33)',
    lineHeight: 20,
    textAlign: 'center',
    alignSelf: 'stretch',
    marginTop: 5,
    marginBottom: 24,
  },
  textFlexBox: {
    textAlign: 'center',
    lineHeight: 20,
    alignSelf: 'stretch',
  },
  messages: {
    gap: 24,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  aiBubble: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 10,
  },
  userBubble: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignSelf: 'flex-end',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 10,
  },
  bubbleText: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#000',
    lineHeight: 14.5,
  },
});

export default CallLogDetailScreen;

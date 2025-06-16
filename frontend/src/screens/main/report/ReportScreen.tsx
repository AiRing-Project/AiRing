import React, {useState} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';

import IcChevronRight from '../../../assets/icons/ic-chevron-right.svg';
import EmotionIcon from '../../../components/common/EmotionIcon';
import HorizontalDivider from '../../../components/common/HorizontalDivider';
import AppScreen from '../../../components/layout/AppScreen';
import Picker from '../../../components/picker/Picker';
import {WEEK_DAYS} from '../../../constants/calendar';

const WIDTH = Dimensions.get('window').width;
const RANGE = ['이번 주', '이번 달', '오늘'];
const xLabels = WEEK_DAYS;
// const yTicks = [0, 50, 90];

// TODO: 데이터 받아오기
const barData = [50, 80, 30, 90, 70, 60, 40];
const color = [
  '#6C63FF',
  '#FFA800',
  '#FF6B6B',
  '#4CAF50',
  '#2196F3',
  '#9C27B0',
  '#FF5722',
];
const data = barData.map((value, index) => ({
  value,
  label: xLabels[index],
  frontColor: color[index],
  labelTextStyle: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.5)',
  },
}));

const EmotionGraph = () => (
  <BarChart
    // 기본
    data={data}
    height={160}
    disablePress
    disableScroll
    sideWidth={0}
    maxValue={100}
    // bar
    initialSpacing={20}
    spacing={20}
    barBorderTopLeftRadius={5}
    barBorderTopRightRadius={5}
    barWidth={25}
    // line
    hideRules
    noOfSections={2}
    xAxisIndicesColor={'rgba(0, 0, 0, 0.5)'}
    xAxisColor={'rgba(0, 0, 0, 0.15)'}
    xAxisLabelTextStyle={styles.xLabel}
    xAxisLength={WIDTH * 0.8}
    yAxisTextStyle={styles.yLabel}
    yAxisColor={'rgba(0, 0, 0, 0.15)'}
  />
);

const ReportScreen = () => {
  const [selected, setSelected] = useState(RANGE[0]);

  return (
    <AppScreen isTabScreen scrollable contentContainerStyle={styles.container}>
      {/* 기간 선택 */}
      <Picker value={selected} onChange={setSelected} data={RANGE} />
      {/* 평균 감정 */}
      <View style={[styles.box, styles.averageEmotionContainer]}>
        <View style={styles.averageEmotion}>
          <Text style={styles.title}>평균 감정</Text>
          <View style={styles.emotionList}>
            <View style={styles.emotionItem}>
              <Text style={styles.emotion}>편안함</Text>
              <Text style={styles.value}>38%</Text>
            </View>
            <View style={styles.emotionItem}>
              <Text style={styles.emotion}>즐거움</Text>
              <Text style={styles.value}>52%</Text>
            </View>
          </View>
        </View>
        <EmotionIcon />
      </View>
      {/* 감정 통계 */}
      <View style={styles.barGraphContainer}>
        <Text style={styles.barGraphTitle}>감정 변화 그래프</Text>
        <EmotionGraph />
        <View style={styles.box}>
          <Text style={styles.feedbackTitle}>
            이번 주에는 기분 좋은 날이 많았어요.
          </Text>
          <Text style={styles.feedbackTitle}>
            특히 목요일과 토요일에 기쁨이 자주 감지되었어요!
          </Text>
        </View>
      </View>
      <HorizontalDivider />
      {/* 회고 일기 추천 */}
      <View style={[styles.box, {gap: 20}]}>
        <Text style={styles.title}>회고 일기 추천</Text>
        <View style={{gap: 10}}>
          <Text style={styles.date}>2025년 5월 21일 수요일</Text>
          <View style={[styles.box, styles.recommendContainer]}>
            <Text style={styles.content}>
              "오전엔 멀쩡했는데, 오후엔 울적했어요... 회사에서 오전에회의를
              했었는데, 실수를 하는 바람에 상사분한테 크게 혼이 났거든요..."
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>일기장으로 이동</Text>
          <IcChevronRight width={12} height={12} color="#999999" />
        </TouchableOpacity>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 32,
    paddingBottom: 24,
  },
  box: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#f4f4f4',
    paddingVertical: 20,
    paddingHorizontal: 25,
  },
  averageEmotionContainer: {
    height: 100,
    flexDirection: 'row',
  },
  averageEmotion: {
    justifyContent: 'space-between',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.85)',
  },
  emotionList: {
    flexDirection: 'row',
    gap: 28,
  },
  emotionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emotion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3f3f3f',
    textAlign: 'center',
  },
  value: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    textAlign: 'center',
  },
  xLabel: {
    width: 9,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.5)',
  },
  yLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.2)',
  },
  barGraphContainer: {
    gap: 16,
  },
  barGraphTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 16,
  },
  feedbackTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
  date: {
    width: '100%',
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.83)',
    textAlign: 'center',
  },
  recommendContainer: {
    backgroundColor: '#fff',
  },
  content: {
    fontSize: 12,
    color: '#000',
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-end',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
});

export default ReportScreen;

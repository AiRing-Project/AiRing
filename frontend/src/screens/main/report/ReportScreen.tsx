import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import VectorIcon from '../../../assets/icons/ic-SettingIcon.svg';
import AnalysisText from '../../../components/AnalysisText';
import EmotionIcon from '../../../components/common/EmotionIcon';
import HorizontalDivider from '../../../components/common/HorizontalDivider';
import DateText from '../../../components/DateText';
import DiaryContentText from '../../../components/DiaryContentText';
import EmotionChart from '../../../components/EmotionChart';
import AppScreen from '../../../components/layout/AppScreen';
import MoveToDiaryText from '../../../components/MoveToDiaryText';
import Rectangle14999 from '../../../components/Rectangle14999';
import Rectangle15000 from '../../../components/Rectangle15000';
import Rectangle15004 from '../../../components/Rectangle15004';
import Vector from '../../../components/Vector';
import Vector8Icon from '../../../components/Vector8Icon';

const ReportScreen = () => {
  return (
    <AppScreen isTabScreen scrollable style={styles.container}>
      <View style={styles.headerSection}>
        {/* TODO: 실제 로직 구현 */}
        <View style={styles.todayAndIconWrapper}>
          <Text style={styles.todayText}>오늘</Text>
          <TouchableOpacity style={styles.rightIconButton}>
            <Vector />
          </TouchableOpacity>
        </View>
        <View style={styles.infoIconRight}>
          <VectorIcon style={styles.vectorIconAbsolute} />
        </View>
      </View>

      {/* 평균 감정 섹션 */}
      <View style={styles.averageEmotionBox}>
        <Text style={styles.averageEmotionTitle}>평균 감정</Text>
        <View style={styles.emotionMetricsContainer}>
          <Text style={styles.emotionMetricText}>편안함 38%</Text>
          <Text style={styles.emotionMetricText}>즐거움 52%</Text>
        </View>
        <View style={styles.emotionIconContainer}>
          <EmotionIcon size={66} />
        </View>
      </View>

      {/* 감정 변화 그래프 섹션 */}
      <View style={{marginHorizontal: 15, marginTop: 18}}>
        <EmotionChart />
      </View>

      {/* 그래프 분석 박스 -> Rectangle15004로 교체 */}
      <Rectangle15004
        style={{
          marginTop: 15,
          paddingHorizontal: 25,
          paddingVertical: 20,
        }}>
        <AnalysisText />
      </Rectangle15004>

      {/* 새로운 직사각형 추가 */}
      <HorizontalDivider style={{marginTop: 30, marginBottom: 20}} />

      {/* 회고 일기 추천 섹션 -> Rectangle14999로 재구성 */}
      <Rectangle14999>
        <Text style={styles.diaryRecommendationTitle}>회고 일기 추천</Text>
        <View style={styles.recommendationMainBoxInside}>
          <DateText style={{marginTop: 21}} />
          <Rectangle15000
            style={{marginTop: 10, marginLeft: -7, marginRight: 8}}>
            <View style={styles.diaryContentBox}>
              <DiaryContentText />
            </View>
          </Rectangle15000>
          <TouchableOpacity style={styles.moveToDiaryButton}>
            <MoveToDiaryText />
            <Vector8Icon style={styles.vector8IconStyle} />
          </TouchableOpacity>
        </View>
      </Rectangle14999>

      {/* <RectYellowIcon style={styles.rectYellowIconStyle} /> */}
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 34,
    paddingBottom: 24,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  todayAndIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  rightIconButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIconRight: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{translateY: -14}],
  },
  vectorIconAbsolute: {
    position: 'absolute',
    right: 0,
    top: 3,
  },
  unionIconAbsolute: {
    position: 'absolute',
    right: 32,
    top: 0,
  },
  EllipseIcon: {
    position: 'absolute',
    right: 35,
    top: 3,
    width: 0.5,
    height: 0.5,
  },
  groupIconAbsolute: {
    position: 'absolute',
    right: 40,
    top: 8,
  },
  lightTextAbsolute: {
    position: 'absolute',
    right: 63,
    top: 4,
  },
  averageEmotionBox: {
    borderRadius: 10,
    backgroundColor: '#F4F4F4',
    width: '100%',
    height: 99,
    marginBottom: 20,
    paddingHorizontal: 25,
    justifyContent: 'center',
  },
  averageEmotionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.85)',
    textAlign: 'left',
    position: 'absolute',
    top: 20,
    left: 25,
  },
  emotionMetricsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    left: 25,
  },
  emotionMetricText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3F3F3F',
    marginRight: 20,
  },
  emotionIconContainer: {
    position: 'absolute',
    right: 19,
    top: 16,
  },
  diaryRecommendationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.85)',
    textAlign: 'left',
  },
  recommendationMainBoxInside: {
    width: '100%',
    marginTop: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  diaryContentBox: {
    width: '100%',
    paddingVertical: 15,
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  diaryMoveButton: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFE066',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  diaryMoveButtonText: {
    fontSize: 14,
    letterSpacing: 0.1,
    lineHeight: 20,
    fontWeight: '500',
    color: '#999',
    textAlign: 'left',
  },
  moveToDiaryTextWrapper: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 20,
  },
  moveToDiaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 20,
  },
  vector8IconStyle: {
    marginLeft: 4, // 텍스트와 아이콘 사이의 간격
  },
  rectYellowIconStyle: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
});

export default ReportScreen;

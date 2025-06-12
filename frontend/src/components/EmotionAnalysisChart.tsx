import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {G, Text as SVGText} from 'react-native-svg';
import {BarChart, YAxis} from 'react-native-svg-charts';

const EmotionAnalysisChart = () => {
  const data = [10, 30, 70, 90, 40, 70, 60];
  const labels = ['월', '화', '수', '목', '금', '토', '일'];
  const colors = [
    '#F1959B',
    '#F1959B',
    '#F5C463',
    '#F5C463',
    '#9EA6F1',
    '#F5C463',
    '#79C28D',
  ];

  const CUT_OFF = 20;

  const Labels = ({x, y, bandwidth, data}: any) => (
    <G>
      {data.map((value: number, index: number) => (
        <SVGText
          key={index}
          x={x(index) + bandwidth / 2}
          y={value < CUT_OFF ? y(value) - 10 : y(value) + 15}
          fontSize={12}
          fill="black"
          alignmentBaseline="middle"
          textAnchor="middle">
          {value}
        </SVGText>
      ))}
    </G>
  );

  return (
    <View>
      {/* 감정 변화 그래프 */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>감정 변화 그래프</Text>
        <View style={{flexDirection: 'row', height: 250, marginTop: 6}}>
          <YAxis
            data={[0, 50, 90]}
            contentInset={{top: 10, bottom: 10}}
            svg={{fontSize: 12, fill: '#999'}}
            numberOfTicks={3}
            min={0}
            max={90}
          />
          <BarChart
            style={{flex: 1, marginLeft: 8}}
            data={data}
            svg={{fill: (value: number, index: number) => colors[index]}}
            spacingInner={0.4}
            gridMin={0}
            contentInset={{top: 10, bottom: 10}}
            yMin={0}
            yMax={90}>
            <Labels />
          </BarChart>
        </View>
        {/* 요일 라벨 */}
        <View style={styles.labels}>
          {labels.map((label, index) => (
            <Text key={index} style={styles.labelText}>
              {label}
            </Text>
          ))}
        </View>
      </View>

      {/* 텍스트 해설 */}
      <View style={styles.explanationBox}>
        <Text style={styles.explanation}>
          이번 주엔 기분 좋은 날이 많았어요.{'\n'}
          특히 <Text style={styles.bold}>목요일</Text>과{' '}
          <Text style={styles.bold}>토요일</Text>에 기쁨이 자주 감지되었어요!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    elevation: 2,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 4,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 6,
  },
  labelText: {
    fontSize: 12,
    color: '#444',
  },
  explanationBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  explanation: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default EmotionAnalysisChart;

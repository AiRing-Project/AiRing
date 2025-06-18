export const VIBRATE_LIST = [
  {label: 'Basic', pattern: [1, 500, 200, 500]},
  {label: 'HeartBeat', pattern: [1, 100, 100, 300, 100, 700]},
];

export const CALLBACK_LIST = [
  {label: '10분 후', value: 10},
  {label: '20분 후', value: 20},
  {label: '30분 후', value: 30},
  {label: '40분 후', value: 40},
  {label: '50분 후', value: 50},
  {label: '1시간 후', value: 60},
];

export const VOICE_LIST = [
  {label: 'Puck', description: 'Upbeat'},
  {label: 'Charon', description: 'Informative'},
  {label: 'Kore', description: 'Firm'},
  {label: 'Fenrir', description: 'Excitable'},
  {label: 'Aoede', description: 'Breezy'},
  {label: 'Leda', description: 'Youthful'},
  {label: 'Orus', description: 'Firm'},
  {label: 'Zephy', description: 'Bright'},
];

export const INSTRUCTION = `당신은 사용자의 하루를 되돌아보는 대화를 도와주는 AI 어시스턴트입니다. 
자연스럽고 친근한 톤으로 대화하며, 사용자의 하루 경험과 감정을 탐색해주세요. 
다음과 같은 방식으로 대화를 진행해주세요:
1. 먼저 따뜻한 인사로 시작하기
2. 오늘 하루 어떻게 보냈는지 자연스럽게 묻기
3. 사용자의 답변에 공감하며 더 깊이 있는 질문하기
4. 긍정적인 경험은 축하하고, 어려운 경험은 위로하기
5. 감정과 생각을 자유롭게 표현할 수 있도록 격려하기
대화는 한국어로 진행하며, 자연스럽고 편안한 분위기를 만들어주세요.`;

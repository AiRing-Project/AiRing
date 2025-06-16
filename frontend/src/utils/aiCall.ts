import {Alert} from 'react-native';

import {initCallLog} from '../api/callApi';
import type {CallType} from '../types/call';

interface InitAiCallParams {
  callType: CallType;
  onSuccess?: (ephemeralToken: string, callLogId: number) => void;
  onError?: (e: unknown) => void;
}

export async function initAiCall({
  callType,
  onSuccess,
  onError,
}: InitAiCallParams) {
  try {
    const {ephemeralToken, callLogId} = await initCallLog({callType});
    // TODO: WebSocket 연결해서 session 시작
    if (onSuccess) {
      onSuccess(ephemeralToken, callLogId);
    }
  } catch (e) {
    Alert.alert(
      '통화 연결 실패',
      '네트워크 상태를 확인하거나 잠시 후 다시 시도해 주세요.',
    );
    if (onError) {
      onError(e);
    }
  }
}

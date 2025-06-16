import {CallType, SpeakerType} from '../types/call';
import api from './axiosInstance';

export interface InitCallLogParams {
  callType: CallType;
}

export interface InitCallLogResponse {
  ephemeralToken: string;
  callLogId: number;
}

export interface CallLogMessage {
  from: SpeakerType;
  message: string;
}

export interface PostCallLogMessagesParams {
  id: number;
  messages: CallLogMessage[];
}

export async function initCallLog(
  data: InitCallLogParams,
): Promise<InitCallLogResponse> {
  const res = await api.post('/call_logs/init', data);
  return res.data;
}

export async function postCallLogMessages(
  id: number,
  messages: CallLogMessage[],
): Promise<void> {
  await api.post(`/call_logs/${id}/messages`, messages);
}

export async function postCallLogEnd(id: number): Promise<void> {
  await api.post(`/call_logs/${id}/end`);
}

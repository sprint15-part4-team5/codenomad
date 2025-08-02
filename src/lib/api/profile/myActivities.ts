import instance from '../axios';
import type { MyActivitiesResponse } from '@/components/profile/types/activity';

// 내 체험 목록 조회
// 페이지네이션을 위해 cursorId와 size를 받을 수 있도록 수정
export const getMyActivities = async (
  cursorId?: number,
  size: number = 5,
): Promise<MyActivitiesResponse> => {
  const params = new URLSearchParams();
  if (cursorId) {
    params.append('cursorId', String(cursorId));
  }
  params.append('size', String(size));

  const response = await instance.get('/my-activities', {
    params,
  });
  return response.data;
};

// 내 체험 삭제
export const deleteMyActivity = async (activityId: number) => {
  await instance.delete(`/my-activities/${activityId}`);
};

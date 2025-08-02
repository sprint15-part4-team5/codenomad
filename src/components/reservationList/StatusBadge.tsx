import { StatusType } from './reservations.types';

interface ReservationStatusType {
  status: StatusType;
}

const StatusBadge = ({ status }: ReservationStatusType) => {
  const statusStyle = {
    canceled: {
      style: 'text-gray-600 bg-gray-100',
      text: '예약 취소',
    },
    confirmed: {
      style: 'text-[#2BA90D] bg-[#E9FBE4]',
      text: '예약 승인',
    },
    declined: {
      style: 'text-[#F96767] bg-[#FCECEA]',
      text: '예약 거절',
    },
    completed: {
      style: 'text-[#0D6CD1] bg-[#DAF0FF]',
      text: '체험 완료',
    },
    pending: {
      style: 'text-[#1790A0] bg-[#DDF9F9]',
      text: '예약 신청',
    },
  };

  return (
    <span className={`${statusStyle[status].style} text-13-b rounded-full px-8 py-4`}>
      {statusStyle[status].text}
    </span>
  );
};

export default StatusBadge;

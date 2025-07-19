export default function Layout({
  children,
  modal, // 병렬 슬롯
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal} {/* 여기서 모달을 렌더링 */}
    </>
  );
}

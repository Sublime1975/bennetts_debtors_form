export function CornerBrackets({ color = "#C9863F" }: { color?: string }) {
  const bracket = "absolute w-6 h-6";
  return (
    <>
      <div className={`${bracket} top-0 left-0 border-t-2 border-l-2 rounded-tl-sm`} style={{ borderColor: color }} />
      <div className={`${bracket} top-0 right-0 border-t-2 border-r-2 rounded-tr-sm`} style={{ borderColor: color }} />
      <div className={`${bracket} bottom-0 left-0 border-b-2 border-l-2 rounded-bl-sm`} style={{ borderColor: color }} />
      <div className={`${bracket} bottom-0 right-0 border-b-2 border-r-2 rounded-br-sm`} style={{ borderColor: color }} />
    </>
  );
}

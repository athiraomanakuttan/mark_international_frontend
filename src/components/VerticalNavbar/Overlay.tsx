const Overlay = ({ onClick }: { onClick: () => void }) => (
  <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClick} />
);

export default Overlay;

type OrdersUpdatedMarkProps = {
  token: number;
  visible: boolean;
  onHide: () => void;
};

export function OrdersUpdatedMark({ token, visible, onHide }: OrdersUpdatedMarkProps) {
  if (!visible) {
    return null;
  }

  return (
    <span
      key={token}
      className="orders-page__updated"
      onAnimationEnd={(event) => {
        if (event.animationName === 'orders-page-updated') {
          onHide();
        }
      }}
    >
      Обновлено
    </span>
  );
}

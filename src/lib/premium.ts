export const openPremiumModal = () => {
  window.dispatchEvent(new CustomEvent('open-premium'));
};

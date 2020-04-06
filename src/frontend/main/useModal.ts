import { useState } from 'react';

const useModal = () => {
  const [isShowing, setIsShowing] = useState(false);

  const toggleModal = () => {
    setIsShowing(!isShowing);
  };

  return {
    isShowing,
    toggleModal,
  };
};

export default useModal;

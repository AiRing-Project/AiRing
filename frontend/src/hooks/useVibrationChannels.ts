import {useEffect} from 'react';

import {createVibrationChannels} from '../utils/alarmManager';

const useVibrationChannels = () => {
  useEffect(() => {
    createVibrationChannels();
  }, []);
};

export default useVibrationChannels;

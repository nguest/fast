import { useEffect, useState } from 'react';

const context = new AudioContext();

export const Sound = ({ speed }) => {
  const [oscillator, setOscillator] = useState();

  useEffect(() => {
    const osc = context.createOscillator();
    osc.frequency.value = 50 + parseInt(speed, 10);
    osc.type = 'sawtooth';

    const gainNode = context.createGain();
    gainNode.gain.value = 0.05;
    osc.connect(gainNode);
    gainNode.connect(context.destination);

    //osc.start(0);

    setOscillator(osc);
    return () => {
      oscillator?.stop();
      oscillator?.disconnect();
      context.close();
    };
  }, []);

  useEffect(() => {
    if (oscillator) {
      if (parseInt(speed, 10) <= 0) {
        setInterval(() => {
          oscillator.frequency.value = 50 + Math.random() * 10;
        }, 1000);
      } else {
        oscillator.frequency.setValueAtTime(oscillator.frequency.value, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50 + parseInt(speed, 10), context.currentTime + 0.5);
      }

      //oscillator.frequency.value = 50 + parseInt(speed, 10);
    }
  }, [speed]);

  return null;
};

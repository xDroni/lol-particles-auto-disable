import 'react-toastify/dist/ReactToastify.css';

import React, { useContext, useEffect, useState } from 'react';
import { Slide, toast, ToastContainer } from 'react-toastify';

import { LoadingContext, ParticlesContext } from './AppContext';
import fetchParticles, { autoFetch } from './common/fetchParticles';
import { TOAST_NOTIFICATION_TYPES } from './common/types';
import Particles from './Particles';

function App() {
  const { interval, setInterval, replayLoad, setReplayLoad } = useContext(LoadingContext);
  const { particles, setParticles } = useContext(ParticlesContext);
  const [loadingToastId, setLoadingToastId] = useState(null);

  const toastNotificationHandler = (type, message) => {
    const options = {
      position: 'bottom-right',
      autoClose: 7000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'dark'
    };
    switch (type) {
      case TOAST_NOTIFICATION_TYPES.ERROR:
        toast.error(message, options);
        break;
      case TOAST_NOTIFICATION_TYPES.WARN:
        toast.warn(message, options);
        break;
      case TOAST_NOTIFICATION_TYPES.LOADING:
        setLoadingToastId(toast.loading(message));
        window.electronAPI.focusMainWindow();
        break;
      default:
        toast.info(message, options);
    }
  };

  useEffect(() => {
    window.electronAPI.waitForToastNotification(toastNotificationHandler);
  }, []);

  useEffect(() => {
    fetchParticles(setParticles, replayLoad, setReplayLoad);
    if (Number(interval)) {
      clearInterval(interval);
    }

    const i =
      replayLoad === true || replayLoad === null
        ? autoFetch(setParticles, replayLoad, setReplayLoad, 2000)
        : autoFetch(setParticles, replayLoad, setReplayLoad, 7000);
    setInterval(i);

    if (replayLoad === true) {
      toastNotificationHandler(
        TOAST_NOTIFICATION_TYPES.LOADING,
        'Cannot find the replay. Save the disabled particles to file to not lose them!'
      );
    }

    if (replayLoad === false && loadingToastId !== null) {
      toast.update(loadingToastId, {
        render: 'The replay has been found',
        type: 'success',
        autoClose: 3000,
        isLoading: false
      });
    }

    return () => {
      clearInterval(i);
    };
  }, [replayLoad]);

  if (particles.length === 0) {
    return (
      <>
        <header className="absolute right-0 top-0">v{process.env.REACT_APP_VERSION}</header>
        <div className="flex h-screen w-screen items-center justify-center">
          <span className="text-3xl">Waiting for the replay...</span>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="absolute right-0 top-0">v{process.env.REACT_APP_VERSION}</header>
      <Particles />
      <footer className="absolute right-0 bottom-0 mb-2 text-white">
        <span className="text-[0px] sm:text-xs">Created by </span>
        <span className="text-xxs font-bold sm:text-xs">dx droni#9467</span>
        <span className="text-[0px] sm:text-xs"> mrdroonix@gmail.com</span>
      </footer>
      <ToastContainer
        position="bottom-right"
        transition={Slide}
        limit={7}
        newestOnTop
        theme="dark"
      />
    </>
  );
}

export default App;

import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * useCamera — manages camera stream lifecycle
 *
 * Returns:
 *   videoRef, canvasRef   — attach to <video> and <canvas>
 *   state                 — 'idle' | 'requesting' | 'active' | 'captured' | 'error'
 *   cameraError           — string | null
 *   capturedImage         — base64 data-URL | null
 *   start, stop, capture, reset
 */
const useCamera = () => {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [state,         setState]         = useState('idle');
  const [cameraError,   setCameraError]   = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const start = useCallback(async () => {
    setCameraError(null);
    setCapturedImage(null);
    setState('requesting');
    stop(); // clear any existing stream

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width:      { ideal: 1280 },
          height:     { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setState('active');
        };
      }
    } catch (err) {
      let msg = 'Unable to access camera.';
      if (err.name === 'NotAllowedError')  msg = 'Camera permission denied. Please allow access in your browser settings.';
      if (err.name === 'NotFoundError')    msg = 'No camera found on this device.';
      if (err.name === 'NotReadableError') msg = 'Camera is being used by another application.';
      if (err.name === 'OverconstrainedError') msg = 'Camera constraints could not be satisfied.';
      setCameraError(msg);
      setState('error');
    }
  }, [stop]);

  const capture = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || state !== 'active') return;

    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    // Mirror the capture to match the mirrored preview
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stop();
    setState('captured');
  }, [state, stop]);

  const reset = useCallback(() => {
    stop();
    setCapturedImage(null);
    setCameraError(null);
    setState('idle');
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  return {
    videoRef, canvasRef,
    state, cameraError, capturedImage,
    start, stop, capture, reset,
  };
};

export default useCamera;

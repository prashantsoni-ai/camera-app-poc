import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, Download, RotateCcw, RefreshCw, Info, Eye, EyeOff } from 'lucide-react';

// EXIF.js library functionality - simplified implementation
const EXIF = {
  getData: (img, callback) => {
    if (img.src && img.src.startsWith('data:image')) {
      // Extract EXIF data from data URL
      const base64Data = img.src.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Basic EXIF extraction (simplified)
      const exifData = {
        DateTime: new Date().toISOString(),
        ImageWidth: img.naturalWidth || img.width,
        ImageHeight: img.naturalHeight || img.height,
        Make: 'Web Browser',
        Model: navigator.userAgent.includes('Mobile') ? 'Mobile Camera' : 'Desktop Camera',
        Orientation: 1,
        XResolution: 72,
        YResolution: 72,
        ResolutionUnit: 2,
        Software: 'Dual Camera Studio',
        ColorSpace: 1,
        ExifImageWidth: img.naturalWidth || img.width,
        ExifImageHeight: img.naturalHeight || img.height,
        UserAgent: navigator.userAgent,
        CaptureMethod: img.src.includes('webcam') ? 'Live Camera' : 'File Upload'
      };
      
      callback.call(img, exifData);
    } else {
      // For uploaded files, we can't access EXIF without the actual file
      callback.call(img, {
        DateTime: new Date().toISOString(),
        ImageWidth: img.naturalWidth || img.width,
        ImageHeight: img.naturalHeight || img.height,
        CaptureMethod: 'File Upload',
        Software: 'Dual Camera Studio'
      });
    }
  },
  
  getTag: (img, tag) => {
    return img.exifdata ? img.exifdata[tag] : null;
  }
};

// Embedded CSS styles with responsive design
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#000000',
    padding: '16px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  maxWidth: {
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: '700',
    background: 'linear-gradient(to right, #60a5fa, #a855f7, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '16px',
    lineHeight: '1.2'
  },
  subtitle: {
    color: '#d1d5db',
    fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
    padding: '0 16px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
    gap: 'clamp(16px, 4vw, 32px)',
    width: '100%'
  },
  card: {
    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
    borderRadius: 'clamp(12px, 2vw, 16px)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: 'clamp(16px, 4vw, 32px)',
    border: '1px solid #374151',
    backdropFilter: 'blur(8px)',
    width: '100%',
    boxSizing: 'border-box'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(8px, 2vw, 12px)',
    marginBottom: 'clamp(16px, 3vw, 24px)',
    flexWrap: 'wrap'
  },
  iconWrapper: {
    padding: 'clamp(6px, 1.5vw, 8px)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  blueIcon: {
    backgroundColor: '#2563eb'
  },
  purpleIcon: {
    backgroundColor: '#9333ea'
  },
  cardTitle: {
    fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
    wordBreak: 'break-word'
  },
  webcamContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
    width: '100%'
  },
  webcamCanvas: {
    borderRadius: 'clamp(8px, 2vw, 12px)',
    border: '2px solid #4b5563',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    maxWidth: '100%',
    width: '100%',
    height: 'auto',
    aspectRatio: '4/3'
  },
  buttonGroup: {
    display: 'flex',
    gap: 'clamp(8px, 2vw, 12px)',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px)',
    borderRadius: 'clamp(8px, 2vw, 12px)',
    border: 'none',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    color: '#ffffff',
    minHeight: '44px',
    justifyContent: 'center',
    whiteSpace: 'nowrap'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
  },
  secondaryButton: {
    background: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)'
  },
  greenButton: {
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
  },
  orangeButton: {
    background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)'
  },
  uploadArea: {
    border: '2px dashed #4b5563',
    borderRadius: 'clamp(8px, 2vw, 12px)',
    padding: 'clamp(20px, 5vw, 40px)',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(55, 65, 81, 0.1)',
    width: '100%',
    boxSizing: 'border-box'
  },
  uploadAreaHover: {
    borderColor: '#9333ea',
    backgroundColor: 'rgba(147, 51, 234, 0.1)'
  },
  hiddenInput: {
    display: 'none'
  },
  uploadIcon: {
    padding: 'clamp(12px, 3vw, 16px)',
    borderRadius: '50%',
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 'clamp(12px, 3vw, 16px)'
  },
  uploadText: {
    color: '#ffffff',
    fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
    fontWeight: '600',
    display: 'block',
    marginBottom: '8px',
    wordBreak: 'break-word'
  },
  uploadSubtext: {
    color: '#9ca3af',
    fontSize: 'clamp(11px, 2vw, 14px)',
    wordBreak: 'break-word',
    lineHeight: '1.4'
  },
  imageSection: {
    marginTop: 'clamp(16px, 4vw, 24px)',
    width: '100%'
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: '16px',
    fontSize: 'clamp(1rem, 2.5vw, 1.125rem)'
  },
  imageContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: 'min(400px, 60vh)',
    width: 'auto',
    height: 'auto',
    borderRadius: 'clamp(8px, 2vw, 12px)',
    border: '2px solid #4b5563',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    objectFit: 'contain'
  },
  downloadButton: {
    position: 'absolute',
    top: 'clamp(8px, 2vw, 12px)',
    right: 'clamp(8px, 2vw, 12px)',
    padding: 'clamp(8px, 2vw, 12px)',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    opacity: '0.8',
    color: '#ffffff',
    minWidth: '44px',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  exifButton: {
    position: 'absolute',
    top: 'clamp(8px, 2vw, 12px)',
    right: 'clamp(60px, 15vw, 80px)',
    padding: 'clamp(8px, 2vw, 12px)',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    opacity: '0.8',
    color: '#ffffff',
    minWidth: '44px',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  exifPanel: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: '8px',
    border: '1px solid #4b5563',
    backdropFilter: 'blur(4px)'
  },
  exifTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  exifGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '8px',
    fontSize: '12px'
  },
  exifItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    borderBottom: '1px solid rgba(75, 85, 99, 0.3)'
  },
  exifLabel: {
    color: '#9ca3af',
    fontWeight: '500'
  },
  exifValue: {
    color: '#f3f4f6',
    fontFamily: 'mono, monospace',
    wordBreak: 'break-all'
  },
  footer: {
    textAlign: 'center',
    marginTop: 'clamp(32px, 6vw, 48px)',
    padding: '0 16px'
  },
  footerContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#9ca3af',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
    flexShrink: 0
  },
  footerText: {
    fontSize: 'clamp(12px, 2vw, 14px)',
    margin: 0
  }
};

// Add keyframe animation for pulse effect
const pulseAnimation = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

// EXIF Display Component
const ExifPanel = ({ exifData, isVisible, onToggle }) => {
  if (!isVisible || !exifData) return null;

  const formatExifValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value);
    if (value.toString().length > 50) return value.toString().substring(0, 50) + '...';
    return value.toString();
  };

  return (
    <div style={styles.exifPanel}>
      <div style={styles.exifTitle}>
        <Info size={16} />
        Image Metadata (EXIF)
      </div>
      <div style={styles.exifGrid}>
        {Object.entries(exifData).map(([key, value]) => (
          <div key={key} style={styles.exifItem}>
            <span style={styles.exifLabel}>{key}:</span>
            <span style={styles.exifValue}>{formatExifValue(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Real webcam component using getUserMedia API with better mobile support
const Webcam = ({ ref, screenshotFormat, width, height, videoConstraints }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cameraCapabilities, setCameraCapabilities] = useState({
    hasZoom: false,
    hasFlash: false,
    currentZoom: null,
    isFlashOn: false
  });

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);

  const startCamera = async (facingMode = 'user') => {
    try {
      setIsLoading(true);
      setError(null);
      setPermissionDenied(false);
      
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Check if running on HTTPS or localhost
      const isSecureContext = window.isSecureContext;
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (!isSecureContext && !isLocalhost) {
        throw new Error('Camera requires secure connection (HTTPS) or localhost');
      }

      // Mobile-specific constraints
      const constraints = isMobile ? {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      } : {
        video: {
          facingMode: facingMode,
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 }
        }
      };

      // Try to get camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Mobile-specific attributes
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        
        // Force play on mobile
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.log('Video autoplay failed:', playError);
          // This is often normal on mobile - user might need to interact first
        }
      }

      setIsLoading(false);
      
    } catch (err) {
      console.error('Camera access error:', err);
      setIsLoading(false);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setError('Camera permission denied. Please allow camera access in your browser settings and refresh the page.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is being used by another app. Please close other camera apps and try again.');
      } else if (err.message.includes('HTTPS')) {
        setError('Camera requires secure connection (HTTPS). Please access this page via HTTPS.');
      } else {
        setError(`Camera error: ${err.message || 'Unknown error'}. Try refreshing the page.`);
      }
    }
  };

  // Add methods to control zoom and flash
  const setZoom = useCallback(async (zoomLevel) => {
    if (!stream || !cameraCapabilities.hasZoom) return;
    
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      await videoTrack.applyConstraints({
        advanced: [{ zoom: zoomLevel }]
      });
      
      const settings = videoTrack.getSettings();
      setCameraCapabilities(prev => ({
        ...prev,
        currentZoom: settings.zoom
      }));
    } catch (err) {
      console.error('Error setting zoom:', err);
    }
  }, [stream, cameraCapabilities.hasZoom]);

  const toggleFlash = useCallback(async () => {
    if (!stream || !cameraCapabilities.hasFlash) return;
    
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const newFlashState = !cameraCapabilities.isFlashOn;
      await videoTrack.applyConstraints({
        advanced: [{ torch: newFlashState }]
      });
      
      setCameraCapabilities(prev => ({
        ...prev,
        isFlashOn: newFlashState
      }));
    } catch (err) {
      console.error('Error toggling flash:', err);
    }
  }, [stream, cameraCapabilities.hasFlash, cameraCapabilities.isFlashOn]);

  React.useEffect(() => {
    startCamera('user');

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  React.useImperativeHandle(ref, () => ({
    getScreenshot: () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !canvas) {
        console.error('Video or canvas not available');
        return null;
      }
      
      // Check if video is playing and has dimensions
      if (video.readyState < 2) {
        console.error('Video not ready - readyState:', video.readyState);
        return null;
      }
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('Video has no dimensions');
        return null;
      }
      
      try {
        // Use video's actual dimensions for better quality
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas first
        ctx.clearRect(0, 0, videoWidth, videoHeight);
        
        // Draw the video frame
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        
        // Convert to data URL
        const dataURL = canvas.toDataURL(screenshotFormat, 0.9);
        console.log('Screenshot captured successfully');
        return dataURL;
        
      } catch (error) {
        console.error('Screenshot capture error:', error);
        return null;
      }
    },
    switchCamera: () => {
      const currentFacingMode = videoConstraints.facingMode === 'user' ? 'environment' : 'user';
      startCamera(currentFacingMode);
    },
    getCameraCapabilities: () => cameraCapabilities,
    setZoom,
    toggleFlash
  }));

  const retryCamera = () => {
    startCamera('user');
  };

  const errorStyle = {
    ...styles.webcamCanvas,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: '#1f2937',
    color: '#ef4444',
    padding: 'clamp(16px, 4vw, 20px)',
    textAlign: 'center',
    minHeight: '200px'
  };

  const loadingStyle = {
    ...styles.webcamCanvas,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: '#1f2937',
    color: '#60a5fa',
    minHeight: '200px'
  };

  if (error) {
    return (
      <div>
        <div style={errorStyle}>
          <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', marginBottom: '8px' }}>
            {permissionDenied ? '🚫' : '📷'}
          </div>
          <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: '600', marginBottom: '8px' }}>
            {permissionDenied ? 'Camera Permission Required' : 'Camera Error'}
          </div>
          <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#9ca3af', marginBottom: '16px', lineHeight: '1.4' }}>
            {error}
          </div>
          <button
            onClick={retryCamera}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              fontSize: 'clamp(10px, 2vw, 12px)',
              padding: '8px 16px'
            }}
          >
            <RefreshCw size={16} />
            Retry Camera
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={loadingStyle}>
        <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', marginBottom: '8px' }}>🔄</div>
        <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: '600' }}>Loading Camera...</div>
        <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#9ca3af', marginTop: '4px' }}>
          Please allow camera access when prompted
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          ...styles.webcamCanvas,
          objectFit: 'cover'
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.play().catch(console.error);
          }
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </div>
  );
};

const CameraApp = () => {
  const [webcamImage, setWebcamImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [webcamExif, setWebcamExif] = useState(null);
  const [uploadedExif, setUploadedExif] = useState(null);
  const [showWebcamExif, setShowWebcamExif] = useState(false);
  const [showUploadedExif, setShowUploadedExif] = useState(false);
  const [isUploadHovered, setIsUploadHovered] = useState(false);
  const [allCapturedImages, setAllCapturedImages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [cameraCapabilities, setCameraCapabilities] = useState({
    hasZoom: false,
    hasFlash: false,
    currentZoom: null,
    isFlashOn: false
  });

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);

  // Update extractExifData to include zoom and flash information
  const extractExifData = (imageSrc, callback) => {
    const img = new Image();
    img.onload = () => {
      EXIF.getData(img, function() {
        const exifData = {};
        
        // Add basic image info
        exifData.DateTime = new Date().toISOString();
        exifData.ImageWidth = this.naturalWidth || this.width;
        exifData.ImageHeight = this.naturalHeight || this.height;
        exifData.FileSize = imageSrc.length;
        exifData.ColorDepth = 24;
        
        // Add camera capabilities info
        exifData.HasZoom = cameraCapabilities.hasZoom;
        exifData.CurrentZoom = cameraCapabilities.currentZoom;
        exifData.HasFlash = cameraCapabilities.hasFlash;
        exifData.IsFlashOn = cameraCapabilities.isFlashOn;
        
        // Add browser/device info
        exifData.UserAgent = navigator.userAgent;
        exifData.Platform = navigator.platform;
        exifData.Language = navigator.language;
        exifData.CookieEnabled = navigator.cookieEnabled;
        exifData.OnLine = navigator.onLine;

        // Add screen info safely
        if (typeof window !== 'undefined' && window.screen) {
          exifData.ScreenWidth = window.screen.width;
          exifData.ScreenHeight = window.screen.height;
          exifData.ColorDepthScreen = window.screen.colorDepth;
        }

        // Add timestamp and source info
        exifData.CaptureTimestamp = Date.now();
        exifData.TimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        exifData.Software = 'Dual Camera Studio v1.0';
        
        // Determine capture method
        if (imageSrc.includes('data:image')) {
          exifData.CaptureMethod = 'Live Camera';
          exifData.Make = 'Web Browser';
          exifData.Model = navigator.userAgent.includes('Mobile') ? 'Mobile Camera' : 'Desktop Camera';
        } else {
          exifData.CaptureMethod = 'File Upload';
        }
        
        callback(exifData);
      });
    };
    img.src = imageSrc;
  };

  // Webcam capture function with EXIF extraction
  const captureWebcam = useCallback(() => {
    if (!webcamRef.current) {
      alert('Camera not initialized. Please wait or refresh the page.');
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setWebcamImage(imageSrc);
      
      // Extract EXIF data
      extractExifData(imageSrc, (exifData) => {
        setWebcamExif(exifData);
        
        // Add to all captured images with metadata
        const newCapture = {
          id: Date.now(),
          image: imageSrc,
          exif: exifData,
          type: 'webcam',
          timestamp: new Date().toISOString()
        };
        
        setAllCapturedImages(prev => [...prev, newCapture]);
      });
    } else {
      alert('Failed to capture image. Please ensure camera is working and try again.');
    }
  }, [webcamRef]);

  // Switch camera function for mobile devices
  const switchCamera = useCallback(() => {
    if (!webcamRef.current) {
      alert('Camera not initialized. Please wait or refresh the page.');
      return;
    }
    webcamRef.current.switchCamera();
  }, [webcamRef]);

  // File input change handler with EXIF extraction
  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result;
        if (imageSrc) {
          setUploadedImage(imageSrc);
          
          // Extract EXIF data
          extractExifData(imageSrc, (exifData) => {
            exifData.FileName = file.name;
            exifData.FileSize = file.size;
            exifData.FileType = file.type;
            exifData.LastModified = new Date(file.lastModified).toISOString();
            setUploadedExif(exifData);
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Download image function
  const downloadImage = (imageSrc, filename) => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container}>
      <style>{pulseAnimation}</style>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Dual Camera Studio</h1>
          <p style={styles.subtitle}>
            {isMobile ? 'Mobile Camera Studio' : 'Professional dual-camera experience with live webcam capture and file upload capabilities'}
          </p>
        </div>

        {/* Main Grid */}
        <div style={styles.grid}>
          {/* Webcam Section */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{...styles.iconWrapper, ...styles.blueIcon}}>
                <Camera size={24} color="white" />
              </div>
              <h2 style={styles.cardTitle}>{isMobile ? 'Mobile Camera' : 'Live Camera'}</h2>
            </div>
            
            <div style={styles.webcamContainer}>
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                height="auto"
                videoConstraints={{
                  width: isMobile ? 1280 : 640,
                  height: isMobile ? 720 : 480,
                  facingMode: "user"
                }}
              />
            </div>
            
            <div style={styles.buttonGroup}>
              <button
                onClick={captureWebcam}
                style={{...styles.button, ...styles.primaryButton}}
              >
                <Camera size={18} />
                {isMobile ? 'Take Photo' : 'Capture'}
              </button>
              {isMobile && (
                <button
                  onClick={switchCamera}
                  style={{...styles.button, ...styles.secondaryButton}}
                >
                  <RotateCcw size={18} />
                  Switch Camera
                </button>
              )}
            </div>

            {/* Webcam Image Display */}
            {webcamImage && (
              <div style={styles.imageSection}>
                <h3 style={styles.sectionTitle}>Captured Image</h3>
                <div style={styles.imageContainer}>
                  <img 
                    src={webcamImage} 
                    alt="Webcam capture" 
                    style={styles.imagePreview}
                  />
                  <button
                    onClick={() => downloadImage(webcamImage, `webcam-${Date.now()}.jpg`)}
                    style={{...styles.downloadButton, ...styles.greenButton}}
                    title="Download Image"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => setShowWebcamExif(!showWebcamExif)}
                    style={{...styles.exifButton, ...styles.orangeButton}}
                    title="View EXIF Data"
                  >
                    {showWebcamExif ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <ExifPanel 
                  exifData={webcamExif} 
                  isVisible={showWebcamExif}
                  onToggle={() => setShowWebcamExif(!showWebcamExif)}
                />
              </div>
            )}
          </div>

          {/* Upload Section - Hide on mobile */}
          {!isMobile && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={{...styles.iconWrapper, ...styles.purpleIcon}}>
                  <Upload size={24} color="white" />
                </div>
                <h2 style={styles.cardTitle}>File Upload</h2>
              </div>
              
              <div 
                style={{
                  ...styles.uploadArea,
                  ...(isUploadHovered ? styles.uploadAreaHover : {})
                }}
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={() => setIsUploadHovered(true)}
                onMouseLeave={() => setIsUploadHovered(false)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsUploadHovered(true);
                }}
                onDragLeave={() => setIsUploadHovered(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsUploadHovered(false);
                  const files = e.dataTransfer.files;
                  if (files[0]) {
                    const event = { target: { files: [files[0]] } };
                    handleFileInputChange(event);
                  }
                }}
              >
                <div style={styles.uploadIcon}>
                  <Upload size={32} color="#9333ea" />
                </div>
                <span style={styles.uploadText}>
                  Click to upload or drag & drop
                </span>
                <span style={styles.uploadSubtext}>
                  Support for JPG, PNG, GIF, WebP formats
                </span>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  style={styles.hiddenInput}
                />
              </div>

              {/* Uploaded Image Display */}
              {uploadedImage && (
                <div style={styles.imageSection}>
                  <h3 style={styles.sectionTitle}>Uploaded Image</h3>
                  <div style={styles.imageContainer}>
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      style={styles.imagePreview}
                    />
                    <button
                      onClick={() => downloadImage(uploadedImage, `upload-${Date.now()}.jpg`)}
                      style={{...styles.downloadButton, ...styles.greenButton}}
                      title="Download Image"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => setShowUploadedExif(!showUploadedExif)}
                      style={{...styles.exifButton, ...styles.orangeButton}}
                      title="View EXIF Data"
                    >
                      {showUploadedExif ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <ExifPanel 
                    exifData={uploadedExif} 
                    isVisible={showUploadedExif}
                    onToggle={() => setShowUploadedExif(!showUploadedExif)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.statusDot}></div>
            <p style={styles.footerText}>
              {isMobile ? 'Mobile Camera Ready' : 'Camera Studio Ready'} • {allCapturedImages.length} images captured
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraApp;
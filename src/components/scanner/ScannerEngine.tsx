import React, { useState, useRef, useCallback } from 'react';
import { Camera, Image as ImageIcon, RotateCcw } from 'lucide-react';

interface ScannerEngineProps {
  onAnalyze: (imageSrc: string) => void;
}

export default function ScannerEngine(props: ScannerEngineProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      setStream(mediaStream);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError("Gagal mengakses kamera. Pastikan Anda telah memberikan izin, atau gunakan fitur unggah foto.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const width = video.videoWidth || video.clientWidth || 640;
      const height = video.videoHeight || video.clientHeight || 480;
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        try {
          ctx.drawImage(video, 0, 0, width, height);
          const imageSrc = canvas.toDataURL('image/jpeg', 0.8);
          stopCamera();
          props.onAnalyze(imageSrc);
        } catch (e) {
          console.error("Failed to capture image:", e);
        }
      }
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCapturedImage(result);
        stopCamera();
        props.onAnalyze(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  React.useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(e => console.error("Error playing video:", e));
      };
    }
  }, [stream]);

  if (capturedImage) {
    return (
      <div className="flex flex-col h-full bg-black">
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          <img src={capturedImage} alt="Captured" className="max-h-full max-w-full object-contain" />
        </div>
        <div className="bg-white rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-10 flex flex-col gap-4 pb-12">
          <button 
            onClick={retakePhoto}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-6 h-6" />
            Foto Ulang / Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black relative">
      {!stream && !error && (
        <div className="flex-1 flex flex-col items-center justify-center text-white p-6 text-center z-10 bg-eco-bg text-eco-text">
          <Camera className="w-20 h-20 mb-6 opacity-30 text-eco-green" />
          <h2 className="text-2xl font-bold mb-2">Pemindai Sampah</h2>
          <p className="text-eco-text-light mb-8 max-w-xs">Arahkan kamera ke sampah untuk mengetahui jenis dan cara membuangnya.</p>
          <button 
            onClick={startCamera}
            className="bg-eco-green hover:bg-eco-green-dark text-white rounded-full py-4 px-8 font-bold text-lg transition-all active:scale-95 w-full max-w-xs shadow-lg shadow-eco-green/30"
          >
            Buka Kamera
          </button>
          <div className="mt-6 flex items-center gap-2">
            <div className="h-px w-16 bg-gray-300"></div>
            <span className="text-gray-500 text-sm">Atau</span>
            <div className="h-px w-16 bg-gray-300"></div>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 text-eco-green font-medium flex items-center gap-2 p-2 active:opacity-70"
          >
            <ImageIcon className="w-5 h-5" />
            Pilih dari Galeri
          </button>
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 bg-eco-bg">
          <div className="bg-eco-red/10 p-4 rounded-full mb-4">
            <Camera className="w-12 h-12 text-eco-red" />
          </div>
          <p className="text-eco-red mb-8 max-w-xs">{error}</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-eco-blue hover:bg-eco-blue/90 text-white rounded-full py-4 px-8 font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 w-full max-w-xs shadow-lg shadow-eco-blue/30"
          >
            <ImageIcon className="w-5 h-5" />
            Pilih dari Galeri
          </button>
        </div>
      )}

      {stream && (
        <>
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
            <div className="w-full aspect-square max-w-sm border-2 border-white/50 rounded-3xl relative">
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-eco-green rounded-tl-3xl" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-eco-green rounded-tr-3xl" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-eco-green rounded-bl-3xl" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-eco-green rounded-br-3xl" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 flex items-center justify-between z-10 max-w-xs mx-auto">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={captureFrame}
              className="w-20 h-20 rounded-full border-4 border-white active:scale-95 flex items-center justify-center transition-all"
            >
              <div className="w-16 h-16 bg-white rounded-full transition-all" />
            </button>
            <button 
              onClick={stopCamera}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform"
            >
              <span className="sr-only">Batal</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden" 
      />
    </div>
  );
}

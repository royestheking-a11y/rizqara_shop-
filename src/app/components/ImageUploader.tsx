import React, { useState, useCallback } from 'react';
import { Upload, RotateCw, X, Check, Trash2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/app/utils/cropImage';
import { toast } from 'sonner';

interface ImageUploaderProps {
    onImageCropped: (base64Image: string) => void;
    aspectRatio?: number;
    label?: string;
    initialImage?: string;
    className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    onImageCropped,
    aspectRatio = 4 / 3,
    label = "Upload Image",
    initialImage,
    className = ""
}) => {
    const [uploadedImage, setUploadedImage] = useState<string | null>(initialImage || null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropping, setIsCropping] = useState(false);

    // Sync with initialImage
    React.useEffect(() => {
        if (initialImage) {
            setUploadedImage(initialImage);
        }
    }, [initialImage]);

    const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setUploadedImage(reader.result as string);
                setIsCropping(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleSaveCrop = async () => {
        try {
            if (!uploadedImage || !croppedAreaPixels) return;

            const croppedImage = await getCroppedImg(
                uploadedImage,
                croppedAreaPixels,
                rotation
            );

            onImageCropped(croppedImage);
            setUploadedImage(croppedImage); // Show the cropped result in preview
            setIsCropping(false);
            // We keep uploadedImage set so we can show a preview or allow re-crop if needed
        } catch (e) {
            console.error(e);
            toast.error('Failed to crop image');
        }
    };

    const handleCancel = () => {
        setUploadedImage(null);
        setIsCropping(false);
    };

    if (uploadedImage && isCropping) {
        return (
            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="relative h-64 w-full bg-gray-900 rounded-xl overflow-hidden">
                    <Cropper
                        image={uploadedImage}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspectRatio}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                    />
                </div>

                <div className="flex gap-4 items-center flex-wrap">
                    <div className="flex-1 min-w-[120px] space-y-1">
                        <label className="text-xs font-bold text-gray-600">Zoom</label>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1 min-w-[120px] space-y-1">
                        <label className="text-xs font-bold text-gray-600">Rotation</label>
                        <input
                            type="range"
                            value={rotation}
                            min={0}
                            max={360}
                            step={1}
                            onChange={(e) => setRotation(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setRotation(r => (r + 90) % 360)}
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                            title="Rotate 90deg"
                        >
                            <RotateCw size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            title="Cancel"
                        >
                            <X size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveCrop}
                            className="px-4 py-2 bg-[#D91976] text-white rounded-lg hover:bg-pink-800 transition flex items-center gap-2"
                        >
                            <Check size={18} /> Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>

            {!uploadedImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative bg-white">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Upload size={20} />
                        </div>
                        <p className="text-sm font-medium">Click to upload</p>
                    </div>
                </div>
            ) : (
                <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={uploadedImage} alt="Preview" className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCropping(true)}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 text-[#D91976]"
                            title="Edit Crop"
                        >
                            <RotateCw size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => { setUploadedImage(null); }}
                            className="p-2 bg-white rounded-full hover:bg-red-50 text-red-500"
                            title="Remove"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

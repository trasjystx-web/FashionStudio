import { AspectRatio, CameraAngle, ImageResolution, Pose } from "./types";

export const POSES: Pose[] = [
  { id: '1', name: 'Базовая проходка', description: 'Walking forward confidently, looking at camera', thumbnailUrl: 'https://picsum.photos/seed/pose1/300/400' },
  { id: '2', name: 'Руки в боки', description: 'Standing still, hands on hips, power pose', thumbnailUrl: 'https://picsum.photos/seed/pose2/300/400' },
  { id: '3', name: 'Сидя на стуле', description: 'Sitting on a high stool, one leg extended', thumbnailUrl: 'https://picsum.photos/seed/pose3/300/400' },
  { id: '4', name: 'Оборот 3/4', description: 'Turned 3/4 away from camera, looking back over shoulder', thumbnailUrl: 'https://picsum.photos/seed/pose4/300/400' },
  { id: '5', name: 'Динамичный прыжок', description: 'Mid-air jumping pose, dynamic fashion shot', thumbnailUrl: 'https://picsum.photos/seed/pose5/300/400' },
  { id: '6', name: 'Прислонившись к стене', description: 'Leaning casually against a wall, relaxed', thumbnailUrl: 'https://picsum.photos/seed/pose6/300/400' },
  { id: '7', name: 'Скрестив руки', description: 'Standing with arms crossed, serious expression', thumbnailUrl: 'https://picsum.photos/seed/pose7/300/400' },
  { id: '8', name: 'Рука у лица', description: 'Close up portrait style, hand gently touching face', thumbnailUrl: 'https://picsum.photos/seed/pose8/300/400' },
];

export const DEFAULT_SETTINGS = {
  resolution: ImageResolution.RES_1K,
  aspectRatio: AspectRatio.PORTRAIT,
  cameraAngle: CameraAngle.EYE_LEVEL,
  prompt: "Professional studio lighting, 8k resolution, photorealistic, high fashion"
};

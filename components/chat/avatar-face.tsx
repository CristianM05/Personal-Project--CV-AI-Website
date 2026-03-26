"use client";

type Emotion =
  | "neutral"
  | "happy"
  | "sad"
  | "angry"
  | "surprised"
  | "thinking"
  | "talking";

interface AvatarFaceProps {
  emotion: Emotion;
  speaking: boolean;
}

export function AvatarFace({ emotion, speaking }: AvatarFaceProps) {
  const emotionClass = `avatar-${emotion}`;
  const speakingClass = speaking ? "avatar-speaking" : "";

  return (
    <div className={`avatar-shell ${emotionClass} ${speakingClass}`}>
      <div className="avatar-grid" />
      <div className="avatar-face">
        <div className="avatar-eye avatar-eye-left" />
        <div className="avatar-eye avatar-eye-right" />
        <div className="avatar-mouth" />
      </div>
      <div className="avatar-glow" />
    </div>
  );
}


import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to map sentiment to mood
export const emotionToMood = (emotion?: string) => {
  switch (emotion?.toLowerCase()) {
    case 'happy':
      return { emoji: '😊', color: '' };
    case 'excited':
      return { emoji: '😃', color: '' };
    case 'grateful':
      return { emoji: '🙏', color: '' };
    case 'content':
        return { emoji: '😌', color: '' };
    case 'loving':
      return { emoji: '😍', color: '' };
    case 'relaxed':
      return { emoji: '😌', color: '' };
    case 'calm':
      return { emoji: '😌', color: '' };
    case 'romantic':
        return { emoji: '🥰', color: '' };
    case 'amused':
        return { emoji: '😂', color: '' };
    case 'joyful':
        return { emoji: '🎉', color: '' };
    case 'optimistic':
        return { emoji: '👍', color: '' };
    case 'proud':
        return { emoji: '🏆', color: '' };
    case 'sad':
      return { emoji: '😢', color: '' };
    case 'angry':
      return { emoji: '😠', color: '' };
    case 'anxious':
      return { emoji: '😟', color: '' };
    case 'worried':
      return { emoji: '😨', color: '' };
    case 'scared':
      return { emoji: '😱', color: '' };
    case 'surprised':
      return { emoji: '😮', color: '' };
    case 'bored':
        return { emoji: '😴', color: '' };
    case 'exhausted':
        return { emoji: '😴', color: '' };
    case 'stressed':
        return { emoji: '😥', color: '' };
    case 'tired':
        return { emoji: '😴', color: '' };
    case 'confused':
        return { emoji: '🤔', color: '' };
    case 'lonely':
        return { emoji: '😔', color: '' };
    case 'guilty':
        return { emoji: '😅', color: '' };
    case 'disappointed':
        return { emoji: '😞', color: '' };
    case 'neutral':
      return { emoji: '😐', color: '' };
    default:
        return { emoji: '😐', color: '' };
  }
};

    
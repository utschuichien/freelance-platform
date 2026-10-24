import { cn } from '@/lib/utils';

interface UserAvatarProps {
  seed?: string;
  src?: string;
  className?: string;
}

export default function UserAvatar({ seed, src, className }: UserAvatarProps) {
  // Sử dụng thư viện DiceBear API (phong cách Bottts - Robot Cyberpunk) của dự án
  const fallbackUrl = `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed || 'anonymous')}`;
  const avatarUrl = src && src.trim() !== '' && !src.includes('ui-avatars.com') ? src : fallbackUrl;

  return (
    <div className={cn("relative rounded-full overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center p-0.5", className)}>
      <img 
        src={avatarUrl} 
        alt={`Avatar of ${seed || 'User'}`} 
        className="w-full h-full object-cover rounded-full"
        onError={(e) => {
          if (e.currentTarget.src !== fallbackUrl) {
            e.currentTarget.src = fallbackUrl;
          }
        }}
      />
    </div>
  );
}

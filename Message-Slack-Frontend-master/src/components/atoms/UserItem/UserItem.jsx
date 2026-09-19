import { AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { cva } from 'class-variance-authority';
import { Link } from 'react-router-dom';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCurrentWorkspace } from '@/hooks/context/useCurrentWorkspace';

const userItemVariants = cva(
  'flex items-center gap-1.5 justify-start font-normal h-7 px-4 text-sm overflow-hidden',
  {
    variants: {
      variant: {
        default: 'text-[#f9edffcc]',
        active: 'text-[#481349] bg-white/90 hover:bg-white/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const UserItem = ({
    id,
    label = 'Member',
    image,
    variant,
}) => {
    const { currentWorkspace } = useCurrentWorkspace();
    const avatarFallback = label.charAt(0).toUpperCase();

    if (!currentWorkspace?._id) {
        return null;
    }

    return (
        <Button
            variant="transparent"
            className={userItemVariants({ variant })}
            size="sm"
            asChild
        >
            <Link to={`/workspaces/${currentWorkspace._id}/members/${id}`}>
                <Avatar className="size-5 rounded-md mr-1">
                    <AvatarImage className="rounded-md" src={image} />
                    <AvatarFallback className="rounded-md bg-sky-500 text-white text-xs">
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
                <span className="text-sm truncate">{label}</span>
            </Link>
        </Button>
    );
};

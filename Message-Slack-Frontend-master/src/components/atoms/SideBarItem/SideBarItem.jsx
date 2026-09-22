import { cva } from 'class-variance-authority';
import { Link, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';

const sideBarItemVariants = cva(
  'flex items-center gap-1.5 justify-start font-normal h-7 px-4 text-sm overflow-hidden',
  {
    variants: {
      variant: {
        default: 'text-[#f9edffcc] hover:bg-white/10',
        active: 'text-[#481349] bg-white/90 hover:bg-white/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const SPECIAL_DESTINATIONS = {
  threads: 'threads',
  drafts: 'drafts',
};

export const SideBarItem = ({
    label,
    id,
    icon: Icon,
    variant,
}) => {
    const { workspaceId } = useParams();
    const specialPath = SPECIAL_DESTINATIONS[id];
    const destination = specialPath
      ? `/workspaces/${workspaceId}/${specialPath}`
      : `/workspaces/${workspaceId}/channels/${id}`;

    return (
        <Button
            variant="transparent"
            className={sideBarItemVariants({ variant })}
            size="sm"
            asChild
        >
            <Link className="flex items-center gap-1.5" to={destination}>
                {Icon && <Icon className="size-3.5 mr-1" />}
                <span className="text-sm">{label}</span>
            </Link>
        </Button>
    );
};

import { forwardRef } from 'react';
import { cn } from '~/lib/utils';

type IconProps = React.ComponentProps<'svg'> & {
	name: string;
};

export const Icon = forwardRef<React.ElementRef<'svg'>, IconProps>(
	({ name, ...props }, ref) => {
		return (
			<svg
				{...props}
				ref={ref}
				className={cn(
					'inline-block aspect-square w-[21px] fill-current',
					props.className,
				)}
			>
				<use href={`/sprite.svg#${name}`} />
			</svg>
		);
	},
);

Icon.displayName = 'Icon';

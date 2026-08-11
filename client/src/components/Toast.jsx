import React, { useMemo, useState } from 'react';

const typeStyles = {
	success: {
		backgroundColor: '#059669',
		textColor: '#ffffff',
		icon: '✅',
	},
	error: {
		backgroundColor: '#dc2626',
		textColor: '#ffffff',
		icon: '🚫',
	},
	warning: {
		backgroundColor: '#d97706',
		textColor: '#ffffff',
		icon: '⚠️',
	},
	info: {
		backgroundColor: '#2563eb',
		textColor: '#ffffff',
		icon: 'ℹ️',
	},
};

const Toast = ({ toasts, removeToast }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const displayedToasts = useMemo(() => [...toasts].reverse(), [toasts]);
	const newestToast = displayedToasts[0];

	const toastOffsets = useMemo(() => {
		let expandedOffset = 0;

		return displayedToasts.map((toast, index) => {
			const collapsedOffset = index * toast.options.stackOffset;
			const offset = isExpanded ? expandedOffset : collapsedOffset;

			expandedOffset += toast.options.height + toast.options.expandedGap;

			return offset;
		});
	}, [displayedToasts, isExpanded]);

	if (displayedToasts.length === 0) {
		return null;
	}

	const newestOptions = newestToast.options;
	const collapsedHeight = newestOptions.height
		+ (displayedToasts.length - 1) * newestOptions.stackOffset;
	const expandedHeight = displayedToasts.reduce(
		(total, toast, index) => total + toast.options.height
			+ (index === displayedToasts.length - 1 ? 0 : toast.options.expandedGap),
		0
	);

	return (
		<div
			className="fixed z-50"
			style={{
				bottom: newestOptions.bottom,
				right: newestOptions.right,
				width: newestOptions.width,
				height: isExpanded ? expandedHeight : collapsedHeight,
				transition: 'height 220ms ease',
			}}
			onMouseEnter={() => setIsExpanded(true)}
			onMouseLeave={() => setIsExpanded(false)}
		>
			{displayedToasts.map((toast, index) => {
				const defaults = typeStyles[toast.type] || typeStyles.info;
				const { options } = toast;

				return (
					<div
						key={toast.id}
						className="absolute left-0 flex items-center justify-between border shadow-lg"
						style={{
							bottom: toastOffsets[index],
							zIndex: displayedToasts.length - index,
							width: options.width,
							height: options.height,
							padding: options.padding,
							borderRadius: options.borderRadius,
							backgroundColor: options.backgroundColor || defaults.backgroundColor,
							color: options.textColor || defaults.textColor,
							borderColor: options.borderColor || 'rgba(255, 255, 255, 0.25)',
							fontSize: options.fontSize,
							transition: 'bottom 220ms ease, transform 220ms ease, opacity 220ms ease',
						}}
					>
						<div className="flex min-w-0 items-center gap-3 pr-2">
							<span className="shrink-0 text-xl">
								{options.icon || defaults.icon}
							</span>
							<p className="line-clamp-2 font-medium leading-snug">
								{toast.message}
							</p>
						</div>
						<button
							type="button"
							onClick={() => removeToast(toast.id)}
							className="shrink-0 rounded px-2 text-lg font-bold opacity-80 hover:opacity-100 focus:outline-none"
							aria-label="Close notification"
						>
							×
						</button>
					</div>
				);
			})}
		</div>
	);
};

export default Toast;

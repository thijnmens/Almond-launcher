import { useState, useEffect } from 'react';

export default function useRightClickMenu() {
	const [x, setX] = useState(0);
	const [y, setY] = useState(0);
	const [showMenu, setShowMenu] = useState(false);

	const handleClick = (e) => {
		showMenu && setShowMenu(false);
	};

	const handleContextMenu = (e) => {
		e.preventDefault();
		e.pageX + 256 > window.innerWidth ? setX(`${window.innerWidth - 256}px`) : setX(e.pageX);
		e.pageY + 256 > window.innerHeight ? setY(`${window.innerHeight - 256}px`) : setY(e.pageY);
		setShowMenu(true);
	};

	useEffect(() => {
		document.addEventListener('click', handleClick);
		document.addEventListener('contextmenu', handleContextMenu);
		return () => {
			document.removeEventListener('click', handleClick);
			document.removeEventListener('contextmenu', handleContextMenu);
		};
	});

	return { x, y, showMenu };
}

import { BiAddToQueue, BiPackage } from 'react-icons/bi';
import { RiSettingsFill, RiListCheck2 } from 'react-icons/ri';
import { BsListNested, BsFillTrashFill } from 'react-icons/bs';
import { IoMdPlay } from 'react-icons/io';

const Contextmenu = ({ x, y, showMenu }) => {
	const style = () => {
		return {
			top: y,
			left: x,
			display: showMenu ? 'flex' : 'none',
		};
	};

	const Icon = ({ icon, text }) => {
		return (
			<div className="contextmenu-button">
				{icon}
				<span>{text}</span>
			</div>
		);
	};

	return (
		<div style={style()} className="h-64 w-64 rounded-sm bg-gray-800 flex-col absolute z-50">
			<Icon className="contextmenu-button" icon={<IoMdPlay size="32" />} text="Play" />
			<Icon
				className="contextmenu-button"
				icon={<BiAddToQueue size="32" />}
				text="Add to group"
			/>
			<Icon
				className="contextmenu-button"
				icon={<RiSettingsFill size="32" />}
				text="Settings"
			/>
			<Icon
				className="contextmenu-button"
				icon={<BiPackage size="32" />}
				text="Install Mods"
			/>
			<Icon
				className="contextmenu-button"
				icon={<RiListCheck2 size="32" />}
				text="Verify Files"
			/>
			<Icon
				className="contextmenu-button"
				icon={<BsFillTrashFill size="32" />}
				text="Uninstall"
			/>
			<div>{IoMdPlay}</div>
		</div>
	);
};

export default Contextmenu;

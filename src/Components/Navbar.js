import ReactTooltip from 'react-tooltip';
import { createPortal } from 'react-dom';
import { FaFire, FaGithub, FaArchive } from 'react-icons/fa';

export const Portal = ({ children }) => {
	return createPortal(children, document.body);
};

const Navbar = () => {
	const NavbarIcon = ({ icon, text }) => (
	<div className='navbar-icon group static'>
		{icon}
		{/*  ok so.... WHY TF DOES OVERFLOW-Y AUTO CHANGE OVERFLOW-X VISIBLE IN AUTO TOO
		<span className='navbar-tooltip group-hover:scale-100'>
			{text}
		</span> */}
	</div>
	);

	const games = ["Uno", "*NEW* SCUFFED EPIC BHOP SIMULATOR 2023 (POG CHAMP)", "Abovus", "Conan the mighty pig", "Portal", "Crab game", "Hacknet", "Darksiders", "Black Mesa", " ", "*NEW* SCUFFED EPIC BHOP SIMULATOR 2023 (POG CHAMP)", "Abovus", "Conan the mighty pig", "Portal", "Crab game", "Hacknet", "Darksiders", "Black Mesa"]
	
	return (
		<div className="fixed top-0 bottom-0 left-0 h-screen w-16 m-0 flex flex-col bg-gray-900 text-white shadow-lg">
			<div className='flex-grow flex flex-col min-h-0'>
				<div className=''>
					<NavbarIcon icon={<FaFire size="28" />} text='Home' />
				</div>
				<div>
					<svg width="64px" height="10" xmlns="http://www.w3.org/2000/svg" version="1.1">
						<line class="spacer" x1="10" x2="54" y1="0" y2="0" />
					</svg>
				</div>
				{/* <div className='flex-grow overflow-y-auto min-h-0 no-scrollbar'> */}
				<div className='flex-grow overflow-y-auto min-h-0 no-scrollbar'>
					<div className='' >
						{games.map((data) => {
							return (
								<NavbarIcon icon={<FaArchive size="28" />} text={data} />
							);
						})}
					</div>
				</div>
				<div className=''> 
					<svg width="64px" height="10" xmlns="http://www.w3.org/2000/svg" version="1.1">
						<line class="spacer" x1="10" x2="54" y1="0" y2="0" />
					</svg>
				<NavbarIcon icon={<FaGithub size="28" />} text='Contact' />
				</div>
			</div>
		</div>
	);

};

export default Navbar;
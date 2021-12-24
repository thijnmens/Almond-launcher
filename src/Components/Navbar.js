import { FaFire, FaAddressCard } from 'react-icons/fa';

const Navbar = () => {
	const NavbarIcon = ({ icon, text }) => (
		<div className='navbar-icon group'>
			{icon}

			<span className='navbar-tooltip group-hover:scale-100'>
				{text}
			</span>
		</div>
	);

	return (
		<div className="fixed top-0 left-0 h-screen w-16 m-0 flex flex-col bg-gray-900 text-white shadow-lg">
			<NavbarIcon icon={<FaFire size="28" />} text='Home' />
			<NavbarIcon icon={<FaAddressCard size="28" />} text='Contact' />
		</div>
	);

};

export default Navbar;
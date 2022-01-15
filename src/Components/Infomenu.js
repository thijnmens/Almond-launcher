import Spinner from './../Assets/Chunk-4s-200px.svg';

function getIndex(arr, appid, width) {
	var dex = 0.0;
	arr.forEach((data, index) => {
		if (data.appid === appid) {
			dex = ((width - 144) / 8) * (index % 8) + ((index % 8) * 16)
		};
	});
	return dex;
}

const Infomenu = (props) => {

	if (props.appid.toString() === props.active.toString() ) {
		var index = getIndex(props.games, props.appid, props.vhwidth)
		return (
			<div className="infomenu" style={{marginLeft: `-${index}px`}}>
				<div className='absolute left-40 top-16 z-50 shadow-xl'>
					<img alt="Banner" width="340" height="510" classname='rounded-lg' src={props.banners} />
				</div>
				<img alt="Header" className='rounded-lg absolute top-0 left-0 object-cover z-10 h-[40rem] w-[93vw]' src={props.headers} />
				<div className='rounded-lg absolute w-[93vw] bottom-0 left-0 infomenubar z-10' >
					<div className='m-0 absolute top-[35%] left-[35rem]'>
						<button onClick={() => fetch(`http://localhost:666/steam/launch/${props.appid}`,{method: 'GET', headers: { 'Content-Type': 'application/json' }})} className='bg-gray-900 px-7 py-2 rounded-sm font-bold hover:bg-gray-700'>Launch</button>
					</div>
				</div>
				
			</div>
		);
	} else {
		return (<></>)
	}
};

export default Infomenu;
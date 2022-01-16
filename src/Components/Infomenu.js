import ProgressBar from "@ramonak/react-progress-bar";
import { round } from "lodash";
import fetch from "node-fetch";
import { useEffect, useState } from "react";

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

	const [achievements, setAchievements] = useState({ called: false, calls: 0, data: {} })
	const [completion, setCompletion] = useState({
		achieved: 0,
		notAchieved: 0,
		precentage: 100
	})

	useEffect(() => {
		const controller = new AbortController();
		const signal = controller.signal;
		fetch(`http://localhost:666/steam/achievements/${props.appid}`, {"content-type": "application/json", "Access-Control-Allow-Origin": "*", signal: signal})
		.then(res => res.json())
		.then(json => setAchievements({ called: true, calls: achievements.calls+1, data: json }))
		return () => {
			controller.abort();
		}
	}, []);

	if (props.appid.toString() === props.active.toString()) {


		if (achievements.called === true && achievements.calls === 1) {
			try {
				var _ = {
					achieved: 0,
					total: achievements.data.playerstats.achievements.length,
					precentage: 100
				}
				achievements.data.playerstats.achievements.forEach((data) => {
					if (data.achieved === 1) {
						_ = {
							achieved: _.achieved + data.achieved,
							total: _.total,
							precentage: round(((_.achieved + data.achieved) / _.total) * 100, 0)
						}
					}
				})
				
			} catch {
				var _ = {
					achieved: 0,
					total: 0,
					precentage: 100
				}
			}
			setCompletion(_)
			setAchievements({ called: achievements.called, calls: achievements.calls+1, data: achievements.data })
		}

		var index = getIndex(props.games, props.appid, props.vhwidth)

		return (
			<div className="infomenu" style={{marginLeft: `-${index}px`}}>
				<div className='absolute left-40 top-16 z-50 shadow-xl'>
					<img alt="Banner" width="340" height="510" classname='rounded-lg' src={props.banners} />
				</div>
				<img alt="Header" className='rounded-lg absolute top-0 left-0 object-cover z-10 h-[40rem] w-[93vw]' src={props.headers} />
				<div className='rounded-lg absolute w-[93vw] bottom-0 left-0 infomenubar z-10' >
					<div className='m-0 absolute top-[35%] left-[32%]'>
						<button onClick={() => fetch(`http://localhost:666/steam/launch/${props.appid}`,{method: 'GET', headers: { 'Content-Type': 'application/json' }})} className='bg-gray-900 px-7 py-2 rounded-sm font-bold hover:bg-gray-700'>Launch</button>
					</div>
					<div className='m-0 absolute w-[20%] top-[40%] left-[45%]'>
						<ProgressBar completed={completion.precentage} barContainerClassName='bg-gray-800 rounded-lg' bgColor="#2563eb"  />
					</div>
				</div>
				
			</div>
		);
	} else {
		return (<></>)
	}
};

export default Infomenu;
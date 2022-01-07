import './index.css';
import Navbar from './Components/Navbar';
import React from 'react';
import useSWR from 'swr';
import Spinner from './Assets/Chunk-4s-200px.svg';
import useRightClickMenu from './Hooks/useRightClickMenu';
import Contextmenu from './Components/Contextmenu';

const fetcher = (url) => fetch(url).then((r) => r.json());

function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); return; });
  return images;
}

function App() {

  const { x, y, showMenu } = useRightClickMenu();

  const [selected, setSelected] = React.useState("");
  console.log(selected)

  function getNavData(navData) {
    setSelected(navData);
  };

  var navbarRef = React.createRef();
  
  const { data: appid, error: errappid } = useSWR('http://localhost:666/steam/games', fetcher);   //Steam Apps
  const { data: steam, error: errsteam } = useSWR('http://localhost:666/steam/file/libraryfolders.vdf', fetcher);   //Steam Library
  if ( errappid ) {
    console.error(errappid)
    return (<div><h1 className='text-gray-200'>An error has occured while loading Steam Library</h1></div>)
  } else if (!appid) {
    return (<div className='block ml-auto mr-auto'><img src={Spinner} alt='Spinner "Chunk" provided by loading.io' /></div>)
  }
  if ( errsteam ) {
    console.error(errsteam)
    return (<div><h1 className='text-gray-200'>An error has occured while loading Steam Library</h1></div>)
  } else if (!steam) {
    return (<div className='w-screen h-screen'><img className='w-[50%] h-[50%]' src={Spinner} alt='Spinner "Chunk" provided by loading.io' /></div>)
  }

  fetch('http://localhost:666/cache/reload', {method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ steamgames: steam.response.games})})
  const Banners = importAll(require.context('./Assets/Banners', false, /\.(jpg)$/));

  return (
    <div className='w-screen h-screen overflow-x-hidden'>
    <Contextmenu x={x} y={y} showMenu={showMenu} />
      <table>
        <tbody>
          <tr>
            <td className='w-16 bg-gray-900 align-text-top fixed'>
              <Navbar ref={navbarRef} getNavData={getNavData} steam={steam.response.games} epic="" />
            </td>
            <td>
              <div className='overflow-y-auto overflow-x-hidden w-[98%] ml-16'>
                <div className='grid grid-cols-8 grid-flow-row gap-4 mx-4 my-1' onClick={() => {}}>
                  {steam.response.games.map((data) => {
						      	return (
                      <div className='hover:cursor-pointer banner-container' onClick={() => {alert(data.name)}}>
                        <img className='rounded-xl pointer-events-none block' src={Banners[`Banner_${data.appid}_600x900.jpg`]} alt={data}/>
                        <div className='hover-banner'>{data.name}</div>
                      </div>
						      	);
						      })}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;

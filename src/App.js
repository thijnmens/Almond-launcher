import './App.css';
import './index.css';
import Navbar from './Components/Navbar';
import { parse } from '@node-steam/vdf';
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((r) => r.json());

function range(start, end) {
  var ans = [];
  for (let i = start; i <= end; i++) {
      ans.push(i);
  }
  return ans;
}

function ReadSteamLib() {
  //const { data, error } = useSWR('http://localhost:666/steam/file/libraryfolders', fetcher)
  const { data, error } = useSWR('http://localhost:666/', fetcher)
  if (!data)
  console.log(data)
  let json = parse(data.toString());
  const lib = [];
  for (const i in range(0, Object.keys(json.libraryfolders).length - 2)) {
    lib.push({
      path: json.libraryfolders[i].path,
      apps: Object.keys(json.libraryfolders[i].apps)
    });
  };
};

function App() {

  const { data, error } = useSWR('http://localhost:666/', fetcher)
  if (!data) {
    return (<h1>Loading...</h1>)
  }
  console.log(data)
  let json = parse(data.toString());
  const lib = [];
  for (const i in range(0, Object.keys(json.libraryfolders).length - 2)) {
    lib.push({
      path: json.libraryfolders[i].path,
      apps: Object.keys(json.libraryfolders[i].apps)
    });
  };

  return (
    <div className='flex'>
      <Navbar />
    </div>
  );
}

export default App;

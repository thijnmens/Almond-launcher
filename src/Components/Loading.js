import Spinner from '../Assets/Chunk-4s-200px.svg';

const Loading = () => {
	return (
		<div className='h-full m-0 p-0'>
			<div className='relative h-full w-full'>
					<img className='absolute top-[25vh] left-[25vw] right-[25vw] bottom-[25vh] w-[50%] h-[50%] m-auto' src={Spinner} alt='Spinner "Chunk" provided by loading.io' />
			</div>
		</div>
	);
};

export default Loading;
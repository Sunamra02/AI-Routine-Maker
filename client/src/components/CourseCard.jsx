const CourseCard = (props) => {
	return (
		<div className="shadow-xl rounded-b-xl overflow-hidden">
			<img
				src={props.image}
				alt='img'
				className="w-90"
			/>
			<div className='p-5 bg-[#e6e7eb] '>
				<h2 className='text-xl font-bold'>{props.title}</h2>
				<p className="font-medium">{props.price}</p>
			</div>
		</div>
	);
};

export default CourseCard;
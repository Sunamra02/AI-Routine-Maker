const course_obj = [
	{
		id: 1,
		title: "React JS Full Course",
		price: "₹999",
		image: "https://picsum.photos/400/250?random=1",
		desc: "Learn React components, props, routing and project building.",
	},
	{
		id: 2,
		title: "Web Design Course",
		price: "₹799",
		image: "https://picsum.photos/400/250?random=2",
		desc: "Learn HTML, CSS, Tailwind CSS and responsive design.",
	},
	{
		id: 3,
		title: "JavaScript ES6 Course",
		price: "₹899",
		image: "https://picsum.photos/400/250?random=3",
		desc: "Learn modern JavaScript with real examples.",
	},
];
import CourseCard from "../CourseCard";
const Courses = () => {

	return (
		<div className="flex justify-around m-3">
			<div className="flex gap-5 flex-wrap md:flex-row flex-col">
				{
					course_obj.map(i => (
						<CourseCard key={i.id} image={i.image} title={i.title} price={i.price} />)
					)
				}
			</div>
		</div>
	)
};

export default Courses;
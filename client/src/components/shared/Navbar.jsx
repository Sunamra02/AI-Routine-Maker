import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className='sm:flex sm:justify-between bg-blue-500 text-white px-6 py-4'>
            <h1 className="text-2xl font-serif font-bold">E-learn</h1>
            <div className="flex items-center justify-content gap-4">
                <Link to="/">Home</Link>
                <Link to="/About">About</Link>
                <Link to="/Contacts">Contacts</Link>
                <Link to="/Courses">Courses</Link>
            </div>
        </nav>)
};

export default Navbar;
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import Home from './components/pages/Home';
import About from './components/pages/About';
import Contacts from './components/pages/Contacts';
import Courses from './components/pages/Courses';
const App = () => {
	return <>
		<BrowserRouter>
			<Navbar />
			<Routes>
				<Route path='/' element={<Home />}></Route>
				<Route path='/Contacts' element={<Contacts />}></Route>
				<Route path='/About' element={<About />}></Route>
				<Route path='/Courses' element={<Courses msg="ok" />}></Route>
			</Routes>
		</BrowserRouter>

	</>
};
export default App;
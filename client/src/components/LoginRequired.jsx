import { Link } from 'react-router-dom';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const LoginRequired = () => {
	return (
		<div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
			<div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl max-w-md w-full space-y-4">
				<span className="text-4xl">🔒</span>
				<h2 className="text-xl font-bold text-amber-900">Login Required</h2>
				<p className="text-amber-700 text-sm">
					Only registered users can generate, view, and manage daily routines in their account.
				</p>
				<Link
					to="/login"
					className="inline-block px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-colors"
				>
					Log In <FontAwesomeIcon icon={faArrowRight} />
				</Link>
			</div>
		</div>
	);
}
export default LoginRequired;
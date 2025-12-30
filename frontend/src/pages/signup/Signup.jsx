import React, { useState } from "react";
import { Link } from "react-router-dom";
import GenderCheckbox from "./GenderCheckbox.jsx";
import useSignup from "../../hooks/useSignup.js";

const Signup = () => {

  const [inputs,setInputs] = useState({
    fullName: '',
    username: '',
    password:'',
    confirmPassword: '',
    gender: ''
  });

  const {loading,signup} = useSignup();

  const handleCheckboxChange = (gender) => {
    setInputs({...inputs,gender})
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(inputs)
  }

	return (
		<div className='flex flex-col items-center justify-center min-w-96 mx-auto'>
			<div className='w-96 p-6 rounded-xl shadow-xl
        bg-white/20 backdrop-blur-xl border border-white/30'>
				<h1 className='text-3xl font-semibold text-center text-gray-300'>
					Sign Up <span className='text-[#ffb700]'> ChatApp</span>
				</h1>

				<form onSubmit={handleSubmit}>
					<div>
						<label className='label p-2 mt-4 '>
							<span className='text-base label-text'>Full Name</span>
						</label>
						<input type='text' placeholder='Sam Nick' className='w-80 input input-bordered  h-10' 
            value={inputs.fullName}
            onChange={(e) => setInputs({...inputs, fullName: e.target.value})}
            />
					</div>

					<div>
						<label className='label p-2  '>
							<span className='text-base label-text'>Username</span>
						</label>
						 <>
          <label className="input validator  ">
  <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <g
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeWidth="2.5"
      fill="none"
      stroke="currentColor"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </g>
  </svg>
  <input
    type="text"
    required
    placeholder="Username"
    pattern="[A-Za-z][A-Za-z0-9\-_]*"
    title="Only letters, numbers or dash"
     value={inputs.username}
            onChange={(e) => setInputs({...inputs, username: e.target.value})}
  />
</label>
<p className="validator-hint hidden">
  Must be more than 3 characters
</p>

          </>
					</div>

					<div>
						<label className='label p-2'>
							<span className='text-base label-text'>Password</span>
						</label>
					 <>
          <label className="input validator mt-2`">
  <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <g
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeWidth="2.5"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
      ></path>
      <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
    </g>
  </svg>
  <input
    type="password"
    required
    placeholder="Password"
    value={inputs.password}
    onChange={(e) => setInputs({...inputs, password: e.target.value})}
  />
</label>
<p className="validator-hint hidden">
  Must be more than 6 characters
</p>
          </>
					</div>

					<div>
						<label className='label p-2'>
							<span className='text-base label-text'>Confirm Password</span>
						</label>
						 <>
          <label className="input validator mt-2">
  <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <g
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeWidth="2.5"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
      ></path>
      <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
    </g>
  </svg>
  <input
    type="password"
    required
    placeholder="Confirm Password"
     value={inputs.confirmPassword}
    onChange={(e) => setInputs({...inputs, confirmPassword: e.target.value})}
  />
</label>
<p className="validator-hint hidden">
  Must be matching to passwords
</p>
          </>
					</div>

					<GenderCheckbox onCheckboxChange = {handleCheckboxChange} selectedGender={inputs.gender}/>

					<Link to='/login' className='text-sm hover:underline p-2 hover:text-blue-600 mt-2 inline-block' href='#'>
						Already have an account?
					</Link>

					 <div>
						<button className='btn btn-soft btn-warning w-full  -ml-1.5 btn-sm mt-3'
            disabled = {loading}
            >
              {loading ? <span className="loading loading-spinner"></span> : "Sign Up" }
            </button>
					</div>
				</form>
			</div>
		</div>
	);
};
export default Signup;
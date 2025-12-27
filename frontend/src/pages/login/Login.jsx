import React from "react";

const Login = () => {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
    >
      <div className="w-96 p-6 rounded-xl shadow-xl
        bg-white/20 backdrop-blur-xl border border-white/30 ">
        
        <h1 className="text-3xl font-semibold text-center text-white">
          Login
          <span className="text-[#ffb700]">ChatApp</span>
        </h1>

        <form className="mt-4">
          <label className="text-white text-sm">Username</label>
          {/* UserName */}
          <>
          <label className="input validator mt-1 ">
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
    pattern="[A-Za-z][A-Za-z0-9\-]*"
    minlength="3"
    maxlength="30"
    title="Only letters, numbers or dash"
  />
</label>
<p className="validator-hint hidden">
  Must be more than 3 characters
</p>

          </>

          <label className="text-white text-sm mt-3 block">Password</label>
           {/* Password */} 
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
    placeholder="Password"
    minlength="6"
  />
</label>
<p className="validator-hint hidden">
  Must be more than 6 characters
</p>
          </>
        

          <a href='#' className='text-sm  hover:underline hover:text-blue-600 mt-2 inline-block'>
						{"Don't"} have an account?
 					</a>

          <div>
						<button className='btn btn-warning w-full  -ml-1.5 btn-sm mt-3'>Login</button>
					</div>
          

        </form>
      </div>
    </div>
  );
};

export default Login;

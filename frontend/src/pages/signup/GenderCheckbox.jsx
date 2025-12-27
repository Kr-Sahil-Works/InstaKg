import React from "react";

const GenderCheckbox = () => {
	return (
		<div className='flex mt-4'>
			<div className='form-control'>
				<label className={`label gap-2 cursor-pointer`}>
					<span className='label-text'>Male</span>
					<input type="checkbox" defaultChecked className="checkbox checkbox-info" />
				</label>
			</div>
			<div className='form-control'>
				<label className={`label gap-2 cursor-pointer`}>
					<span className='label-text ml-4'>Female</span>
					<input type="checkbox" defaultChecked className="checkbox checkbox-warning" />
				</label>
			</div>
		</div>
	);
};
export default GenderCheckbox;
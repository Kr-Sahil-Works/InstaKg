// import React from "react";

// const GenderCheckbox = ({onCheckboxChange,selectedGender}) => {
// 	return (
// 		<div className='flex mt-4'>
// 			<div className='form-control'>
// 				<label className={`label gap-2 cursor-pointer ${selectedGender === 'male' ? "selected" : ""}`}>
// 					<span className='label-text'>Male</span>
// 					<input type="checkbox" defaultChecked className="checkbox checkbox-success "
// 					checked={selectedGender=== 'male'}
// 					onChange={() => onCheckboxChange("male")}
// 					/>
// 				</label>
// 			</div>
// 			<div className='form-control'>
// 				<label className={`label gap-2 cursor-pointer  ${selectedGender === 'female' ? "selected" : ""}`}>
// 					<span className='label-text ml-4'>Female</span>
// 					<input type="checkbox" defaultChecked className="checkbox checkbox-warning" 
// 					checked={selectedGender=== 'female'}
// 					onChange={() => onCheckboxChange("female")}
// 					/>
// 				</label>
// 			</div>
// 		</div>
// 	);
// };
// export default GenderCheckbox;

import React from "react";

const GenderCheckbox = ({ onCheckboxChange, selectedGender }) => {
	return (
		<div className="flex mt-4">
			<div className="form-control">
				<label className={`label gap-2 cursor-pointer ${selectedGender === "male" ? "selected" : ""}`}>
					<span className="label-text">Male</span>
					<input
						type="checkbox"
						className="checkbox checkbox-success"
						checked={selectedGender === "male"}
						onChange={() => onCheckboxChange("male")}
					/>
				</label>
			</div>

			<div className="form-control">
				<label className={`label gap-2 cursor-pointer ${selectedGender === "female" ? "selected" : ""}`}>
					<span className="label-text ml-4">Female</span>
					<input
						type="checkbox"
						className="checkbox checkbox-warning"
						checked={selectedGender === "female"}
						onChange={() => onCheckboxChange("female")}
					/>
				</label>
			</div>
		</div>
	);
};

export default GenderCheckbox;
